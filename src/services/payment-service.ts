import crypto from "node:crypto";
import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import { initializeTransaction, verifyTransaction } from "@/lib/paystack";
import { FeeRecord } from "@/models/FeeRecord";
import { Payment } from "@/models/Payment";
import { User } from "@/models/User";

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
  parentId: string;
  amount: number;
}) {
  await connectDB();

  const parent = await User.findById(params.parentId);
  if (!parent) {
    throw new Error("Parent not found");
  }

  const reference = await createPaymentReference();

  const payment = await Payment.create({
    player: params.playerId,
    parent: params.parentId,
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
    throw new Error(response.message ?? "Payment initialization failed");
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
    throw new Error(`Payment not found for reference: ${reference}`);
  }

  if (payment.status === "SUCCESS") return;

  const verification = await verifyTransaction(reference);

  if (verification.data.status === "success") {
    payment.status = "SUCCESS";
    payment.paymentMethod = "PAYSTACK";
    await payment.save();

    await allocateToFeeRecords(payment.player.toString(), payment.amount);
  }
}

export async function verifyPayment(reference: string) {
  await connectDB();

  const payment = await Payment.findOne({ reference });
  if (!payment) {
    throw new Error("Payment not found");
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
