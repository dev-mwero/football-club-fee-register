import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PayNowButton } from "@/components/pay-now-button";
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
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { FeeRecord } from "@/models/FeeRecord";
import { Payment } from "@/models/Payment";
import { Player } from "@/models/Player";

export const dynamic = "force-dynamic";

export default async function PlayerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ type?: string }>;
}) {
  const { id } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const recordTypeFilter =
    resolvedSearchParams?.type === "EXPENSE"
      ? "EXPENSE"
      : resolvedSearchParams?.type === "FEE"
        ? "FEE"
        : "ALL";
  const session = await getSession();
  await connectDB();

  const player = await Player.findById(id).populate(
    "parent",
    "name email phone",
  );
  if (!player) notFound();

  const feeRecords = await FeeRecord.find({ player: id })
    .populate("feeStructure", "name amount")
    .sort({ createdAt: -1 });
  const visibleFeeRecords =
    recordTypeFilter === "ALL"
      ? feeRecords
      : feeRecords.filter(
          (record) =>
            ((record as unknown as { chargeType?: "FEE" | "EXPENSE" })
              .chargeType ?? "FEE") === recordTypeFilter,
        );

  const payments = await Payment.find({ player: id }).sort({ paymentDate: -1 });
  const parent = player.parent as unknown as {
    _id: string;
    name: string;
    email: string;
    phone: string;
  } | null;

  const isOwner = session?.userId === parent?._id;
  const canPay = session?.role === "PARENT" && isOwner;

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
          <div className="flex items-center justify-between gap-3">
            <CardTitle>Fee Records</CardTitle>
            <div className="flex gap-2 text-xs">
              <Link
                href={`/dashboard/players/${id}${recordTypeFilter === "ALL" ? "" : "?type=ALL"}`}
              >
                <Button
                  variant={recordTypeFilter === "ALL" ? "default" : "outline"}
                  size="sm"
                >
                  All
                </Button>
              </Link>
              <Link href={`/dashboard/players/${id}?type=FEE`}>
                <Button
                  variant={recordTypeFilter === "FEE" ? "default" : "outline"}
                  size="sm"
                >
                  Fees
                </Button>
              </Link>
              <Link href={`/dashboard/players/${id}?type=EXPENSE`}>
                <Button
                  variant={
                    recordTypeFilter === "EXPENSE" ? "default" : "outline"
                  }
                  size="sm"
                >
                  Expenses
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fee</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount Due</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Status</TableHead>
                {canPay && <TableHead className="text-right">Action</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleFeeRecords.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={canPay ? 7 : 6}
                    className="text-center text-muted-foreground"
                  >
                    No{" "}
                    {recordTypeFilter === "ALL"
                      ? "fee records"
                      : recordTypeFilter.toLowerCase()}{" "}
                    found
                  </TableCell>
                </TableRow>
              )}
              {visibleFeeRecords.map((record) => {
                const fee = record.feeStructure as unknown as {
                  name: string;
                  amount: number;
                };
                const chargeType =
                  (record as unknown as { chargeType?: "FEE" | "EXPENSE" })
                    .chargeType ?? "FEE";
                return (
                  <TableRow key={record._id.toString()}>
                    <TableCell>{fee?.name ?? "Unknown"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          chargeType === "EXPENSE" ? "secondary" : "default"
                        }
                      >
                        {chargeType}
                      </Badge>
                    </TableCell>
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
                    {canPay && parent?._id && (
                      <TableCell className="text-right">
                        {record.status !== "PAID" && (
                          <PayNowButton
                            playerId={id}
                            parentId={parent._id}
                            amount={record.balance}
                            label={
                              record.status === "UNPAID"
                                ? "Pay Now"
                                : "Pay Balance"
                            }
                          />
                        )}
                      </TableCell>
                    )}
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
