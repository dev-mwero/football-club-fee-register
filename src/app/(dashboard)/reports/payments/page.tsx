import { ArrowLeft } from "lucide-react";
import Link from "next/link";
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
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payment Report</h1>
          <p className="text-sm text-muted-foreground">
            Total collected: KES {totalAmount.toLocaleString()} (
            {payments.length} transactions)
          </p>
        </div>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Player</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Reference</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground"
                >
                  No completed payments yet
                </TableCell>
              </TableRow>
            )}
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
                <TableRow key={payment._id.toString()}>
                  <TableCell className="font-medium">
                    {player?.fullName ?? "—"}
                  </TableCell>
                  <TableCell>{player?.teamCategory ?? "—"}</TableCell>
                  <TableCell>{parent?.name ?? "—"}</TableCell>
                  <TableCell>KES {payment.amount.toLocaleString()}</TableCell>
                  <TableCell>
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
    </div>
  );
}
