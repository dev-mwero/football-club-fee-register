import { NextResponse } from "next/server";
import { ApiError, badRequest, notFound, toErrorResponse } from "@/lib/errors";
import { mongoIdParamSchema, updateFeeSchema } from "@/lib/validations";
import {
  deleteFeeStructure,
  getFeeStructureById,
  updateFeeStructure,
} from "@/services/fee-service";

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const parsed = mongoIdParamSchema.safeParse({ id });
    if (!parsed.success) {
      throw badRequest("Invalid fee structure ID", "INVALID_ID");
    }

    const fee = await getFeeStructureById(id);
    if (!fee) {
      throw notFound("Fee structure not found", "FEE_STRUCTURE_NOT_FOUND");
    }
    return NextResponse.json({ success: true, data: fee });
  } catch (error) {
    return toErrorResponse(error, "GET /api/v1/fees/[id]");
  }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const idParsed = mongoIdParamSchema.safeParse({ id });
    if (!idParsed.success) {
      throw badRequest("Invalid fee structure ID", "INVALID_ID");
    }

    const body = await req.json();
    const bodyParsed = updateFeeSchema.safeParse(body);
    if (!bodyParsed.success) {
      throw new ApiError(
        422,
        "Please check the fee structure details",
        "VALIDATION_ERROR",
        bodyParsed.error.flatten().fieldErrors,
      );
    }

    const fee = await updateFeeStructure(id, bodyParsed.data);
    if (!fee) {
      throw notFound("Fee structure not found", "FEE_STRUCTURE_NOT_FOUND");
    }
    return NextResponse.json({ success: true, data: fee });
  } catch (error) {
    return toErrorResponse(error, "PUT /api/v1/fees/[id]");
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const parsed = mongoIdParamSchema.safeParse({ id });
    if (!parsed.success) {
      throw badRequest("Invalid fee structure ID", "INVALID_ID");
    }

    const fee = await deleteFeeStructure(id);
    if (!fee) {
      throw notFound("Fee structure not found", "FEE_STRUCTURE_NOT_FOUND");
    }
    return NextResponse.json({ success: true, data: fee });
  } catch (error) {
    return toErrorResponse(error, "DELETE /api/v1/fees/[id]");
  }
}
