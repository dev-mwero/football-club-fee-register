"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Player {
  _id: string;
  fullName: string;
  teamCategory: string;
  parent: { _id: string; name: string } | null;
  feeRecords: FeeRecord[];
}

interface FeeRecord {
  _id: string;
  amountDue: number;
  amountPaid: number;
  balance: number;
  status: string;
  chargeType?: "FEE" | "EXPENSE";
}

export default function ManualPaymentPage() {
  const router = useRouter();
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [recordTypeFilter, setRecordTypeFilter] = useState<"ALL" | "FEE" | "EXPENSE">("ALL");

  useEffect(() => {
    fetch("/api/admin/payments/manual/players")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setPlayers(data.data);
      })
      .finally(() => setDataLoading(false));
  }, []);

  const selectedPlayer = players.find((p) => p._id === selectedPlayerId);

  const feeRecords = selectedPlayer?.feeRecords ?? [];
  const visibleFeeRecords =
    recordTypeFilter === "ALL"
      ? feeRecords
      : feeRecords.filter((record) => (record.chargeType ?? "FEE") === recordTypeFilter);
  const totalOutstanding = feeRecords.reduce((sum, r) => sum + r.balance, 0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPlayerId || !amount || Number(amount) <= 0) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/payments/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerId: selectedPlayerId,
          amount: Number(amount),
          notes: notes || undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error ?? "Failed to record payment");
        return;
      }

      toast.success("Manual payment recorded successfully");
      router.push("/dashboard/payments");
      router.refresh();
    } catch {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  }

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/payments">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Record Manual Payment
          </h1>
          <p className="text-sm text-muted-foreground">
            Record a cash, mobile transfer, or other off-platform payment
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="player">Player</Label>
                <Select
                  value={selectedPlayerId}
                  onValueChange={(v) => {
                    if (v) setSelectedPlayerId(v);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a player" />
                  </SelectTrigger>
                  <SelectContent>
                    {players.map((p) => (
                      <SelectItem key={p._id} value={p._id}>
                        {p.fullName} ({p.teamCategory}) —{" "}
                        {p.parent?.name ?? "No parent"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">
                  Amount (KES) — Outstanding:{" "}
                  {totalOutstanding.toLocaleString()}
                </Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  placeholder="e.g. 5000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Input
                  id="notes"
                  placeholder="e.g. Cash payment, M-PESA ref XYZ"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !selectedPlayerId || !amount}
              >
                {loading ? "Recording..." : "Record Payment"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>
                Fee Records — {selectedPlayer?.fullName ?? "..."}
              </CardTitle>
              <Select
                value={recordTypeFilter}
                onValueChange={(value) =>
                  setRecordTypeFilter(value as "ALL" | "FEE" | "EXPENSE")
                }
              >
                <SelectTrigger className="w-35">
                  <SelectValue placeholder="Filter type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All</SelectItem>
                  <SelectItem value="FEE">Fees</SelectItem>
                  <SelectItem value="EXPENSE">Expenses</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {!selectedPlayer ? (
              <p className="text-sm text-muted-foreground">
                Select a player to see their fee records
              </p>
            ) : visibleFeeRecords.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No {recordTypeFilter === "ALL" ? "fee records" : recordTypeFilter.toLowerCase()} found for this player
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead>Paid</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleFeeRecords.map((r) => (
                    <TableRow key={r._id}>
                      <TableCell>
                        <Badge
                          variant={
                            (r.chargeType ?? "FEE") === "EXPENSE"
                              ? "secondary"
                              : "default"
                          }
                        >
                          {r.chargeType ?? "FEE"}
                        </Badge>
                      </TableCell>
                      <TableCell>KES {r.amountDue.toLocaleString()}</TableCell>
                      <TableCell>KES {r.amountPaid.toLocaleString()}</TableCell>
                      <TableCell>KES {r.balance.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            r.status === "PAID"
                              ? "default"
                              : r.status === "PARTIAL"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {r.status}
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
    </div>
  );
}
