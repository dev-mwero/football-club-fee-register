import { NextResponse } from "next/server";
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
      return NextResponse.json(
        { success: false, error: "Invalid fee record ID" },
        { status: 400 },
      );
    }

    const body = await req.json();
    const bodyParsed = updateFeeRecordSchema.safeParse(body);

    if (!bodyParsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: bodyParsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const record = await updateFeeRecord(id, bodyParsed.data);
    if (!record) {
      return NextResponse.json(
        { success: false, error: "Fee record not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    console.error("Update fee record error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update fee record" },
      { status: 500 },
    );
  }
}
