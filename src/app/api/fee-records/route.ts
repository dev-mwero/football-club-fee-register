import { NextResponse } from "next/server";
import {
  assignFeeToPlayer,
  autoBillActivePlayers,
  getFeeRecords,
} from "@/services/fee-service";

export async function GET() {
  try {
    const records = await getFeeRecords();
    return NextResponse.json({ success: true, data: records });
  } catch (error) {
    console.error("Get fee records error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch fee records" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.billingType === "AUTO") {
      if (!body.feeStructure || !body.amountDue || !body.periodKey) {
        return NextResponse.json(
          {
            success: false,
            error:
              "feeStructure, amountDue, and periodKey are required for automatic billing",
          },
          { status: 400 },
        );
      }

      const result = await autoBillActivePlayers({
        feeStructure: body.feeStructure,
        amountDue: Number(body.amountDue),
        periodKey: String(body.periodKey),
        teamCategory: body.teamCategory ? String(body.teamCategory) : undefined,
        playerIds: Array.isArray(body.playerIds)
          ? body.playerIds.map((id: unknown) => String(id))
          : undefined,
        billingLabel: body.billingLabel ? String(body.billingLabel) : undefined,
        billingReason: body.billingReason ? String(body.billingReason) : undefined,
        chargeType: body.chargeType === "EXPENSE" ? "EXPENSE" : "FEE",
      });

      return NextResponse.json({ success: true, data: result }, { status: 201 });
    }

    if (!body.player || !body.feeStructure || !body.amountDue) {
      return NextResponse.json(
        { success: false, error: "player, feeStructure, and amountDue are required" },
        { status: 400 },
      );
    }

    const record = await assignFeeToPlayer({
      player: body.player,
      feeStructure: body.feeStructure,
      amountDue: Number(body.amountDue),
    });

    return NextResponse.json({ success: true, data: record }, { status: 201 });
  } catch (error) {
    console.error("Assign fee error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to assign fee" },
      { status: 500 },
    );
  }
}
