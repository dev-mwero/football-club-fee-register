"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface PayNowButtonProps {
  playerId: string;
  parentId: string;
  amount: number;
  label?: string;
}

export function PayNowButton({
  playerId,
  parentId,
  amount,
  label = "Pay Now",
}: PayNowButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePay() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/payments/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playerId, parentId, amount }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Payment initialization failed");
        return;
      }

      window.location.href = json.data.authorizationUrl;
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Button onClick={handlePay} disabled={loading} size="sm">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          label
        )}
      </Button>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
