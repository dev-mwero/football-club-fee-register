import { NextResponse } from "next/server";
import { badRequest, toErrorResponse } from "@/lib/errors";
import { verifyPayment } from "@/services/payment-service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      throw badRequest("Payment reference is required", "MISSING_REFERENCE");
    }

    const payment = await verifyPayment(reference);
    return NextResponse.json({ success: true, data: payment });
  } catch (error) {
    return toErrorResponse(error, "GET /api/v1/payments/verify");
  }
}
