import { AlertTriangle, FileText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>
        <p className="text-sm text-muted-foreground">
          Generate and view financial reports
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle>Payment Report</CardTitle>
            </div>
            <CardDescription>
              View all payment transactions with player and parent details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/reports/payments">
              <Button>View Report</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <CardTitle>Outstanding Fees Report</CardTitle>
            </div>
            <CardDescription>
              View all accounts with unpaid or partially paid fees
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/reports/outstanding">
              <Button>View Report</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
