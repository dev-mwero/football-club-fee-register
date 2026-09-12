import { NextResponse } from "next/server";
import { toErrorResponse } from "@/lib/errors";
import { getDashboardStats } from "@/services/report-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stats = await getDashboardStats();
    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    return toErrorResponse(error, "GET /api/v1/reports/dashboard");
  }
}
