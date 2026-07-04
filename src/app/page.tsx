import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0a0f1e]">
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-emerald-400 text-xs font-bold text-[#0a0f1e]">
            FA
          </div>
          <span className="font-display text-lg tracking-wide text-white">
            Football Academy
          </span>
        </div>
        <Link
          href="/login"
          className="rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
        >
          Sign In
        </Link>
      </header>

      <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 text-center">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1e] via-[#064e3b]/60 to-[#0a0f1e]" />

        {/* Lime glow at bottom */}
        <div className="absolute bottom-0 left-1/2 h-64 w-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />

        {/* Content */}
        <div className="relative z-10">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-primary">
            Football Academy
          </p>

          <h1 className="font-display text-7xl font-normal uppercase tracking-wide text-white sm:text-8xl md:text-9xl">
            Fee Register
          </h1>

          <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-gradient-to-r from-primary to-emerald-400" />

          <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-slate-400">
            Track player registrations, manage fee structures, process payments,
            and send automated reminders — all in one place.
          </p>

          <div className="mt-10">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-[#0a0f1e] shadow-lg shadow-primary/25 transition-all duration-200 hover:bg-primary/90 hover:shadow-primary/30"
            >
              Sign In
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 px-6 py-4 text-center text-sm text-slate-500">
        {"\u00A9"} {new Date().getFullYear()} Football Academy Fee Register
      </footer>
    </div>
  );
}
