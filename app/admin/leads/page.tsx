"use client";

import { useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PermissionGate } from "@/components/admin/PermissionGate";
import { hasPermission, parseRole } from "@/lib/rbac";

const leadStatuses = ["new", "responded", "archived"] as const;

export default function LeadsAdminPage() {
  const { user } = useUser();
  const leads = useQuery(api.leadsAdmin.list);
  const updateStatus = useMutation(api.leadsAdmin.updateStatus);
  const logAction = useMutation(api.adminAudit.logAction);
  const role = parseRole(user?.publicMetadata?.role);
  const canWrite = hasPermission(role, "leads.write");

  const sortedLeads = useMemo(() => leads ?? [], [leads]);

  const handleStatusChange = async (id: Id<"collabLeads">, status: (typeof leadStatuses)[number]) => {
    await updateStatus({ id, status });
    await logAction({
      actorEmail: user?.primaryEmailAddress?.emailAddress ?? "unknown",
      actorRole: (user?.publicMetadata?.role as string | undefined) ?? "unknown",
      action: "update",
      resource: "lead",
      resourceId: String(id),
      after: JSON.stringify({ status }),
    });
  };

  return (
    <PermissionGate permission="leads.read">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Lead hợp tác</h2>
          <p className="text-sm text-muted-foreground">Theo dõi pipeline và phản hồi nhanh cho đối tác.</p>
        </div>

      <Card className="border-primary/10">
        <CardHeader>
          <CardTitle>Danh sách lead</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sortedLeads.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có lead mới.</p>
          ) : (
            sortedLeads.map((lead) => (
              <div key={lead._id} className="rounded-2xl border border-primary/10 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">{new Date(lead.createdAt).toLocaleString("vi-VN")}</p>
                    <h3 className="text-lg font-semibold">{lead.name}</h3>
                    <p className="text-sm text-muted-foreground">{lead.email}</p>
                  </div>
                  <Badge className="rounded-full">{lead.status}</Badge>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{lead.message}</p>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span>Tổ chức: {lead.org ?? "-"}</span>
                  <span>Ngân sách: {lead.budget ?? "-"}</span>
                  <span>Deadline: {lead.deadline ?? "-"}</span>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <select
                    className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
                    value={lead.status}
                    disabled={!canWrite}
                    onChange={(event) => handleStatusChange(lead._id, event.target.value as (typeof leadStatuses)[number])}
                  >
                    {leadStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
    </PermissionGate>
  );
}
