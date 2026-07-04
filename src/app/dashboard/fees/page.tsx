import { Pencil, Plus, Receipt } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
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
import { getSession } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { FeeStructure } from "@/models/FeeStructure";

export const dynamic = "force-dynamic";

export default async function FeesPage() {
  const session = await getSession();
  if (session?.role !== "ADMIN") redirect("/dashboard");
  await connectDB();
  const fees = await FeeStructure.find().sort({ createdAt: -1 });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fee Structures"
        description="Create and manage fee plans"
        action={
          <div className="flex gap-2">
            <Link href="/dashboard/fees/assign">
              <Button variant="outline">Assign Fees</Button>
            </Link>
            <Link href="/dashboard/fees/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Fee
              </Button>
            </Link>
          </div>
        }
      />

      {fees.length === 0 ? (
        <EmptyState
          icon={<Receipt className="h-7 w-7" />}
          title="No fee structures"
          description="Create your first fee structure to start billing players."
          action={
            <Link href="/dashboard/fees/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Fee Structure
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Amount</TableHead>
                <TableHead className="font-semibold">Frequency</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="text-right font-semibold">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fees.map((fee) => (
                <TableRow
                  key={fee._id.toString()}
                  className="transition-colors hover:bg-muted/50"
                >
                  <TableCell className="font-medium">{fee.name}</TableCell>
                  <TableCell className="font-medium text-foreground">
                    KES {fee.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="capitalize text-muted-foreground">
                    {fee.frequency.toLowerCase().replace("_", " ")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={fee.active ? "default" : "secondary"}
                      className={
                        fee.active
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                          : ""
                      }
                    >
                      {fee.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
