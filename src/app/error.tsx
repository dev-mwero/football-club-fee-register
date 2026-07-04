"use client";

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
        <div className="flex h-screen items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Application Error
            </h2>
            <p className="text-gray-600 mb-4">
              A critical error occurred. Please refresh the page.
            </p>
            <button
              type="button"
              onClick={reset}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
