import { Pen, Wallet } from "lucide-react";
import Link from "next/link";
import { EmptyState, PageHeader } from "@/components/page-layout";
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
      <PageHeader
        title="Payments"
        description="View all payment transactions"
        action={
          <Link href="/dashboard/payments/manual">
            <Button>
              <Pen className="mr-2 h-4 w-4" />
              Record Payment
            </Button>
          </Link>
        }
      />

      {payments.length === 0 ? (
        <EmptyState
          icon={<Wallet className="h-7 w-7" />}
          title="No payments yet"
          description="Payment transactions will appear here once recorded."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold">Reference</TableHead>
                <TableHead className="font-semibold">Player</TableHead>
                <TableHead className="font-semibold">Parent</TableHead>
                <TableHead className="font-semibold">Method</TableHead>
                <TableHead className="font-semibold">Amount</TableHead>
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => {
                const player = payment.player as unknown as {
                  fullName: string;
                } | null;
                const parent = payment.parent as unknown as {
                  name: string;
                } | null;

                return (
                  <TableRow
                    key={payment._id.toString()}
                    className="transition-colors hover:bg-muted/50"
                  >
                    <TableCell className="font-mono text-xs">
                      {payment.reference}
                    </TableCell>
                    <TableCell className="font-medium">
                      {player?.fullName ?? "\u2014"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {parent?.name ?? "\u2014"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-normal">
                        {payment.paymentMethod}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      KES {payment.amount.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
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
                        className={
                          payment.status === "SUCCESS"
                            ? "bg-primary/15 text-primary hover:bg-primary/15"
                            : ""
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
      )}
    </div>
  );
}
