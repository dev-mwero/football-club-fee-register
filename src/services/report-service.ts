import { connectDB } from "@/lib/db";
import { FeeRecord } from "@/models/FeeRecord";
import { Notification } from "@/models/Notification";
import { Payment } from "@/models/Payment";
import { Player } from "@/models/Player";

export async function getPaymentReport() {
  await connectDB();
  return Payment.find()
    .populate("player", "fullName teamCategory")
    .populate("parent", "name email")
    .sort({ paymentDate: -1 });
}

export async function getOutstandingReport() {
  await connectDB();
  const records = await FeeRecord.find({
    status: { $in: ["UNPAID", "PARTIAL"] },
  })
    .populate("player", "fullName teamCategory")
    .populate("feeStructure", "name amount frequency")
    .sort({ balance: -1 });

  const enriched = [];

  for (const record of records) {
    const player = record.player as unknown as {
      _id: string;
      fullName: string;
      teamCategory: string;
    };

    const lastNotification = await Notification.findOne({
      recipient: player?._id,
      type: "PAYMENT_REMINDER",
      sent: true,
    }).sort({ sentAt: -1 });

    enriched.push({
      ...record.toObject(),
      lastReminder: lastNotification?.sentAt ?? null,
    });
  }

  return enriched;
}

export async function getDashboardStats() {
  await connectDB();

  const totalPlayers = await Player.countDocuments({ status: "ACTIVE" });

  const totalRevenue = await Payment.aggregate([
    { $match: { status: "SUCCESS" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const outstandingFees = await FeeRecord.aggregate([
    { $match: { status: { $in: ["UNPAID", "PARTIAL"] } } },
    { $group: { _id: null, total: { $sum: "$balance" } } },
  ]);

  const monthlyCollections = await Payment.aggregate([
    {
      $match: {
        status: "SUCCESS",
        paymentDate: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const unpaidAccounts = await FeeRecord.countDocuments({ status: "UNPAID" });

  return {
    totalPlayers,
    totalRevenue: totalRevenue[0]?.total ?? 0,
    outstandingFees: outstandingFees[0]?.total ?? 0,
    monthlyCollections: monthlyCollections[0]?.total ?? 0,
    unpaidAccounts,
  };
}
