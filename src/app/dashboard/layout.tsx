import { redirect } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { getSession } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar role={session.role} />
      <main className="flex-1 overflow-auto bg-background p-6">{children}</main>
      <Toaster />
    </div>
  );
}
