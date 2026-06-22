import { AlertTriangle, TrendingUp, Users, UserX, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { FeeRecord } from "@/models/FeeRecord";
import { Payment } from "@/models/Payment";
import { Player } from "@/models/Player";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await getSession();
  await connectDB();

  const totalPlayers = await Player.countDocuments({ status: "ACTIVE" });
  const totalRevenue = await Payment.aggregate([
    { $match: { status: "SUCCESS" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const outstandingFees = await FeeRecord.aggregate([
    { $match: { status: { $in: ["UNPAID", "PARTIAL"] } } },
    { $group: { _id: null, total: { $sum: "$balance" } } },
  ]);
  const unpaidAccounts = await FeeRecord.countDocuments({ status: "UNPAID" });
  const monthlyCollections = await Payment.aggregate([
    {
      $match: {
        status: "SUCCESS",
        paymentDate: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const stats = [
    {
      title: "Total Players",
      value: totalPlayers,
      icon: Users,
      color: "text-primary",
    },
    {
      title: "Total Revenue",
      value: `KES ${(totalRevenue[0]?.total ?? 0).toLocaleString()}`,
      icon: TrendingUp,
      color: "text-emerald-600",
    },
    {
      title: "Outstanding Fees",
      value: `KES ${(outstandingFees[0]?.total ?? 0).toLocaleString()}`,
      icon: AlertTriangle,
      color: "text-amber-500",
    },
    {
      title: "Monthly Collections",
      value: `KES ${(monthlyCollections[0]?.total ?? 0).toLocaleString()}`,
      icon: Wallet,
      color: "text-blue-600",
    },
    {
      title: "Unpaid Accounts",
      value: unpaidAccounts,
      icon: UserX,
      color: "text-red-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Welcome, {session?.role === "ADMIN" ? "Admin" : "Parent"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Here is your academy financial overview
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
