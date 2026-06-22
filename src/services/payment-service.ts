import crypto from "node:crypto";
import { connectDB } from "@/lib/db";
import { initializeTransaction, verifyTransaction } from "@/lib/paystack";
import { FeeRecord } from "@/models/FeeRecord";
import { Payment } from "@/models/Payment";
import { User } from "@/models/User";

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

    const feeRecords = await FeeRecord.find({
      player: payment.player,
      status: { $in: ["UNPAID", "PARTIAL"] },
    }).sort({ createdAt: 1 });

    let remaining = payment.amount;

    for (const record of feeRecords) {
      if (remaining <= 0) break;

      const owed = record.balance;
      const toPay = Math.min(remaining, owed);

      record.amountPaid += toPay;
      record.balance = record.amountDue - record.amountPaid;

      if (record.balance <= 0) {
        record.status = "PAID";
        record.balance = 0;
      } else {
        record.status = "PARTIAL";
      }

      remaining -= toPay;
      await record.save();
    }
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

export async function getPayments() {
  await connectDB();
  return Payment.find()
    .populate("player", "fullName teamCategory")
    .populate("parent", "name email")
    .sort({ paymentDate: -1 });
}
