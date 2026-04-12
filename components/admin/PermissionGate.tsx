"use client";

import { useUser } from "@clerk/nextjs";
import { hasPermission, parseRole, type AdminPermission } from "@/lib/rbac";

type PermissionGateProps = {
  permission: AdminPermission;
  children: React.ReactNode;
};

export function PermissionGate({ permission, children }: PermissionGateProps) {
  const { user } = useUser();
  const role = parseRole(user?.publicMetadata?.role);

  if (!hasPermission(role, permission)) {
    return (
      <div className="rounded-2xl border border-primary/10 bg-white p-6 text-sm text-muted-foreground">
        Bạn không đủ quyền để truy cập khu vực này.
      </div>
    );
  }

  return <>{children}</>;
}
