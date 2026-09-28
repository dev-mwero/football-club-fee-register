import crypto from "node:crypto";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import { ApiError, badRequest, notFound } from "@/lib/errors";
import { logger } from "@/lib/logger";
import { initializeTransaction, verifyTransaction } from "@/lib/paystack";
import { FeeRecord } from "@/models/FeeRecord";
import { Payment } from "@/models/Payment";
import { Player } from "@/models/Player";
import { User } from "@/models/User";
import { sendPaymentConfirmation } from "@/services/email-service";
import { createNotification } from "@/services/notification-service";

async function allocateToFeeRecords(
  playerId: string,
  amount: number,
): Promise<void> {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const feeRecords = await FeeRecord.find({
      player: playerId,
      status: { $in: ["UNPAID", "PARTIAL"] },
    })
      .sort({ createdAt: 1 })
      .session(session);

    let remaining = amount;

    for (const record of feeRecords) {
      if (remaining <= 0) break;

      const toPay = Math.min(remaining, record.balance);

      record.amountPaid += toPay;
      record.balance = Math.max(0, record.amountDue - record.amountPaid);

      if (record.balance <= 0) {
        record.status = "PAID";
        record.balance = 0;
      } else {
        record.status = "PARTIAL";
      }

      remaining -= toPay;
      await record.save({ session });
    }

    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

export async function createPaymentReference() {
  return `PAY-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
}

export async function initializePayment(params: {
  playerId: string;
  amount: number;
}) {
  await connectDB();

  const player = await Player.findById(params.playerId).populate("parent");
  if (!player) {
    throw notFound("Player not found", "PLAYER_NOT_FOUND");
  }
  const parent = player.parent as unknown as {
    _id: string;
    email: string;
    name: string;
  };
  if (!parent) {
    throw badRequest("Player has no parent assigned", "PLAYER_HAS_NO_PARENT");
  }

  const reference = await createPaymentReference();

  const payment = await Payment.create({
    player: params.playerId,
    parent: parent._id,
    amount: params.amount,
    paymentMethod: "PAYSTACK",
    reference,
    status: "PENDING",
  });

  const response = await initializeTransaction({
    email: parent.email,
    amount: params.amount,
    reference,
    metadata: {
      paymentId: payment._id.toString(),
      playerId: params.playerId,
    },
  });

  if (!response.status) {
    payment.status = "FAILED";
    await payment.save();
    throw new ApiError(
      502,
      response.message ?? "Payment initialization failed",
      "PAYSTACK_INITIALIZATION_FAILED",
    );
  }

  return {
    authorizationUrl: response.data.authorization_url,
    reference,
    paymentId: payment._id,
  };
}

export async function handleWebhook(
  event: string,
  data: Record<string, unknown>,
) {
  if (event !== "charge.success") return;

  const reference = data.reference as string;

  await connectDB();

  const payment = await Payment.findOne({ reference });
  if (!payment) {
    throw notFound(
      `Payment not found for reference: ${reference}`,
      "PAYMENT_NOT_FOUND",
    );
  }

  if (payment.status === "SUCCESS") return;

  const verification = await verifyTransaction(reference);

  if (verification.data.status === "success") {
    payment.status = "SUCCESS";
    payment.paymentMethod = "PAYSTACK";
    await payment.save();

    await allocateToFeeRecords(payment.player.toString(), payment.amount);

    const player = await Player.findById(payment.player);
    const parent = await User.findById(payment.parent);
    if (player && parent) {
      await sendPaymentConfirmation({
        to: parent.email,
        parentName: parent.name,
        playerName: player.fullName,
        amount: payment.amount,
        reference: payment.reference,
      }).catch((error: unknown) => {
        logger.warn("Payment confirmation email not delivered", { error });
      });

      await createNotification({
        recipient: parent._id.toString(),
        type: "PAYMENT_CONFIRMATION",
        message: `Payment of KES ${payment.amount.toLocaleString()} for ${player.fullName} confirmed. Reference: ${payment.reference}`,
      });
    }
  }
}

export async function verifyPayment(reference: string) {
  await connectDB();

  const payment = await Payment.findOne({ reference });
  if (!payment) {
    throw notFound("Payment not found", "PAYMENT_NOT_FOUND");
  }

  const verification = await verifyTransaction(reference);

  if (verification.data.status === "success" && payment.status !== "SUCCESS") {
    payment.status = "SUCCESS";
    await payment.save();
  }

  return payment;
}

export async function createManualPayment(params: {
  playerId: string;
  parentId: string;
  amount: number;
  notes?: string;
}) {
  await connectDB();

  const reference = `MANUAL-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;

  const payment = await Payment.create({
    player: params.playerId,
    parent: params.parentId,
    amount: params.amount,
    paymentMethod: "MANUAL",
    reference,
    status: "SUCCESS",
    notes: params.notes,
  });

  await allocateToFeeRecords(params.playerId, params.amount);

  const player = await Player.findById(params.playerId);
  const parent = await User.findById(params.parentId);
  if (player && parent) {
    await sendPaymentConfirmation({
      to: parent.email,
      parentName: parent.name,
      playerName: player.fullName,
      amount: params.amount,
      reference,
    }).catch((error: unknown) => {
      logger.warn("Payment confirmation email not delivered", { error });
    });

    await createNotification({
      recipient: parent._id.toString(),
      type: "PAYMENT_CONFIRMATION",
      message: `Payment of KES ${params.amount.toLocaleString()} for ${player.fullName} confirmed. Reference: ${reference}`,
    });
  }

  return payment;
}

export async function getPayments() {
  await connectDB();
  return Payment.find()
    .populate("player", "fullName teamCategory")
    .populate("parent", "name email")
    .sort({ paymentDate: -1 })
    .lean();
}
