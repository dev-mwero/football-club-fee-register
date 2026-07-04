import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { manualPaymentSchema } from "@/lib/validations";
import { Player } from "@/models/Player";
import { createManualPayment } from "@/services/payment-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = manualPaymentSchema.safeParse(body);

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

    const { playerId, amount, notes } = parsed.data;

    await connectDB();

    const player = await Player.findById(playerId).populate("parent");
    if (!player) {
      return NextResponse.json(
        { success: false, error: "Player not found" },
        { status: 404 },
      );
    }

    const parent = player.parent as unknown as { _id: string } | null;
    if (!parent) {
      return NextResponse.json(
        { success: false, error: "Player has no parent assigned" },
        { status: 400 },
      );
    }

    const payment = await createManualPayment({
      playerId: player._id.toString(),
      parentId: parent._id.toString(),
      amount,
      notes,
    });

    return NextResponse.json({ success: true, data: payment }, { status: 201 });
  } catch (error) {
    console.error("Manual payment error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
