import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Payment } from "@/models/Payment";
import { Player } from "@/models/Player";

export const dynamic = "force-dynamic";

export default async function PlayerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await connectDB();

  const player = await Player.findById(id).populate(
    "parent",
    "name email phone",
  );
  if (!player) notFound();

  const feeRecords = await FeeRecord.find({ player: id })
    .populate("feeStructure", "name amount")
    .sort({ createdAt: -1 });

  const payments = await Payment.find({ player: id }).sort({ paymentDate: -1 });
  const parent = player.parent as unknown as {
    name: string;
    email: string;
    phone: string;
  } | null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/players">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {player.fullName}
          </h1>
          <p className="text-sm text-muted-foreground">
            {player.teamCategory} &middot; {player.position}
          </p>
        </div>
        <Badge
          variant={
            player.status === "ACTIVE"
              ? "default"
              : player.status === "INACTIVE"
                ? "secondary"
                : "outline"
          }
          className="ml-auto"
        >
          {player.status}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Player Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date of Birth</span>
              <span>{new Date(player.dateOfBirth).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Position</span>
              <span>{player.position}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Category</span>
              <span>{player.teamCategory}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Parent / Guardian</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name</span>
              <span>{parent?.name ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span>{parent?.email ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone</span>
              <span>{parent?.phone ?? "—"}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fee Records</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fee</TableHead>
                <TableHead>Amount Due</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {feeRecords.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center text-muted-foreground"
                  >
                    No fee records
                  </TableCell>
                </TableRow>
              )}
              {feeRecords.map((record) => {
                const fee = record.feeStructure as unknown as {
                  name: string;
                  amount: number;
                };
                return (
                  <TableRow key={record._id.toString()}>
                    <TableCell>{fee?.name ?? "Unknown"}</TableCell>
                    <TableCell>
                      KES {record.amountDue.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      KES {record.amountPaid.toLocaleString()}
                    </TableCell>
                    <TableCell>KES {record.balance.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          record.status === "PAID"
                            ? "default"
                            : record.status === "PARTIAL"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {record.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center text-muted-foreground"
                  >
                    No payments yet
                  </TableCell>
                </TableRow>
              )}
              {payments.map((payment) => (
                <TableRow key={payment._id.toString()}>
                  <TableCell>
                    {new Date(payment.paymentDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>KES {payment.amount.toLocaleString()}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {payment.reference}
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
