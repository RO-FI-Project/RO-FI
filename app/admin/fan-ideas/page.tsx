"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PermissionGate } from "@/components/admin/PermissionGate";
import { hasPermission, parseRole } from "@/lib/rbac";

const ideaStatuses = ["new", "reviewing", "approved", "declined"] as const;

export default function FanIdeasAdminPage() {
  const { user } = useUser();
  const [statusFilter, setStatusFilter] = useState<"all" | (typeof ideaStatuses)[number]>("all");
  const ideas = useQuery(api.fanIdeasAdmin.list, {
    status: statusFilter === "all" ? undefined : statusFilter,
  });
  const updateStatus = useMutation(api.fanIdeasAdmin.updateStatus);
  const logAction = useMutation(api.adminAudit.logAction);
  const role = parseRole(user?.publicMetadata?.role);
  const canWrite = hasPermission(role, "fanIdeas.write");

  const sortedIdeas = useMemo(() => ideas ?? [], [ideas]);

  const handleStatusChange = async (id: Id<"fanIdeas">, status: (typeof ideaStatuses)[number]) => {
    await updateStatus({ id, status });
    await logAction({
      actorEmail: user?.primaryEmailAddress?.emailAddress ?? "unknown",
      actorRole: (user?.publicMetadata?.role as string | undefined) ?? "unknown",
      action: "update",
      resource: "fanIdea",
      resourceId: String(id),
      after: JSON.stringify({ status }),
    });
  };

  return (
    <PermissionGate permission="fanIdeas.read">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Fan Ideas</h2>
          <p className="text-sm text-muted-foreground">Theo dõi ý tưởng và phản hồi theo trạng thái.</p>
        </div>

        <Card className="border-primary/10">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Danh sách ý tưởng</CardTitle>
            <select
              className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm sm:w-auto"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
            >
              <option value="all">Tất cả trạng thái</option>
              {ideaStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </CardHeader>
          <CardContent className="space-y-4">
            {sortedIdeas.length === 0 ? (
              <p className="text-sm text-muted-foreground">Chưa có ý tưởng mới.</p>
            ) : (
              sortedIdeas.map((idea) => (
                <div key={idea._id} className="rounded-2xl border border-primary/10 bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(idea.createdAt).toLocaleString("vi-VN")}
                      </p>
                      <h3 className="text-lg font-semibold">{idea.fanName}</h3>
                      <p className="text-sm text-muted-foreground">Ngày đề xuất: {idea.proposedDate}</p>
                    </div>
                    <Badge className="rounded-full">{idea.status}</Badge>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{idea.idea}</p>
                  <div className="mt-4 flex items-center gap-2">
                    <select
                      className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
                      value={idea.status}
                      disabled={!canWrite}
                      onChange={(event) =>
                        handleStatusChange(idea._id, event.target.value as (typeof ideaStatuses)[number])
                      }
                    >
                      {ideaStatuses.map((status) => (
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
