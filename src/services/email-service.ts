import {
  paymentConfirmationEmail,
  paymentReminderEmail,
  sendEmail,
} from "@/lib/email";

export async function sendPaymentConfirmation(params: {
  to: string;
  parentName: string;
  playerName: string;
  amount: number;
  reference: string;
}) {
  const email = paymentConfirmationEmail({
    parentName: params.parentName,
    playerName: params.playerName,
    amount: params.amount,
    reference: params.reference,
    date: new Date().toLocaleDateString(),
  });

  await sendEmail({ to: params.to, ...email });
}

export async function sendPaymentReminder(params: {
  to: string;
  parentName: string;
  playerName: string;
  amountDue: number;
  balance: number;
}) {
  const email = paymentReminderEmail({
    parentName: params.parentName,
    playerName: params.playerName,
    amountDue: params.amountDue,
    balance: params.balance,
  });

  await sendEmail({ to: params.to, ...email });
}
