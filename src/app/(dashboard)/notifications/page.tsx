import { Send } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            View sent notifications and reminders
          </p>
        </div>
        <Link href="/api/reminders/send">
          <Button variant="outline">
            <Send className="mr-2 h-4 w-4" />
            Send Reminders
          </Button>
        </Link>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Recipient</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sent At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notifications.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground"
                >
                  No notifications sent yet
                </TableCell>
              </TableRow>
            )}
            {notifications.map((notification) => {
              const recipient = notification.recipient as unknown as {
                name: string;
                email: string;
              } | null;

              return (
                <TableRow key={notification._id.toString()}>
                  <TableCell>
                    <Badge variant="outline">
                      {notification.type.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>{recipient?.name ?? "—"}</TableCell>
                  <TableCell className="max-w-xs truncate text-sm">
                    {notification.message}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={notification.sent ? "default" : "secondary"}
                    >
                      {notification.sent ? "Sent" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {notification.sentAt
                      ? new Date(notification.sentAt).toLocaleString()
                      : "—"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
