import { AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { EmptyState, PageHeader } from "@/components/page-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

function buildLink(type: "ALL" | "FEE" | "EXPENSE") {
  return type === "ALL"
    ? "/dashboard/reports/outstanding"
    : `/dashboard/reports/outstanding?type=${type}`;
}

export default async function OutstandingReportPage({
  searchParams,
}: {
  searchParams?: Promise<{ type?: string }>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const selectedType: "ALL" | "FEE" | "EXPENSE" =
    resolvedSearchParams?.type === "FEE"
      ? "FEE"
      : resolvedSearchParams?.type === "EXPENSE"
        ? "EXPENSE"
        : "ALL";

  await connectDB();
  const records = await FeeRecord.find({
    status: { $in: ["UNPAID", "PARTIAL"] },
    ...(selectedType === "ALL" ? {} : { chargeType: selectedType }),
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/reports">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <PageHeader
            title="Outstanding Fees Report"
            description={`Total outstanding: KES ${totalOutstanding.toLocaleString()} (${records.length} accounts)`}
          />
        </div>
        <div className="flex gap-2">
          <Link href={buildLink("ALL")}>
            <Button
              variant={selectedType === "ALL" ? "default" : "outline"}
              size="sm"
            >
              All
            </Button>
          </Link>
          <Link href={buildLink("FEE")}>
            <Button
              variant={selectedType === "FEE" ? "default" : "outline"}
              size="sm"
            >
              Fees
            </Button>
          </Link>
          <Link href={buildLink("EXPENSE")}>
            <Button
              variant={selectedType === "EXPENSE" ? "default" : "outline"}
              size="sm"
            >
              Expenses
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary card */}
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10">
              <AlertTriangle className="h-5 w-5 text-cyan-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Outstanding</p>
              <p className="text-2xl font-bold text-cyan-600">
                KES {totalOutstanding.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {recordsWithReminder.length === 0 ? (
        <EmptyState
          icon={<AlertTriangle className="h-7 w-7" />}
          title="No outstanding records"
          description={
            selectedType === "ALL"
              ? "All accounts are fully paid."
              : `No outstanding ${selectedType.toLowerCase()} records found.`
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold">Player</TableHead>
                <TableHead className="font-semibold">Category</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Fee</TableHead>
                <TableHead className="font-semibold">Amount Due</TableHead>
                <TableHead className="font-semibold">Balance</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Last Reminder</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recordsWithReminder.map((record) => {
                const player = record.player as unknown as {
                  fullName: string;
                  teamCategory: string;
                } | null;
                const fee = record.feeStructure as unknown as {
                  name: string;
                  amount: number;
                } | null;
                const chargeType =
                  (record as { chargeType?: "FEE" | "EXPENSE" }).chargeType ??
                  "FEE";

                return (
                  <TableRow
                    key={record._id?.toString() ?? Math.random()}
                    className="transition-colors hover:bg-muted/50"
                  >
                    <TableCell className="font-medium">
                      {player?.fullName ?? "\u2014"}
                    </TableCell>
                    <TableCell>{player?.teamCategory ?? "\u2014"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          chargeType === "EXPENSE" ? "secondary" : "default"
                        }
                        className="font-normal"
                      >
                        {chargeType}
                      </Badge>
                    </TableCell>
                    <TableCell>{fee?.name ?? "\u2014"}</TableCell>
                    <TableCell>
                      KES {record.amountDue.toLocaleString()}
                    </TableCell>
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
