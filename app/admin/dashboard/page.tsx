"use client";

import { useMemo } from "react";
import { useQuery } from "convex/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/convex/_generated/api";
import { PermissionGate } from "@/components/admin/PermissionGate";

export default function AdminDashboard() {
  const releases = useQuery(api.releasesAdmin.listAll);
  const leads = useQuery(api.leadsAdmin.list);
  const settings = useQuery(api.siteSettings.getPublic);

  const stats = useMemo(() => {
    const totalReleases = releases?.length ?? 0;
    const publicReleases = releases?.filter((item) => item.isPublic).length ?? 0;
    const totalLeads = leads?.length ?? 0;
    const newLeads = leads?.filter((item) => item.status === "new").length ?? 0;
    return { totalReleases, publicReleases, totalLeads, newLeads };
  }, [releases, leads]);

  return (
    <PermissionGate permission="dashboard.read">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Tổng quan</h2>
          <p className="text-sm text-muted-foreground">Theo dõi nhanh hiệu suất nội dung và lead hợp tác.</p>
        </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Release" value={stats.totalReleases} helper={`${stats.publicReleases} public`} />
        <StatCard title="Lead hợp tác" value={stats.totalLeads} helper={`${stats.newLeads} lead mới`} />
        <StatCard title="Settings" value={settings ? "Đã cấu hình" : "Chưa có"} helper="Site profile" />
        <StatCard title="Health" value="Ổn định" helper="Không có cảnh báo" />
      </div>

      <Card className="border-primary/10">
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Checklist vận hành</CardTitle>
            <p className="text-sm text-muted-foreground">Các điểm quan trọng trước khi publish.</p>
          </div>
          <Badge className="rounded-full">Enterprise</Badge>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>Release sắp tới đã có mô tả & trạng thái</span>
            <span className="font-medium text-foreground">{stats.totalReleases > 0 ? "OK" : "Thiếu"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Lead mới cần phản hồi</span>
            <span className="font-medium text-foreground">{stats.newLeads}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Cấu hình donate & socials</span>
            <span className="font-medium text-foreground">{settings ? "OK" : "Chưa cấu hình"}</span>
          </div>
        </CardContent>
      </Card>
    </div>
    </PermissionGate>
  );
}

function StatCard({ title, value, helper }: { title: string; value: string | number; helper: string }) {
  return (
    <Card className="border-primary/10">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-2xl font-semibold">{value}</p>
        <p className="text-xs text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}
