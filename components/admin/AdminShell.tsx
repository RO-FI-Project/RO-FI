"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import type { AdminRole } from "@/lib/rbac";
import { cn } from "@/lib/utils";

type AdminShellProps = {
  role: AdminRole;
  userLabel: string;
  children: React.ReactNode;
};

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Releases", href: "/admin/releases" },
  { label: "Leads", href: "/admin/leads" },
  { label: "Settings", href: "/admin/settings" },
  { label: "Audit Log", href: "/admin/audit" },
];

export function AdminShell({ role, userLabel, children }: AdminShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-muted/30 text-foreground">
      <div className="border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div>
            <p className="text-xs text-muted-foreground">RF Admin</p>
            <h1 className="text-xl font-semibold">Bảng quản trị</h1>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="rounded-full px-3 py-1 text-xs uppercase">{role}</Badge>
            <span className="text-sm font-medium">{userLabel}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto grid gap-6 px-4 py-6 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-2 rounded-2xl border border-primary/10 bg-white p-4 shadow-sm">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </aside>
        <main className="space-y-6">{children}</main>
      </div>
    </div>
  );
}
