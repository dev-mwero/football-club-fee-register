import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Player } from "@/models/Player";
import { createManualPayment } from "@/services/payment-service";

export async function POST(request: Request) {
  try {
    const { playerId, amount, notes } = await request.json();

    if (!playerId || !amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "playerId and a valid amount are required" },
        { status: 400 },
      );
    }

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
