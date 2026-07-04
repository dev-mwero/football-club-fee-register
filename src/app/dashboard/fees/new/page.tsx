"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageHeader } from "@/components/page-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NewFeePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const data = {
      name: form.get("name"),
      amount: Number(form.get("amount")),
      frequency: form.get("frequency"),
      description: form.get("description"),
    };

    try {
      const res = await fetch("/api/v1/fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Failed to create fee");
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
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <PageHeader
          title="New Fee Structure"
          description="Create a new fee plan for the academy"
        />
      </div>

      <Card className="max-w-lg transition-all duration-200 hover:shadow-md">
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-base">Fee Details</CardTitle>
          <CardDescription>Define the fee structure</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Fee Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="e.g. Monthly Training Fee"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount (KES)</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                min="0"
                placeholder="5000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select name="frequency" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ONE_TIME">One Time</SelectItem>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="TERMLY">Termly</SelectItem>
                  <SelectItem value="YEARLY">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                name="description"
                placeholder="Brief description of the fee"
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating..." : "Create Fee Structure"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
