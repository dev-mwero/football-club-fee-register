import { ArrowLeft, Calendar, MapPin, Trophy, User, Users } from "lucide-react";
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

  const totalDue = visibleFeeRecords.reduce((s, r) => s + r.amountDue, 0);
  const totalPaid = visibleFeeRecords.reduce((s, r) => s + r.amountPaid, 0);
  const totalBalance = visibleFeeRecords.reduce((s, r) => s + r.balance, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/players">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {player.fullName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
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
          className={
            player.status === "ACTIVE"
              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
              : ""
          }
        >
          {player.status}
        </Badge>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Due</p>
                <p className="text-lg font-bold text-foreground">
                  KES {totalDue.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                <Trophy className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Paid</p>
                <p className="text-lg font-bold text-emerald-600">
                  KES {totalPaid.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
                <Trophy className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Balance</p>
                <p className="text-lg font-bold text-amber-500">
                  KES {totalBalance.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Player Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" /> Date of Birth
              </span>
              <span className="font-medium">
                {new Date(player.dateOfBirth).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" /> Position
              </span>
              <span className="font-medium">{player.position}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Trophy className="h-3.5 w-3.5" /> Category
              </span>
              <Badge variant="outline" className="font-normal">
                {player.teamCategory}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="transition-all duration-200 hover:shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Parent / Guardian</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{parent?.name ?? "\u2014"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{parent?.email ?? "\u2014"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone</span>
              <span className="font-medium">{parent?.phone ?? "\u2014"}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
        <CardHeader className="bg-muted/30">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base">Fee Records</CardTitle>
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
        <CardContent className="p-0">
          {visibleFeeRecords.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-muted-foreground">
              No{" "}
              {recordTypeFilter === "ALL"
                ? "fee records"
                : recordTypeFilter.toLowerCase()}{" "}
              found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold">Fee</TableHead>
                  <TableHead className="font-semibold">Type</TableHead>
                  <TableHead className="font-semibold">Amount Due</TableHead>
                  <TableHead className="font-semibold">Paid</TableHead>
                  <TableHead className="font-semibold">Balance</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  {canPay && (
                    <TableHead className="text-right font-semibold">
                      Action
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleFeeRecords.map((record) => {
                  const fee = record.feeStructure as unknown as {
                    name: string;
                    amount: number;
                  };
                  const chargeType =
                    (record as unknown as { chargeType?: "FEE" | "EXPENSE" })
                      .chargeType ?? "FEE";
                  return (
                    <TableRow
                      key={record._id.toString()}
                      className="transition-colors hover:bg-muted/50"
                    >
                      <TableCell className="font-medium">
                        {fee?.name ?? "Unknown"}
                      </TableCell>
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
                      <TableCell>
                        KES {record.amountDue.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        KES {record.amountPaid.toLocaleString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        KES {record.balance.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            record.status === "PAID"
                              ? "default"
                              : record.status === "PARTIAL"
                                ? "secondary"
                                : "destructive"
                          }
                          className={
                            record.status === "PAID"
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                              : ""
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
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden transition-all duration-200 hover:shadow-md">
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-base">Payment History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {payments.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-muted-foreground">
              No payments yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Amount</TableHead>
                  <TableHead className="font-semibold">Reference</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow
                    key={payment._id.toString()}
                    className="transition-colors hover:bg-muted/50"
                  >
                    <TableCell>
                      {new Date(payment.paymentDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">
                      KES {payment.amount.toLocaleString()}
                    </TableCell>
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
                        className={
                          payment.status === "SUCCESS"
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                            : ""
                        }
                      >
                        {payment.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
