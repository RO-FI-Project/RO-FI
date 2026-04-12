"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PermissionGate } from "@/components/admin/PermissionGate";
import { hasPermission, parseRole } from "@/lib/rbac";

const releaseTypes = ["Single", "EP", "Album", "MV", "Cover"] as const;
const releaseStatuses = ["planning", "teaser", "scheduled", "released"] as const;

type ReleaseFormState = {
  id?: Id<"releases">;
  title: string;
  releaseDate: string;
  type: (typeof releaseTypes)[number];
  status: (typeof releaseStatuses)[number];
  description: string;
  coverUrl: string;
  isPublic: boolean;
};

const emptyForm: ReleaseFormState = {
  title: "",
  releaseDate: "",
  type: "Single",
  status: "planning",
  description: "",
  coverUrl: "",
  isPublic: true,
};

export default function ReleasesAdminPage() {
  const { user } = useUser();
  const releases = useQuery(api.releasesAdmin.listAll);
  const upsertRelease = useMutation(api.releasesAdmin.upsert);
  const removeRelease = useMutation(api.releasesAdmin.remove);
  const logAction = useMutation(api.adminAudit.logAction);
  const [form, setForm] = useState<ReleaseFormState>(emptyForm);
  const role = parseRole(user?.publicMetadata?.role);
  const canWrite = hasPermission(role, "releases.write");

  const sortedReleases = useMemo(() => releases ?? [], [releases]);

  const handleSubmit = async () => {
    if (!form.title || !form.releaseDate) return;
    const payload = {
      id: form.id,
      title: form.title,
      releaseDate: form.releaseDate,
      type: form.type,
      status: form.status,
      description: form.description,
      coverUrl: form.coverUrl || undefined,
      links: [],
      isPublic: form.isPublic,
    };
    const releaseId = await upsertRelease(payload);
    await logAction({
      actorEmail: user?.primaryEmailAddress?.emailAddress ?? "unknown",
      actorRole: (user?.publicMetadata?.role as string | undefined) ?? "unknown",
      action: form.id ? "update" : "create",
      resource: "release",
      resourceId: String(releaseId),
      after: JSON.stringify(payload),
    });
    setForm(emptyForm);
  };

  const handleEdit = (release: NonNullable<typeof releases>[number]) => {
    setForm({
      id: release._id,
      title: release.title,
      releaseDate: release.releaseDate,
      type: release.type as ReleaseFormState["type"],
      status: release.status as ReleaseFormState["status"],
      description: release.description,
      coverUrl: release.coverUrl ?? "",
      isPublic: release.isPublic,
    });
  };

  const handleDelete = async (id: Id<"releases">) => {
    await removeRelease({ id });
    await logAction({
      actorEmail: user?.primaryEmailAddress?.emailAddress ?? "unknown",
      actorRole: (user?.publicMetadata?.role as string | undefined) ?? "unknown",
      action: "delete",
      resource: "release",
      resourceId: id,
    });
  };

  return (
    <PermissionGate permission="releases.read">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold">Quản lý Release</h2>
          <p className="text-sm text-muted-foreground">Tạo và cập nhật lịch phát hành.</p>
        </div>

        <Card className="border-primary/10">
          <CardHeader>
            <CardTitle>{form.id ? "Chỉnh sửa release" : "Tạo release mới"}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tên release</label>
            <Input
              value={form.title}
              disabled={!canWrite}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Ngày phát hành</label>
            <Input
              type="date"
              value={form.releaseDate}
              disabled={!canWrite}
              onChange={(event) => setForm({ ...form, releaseDate: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Loại</label>
            <select
              className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
              value={form.type}
              disabled={!canWrite}
              onChange={(event) => setForm({ ...form, type: event.target.value as ReleaseFormState["type"] })}
            >
              {releaseTypes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Trạng thái</label>
            <select
              className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
              value={form.status}
              disabled={!canWrite}
              onChange={(event) => setForm({ ...form, status: event.target.value as ReleaseFormState["status"] })}
            >
              {releaseStatuses.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Mô tả</label>
            <Textarea
              value={form.description}
              disabled={!canWrite}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Cover URL</label>
            <Input
              value={form.coverUrl}
              disabled={!canWrite}
              onChange={(event) => setForm({ ...form, coverUrl: event.target.value })}
            />
          </div>
          <div className="flex items-center gap-3 md:col-span-2">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="checkbox"
                checked={form.isPublic}
                disabled={!canWrite}
                onChange={(event) => setForm({ ...form, isPublic: event.target.checked })}
              />
              Public
            </label>
            <Button type="button" onClick={handleSubmit} disabled={!canWrite}>
              {form.id ? "Lưu thay đổi" : "Tạo release"}
            </Button>
            {form.id ? (
              <Button type="button" variant="ghost" onClick={() => setForm(emptyForm)}>
                Hủy
              </Button>
            ) : null}
          </div>
          </CardContent>
        </Card>

        <Card className="border-primary/10">
          <CardHeader>
            <CardTitle>Danh sách release</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
          {sortedReleases.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có release nào.</p>
          ) : (
            sortedReleases.map((release) => (
              <div key={release._id} className="rounded-2xl border border-primary/10 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">{release.releaseDate}</p>
                    <h3 className="text-lg font-semibold">{release.title}</h3>
                    <p className="text-sm text-muted-foreground">{release.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{release.type}</Badge>
                    <Badge className="rounded-full">{release.status}</Badge>
                    <Badge className="rounded-full" variant={release.isPublic ? "default" : "secondary"}>
                      {release.isPublic ? "Public" : "Private"}
                    </Badge>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => handleEdit(release)} disabled={!canWrite}>
                    Chỉnh sửa
                  </Button>
                  <Button type="button" size="sm" variant="destructive" onClick={() => handleDelete(release._id)} disabled={!canWrite}>
                    Xoá
                  </Button>
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
