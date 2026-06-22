import { Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Fee Structures</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage fee plans
          </p>
        </div>
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
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Frequency</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {fees.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground"
                >
                  No fee structures created yet
                </TableCell>
              </TableRow>
            )}
            {fees.map((fee) => (
              <TableRow key={fee._id.toString()}>
                <TableCell className="font-medium">{fee.name}</TableCell>
                <TableCell>KES {fee.amount.toLocaleString()}</TableCell>
                <TableCell className="capitalize">
                  {fee.frequency.toLowerCase().replace("_", " ")}
                </TableCell>
                <TableCell>
                  <Badge variant={fee.active ? "default" : "secondary"}>
                    {fee.active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
