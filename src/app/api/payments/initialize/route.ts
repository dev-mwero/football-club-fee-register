import { NextResponse } from "next/server";
import { initializePayment } from "@/services/payment-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.playerId || !body.parentId || !body.amount) {
      return NextResponse.json(
        {
          success: false,
          error: "playerId, parentId, and amount are required",
        },
        { status: 400 },
      );
    }

    const result = await initializePayment({
      playerId: body.playerId,
      parentId: body.parentId,
      amount: Number(body.amount),
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
