"use client";

import { FileQuestion } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0f1e] p-4">
      <div className="w-full max-w-md text-center">
        <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
          <FileQuestion className="h-10 w-10 text-primary" />
          <div className="absolute inset-0 rounded-2xl bg-primary/5 blur-xl" />
        </div>
        <h1 className="font-display text-8xl tracking-wide text-white">404</h1>
        <h2 className="mt-2 font-display text-2xl tracking-wide text-white">
          Page not found
        </h2>
        <p className="mt-2 text-slate-400">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex items-center justify-center rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-[#0a0f1e] shadow-lg shadow-primary/25 transition-all duration-200 hover:bg-primary/90 hover:shadow-primary/30"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
