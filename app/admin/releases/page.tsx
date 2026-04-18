"use client";

import { useMemo, useRef, useState } from "react";
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
import { toast } from "sonner";
import * as XLSX from "xlsx";

const releaseTypes = ["Single", "EP", "Album", "MV", "Cover"] as const;
const releaseStatuses = ["planning", "teaser", "scheduled", "released"] as const;
const requiredImportHeaders = ["title", "releaseDate", "type", "status", "description", "isPublic"] as const;
const maxImportRows = 300;

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

type ImportRow = {
  rowNumber: number;
  title: string;
  releaseDate: string;
  type: string;
  status: string;
  description: string;
  isPublicRaw: string;
  coverUrl?: string;
  isValid: boolean;
  isDuplicate: boolean;
  errors: string[];
};

type ImportPayload = {
  title: string;
  releaseDate: string;
  type: string;
  status: string;
  description: string;
  coverUrl?: string;
  links: [];
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
  const bulkImportReleases = useMutation(api.releasesAdmin.bulkImport);
  const removeRelease = useMutation(api.releasesAdmin.remove);
  const logAction = useMutation(api.adminAudit.logAction);
  const [form, setForm] = useState<ReleaseFormState>(emptyForm);
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [importPayloads, setImportPayloads] = useState<ImportPayload[]>([]);
  const [importFileName, setImportFileName] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const role = parseRole(user?.publicMetadata?.role);
  const canWrite = hasPermission(role, "releases.write");

  const sortedReleases = useMemo(() => releases ?? [], [releases]);
  const existingReleaseKeys = useMemo(
    () => new Set(sortedReleases.map((release) => `${release.title.trim()}::${release.releaseDate}`)),
    [sortedReleases]
  );
  const importSummary = useMemo(() => {
    return importRows.reduce(
      (accumulator, row) => {
        if (!row.isValid) {
          accumulator.invalid += 1;
          return accumulator;
        }
        if (row.isDuplicate) {
          accumulator.duplicates += 1;
          return accumulator;
        }
        accumulator.valid += 1;
        return accumulator;
      },
      { valid: 0, duplicates: 0, invalid: 0 }
    );
  }, [importRows]);

  const getCellString = (value: unknown) => {
    if (typeof value === "string") return value.trim();
    if (typeof value === "number" || typeof value === "boolean") return String(value).trim();
    return "";
  };

  const formatDateParts = (year: number, month: number, day: number) => {
    return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  };

  const normalizeReleaseDate = (value: unknown) => {
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
        return trimmed;
      }
      return "";
    }

    if (typeof value === "number") {
      const parsedDate = XLSX.SSF.parse_date_code(value);
      if (!parsedDate) {
        return "";
      }
      return formatDateParts(parsedDate.y, parsedDate.m, parsedDate.d);
    }

    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return formatDateParts(value.getFullYear(), value.getMonth() + 1, value.getDate());
    }

    return "";
  };

  const parseBoolean = (value: string) => {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes"].includes(normalized)) return true;
    if (["false", "0", "no"].includes(normalized)) return false;
    return null;
  };

  const resetImportState = () => {
    setImportRows([]);
    setImportPayloads([]);
    setImportFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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

  const handleTemplateDownload = () => {
    window.open("/templates/releases-import-template.xlsx", "_blank", "noopener,noreferrer");
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const firstSheet = workbook.Sheets[firstSheetName];

      if (!firstSheet) {
        toast.error("File Excel không có sheet hợp lệ.");
        resetImportState();
        return;
      }

      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, {
        defval: "",
        raw: true,
      });

      if (rows.length > maxImportRows) {
        toast.error(`Chỉ hỗ trợ tối đa ${maxImportRows} dòng mỗi lần import.`);
        resetImportState();
        return;
      }

      const headerRow = XLSX.utils.sheet_to_json<string[]>(firstSheet, {
        header: 1,
        blankrows: false,
      })[0];

      const normalizedHeaders = Array.isArray(headerRow)
        ? headerRow.map((header) => String(header).trim())
        : [];

      const hasAllRequiredHeaders = requiredImportHeaders.every((header) => normalizedHeaders.includes(header));
      if (!hasAllRequiredHeaders) {
        toast.error("Template không đúng. Vui lòng dùng file mẫu .xlsx.");
        resetImportState();
        return;
      }

      const payloads: ImportPayload[] = [];
      const duplicateKeysInFile = new Set<string>();
      const parsedRows = rows.map((row, index) => {
        const title = getCellString(row.title);
        const releaseDate = normalizeReleaseDate(row.releaseDate);
        const type = getCellString(row.type);
        const status = getCellString(row.status);
        const description = getCellString(row.description);
        const isPublicRaw = getCellString(row.isPublic);
        const coverUrl = getCellString(row.coverUrl);
        const errors: string[] = [];

        if (!title) errors.push("Thiếu title");
        if (!releaseDate) errors.push("Thiếu releaseDate");
        if (!/^\d{4}-\d{2}-\d{2}$/.test(releaseDate)) errors.push("releaseDate phải theo YYYY-MM-DD");
        if (!releaseTypes.includes(type as (typeof releaseTypes)[number])) errors.push("type không hợp lệ");
        if (!releaseStatuses.includes(status as (typeof releaseStatuses)[number])) errors.push("status không hợp lệ");
        if (!description) errors.push("Thiếu description");

        const parsedIsPublic = parseBoolean(isPublicRaw);
        if (parsedIsPublic === null) errors.push("isPublic phải là true/false, 1/0, yes/no");

        const duplicateKey = `${title}::${releaseDate}`;
        const isDuplicateInDb = existingReleaseKeys.has(duplicateKey);
        const isDuplicateInFile = duplicateKeysInFile.has(duplicateKey);
        const isDuplicate = Boolean(title && releaseDate) && (isDuplicateInDb || isDuplicateInFile);
        if (title && releaseDate && !isDuplicateInFile) {
          duplicateKeysInFile.add(duplicateKey);
        }

        const isValid = errors.length === 0;
        if (isValid && !isDuplicate && parsedIsPublic !== null) {
          payloads.push({
            title,
            releaseDate,
            type,
            status,
            description,
            coverUrl: coverUrl || undefined,
            links: [],
            isPublic: parsedIsPublic,
          });
        }

        return {
          rowNumber: index + 2,
          title,
          releaseDate,
          type,
          status,
          description,
          isPublicRaw,
          coverUrl: coverUrl || undefined,
          isValid,
          isDuplicate,
          errors,
        };
      });

      setImportRows(parsedRows);
      setImportPayloads(payloads);
      setImportFileName(file.name);
      toast.success("Đã đọc file Excel. Hãy kiểm tra preview trước khi import.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể đọc file Excel.";
      toast.error(message);
      resetImportState();
    }
  };

  const handleConfirmImport = async () => {
    if (!canWrite || importPayloads.length === 0 || isImporting) return;
    setIsImporting(true);
    try {
      const result = await bulkImportReleases({ releases: importPayloads });
      await logAction({
        actorEmail: user?.primaryEmailAddress?.emailAddress ?? "unknown",
        actorRole: (user?.publicMetadata?.role as string | undefined) ?? "unknown",
        action: "bulk_import",
        resource: "release",
        after: JSON.stringify({ fileName: importFileName, ...result }),
      });
      toast.success(`Import xong: ${result.inserted} thêm mới, ${result.skippedDuplicates} trùng bị bỏ qua.`);
      resetImportState();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Import thất bại.";
      toast.error(message);
    } finally {
      setIsImporting(false);
    }
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
            <CardTitle>Import hàng loạt từ Excel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="outline" onClick={handleTemplateDownload}>
                Tải file mẫu .xlsx
              </Button>
              <Input
                ref={fileInputRef}
                type="file"
                accept=".xlsx"
                disabled={!canWrite}
                onChange={handleFileChange}
                className="max-w-sm"
              />
            </div>

            {importFileName ? (
              <div className="space-y-3 rounded-2xl border border-primary/10 bg-white p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{importFileName}</Badge>
                  <Badge className="rounded-full">{importSummary.valid} hợp lệ</Badge>
                  <Badge className="rounded-full" variant="secondary">
                    {importSummary.duplicates} trùng
                  </Badge>
                  <Badge className="rounded-full" variant="secondary">
                    {importSummary.invalid} lỗi
                  </Badge>
                </div>

                <div className="space-y-2">
                  {importRows.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Không có dữ liệu để preview.</p>
                  ) : (
                    importRows.map((row) => (
                      <div key={row.rowNumber} className="rounded-xl border border-primary/10 p-3 text-sm">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-medium">Dòng {row.rowNumber}</span>
                          <Badge variant={row.isValid && !row.isDuplicate ? "default" : "secondary"}>
                            {row.isValid ? (row.isDuplicate ? "duplicate" : "valid") : "invalid"}
                          </Badge>
                        </div>
                        <p className="mt-1 text-foreground">
                          {row.title || "(trống)"} - {row.releaseDate || "(không có ngày)"} - {row.type || "(không có type)"}
                        </p>
                        {row.isDuplicate ? (
                          <p className="text-xs text-muted-foreground">Trùng với dữ liệu đã có hoặc dòng trước trong file.</p>
                        ) : null}
                        {row.errors.length > 0 ? (
                          <p className="text-xs text-destructive">{row.errors.join(" | ")}</p>
                        ) : null}
                      </div>
                    ))
                  )}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button type="button" onClick={handleConfirmImport} disabled={!canWrite || importPayloads.length === 0 || isImporting}>
                    {isImporting ? "Đang import..." : "Xác nhận import"}
                  </Button>
                  <Button type="button" variant="ghost" onClick={resetImportState}>
                    Xóa preview
                  </Button>
                </div>
              </div>
            ) : null}
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
