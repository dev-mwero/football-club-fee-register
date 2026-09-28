"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
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

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [invite, setInvite] = useState<{ email: string; role: string } | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [inviteError, setInviteError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    fetch(`/api/v1/auth/invite?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        const data = await res.json().catch(() => null);

        if (res.ok && data?.success) {
          setInvite(data.data);
          return;
        }

        if (res.status === 401) {
          setInviteError(
            "This invitation link could not be verified. Please ask the academy to send you a new one.",
          );
          return;
        }

        setInviteError(data?.error ?? "This invitation is not valid.");
      })
      .catch(() => setInviteError("Failed to verify invitation"))
      .finally(() => setLoading(false));
  }, [token]);

  if (!token) {
    return (
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Invite Only</CardTitle>
          <CardDescription>
            Registration is currently invite-only. Please contact the academy
            administrator to create your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/login">
            <Button className="w-full">Back to Sign In</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl">Verifying Invitation...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (inviteError || !invite) {
    return (
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl text-destructive">
            Invalid Invitation
          </CardTitle>
          <CardDescription>
            {inviteError || "This invitation is not valid."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/login">
            <Button className="w-full">Back to Sign In</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const registeredEmail = invite.email;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email: registeredEmail,
          phone,
          password,
          inviteToken: token,
        }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.success) {
        router.push("/dashboard");
        return;
      }

      setSubmitError(
        data?.error ??
          (res.status === 401
            ? "Your invitation could not be verified. Please ask the academy to send you a new link."
            : "Registration failed. Please try again."),
      );
    } catch {
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const roleLabel = invite
    ? invite.role === "ADMIN"
      ? "an Administrator"
      : invite.role === "COACH"
        ? "a Coach"
        : "a Parent"
    : "";

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl text-primary">Create Account</CardTitle>
        <CardDescription>
          You've been invited as <strong>{roleLabel}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={registeredEmail}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              minLength={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0712345678"
              required
              minLength={10}
              maxLength={15}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              required
              minLength={8}
            />
          </div>

          {submitError && (
            <p className="text-sm text-destructive">{submitError}</p>
          )}

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Loading...</CardTitle>
          </CardHeader>
        </Card>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
