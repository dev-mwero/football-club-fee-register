"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Player {
  _id: string;
  fullName: string;
  teamCategory: string;
}

interface FeeStructure {
  _id: string;
  name: string;
  amount: number;
}

export default function AssignFeePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);

  useEffect(() => {
    fetch("/api/players")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setPlayers(res.data);
      })
      .catch(() => {});

    fetch("/api/fees")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setFeeStructures(res.data);
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);

    const selectedFee = feeStructures.find(
      (f) => f._id === form.get("feeStructure"),
    );

    const data = {
      player: form.get("player"),
      feeStructure: form.get("feeStructure"),
      amountDue: selectedFee?.amount ?? Number(form.get("amountDue")),
    };

    try {
      const res = await fetch("/api/fee-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Failed to assign fee");
        return;
      }

      router.push("/dashboard/fees");
      router.refresh();
    } catch {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/fees">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Assign Fee to Player
          </h1>
          <p className="text-sm text-muted-foreground">
            Link a fee structure to a player
          </p>
        </div>
      </div>

      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Assignment</CardTitle>
          <CardDescription>Select a player and fee structure</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="player">Player</Label>
              <Select name="player" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select player" />
                </SelectTrigger>
                <SelectContent>
                  {players.map((player) => (
                    <SelectItem key={player._id} value={player._id}>
                      {player.fullName} ({player.teamCategory})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feeStructure">Fee Structure</Label>
              <Select name="feeStructure" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select fee" />
                </SelectTrigger>
                <SelectContent>
                  {feeStructures.map((fee) => (
                    <SelectItem key={fee._id} value={fee._id}>
                      {fee.name} - KES {fee.amount.toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Assigning..." : "Assign Fee"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
