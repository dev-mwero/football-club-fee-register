import { NextResponse } from "next/server";
import { ApiError, badRequest, notFound, toErrorResponse } from "@/lib/errors";
import { mongoIdParamSchema, updateFeeRecordSchema } from "@/lib/validations";
import { updateFeeRecord } from "@/services/fee-service";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const idParsed = mongoIdParamSchema.safeParse({ id });
    if (!idParsed.success) {
      throw badRequest("Invalid fee record ID", "INVALID_ID");
    }

    const body = await req.json();
    const bodyParsed = updateFeeRecordSchema.safeParse(body);
    if (!bodyParsed.success) {
      throw new ApiError(
        422,
        "Please check the payment amount",
        "VALIDATION_ERROR",
        bodyParsed.error.flatten().fieldErrors,
      );
    }

    const record = await updateFeeRecord(id, bodyParsed.data);
    if (!record) {
      throw notFound("Fee record not found", "FEE_RECORD_NOT_FOUND");
    }
    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    return toErrorResponse(error, "PUT /api/v1/fee-records/[id]");
  }
}
