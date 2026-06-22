import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <span className="text-xl font-bold text-primary">Fee Register</span>
        <div className="flex gap-3">
          <Link href="/login">
            <Button variant="outline">Sign In</Button>
          </Link>
          <Link href="/register">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Football Academy Fee Management
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          Track player registrations, manage fee structures, process payments,
          and send automated reminders — all in one place.
        </p>
        <div className="mt-8 flex gap-4">
          <Link href="/register">
            <Button size="lg">Get Started</Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg">
              Sign In
            </Button>
          </Link>
        </div>
      </main>

      <footer className="border-t px-6 py-4 text-center text-sm text-muted-foreground">
        {"\u00A9"} {new Date().getFullYear()} Fee Register
      </footer>
    </div>
  );
}
