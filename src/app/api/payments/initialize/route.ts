import { NextResponse } from "next/server";
import { initializePaymentSchema } from "@/lib/validations";
import { initializePayment } from "@/services/payment-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = initializePaymentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const result = await initializePayment({
      playerId: parsed.data.playerId,
      parentId: parsed.data.playerId,
      amount: parsed.data.amount,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Initialize payment error:", error);
    const message =
      error instanceof Error ? error.message : "Failed to initialize payment";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
