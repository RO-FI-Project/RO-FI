"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PermissionGate } from "@/components/admin/PermissionGate";
import { hasPermission, parseRole } from "@/lib/rbac";

type SocialItem = { label: string; url: string };
const socialOptions = ["Facebook", "YouTube", "TikTok", "Instagram", "Spotify", "SoundCloud"] as const;
const otherSocialOption = "Khác";

type SettingsForm = {
  brandName: string;
  heroTitle: string;
  heroSubtitle: string;
  donation: {
    bankName: string;
    bankAccountName: string;
    bankAccountNumber: string;
    bankQrUrl: string;
    paypalUrl: string;
    stripeUrl: string;
  };
  socials: SocialItem[];
};

const emptySettings: SettingsForm = {
  brandName: "RF",
  heroTitle: "RF",
  heroSubtitle: "Artist hub cho cộng đồng yêu nhạc & anime",
  donation: {
    bankName: "",
    bankAccountName: "",
    bankAccountNumber: "",
    bankQrUrl: "",
    paypalUrl: "",
    stripeUrl: "",
  },
  socials: [],
};

export default function SettingsAdminPage() {
  const { user } = useUser();
  const settings = useQuery(api.siteSettings.getPublic);
  const upsert = useMutation(api.siteSettings.upsert);
  const logAction = useMutation(api.adminAudit.logAction);
  const role = parseRole(user?.publicMetadata?.role);
  const canWrite = hasPermission(role, "settings.write");

  const initialForm: SettingsForm = settings
    ? {
        brandName: settings.brandName,
        heroTitle: settings.heroTitle,
        heroSubtitle: settings.heroSubtitle,
        donation: {
          bankName: settings.donation.bankName,
          bankAccountName: settings.donation.bankAccountName,
          bankAccountNumber: settings.donation.bankAccountNumber,
          bankQrUrl: settings.donation.bankQrUrl ?? "",
          paypalUrl: settings.donation.paypalUrl ?? "",
          stripeUrl: settings.donation.stripeUrl ?? "",
        },
        socials: settings.socials ?? [],
      }
    : emptySettings;

  const handleSave = async (form: SettingsForm) => {
    await upsert({
      brandName: form.brandName,
      heroTitle: form.heroTitle,
      heroSubtitle: form.heroSubtitle,
      donation: {
        bankName: form.donation.bankName,
        bankAccountName: form.donation.bankAccountName,
        bankAccountNumber: form.donation.bankAccountNumber,
        bankQrUrl: form.donation.bankQrUrl || undefined,
        paypalUrl: form.donation.paypalUrl || undefined,
        stripeUrl: form.donation.stripeUrl || undefined,
      },
      socials: form.socials.filter((item) => item.label && item.url),
    });
    await logAction({
      actorEmail: user?.primaryEmailAddress?.emailAddress ?? "unknown",
      actorRole: (user?.publicMetadata?.role as string | undefined) ?? "unknown",
      action: "update",
      resource: "siteSettings",
      after: JSON.stringify(form),
    });
  };

  return (
    <PermissionGate permission="settings.read">
      <SettingsFormContent
        key={settings?._id ?? "empty"}
        initialForm={initialForm}
        canWrite={canWrite}
        onSave={handleSave}
      />
    </PermissionGate>
  );
}

type SettingsFormContentProps = {
  initialForm: SettingsForm;
  canWrite: boolean;
  onSave: (form: SettingsForm) => Promise<void>;
};

