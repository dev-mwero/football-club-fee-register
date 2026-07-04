import { NextResponse } from "next/server";
import { assignFeeSchema, autoBillSchema } from "@/lib/validations";
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
      const parsed = autoBillSchema.safeParse(body);

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

      const result = await autoBillActivePlayers({
        feeStructure: parsed.data.feeStructure,
        amountDue: parsed.data.amountDue,
        periodKey: parsed.data.periodKey,
        teamCategory: parsed.data.teamCategory,
        playerIds: parsed.data.playerIds,
        billingLabel: parsed.data.billingLabel,
        billingReason: parsed.data.billingReason,
        chargeType: parsed.data.chargeType,
      });

      return NextResponse.json(
        { success: true, data: result },
        { status: 201 },
      );
    }

    const parsed = assignFeeSchema.safeParse(body);

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

    const record = await assignFeeToPlayer({
      player: parsed.data.player,
      feeStructure: parsed.data.feeStructure,
      amountDue: parsed.data.amountDue,
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
