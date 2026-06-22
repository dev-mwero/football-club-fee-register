import { connectDB } from "@/lib/db";
import { FeeRecord } from "@/models/FeeRecord";
import { Notification } from "@/models/Notification";
import { Player } from "@/models/Player";
import { User } from "@/models/User";
import { sendPaymentReminder } from "@/services/email-service";

export async function createNotification(params: {
  recipient: string;
  type: "PAYMENT_CONFIRMATION" | "PAYMENT_REMINDER" | "ACCOUNT_NOTIFICATION";
  message: string;
}) {
  await connectDB();
  return Notification.create({
    recipient: params.recipient,
    type: params.type,
    message: params.message,
    sent: false,
    sentAt: null,
  });
}

export async function markAsSent(id: string) {
  await connectDB();
  return Notification.findByIdAndUpdate(id, {
    sent: true,
    sentAt: new Date(),
  });
}

export async function getNotifications() {
  await connectDB();
  return Notification.find()
    .populate("recipient", "name email")
    .sort({ createdAt: -1 });
}

export async function processReminders() {
  await connectDB();

  const overdueRecords = await FeeRecord.find({
    status: { $in: ["UNPAID", "PARTIAL"] },
  }).populate("feeStructure", "name amount");

  const results: { player: string; sent: boolean }[] = [];

  for (const record of overdueRecords) {
    const player = await Player.findById(record.player);
    if (!player) continue;

    const parent = await User.findById(player.parent);
    if (!parent) continue;

    const feeName =
      (record.feeStructure as unknown as { name: string })?.name ?? "Fee";

    const message = `Reminder: ${player.fullName} has an outstanding balance of KES ${record.balance.toLocaleString()} for ${feeName}. Amount due: KES ${record.amountDue.toLocaleString()}.`;

    const notification = await createNotification({
      recipient: parent._id.toString(),
      type: "PAYMENT_REMINDER",
      message,
    });

    try {
      await sendPaymentReminder({
        to: parent.email,
        parentName: parent.name,
        playerName: player.fullName,
        amountDue: record.amountDue,
        balance: record.balance,
      });

      await markAsSent(notification._id.toString());
      results.push({ player: player.fullName, sent: true });
    } catch (error) {
      console.error(`Failed to send reminder for ${player.fullName}:`, error);
      results.push({ player: player.fullName, sent: false });
    }
  }

  return results;
}
