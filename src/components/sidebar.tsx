"use client";

import {
  BarChart3,
  Bell,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Pen,
  Receipt,
  UserCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface SidebarProps {
  role: string;
}

const adminItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/players", label: "Players", icon: Users },
  { href: "/dashboard/fees", label: "Fees", icon: Receipt },
  { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
  { href: "/dashboard/payments/manual", label: "Record Payment", icon: Pen },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
];

const parentItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/players", label: "My Children", icon: UserCheck },
  { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
];

function NavLink({
  item,
  pathname,
  onClick,
}: {
  item: { href: string; label: string; icon: React.ElementType };
  pathname: string;
  onClick?: () => void;
}) {
  const isActive = pathname === item.href;
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-primary/15 text-primary"
          : "text-slate-400 hover:bg-white/5 hover:text-slate-200",
      )}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-primary shadow-[0_0_8px_rgba(132,204,22,0.4)]" />
      )}
      <Icon
        className={cn(
          "h-5 w-5 shrink-0 transition-colors",
          isActive
            ? "text-primary"
            : "text-slate-500 group-hover:text-slate-300",
        )}
      />
      {item.label}
    </Link>
  );
}

function NavContent({
  navItems,
  pathname,
  role,
  onNavigate,
}: {
  navItems: typeof adminItems;
  pathname: string;
  role: string;
  onNavigate?: () => void;
}) {
  const isAdmin = role === "ADMIN";

  async function handleLogout() {
    await fetch("/api/v1/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <>
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            pathname={pathname}
            onClick={onNavigate}
          />
        ))}
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-slate-500">
          {isAdmin ? "Admin Account" : "Parent Account"}
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-slate-400 hover:bg-white/5 hover:text-red-400"
          onClick={() => {
            handleLogout();
            onNavigate?.();
          }}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </>
  );
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const items = role === "ADMIN" ? adminItems : parentItems;

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden h-screen w-64 shrink-0 flex-col bg-[#0a0f1e] lg:flex">
        <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-400 text-sm font-bold text-[#0a0f1e] shadow-lg shadow-primary/20">
            FA
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-emerald-400 opacity-40 blur-md" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-lg tracking-wide text-white">
              Football Academy
            </span>
            <span className="text-[11px] text-slate-500">Fee Register</span>
          </div>
        </div>

        <NavContent navItems={items} pathname={pathname} role={role} />
      </aside>

      {/* Mobile header */}
      <div className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-white/10 bg-[#0a0f1e]/95 px-4 backdrop-blur-sm lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="text-slate-400 hover:text-white lg:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            }
          />
          <SheetContent
            side="left"
            className="w-72 border-white/10 bg-[#0a0f1e] p-0"
          >
            <div className="flex h-16 items-center gap-3 border-b border-white/10 px-5">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-400 text-sm font-bold text-[#0a0f1e] shadow-lg shadow-primary/20">
                FA
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-emerald-400 opacity-40 blur-md" />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-lg tracking-wide text-white">
                  Football Academy
                </span>
                <span className="text-[11px] text-slate-500">Fee Register</span>
              </div>
            </div>
            <NavContent
              navItems={items}
              pathname={pathname}
              role={role}
              onNavigate={() => setOpen(false)}
            />
          </SheetContent>
        </Sheet>

        <div className="flex items-center gap-2">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-emerald-400 text-xs font-bold text-[#0a0f1e]">
            FA
          </div>
          <span className="font-display text-base tracking-wide text-white">
            Football Academy
          </span>
        </div>
      </div>
    </>
  );
}
