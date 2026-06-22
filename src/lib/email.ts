import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!process.env.SMTP_HOST) {
    console.log("Email not configured. Skipping send.");
    console.log(`To: ${params.to}, Subject: ${params.subject}`);
    return;
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM ?? "noreply@academy.com",
    to: params.to,
    subject: params.subject,
    html: params.html,
  });
}

export function paymentConfirmationEmail(params: {
  parentName: string;
  playerName: string;
  amount: number;
  reference: string;
  date: string;
}) {
  return {
    subject: "Payment Confirmed - Football Academy",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <div style="background: #065F46; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 20px;">Football Academy</h1>
        </div>
        <div style="background: #F8FAFC; padding: 24px; border: 1px solid #E2E8F0;">
          <p>Dear ${params.parentName},</p>
          <p>Your payment has been confirmed.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px; color: #64748B;">Player</td><td style="padding: 8px; font-weight: bold;">${params.playerName}</td></tr>
            <tr><td style="padding: 8px; color: #64748B;">Amount</td><td style="padding: 8px; font-weight: bold;">KES ${params.amount.toLocaleString()}</td></tr>
            <tr><td style="padding: 8px; color: #64748B;">Reference</td><td style="padding: 8px; font-family: monospace;">${params.reference}</td></tr>
            <tr><td style="padding: 8px; color: #64748B;">Date</td><td style="padding: 8px;">${params.date}</td></tr>
          </table>
          <p>Thank you for your timely payment.</p>
        </div>
        <div style="background: #F1F5F9; padding: 12px; text-align: center; font-size: 12px; color: #64748B; border-radius: 0 0 8px 8px;">
          Football Academy Fee Management System
        </div>
      </div>
    `,
  };
}

export function paymentReminderEmail(params: {
  parentName: string;
  playerName: string;
  amountDue: number;
  balance: number;
}) {
  return {
    subject: "Payment Reminder - Football Academy",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <div style="background: #DC2626; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 20px;">Payment Reminder</h1>
        </div>
        <div style="background: #F8FAFC; padding: 24px; border: 1px solid #E2E8F0;">
          <p>Dear ${params.parentName},</p>
          <p>Your academy fee balance is pending.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px; color: #64748B;">Player</td><td style="padding: 8px; font-weight: bold;">${params.playerName}</td></tr>
            <tr><td style="padding: 8px; color: #64748B;">Amount Due</td><td style="padding: 8px; font-weight: bold;">KES ${params.amountDue.toLocaleString()}</td></tr>
            <tr><td style="padding: 8px; color: #64748B;">Balance</td><td style="padding: 8px; font-weight: bold; color: #DC2626;">KES ${params.balance.toLocaleString()}</td></tr>
          </table>
          <p>Please complete payment at your earliest convenience.</p>
        </div>
        <div style="background: #F1F5F9; padding: 12px; text-align: center; font-size: 12px; color: #64748B; border-radius: 0 0 8px 8px;">
          Football Academy Fee Management System
        </div>
      </div>
    `,
  };
}
