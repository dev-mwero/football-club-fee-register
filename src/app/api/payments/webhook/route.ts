import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { handleWebhook } from "@/services/payment-service";

export async function POST(request: Request) {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      return NextResponse.json(
        { success: false, error: "Paystack not configured" },
        { status: 500 },
      );
    }

    const hash = crypto
      .createHmac("sha512", secret)
      .update(await request.clone().text())
      .digest("hex");

    if (hash !== request.headers.get("x-paystack-signature")) {
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 401 },
      );
    }

    const body = await request.json();
    await handleWebhook(body.event, body.data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { success: false, error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
