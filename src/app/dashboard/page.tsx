import {
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Users,
  UserX,
  Wallet,
} from "lucide-react";
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

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  bgColor,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
}) {
  return (
    <Card className="relative overflow-hidden transition-all duration-200 hover:shadow-md">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {title}
            </p>
            <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
              {value}
            </p>
          </div>
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${bgColor}`}
          >
            <Icon className={`h-5 w-5 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

async function AdminDashboard() {
  const statsData = await getDashboardStats();

  const primaryStats = [
    {
      title: "Total Players",
      value: statsData.totalPlayers,
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Total Revenue",
      value: `KES ${statsData.totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-500/10",
    },
    {
      title: "Fee Collections",
      value: `KES ${statsData.feeCollections.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-500/10",
    },
  ];

  const secondaryStats = [
    {
      title: "Expense Collections",
      value: `KES ${statsData.expenseCollections.toLocaleString()}`,
      icon: Wallet,
      color: "text-sky-600",
      bgColor: "bg-sky-500/10",
    },
    {
      title: "Monthly Collections",
      value: `KES ${statsData.monthlyCollections.toLocaleString()}`,
      icon: Wallet,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Unpaid Accounts",
      value: statsData.unpaidAccounts,
      icon: UserX,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      title: "Fee Balances",
      value: `KES ${statsData.outstandingFees.toLocaleString()}`,
      icon: AlertTriangle,
      color: "text-cyan-600",
      bgColor: "bg-cyan-500/10",
    },
    {
      title: "Expense Balances",
      value: `KES ${statsData.outstandingExpenses.toLocaleString()}`,
      icon: Wallet,
      color: "text-sky-600",
      bgColor: "bg-sky-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Admin Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Academy financial overview
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {primaryStats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {secondaryStats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="flex items-center justify-end">
        <Link
          href="/dashboard/reports"
          className="group flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          View detailed reports
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
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
  const totalPaidAll = childData.reduce((s, c) => s + c.totalPaid, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          My Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your children&apos;s fee status
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="relative overflow-hidden transition-all duration-200 hover:shadow-md">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Children Registered
                </p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                  {children.length}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all duration-200 hover:shadow-md">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Total Paid
                </p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-emerald-600">
                  KES {totalPaidAll.toLocaleString()}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden transition-all duration-200 hover:shadow-md">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Outstanding Balance
                </p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-cyan-600">
                  KES {totalBalanceAll.toLocaleString()}
                </p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10">
                <AlertTriangle className="h-5 w-5 text-cyan-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {childData.map((child) => (
        <Card
          key={child.id}
          className="overflow-hidden transition-all duration-200 hover:shadow-md"
        >
          <CardHeader className="bg-muted/30">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-lg">{child.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {child.category}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Balance</p>
                  <p
                    className={`text-lg font-bold ${
                      child.totalBalance > 0
                        ? "text-destructive"
                        : "text-emerald-600"
                    }`}
                  >
                    KES {child.totalBalance.toLocaleString()}
                  </p>
                </div>
                <Link href={`/dashboard/players/${child.id}`}>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {child.records.length === 0 ? (
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {child.records.map((record) => {
                    const fee = record.feeStructure as unknown as {
                      name: string;
                      amount: number;
                    } | null;
                    const chargeType =
                      (
                        record as unknown as {
                          chargeType?: "FEE" | "EXPENSE";
                        }
                      ).chargeType ?? "FEE";
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
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
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
