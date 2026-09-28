import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { env } from "@/env";
import { badRequest, toErrorResponse, unauthorized } from "@/lib/errors";
import { handleWebhook } from "@/services/payment-service";

export async function POST(request: Request) {
  try {
    const signature = request.headers.get("x-paystack-signature");
    if (!signature) {
      throw badRequest("Missing signature", "MISSING_SIGNATURE");
    }

    const rawBody = await request.text();

    const hash = crypto
      .createHmac("sha512", env.PAYSTACK_SECRET_KEY)
      .update(rawBody)
      .digest("hex");

    if (hash !== signature) {
      throw unauthorized("Invalid signature");
    }

    const body = JSON.parse(rawBody);
    await handleWebhook(body.event, body.data);

    return NextResponse.json({ success: true });
  } catch (error) {
    return toErrorResponse(error, "POST /api/payments/webhook");
  }
}
