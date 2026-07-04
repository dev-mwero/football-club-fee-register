import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { env } from "@/env";
import { handleWebhook } from "@/services/payment-service";

export async function POST(request: Request) {
  try {
    const signature = request.headers.get("x-paystack-signature");
    if (!signature) {
      return NextResponse.json(
        { success: false, error: "Missing signature" },
        { status: 400 },
      );
    }

    const rawBody = await request.text();

    const hash = crypto
      .createHmac("sha512", env.PAYSTACK_SECRET_KEY)
      .update(rawBody)
      .digest("hex");

    if (hash !== signature) {
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 401 },
      );
    }

    const body = JSON.parse(rawBody);
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
