"use client";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-64 animate-pulse rounded bg-muted" />
      </div>

      {/* Stat cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="h-[100px] animate-pulse rounded-xl border bg-card" />
        <div className="h-[100px] animate-pulse rounded-xl border bg-card" />
        <div className="h-[100px] animate-pulse rounded-xl border bg-card" />
      </div>

      {/* Secondary stats skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <div className="h-[100px] animate-pulse rounded-xl border bg-card" />
        <div className="h-[100px] animate-pulse rounded-xl border bg-card" />
        <div className="h-[100px] animate-pulse rounded-xl border bg-card" />
        <div className="h-[100px] animate-pulse rounded-xl border bg-card" />
        <div className="h-[100px] animate-pulse rounded-xl border bg-card" />
      </div>

      {/* Table skeleton */}
      <div className="h-[300px] animate-pulse rounded-xl border bg-card" />
    </div>
  );
}
