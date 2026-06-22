import { NextResponse } from "next/server";
import { assignFeeToPlayer, getFeeRecords } from "@/services/fee-service";

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
    const record = await assignFeeToPlayer(body);
    return NextResponse.json({ success: true, data: record }, { status: 201 });
  } catch (error) {
    console.error("Assign fee error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to assign fee" },
      { status: 500 },
    );
  }
}
