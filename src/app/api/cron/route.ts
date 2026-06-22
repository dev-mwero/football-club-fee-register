import { NextResponse } from "next/server";
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
    console.error("Cron reminder error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process reminders" },
      { status: 500 },
    );
  }
}
