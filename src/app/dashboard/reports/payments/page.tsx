import { ArrowLeft, TrendingUp } from "lucide-react";
import Link from "next/link";
import { EmptyState, PageHeader } from "@/components/page-layout";
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
import { Payment } from "@/models/Payment";

export const dynamic = "force-dynamic";

export default async function PaymentReportPage() {
  await connectDB();
  const payments = await Payment.find({ status: "SUCCESS" })
    .populate("player", "fullName teamCategory")
    .populate("parent", "name email")
    .sort({ paymentDate: -1 });

  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/reports">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <PageHeader
          title="Payment Report"
          description={`Total collected: KES ${totalAmount.toLocaleString()} (${payments.length} transactions)`}
        />
      </div>

      {/* Summary card */}
      <Card className="transition-all duration-200 hover:shadow-md">
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Collected</p>
              <p className="text-2xl font-bold text-emerald-600">
                KES {totalAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {payments.length === 0 ? (
        <EmptyState
          icon={<TrendingUp className="h-7 w-7" />}
          title="No completed payments"
          description="Successful payment transactions will appear here."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold">Player</TableHead>
                <TableHead className="font-semibold">Category</TableHead>
                <TableHead className="font-semibold">Parent</TableHead>
                <TableHead className="font-semibold">Amount</TableHead>
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold">Reference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => {
                const player = payment.player as unknown as {
                  fullName: string;
                  teamCategory: string;
                } | null;
                const parent = payment.parent as unknown as {
                  name: string;
                  email: string;
                } | null;

                return (
                  <TableRow
                    key={payment._id.toString()}
                    className="transition-colors hover:bg-muted/50"
                  >
                    <TableCell className="font-medium">
                      {player?.fullName ?? "\u2014"}
                    </TableCell>
                    <TableCell>{player?.teamCategory ?? "\u2014"}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {parent?.name ?? "\u2014"}
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      KES {payment.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {payment.reference}
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
