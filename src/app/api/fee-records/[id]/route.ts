import { NextResponse } from "next/server";
import { updateFeeRecord } from "@/services/fee-service";

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const record = await updateFeeRecord(id, body);
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
