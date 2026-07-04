"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
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
  status: "ACTIVE" | "INACTIVE" | "GRADUATED";
}

interface FeeStructure {
  _id: string;
  name: string;
  amount: number;
  frequency: "ONE_TIME" | "MONTHLY" | "TERMLY" | "YEARLY";
}

function getCurrentPeriodKey() {
  return new Date().toISOString().slice(0, 7);
}

function getUniqueTeamCategories(players: Player[]) {
  return Array.from(
    new Set(players.map((player) => player.teamCategory)),
  ).sort();
}

function getPlayerLabel(player: Player) {
  return `${player.fullName} (${player.teamCategory})`;
}

export default function AssignFeePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [autoLoading, setAutoLoading] = useState(false);
  const [error, setError] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [periodKey, setPeriodKey] = useState(getCurrentPeriodKey());
  const [selectedAutoFeeId, setSelectedAutoFeeId] = useState("");
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [selectedManualFeeId, setSelectedManualFeeId] = useState("");
  const [billingScope, setBillingScope] = useState("ALL_ACTIVE");
  const [selectedTeamCategory, setSelectedTeamCategory] = useState("");
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [billingLabel, setBillingLabel] = useState("");
  const [billingReason, setBillingReason] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const activePlayers = players.filter((player) => player.status === "ACTIVE");

  useEffect(() => {
    fetch("/api/v1/players")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setPlayers(res.data);
      })
      .catch(() => {});

    fetch("/api/v1/fees")
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

    const selectedFee = feeStructures.find(
      (f) => f._id === selectedManualFeeId,
    );

    if (!selectedPlayerId || !selectedFee) {
      setError("Select both a player and fee structure");
      setLoading(false);
      return;
    }

    const data = {
      player: selectedPlayerId,
      feeStructure: selectedFee._id,
      amountDue: selectedFee.amount,
    };

    try {
      const res = await fetch("/api/v1/fee-records", {
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

  async function handleAutoBilling(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setAutoLoading(true);

    const selectedFee = feeStructures.find((f) => f._id === selectedAutoFeeId);
    const parsedCustomAmount = customAmount.trim()
      ? Number(customAmount)
      : null;

    if (!selectedFee) {
      setError("Select a fee structure for automatic billing");
      setAutoLoading(false);
      return;
    }

    if (
      parsedCustomAmount !== null &&
      (!Number.isFinite(parsedCustomAmount) || parsedCustomAmount <= 0)
    ) {
      setError("Enter a valid custom amount greater than zero");
      setAutoLoading(false);
      return;
    }

    try {
      const payload: {
        billingType: string;
        feeStructure: string;
        amountDue: number;
        periodKey: string;
        teamCategory?: string;
        playerIds?: string[];
        billingLabel?: string;
        billingReason?: string;
        chargeType?: "FEE" | "EXPENSE";
      } = {
        billingType: "AUTO",
        feeStructure: selectedFee._id,
        amountDue: parsedCustomAmount ?? selectedFee.amount,
        periodKey,
      };

      if (billingScope === "TEAM_CATEGORY") {
        if (!selectedTeamCategory) {
          setError("Select a team category for group billing");
          setAutoLoading(false);
          return;
        }

        payload.teamCategory = selectedTeamCategory;
      } else if (billingScope === "SELECTED_PLAYERS") {
        if (selectedPlayerIds.length === 0) {
          setError("Select at least one player for group billing");
          setAutoLoading(false);
          return;
        }

        payload.playerIds = selectedPlayerIds;
      }

      if (billingLabel.trim()) {
        payload.billingLabel = billingLabel.trim();
      }

      if (billingReason.trim()) {
        payload.billingReason = billingReason.trim();
      }

      if (
        parsedCustomAmount !== null ||
        billingLabel.trim() ||
        billingReason.trim()
      ) {
        payload.chargeType = "EXPENSE";
      }

      const res = await fetch("/api/v1/fee-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Failed to generate billing");
        return;
      }

      toast.success(
        `Generated ${json.data.createdCount ?? 0} bills for ${
          billingScope === "TEAM_CATEGORY"
            ? `${selectedTeamCategory} players`
            : billingScope === "SELECTED_PLAYERS"
              ? `${selectedPlayerIds.length} selected players`
              : "active players"
        } as ${payload.chargeType ?? "FEE"}`,
      );
      router.push("/dashboard/fees");
      router.refresh();
    } catch {
      setError("An error occurred");
    } finally {
      setAutoLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/fees">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="font-display text-4xl tracking-wide text-foreground sm:text-5xl">
            Assign Fee to Player
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Link a fee structure to a player
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="max-w-lg transition-all duration-200 hover:shadow-md">
          <CardHeader className="bg-muted/30">
            <CardTitle className="font-display text-lg tracking-wide">
              Manual Billing
            </CardTitle>
            <CardDescription>
              Assign a fee structure to one specific player
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="player">Player</Label>
                <Select
                  name="player"
                  required
                  value={selectedPlayerId}
                  onValueChange={(value) => setSelectedPlayerId(value ?? "")}
                >
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
                <Select
                  name="feeStructure"
                  required
                  value={selectedManualFeeId}
                  onValueChange={(value) => setSelectedManualFeeId(value ?? "")}
                >
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

        <Card className="max-w-lg transition-all duration-200 hover:shadow-md">
          <CardHeader className="bg-muted/30">
            <CardTitle className="font-display text-lg tracking-wide">
              Bulk Billing Trigger
            </CardTitle>
            <CardDescription>
              Manually trigger billing for all active players or a filtered
              group
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleAutoBilling} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="autoFeeStructure">Fee Structure</Label>
                <Select
                  required
                  value={selectedAutoFeeId}
                  onValueChange={(value) => setSelectedAutoFeeId(value ?? "")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select fee" />
                  </SelectTrigger>
                  <SelectContent>
                    {feeStructures.map((fee) => (
                      <SelectItem key={fee._id} value={fee._id}>
                        {fee.name} - KES {fee.amount.toLocaleString()} (
                        {fee.frequency.toLowerCase().replace("_", " ")})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="billingScope">Billing Scope</Label>
                <Select
                  value={billingScope}
                  onValueChange={(value) => setBillingScope(value ?? "")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose scope" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL_ACTIVE">
                      All active players
                    </SelectItem>
                    <SelectItem value="TEAM_CATEGORY">
                      Specific team category
                    </SelectItem>
                    <SelectItem value="SELECTED_PLAYERS">
                      Selected players
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {billingScope === "TEAM_CATEGORY" && (
                <div className="space-y-2">
                  <Label htmlFor="teamCategory">Team Category</Label>
                  <Select
                    value={selectedTeamCategory}
                    onValueChange={(value) =>
                      setSelectedTeamCategory(value ?? "")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select team category" />
                    </SelectTrigger>
                    <SelectContent>
                      {getUniqueTeamCategories(players).map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {billingScope === "SELECTED_PLAYERS" && (
                <div className="space-y-2">
                  <Label>Players</Label>
                  <div className="max-h-64 space-y-2 overflow-auto rounded-md border p-3">
                    {activePlayers.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No active players available
                      </p>
                    ) : (
                      activePlayers.map((player) => {
                        const checked = selectedPlayerIds.includes(player._id);

                        return (
                          <label
                            key={player._id}
                            className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1 text-sm hover:bg-muted"
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={(event) => {
                                setSelectedPlayerIds((current) =>
                                  event.target.checked
                                    ? [...current, player._id]
                                    : current.filter((id) => id !== player._id),
                                );
                              }}
                            />
                            <span>{getPlayerLabel(player)}</span>
                          </label>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="billingLabel">Expense Label</Label>
                <input
                  id="billingLabel"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={billingLabel}
                  onChange={(e) => setBillingLabel(e.target.value)}
                  placeholder="e.g. Transport levy, Tournament fee"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="billingReason">Reason / Notes</Label>
                <textarea
                  id="billingReason"
                  className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={billingReason}
                  onChange={(e) => setBillingReason(e.target.value)}
                  placeholder="Explain why this charge is being generated"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="periodKey">Billing Period</Label>
                <input
                  id="periodKey"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={periodKey}
                  onChange={(e) => setPeriodKey(e.target.value)}
                  placeholder="YYYY-MM"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Use a unique key per cycle, for example 2026-06 for June 2026.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customAmount">Custom Amount</Label>
                <input
                  id="customAmount"
                  type="number"
                  min="1"
                  step="0.01"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="Leave blank to use the fee structure amount"
                />
                <p className="text-xs text-muted-foreground">
                  Use this for one-off expenses that need a different amount.
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={autoLoading}>
                {autoLoading ? "Generating..." : "Generate Bills"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
