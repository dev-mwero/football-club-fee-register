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
        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-primary text-primary-foreground shadow-md"
          : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
      )}
    >
      <Icon
        className={cn(
          "h-5 w-5 shrink-0 transition-colors",
          isActive
            ? "text-primary-foreground"
            : "text-muted-foreground group-hover:text-foreground",
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

      <div className="border-t p-3">
        <div className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {isAdmin ? "Admin Account" : "Parent Account"}
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
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
      <aside className="hidden h-screen w-64 shrink-0 flex-col border-r bg-card lg:flex">
        <div className="flex h-16 items-center gap-3 border-b px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-600 text-sm font-bold text-white shadow-lg shadow-primary/25">
            FA
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-foreground">
              Football Academy
            </span>
            <span className="text-[11px] text-muted-foreground">
              Fee Register
            </span>
          </div>
        </div>

        <NavContent navItems={items} pathname={pathname} role={role} />
      </aside>

      {/* Mobile header */}
      <div className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-card/95 px-4 backdrop-blur-sm lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            }
          />
          <SheetContent side="left" className="w-72 p-0">
            <div className="flex h-16 items-center gap-3 border-b px-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-600 text-sm font-bold text-white shadow-lg shadow-primary/25">
                FA
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">
                  Football Academy
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Fee Register
                </span>
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
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-emerald-600 text-xs font-bold text-white">
            FA
          </div>
          <span className="text-sm font-semibold text-foreground">
            Football Academy
          </span>
        </div>
      </div>
    </>
  );
}
