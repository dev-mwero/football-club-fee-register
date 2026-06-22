"use client";

import {
  BarChart3,
  Bell,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Receipt,
  UserCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface SidebarProps {
  role: string;
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = role === "ADMIN";

  const adminItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/players", label: "Players", icon: Users },
    { href: "/dashboard/fees", label: "Fees", icon: Receipt },
    { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
    { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
    { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
  ];

  const parentItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/players", label: "My Children", icon: UserCheck },
    { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
  ];

  const navItems = isAdmin ? adminItems : parentItems;

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-card">
      <div className="flex h-14 items-center gap-2 border-b px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
          FR
        </div>
        <span className="text-lg font-semibold text-primary">Fee Register</span>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Separator />

      <div className="space-y-1 p-3">
        <div className="px-3 py-2 text-xs text-muted-foreground">
          {isAdmin ? "Admin" : "Parent"}
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
