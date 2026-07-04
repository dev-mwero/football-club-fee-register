"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
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

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const data = {
      email: form.get("email"),
      password: form.get("password"),
    };

    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Login failed");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0f1e] p-4">
      {/* Background glow */}
      <div className="absolute left-1/2 top-1/3 h-64 w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/8 blur-[120px]" />

      <Card className="relative w-full max-w-md overflow-hidden border-white/10 bg-[#111827]">
        {/* Top accent bar */}
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-primary via-emerald-400 to-primary" />

        <CardHeader className="text-center pt-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-400 text-sm font-bold text-[#0a0f1e] shadow-lg shadow-primary/20">
            FA
          </div>
          <CardTitle className="font-display text-3xl tracking-wide text-white">
            Fee Register
          </CardTitle>
          <CardDescription className="text-slate-400">
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-slate-300" htmlFor="email">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                className="border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-primary focus:ring-primary/20"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-slate-300" htmlFor="password">
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                className="border-white/10 bg-white/5 text-white placeholder:text-slate-500 focus:border-primary focus:ring-primary/20"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-primary text-[#0a0f1e] hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <p className="mt-4 text-center text-sm text-slate-500">
            Registration is invite-only. Contact the academy to create your
            account.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
