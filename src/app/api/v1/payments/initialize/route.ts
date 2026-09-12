import { NextResponse } from "next/server";
import { ApiError, toErrorResponse } from "@/lib/errors";
import { initializePaymentSchema } from "@/lib/validations";
import { initializePayment } from "@/services/payment-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = initializePaymentSchema.safeParse(body);

    if (!parsed.success) {
      throw new ApiError(
        422,
        "Please check the payment details",
        "VALIDATION_ERROR",
        parsed.error.flatten().fieldErrors,
      );
    }

    const result = await initializePayment({
      playerId: parsed.data.playerId,
      amount: parsed.data.amount,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return toErrorResponse(error, "POST /api/v1/payments/initialize");
  }
}
