import { NextResponse } from "next/server";
import { processReminders } from "@/services/notification-service";

export async function POST() {
  try {
    const results = await processReminders();
    return NextResponse.json({
      success: true,
      data: { sent: results.filter((r) => r.sent).length, results },
    });
  } catch (error) {
    console.error("Send reminders error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send reminders" },
      { status: 500 },
    );
  }
}
