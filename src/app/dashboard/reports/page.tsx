import { AlertTriangle, ArrowRight, FileText } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/page-layout";
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
      <PageHeader
        title="Reports"
        description="Generate and view financial reports"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/dashboard/reports/payments" className="group">
          <Card className="transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">Payment Report</CardTitle>
                  <CardDescription className="mt-0.5">
                    View all payment transactions
                  </CardDescription>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Detailed breakdown of all payment transactions with player and
                parent details.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/reports/outstanding" className="group">
          <Card className="transition-all duration-200 hover:border-amber-500/30 hover:shadow-md hover:shadow-amber-500/5">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 transition-colors group-hover:bg-amber-500 group-hover:text-white">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">Outstanding Fees</CardTitle>
                  <CardDescription className="mt-0.5">
                    View unpaid and partially paid fees
                  </CardDescription>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-amber-600" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                See all accounts with outstanding balances and track collection
                progress.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
