import cron from "node-cron";
import { processReminders } from "@/services/notification-service";

export function startReminderCron() {
  cron.schedule("0 8 * * 1", async () => {
    console.log("Running weekly reminder cron job...");
    try {
      const results = await processReminders();
      console.log(
        `Reminders sent: ${results.filter((r) => r.sent).length}/${results.length}`,
      );
    } catch (error) {
      console.error("Cron job failed:", error);
    }
  });

  console.log("Reminder cron job scheduled (every Monday at 8:00 AM)");
}
