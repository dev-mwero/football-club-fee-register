import { NextResponse } from "next/server";
import { toErrorResponse } from "@/lib/errors";
import { processReminders } from "@/services/notification-service";

export const maxDuration = 300;

export async function GET() {
  try {
    const results = await processReminders();
    return NextResponse.json({
      success: true,
      data: { sent: results.filter((r) => r.sent).length, results },
    });
  } catch (error) {
    return toErrorResponse(error, "GET /api/v1/cron");
  }
}
