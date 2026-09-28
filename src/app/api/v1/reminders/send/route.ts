import { NextResponse } from "next/server";
import { toErrorResponse } from "@/lib/errors";
import { processReminders } from "@/services/notification-service";

export async function POST() {
  try {
    const results = await processReminders();
    return NextResponse.json({
      success: true,
      data: { sent: results.filter((r) => r.sent).length, results },
    });
  } catch (error) {
    return toErrorResponse(error, "POST /api/v1/reminders/send");
  }
}