function SettingsFormContent({ initialForm, canWrite, onSave }: SettingsFormContentProps) {
  const [form, setForm] = useState<SettingsForm>(initialForm);

  const updateDonationField = (key: keyof SettingsForm["donation"], value: string) => {
    setForm((prev) => ({
      ...prev,
      donation: {
        ...prev.donation,
        [key]: value,
      },
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Cấu hình Website</h2>
        <p className="text-sm text-muted-foreground">Quản lý thông tin hiển thị ở public site.</p>
      </div>

      <Card className="border-primary/10">
        <CardHeader>
          <CardTitle>Thông tin thương hiệu</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Brand name</label>
            <Input
              value={form.brandName}
              disabled={!canWrite}
              onChange={(event) => setForm({ ...form, brandName: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Hero title</label>
            <Input
              value={form.heroTitle}
              disabled={!canWrite}
              onChange={(event) => setForm({ ...form, heroTitle: event.target.value })}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Hero subtitle</label>
            <Input
              value={form.heroSubtitle}
              disabled={!canWrite}
              onChange={(event) => setForm({ ...form, heroSubtitle: event.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/10">
        <CardHeader>
          <CardTitle>Cấu hình donate</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Ngân hàng</label>
            <Input
              value={form.donation.bankName}
              disabled={!canWrite}
              onChange={(event) => updateDonationField("bankName", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Tên tài khoản</label>
            <Input
              value={form.donation.bankAccountName}
              disabled={!canWrite}
              onChange={(event) => updateDonationField("bankAccountName", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Số tài khoản</label>
            <Input
              value={form.donation.bankAccountNumber}
              disabled={!canWrite}
              onChange={(event) => updateDonationField("bankAccountNumber", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">QR URL</label>
            <Input
              value={form.donation.bankQrUrl}
              disabled={!canWrite}
              onChange={(event) => updateDonationField("bankQrUrl", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">PayPal URL</label>
            <Input
              value={form.donation.paypalUrl}
              disabled={!canWrite}
              onChange={(event) => updateDonationField("paypalUrl", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Stripe URL</label>
            <Input
              value={form.donation.stripeUrl}
              disabled={!canWrite}
              onChange={(event) => updateDonationField("stripeUrl", event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary/10">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Social links</CardTitle>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={!canWrite}
            onClick={() => setForm((prev) => ({ ...prev, socials: [...prev.socials, { label: "", url: "" }] }))}
          >
            Thêm link
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {form.socials.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có link.</p>
          ) : (
            form.socials.map((item, index) => (
              (() => {
                const isPreset = socialOptions.includes(item.label as (typeof socialOptions)[number]);
                const selectedValue = isPreset ? item.label : otherSocialOption;

                return (
              <div key={`${item.label}-${index}`} className="grid gap-3 md:grid-cols-[1fr_2fr_auto]">
                <div className="space-y-2">
                  <select
                    value={selectedValue}
                    disabled={!canWrite}
                    className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80"
                    onChange={(event) => {
                      const updated = [...form.socials];
                      const nextValue = event.target.value;
                      updated[index] = {
                        ...updated[index],
                        label: nextValue === otherSocialOption ? "" : nextValue,
                      };
                      setForm({ ...form, socials: updated });
                    }}
                  >
                    {socialOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                    <option value={otherSocialOption}>{otherSocialOption}</option>
                  </select>
                  {!isPreset && (
                    <Input
                      value={item.label}
                      placeholder="Tên nền tảng"
                      disabled={!canWrite}
                      onChange={(event) => {
                        const updated = [...form.socials];
                        updated[index] = { ...updated[index], label: event.target.value };
                        setForm({ ...form, socials: updated });
                      }}
                    />
                  )}
                </div>
                <Input
                  value={item.url}
                  placeholder="https://"
                  disabled={!canWrite}
                  onChange={(event) => {
                    const updated = [...form.socials];
                    updated[index] = { ...updated[index], url: event.target.value };
                    setForm({ ...form, socials: updated });
                  }}
                />
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={!canWrite}
                  onClick={() => setForm((prev) => ({ ...prev, socials: prev.socials.filter((_, i) => i !== index) }))}
                >
                  Xoá
                </Button>
              </div>
                );
              })()
            ))
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="button" onClick={() => void onSave(form)} disabled={!canWrite}>
          Lưu cấu hình
        </Button>
      </div>
    </div>
  );
}
