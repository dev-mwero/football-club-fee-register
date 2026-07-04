import { Bell } from "lucide-react";
import { EmptyState, PageHeader } from "@/components/page-layout";
import { SendRemindersButton } from "@/components/send-reminders-button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { connectDB } from "@/lib/db";
import { Notification } from "@/models/Notification";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  await connectDB();
  const notifications = await Notification.find()
    .populate("recipient", "name email")
    .sort({ createdAt: -1 });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="View sent notifications and reminders"
        action={<SendRemindersButton />}
      />

      {notifications.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-7 w-7" />}
          title="No notifications"
          description="Sent notifications and reminders will appear here."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Recipient</TableHead>
                <TableHead className="font-semibold">Message</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Sent At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.map((notification) => {
                const recipient = notification.recipient as unknown as {
                  name: string;
                  email: string;
                } | null;

                return (
                  <TableRow
                    key={notification._id.toString()}
                    className="transition-colors hover:bg-muted/50"
                  >
                    <TableCell>
                      <Badge variant="outline" className="font-normal">
                        {notification.type.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {recipient?.name ?? "\u2014"}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                      {notification.message}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={notification.sent ? "default" : "secondary"}
                        className={
                          notification.sent
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                            : ""
                        }
                      >
                        {notification.sent ? "Sent" : "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {notification.sentAt
                        ? new Date(notification.sentAt).toLocaleString()
                        : "\u2014"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
