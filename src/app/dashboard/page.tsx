import { AlertTriangle, TrendingUp, Users, UserX, Wallet } from "lucide-react";
import Link from "next/link";
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
import { Player } from "@/models/Player";
import { getDashboardStats } from "@/services/report-service";

export const dynamic = "force-dynamic";

async function AdminDashboard() {
  const statsData = await getDashboardStats();

  const stats = [
    {
      title: "Total Players",
      value: statsData.totalPlayers,
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Total Revenue",
      value: `KES ${statsData.totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-emerald-600",
    },
    {
      title: "Fee Collections",
      value: `KES ${statsData.feeCollections.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-emerald-600",
    },
    {
      title: "Expense Collections",
      value: `KES ${statsData.expenseCollections.toLocaleString()}`,
      icon: Wallet,
      color: "text-sky-600",
    },
    {
      title: "Monthly Collections",
      value: `KES ${statsData.monthlyCollections.toLocaleString()}`,
      icon: Wallet,
      color: "text-blue-600",
    },
    {
      title: "Unpaid Accounts",
      value: statsData.unpaidAccounts,
      icon: UserX,
      color: "text-red-500",
    },
    {
      title: "Fee Balances",
      value: `KES ${statsData.outstandingFees.toLocaleString()}`,
      icon: AlertTriangle,
      color: "text-amber-500",
    },
    {
      title: "Expense Balances",
      value: `KES ${statsData.outstandingExpenses.toLocaleString()}`,
      icon: Wallet,
      color: "text-sky-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Academy financial overview
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

async function ParentDashboard(
  parentId: string,
  recordTypeFilter: "ALL" | "FEE" | "EXPENSE",
) {
  await connectDB();

  const children = await Player.find({ parent: parentId, status: "ACTIVE" });

  const childData = await Promise.all(
    children.map(async (player) => {
      const records = await FeeRecord.find({ player: player._id })
        .populate("feeStructure", "name amount")
        .sort({ createdAt: -1 });
      const visibleRecords =
        recordTypeFilter === "ALL"
          ? records
          : records.filter(
              (record) =>
                ((record as unknown as { chargeType?: "FEE" | "EXPENSE" })
                  .chargeType ?? "FEE") === recordTypeFilter,
            );

      const totalDue = visibleRecords.reduce((s, r) => s + r.amountDue, 0);
      const totalPaid = visibleRecords.reduce((s, r) => s + r.amountPaid, 0);
      const totalBalance = visibleRecords.reduce((s, r) => s + r.balance, 0);
      const hasUnpaid = visibleRecords.some((r) => r.status !== "PAID");

      return {
        id: player._id.toString(),
        name: player.fullName,
        category: player.teamCategory,
        records: visibleRecords,
        totalDue,
        totalPaid,
        totalBalance,
        hasUnpaid,
      };
    }),
  );

  const totalBalanceAll = childData.reduce((s, c) => s + c.totalBalance, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Your children&apos;s fee status
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Children Registered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{children.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Paid
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600">
              KES{" "}
              {childData.reduce((s, c) => s + c.totalPaid, 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Outstanding Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-500">
              KES {totalBalanceAll.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {childData.map((child) => (
        <Card key={child.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{child.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {child.category}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm">
                  Balance:{" "}
                  <span
                    className={
                      child.totalBalance > 0
                        ? "font-semibold text-destructive"
                        : "font-semibold text-emerald-600"
                    }
                  >
                    KES {child.totalBalance.toLocaleString()}
                  </span>
                </span>
                <Link href={`/dashboard/players/${child.id}`}>
                  <Button variant="outline" size="sm">
                    View Details
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {child.records.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
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
                {child.records.map((record) => {
                  const fee = record.feeStructure as unknown as {
                    name: string;
                    amount: number;
                  } | null;
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
                      <TableCell>
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
      ))}
    </div>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ type?: string }>;
}) {
  const session = await getSession();
  const isAdmin = session?.role === "ADMIN";
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const recordTypeFilter: "ALL" | "FEE" | "EXPENSE" =
    resolvedSearchParams?.type === "EXPENSE"
      ? "EXPENSE"
      : resolvedSearchParams?.type === "FEE"
        ? "FEE"
        : "ALL";

  if (isAdmin) {
    return <AdminDashboard />;
  }

  return ParentDashboard(session?.userId ?? "", recordTypeFilter);
}
