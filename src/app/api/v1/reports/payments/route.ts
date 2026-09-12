import { NextResponse } from "next/server";
import { toErrorResponse } from "@/lib/errors";
import { getPaymentReport } from "@/services/report-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const payments = await getPaymentReport();
    return NextResponse.json({ success: true, data: payments });
  } catch (error) {
    return toErrorResponse(error, "GET /api/v1/reports/payments");
  }
}
