import nodemailer from "nodemailer";
import { env } from "@/env";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: env.SMTP_USER
    ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
    : undefined,
});

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}) {
  if (!env.SMTP_HOST) {
    console.log("Email not configured. Skipping send.");
    console.log(`To: ${params.to}, Subject: ${params.subject}`);
    return;
  }

  await transporter.sendMail({
    from: env.EMAIL_FROM ?? "noreply@academy.com",
    to: params.to,
    subject: params.subject,
    html: params.html,
  });
}

export function inviteEmail(params: { inviteUrl: string; role: string }) {
  const roleLabel =
    params.role === "ADMIN"
      ? "an admin"
      : params.role === "COACH"
        ? "a coach"
        : "a parent";
  return {
    subject: "You're Invited - Football Academy Fee Register",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <div style="background: #065F46; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 20px;">Football Academy</h1>
        </div>
        <div style="background: #F8FAFC; padding: 24px; border: 1px solid #E2E8F0;">
          <p>Hello,</p>
          <p>You have been invited to join the Football Academy Fee Register as <strong>${roleLabel}</strong>.</p>
          <p>Click the link below to create your account:</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${params.inviteUrl}" style="display: inline-block; background: #065F46; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Accept Invitation</a>
          </div>
          <p style="color: #64748B; font-size: 14px;">This link will expire in 7 days.</p>
        </div>
        <div style="background: #F1F5F9; padding: 12px; text-align: center; font-size: 12px; color: #64748B; border-radius: 0 0 8px 8px;">
          Football Academy Fee Management System
        </div>
      </div>
    `,
  };
}

export function promotionEmail(params: { name: string }) {
  return {
    subject: "You've Been Promoted - Football Academy",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <div style="background: #065F46; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 20px;">Football Academy</h1>
        </div>
        <div style="background: #F8FAFC; padding: 24px; border: 1px solid #E2E8F0;">
          <p>Dear ${params.name},</p>
          <p>Congratulations! Your account has been promoted to <strong>Administrator</strong>.</p>
          <p>You now have full access to manage players, fees, payments, and other academy settings.</p>
        </div>
        <div style="background: #F1F5F9; padding: 12px; text-align: center; font-size: 12px; color: #64748B; border-radius: 0 0 8px 8px;">
          Football Academy Fee Management System
        </div>
      </div>
    `,
  };
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
