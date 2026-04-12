"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PermissionGate } from "@/components/admin/PermissionGate";

export default function AuditLogPage() {
  const logs = useQuery(api.adminAudit.listRecent);

  return (
    <PermissionGate permission="audit.read">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Audit log</h2>
          <p className="text-sm text-muted-foreground">Theo dõi các thao tác quan trọng trong admin.</p>
        </div>

      <Card className="border-primary/10">
        <CardHeader>
          <CardTitle>Hoạt động gần đây</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!logs || logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có log.</p>
          ) : (
            logs.map((log) => (
              <div key={log._id} className="rounded-2xl border border-primary/10 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleString("vi-VN")}</p>
                    <h3 className="text-sm font-semibold">{log.actorEmail}</h3>
                  </div>
                  <Badge className="rounded-full">{log.action}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {log.resource}
                  {log.resourceId ? ` · ${log.resourceId}` : ""}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
    </PermissionGate>
  );
}
