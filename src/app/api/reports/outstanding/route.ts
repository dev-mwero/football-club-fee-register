import { NextResponse } from "next/server";
import { getOutstandingReport } from "@/services/report-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const report = await getOutstandingReport();
    return NextResponse.json({ success: true, data: report });
  } catch (error) {
    console.error("Outstanding report error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate outstanding report" },
      { status: 500 },
    );
  }
}
