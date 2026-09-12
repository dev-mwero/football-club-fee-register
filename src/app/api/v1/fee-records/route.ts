import { NextResponse } from "next/server";
import { ApiError, toErrorResponse } from "@/lib/errors";
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
    return toErrorResponse(error, "GET /api/v1/fee-records");
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.billingType === "AUTO") {
      const parsed = autoBillSchema.safeParse(body);
      if (!parsed.success) {
        throw new ApiError(
          422,
          "Please check the billing details",
          "VALIDATION_ERROR",
          parsed.error.flatten().fieldErrors,
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
      throw new ApiError(
        422,
        "Please check the fee assignment",
        "VALIDATION_ERROR",
        parsed.error.flatten().fieldErrors,
      );
    }

    const record = await assignFeeToPlayer({
      player: parsed.data.player,
      feeStructure: parsed.data.feeStructure,
      amountDue: parsed.data.amountDue,
    });

    return NextResponse.json({ success: true, data: record }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error, "POST /api/v1/fee-records");
  }
}
