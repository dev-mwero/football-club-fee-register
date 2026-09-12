import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ApiError, badRequest, notFound, toErrorResponse } from "@/lib/errors";
import { manualPaymentSchema } from "@/lib/validations";
import { Player } from "@/models/Player";
import { createManualPayment } from "@/services/payment-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = manualPaymentSchema.safeParse(body);

    if (!parsed.success) {
      throw new ApiError(
        422,
        "Please check the payment details",
        "VALIDATION_ERROR",
        parsed.error.flatten().fieldErrors,
      );
    }

    const { playerId, amount, notes } = parsed.data;

    await connectDB();

    const player = await Player.findById(playerId).populate("parent");
    if (!player) {
      throw notFound("Player not found", "PLAYER_NOT_FOUND");
    }

    const parent = player.parent as unknown as { _id: string } | null;
    if (!parent) {
      throw badRequest(
        "This player has no parent assigned",
        "PLAYER_HAS_NO_PARENT",
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
    return toErrorResponse(error, "POST /api/v1/admin/payments/manual");
  }
}
