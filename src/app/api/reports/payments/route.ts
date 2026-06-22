import { NextResponse } from "next/server";
import { getPaymentReport } from "@/services/report-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const payments = await getPaymentReport();
    return NextResponse.json({ success: true, data: payments });
  } catch (error) {
    console.error("Payment report error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate payment report" },
      { status: 500 },
    );
  }
}
