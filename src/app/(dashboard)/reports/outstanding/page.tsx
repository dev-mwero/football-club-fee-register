import { ArrowLeft } from "lucide-react";
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
import { FeeRecord } from "@/models/FeeRecord";
import { Notification } from "@/models/Notification";

export const dynamic = "force-dynamic";

export default async function OutstandingReportPage() {
  await connectDB();
  const records = await FeeRecord.find({
    status: { $in: ["UNPAID", "PARTIAL"] },
  })
    .populate("player", "fullName teamCategory")
    .populate("feeStructure", "name amount")
    .sort({ balance: -1 });

  const totalOutstanding = records.reduce((sum, r) => sum + r.balance, 0);

  const recordsWithReminder = [];

  for (const record of records) {
    const player = record.player as unknown as {
      _id: string;
      fullName: string;
    } | null;

    let lastReminder = null;
    if (player) {
      const notification = await Notification.findOne({
        type: "PAYMENT_REMINDER",
        sent: true,
      }).sort({ sentAt: -1 });

      lastReminder = notification?.sentAt ?? null;
    }

    recordsWithReminder.push({ ...record.toObject(), lastReminder });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/reports">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Outstanding Fees Report
          </h1>
          <p className="text-sm text-muted-foreground">
            Total outstanding: KES {totalOutstanding.toLocaleString()} (
            {records.length} accounts)
          </p>
        </div>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Player</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Fee</TableHead>
              <TableHead>Amount Due</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Reminder</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recordsWithReminder.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  No outstanding fees
                </TableCell>
              </TableRow>
            )}
            {recordsWithReminder.map((record) => {
              const player = record.player as {
                fullName: string;
                teamCategory: string;
              } | null;
              const fee = record.feeStructure as {
                name: string;
                amount: number;
              } | null;

              return (
                <TableRow key={record._id}>
                  <TableCell className="font-medium">
                    {player?.fullName ?? "—"}
                  </TableCell>
                  <TableCell>{player?.teamCategory ?? "—"}</TableCell>
                  <TableCell>{fee?.name ?? "—"}</TableCell>
                  <TableCell>KES {record.amountDue.toLocaleString()}</TableCell>
                  <TableCell className="font-medium text-destructive">
                    KES {record.balance.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        record.status === "PARTIAL"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {record.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {record.lastReminder
                      ? new Date(record.lastReminder).toLocaleDateString()
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
