import { NextResponse } from "next/server";
import { getOutstandingReport } from "@/services/report-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const typeParam = searchParams.get("type");
    const chargeType =
      typeParam === "FEE" || typeParam === "EXPENSE" ? typeParam : "ALL";

    const report = await getOutstandingReport(chargeType);
    return NextResponse.json({ success: true, data: report });
  } catch (error) {
    console.error("Outstanding report error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate outstanding report" },
      { status: 500 },
    );
  }
}
