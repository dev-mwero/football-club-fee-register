"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen items-center justify-center bg-[#0a0f1e] p-4">
          <div className="w-full max-w-md text-center">
            <div className="relative mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              <div className="absolute inset-0 rounded-2xl bg-destructive/5 blur-xl" />
            </div>
            <h2 className="font-display text-3xl tracking-wide text-white">
              Application Error
            </h2>
            <p className="mt-2 text-slate-400">
              A critical error occurred. Please refresh the page or try again.
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-6 inline-flex items-center justify-center rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-[#0a0f1e] shadow-lg shadow-primary/25 transition-all duration-200 hover:bg-primary/90"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
