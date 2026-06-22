import { Pen } from "lucide-react";
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
import { Payment } from "@/models/Payment";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  await connectDB();
  const payments = await Payment.find()
    .populate("player", "fullName")
    .populate("parent", "name")
    .sort({ paymentDate: -1 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payments</h1>
          <p className="text-sm text-muted-foreground">
            View all payment transactions
          </p>
        </div>
        <Link href="/dashboard/payments/manual">
          <Button>
            <Pen className="mr-2 h-4 w-4" />
            Record Payment
          </Button>
        </Link>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Player</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  No payments yet
                </TableCell>
              </TableRow>
            )}
            {payments.map((payment) => {
              const player = payment.player as unknown as {
                fullName: string;
              } | null;
              const parent = payment.parent as unknown as {
                name: string;
              } | null;

              return (
                <TableRow key={payment._id.toString()}>
                  <TableCell className="font-mono text-xs">
                    {payment.reference}
                  </TableCell>
                  <TableCell className="font-medium">
                    {player?.fullName ?? "—"}
                  </TableCell>
                  <TableCell>{parent?.name ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{payment.paymentMethod}</Badge>
                  </TableCell>
                  <TableCell>KES {payment.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    {new Date(payment.paymentDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        payment.status === "SUCCESS"
                          ? "default"
                          : payment.status === "PENDING"
                            ? "secondary"
                            : "destructive"
                      }
                    >
                      {payment.status}
                    </Badge>
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
