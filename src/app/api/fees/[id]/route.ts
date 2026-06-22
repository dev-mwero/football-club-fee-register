import { NextResponse } from "next/server";
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
    const fee = await getFeeStructureById(id);
    if (!fee) {
      return NextResponse.json(
        { success: false, error: "Fee structure not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data: fee });
  } catch (error) {
    console.error("Get fee error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch fee structure" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const fee = await updateFeeStructure(id, body);
    if (!fee) {
      return NextResponse.json(
        { success: false, error: "Fee structure not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data: fee });
  } catch (error) {
    console.error("Update fee error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update fee structure" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const fee = await deleteFeeStructure(id);
    if (!fee) {
      return NextResponse.json(
        { success: false, error: "Fee structure not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ success: true, data: fee });
  } catch (error) {
    console.error("Delete fee error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete fee structure" },
      { status: 500 },
    );
  }
}
