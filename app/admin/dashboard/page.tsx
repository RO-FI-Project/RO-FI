"use client";

import { useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import { PermissionGate } from "@/components/admin/PermissionGate";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { getDefaultClassNames, type DayButton, type Locale } from "react-day-picker";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const releases = useQuery(api.releasesAdmin.listAll);
  const leads = useQuery(api.leadsAdmin.list);
  const fanIdeas = useQuery(api.fanIdeasAdmin.list, { status: undefined });
  const settings = useQuery(api.siteSettings.getPublic);
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined);
  const [selectedMonth, setSelectedMonth] = useState<Date | undefined>(undefined);

  const stats = useMemo(() => {
    const totalReleases = releases?.length ?? 0;
    const publicReleases = releases?.filter((item) => item.isPublic).length ?? 0;
    const totalLeads = leads?.length ?? 0;
    const newLeads = leads?.filter((item) => item.status === "new").length ?? 0;
    return { totalReleases, publicReleases, totalLeads, newLeads };
  }, [releases, leads]);

  const events = useMemo(() => {
    const releaseEvents =
      releases?.map((release) => ({
        id: `release-${release._id}`,
        title: release.title,
        date: parseISO(release.releaseDate),
        source: "rf" as const,
      })) ?? [];
    const fanEvents =
      fanIdeas?.map((idea) => ({
        id: `fan-${idea._id}`,
        title: idea.idea,
        date: parseISO(idea.proposedDate),
        source: "fan" as const,
      })) ?? [];

    return [...releaseEvents, ...fanEvents].sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [releases, fanIdeas]);

  const eventMap = useMemo(() => {
    const map = new Map<
      string,
      { rf: number; fan: number; items: Array<{ id: string; title: string; date: Date; source: "rf" | "fan" }> }
    >();
    events.forEach((event) => {
      const key = format(event.date, "yyyy-MM-dd");
      const current = map.get(key) ?? { rf: 0, fan: 0, items: [] };
      const updated = {
        ...current,
        rf: current.rf + (event.source === "rf" ? 1 : 0),
        fan: current.fan + (event.source === "fan" ? 1 : 0),
        items: [...current.items, event],
      };
      map.set(key, updated);
    });
    map.forEach((value) => value.items.sort((a, b) => (a.source === b.source ? 0 : a.source === "rf" ? -1 : 1)));
    return map;
  }, [events]);

  const fallbackDay = events[0]?.date ?? new Date();
  const displayMonth = selectedMonth ?? new Date(fallbackDay.getFullYear(), fallbackDay.getMonth(), 1);
  const effectiveSelectedDay = selectedDay ?? fallbackDay;
  const selectedKey = effectiveSelectedDay ? format(effectiveSelectedDay, "yyyy-MM-dd") : "";
  const selectedEvents = selectedKey ? eventMap.get(selectedKey)?.items ?? [] : [];

  const timelineGroups = useMemo(() => {
    const groups = new Map<string, { label: string; items: typeof events }>();
    events.forEach((event) => {
      const key = format(event.date, "yyyy-MM");
      const label = format(event.date, "MMMM yyyy", { locale: vi });
      const current = groups.get(key) ?? { label, items: [] };
      current.items.push(event);
      groups.set(key, current);
    });
    return Array.from(groups.entries()).map(([key, value]) => ({ key, ...value }));
  }, [events]);

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

      <Card className="border-primary/10">
        <Tabs defaultValue="calendar" className="w-full">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Lịch biểu tổng quan</CardTitle>
              <p className="text-sm text-muted-foreground">Theo dõi release và fan ideas cùng một lịch.</p>
            </div>
            <TabsList>
              <TabsTrigger value="calendar">Calendar</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent>
            <TabsContent value="calendar" className="mt-0">
              <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
                <div className="rounded-2xl border border-primary/10 bg-white p-3">
                  <Calendar
                    mode="single"
                    selected={effectiveSelectedDay}
                    month={displayMonth}
                    onMonthChange={(month) => {
                      setSelectedMonth(month);
                      if (selectedDay) {
                        const sameMonth =
                          selectedDay.getFullYear() === month.getFullYear() &&
                          selectedDay.getMonth() === month.getMonth();
                        if (!sameMonth) setSelectedDay(undefined);
                      }
                    }}
                    onSelect={(day) => {
                      if (!day) {
                        setSelectedDay(undefined);
                        return;
                      }
                      setSelectedDay(day);
                      setSelectedMonth(new Date(day.getFullYear(), day.getMonth(), 1));
                    }}
                    locale={vi}
                    className="mx-auto w-auto"
                    components={{
                      DayButton: (props) => (
                        <DashboardDayButton eventMap={eventMap} locale={vi} {...props} />
                      ),
                    }}
                  />
                </div>
                <div className="space-y-4">
                  <div className="rounded-2xl border border-primary/10 bg-white p-4">
                    <p className="text-sm font-semibold">
                      {effectiveSelectedDay ? format(effectiveSelectedDay, "dd MMMM yyyy", { locale: vi }) : "Chọn ngày"}
                    </p>
                    {selectedEvents.length === 0 ? (
                      <p className="mt-3 text-sm text-muted-foreground">Chưa có sự kiện nào trong ngày này.</p>
                    ) : (
                      <div className="mt-4 space-y-2">
                        {selectedEvents.map((event) => (
                          <div key={event.id} className="flex items-center justify-between gap-3 rounded-xl border border-primary/10 bg-muted/40 px-3 py-2 text-sm">
                            <span className="font-medium text-foreground line-clamp-1">{event.title}</span>
                            <SourceBadge source={event.source} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="rounded-2xl border border-primary/10 bg-white p-4 text-sm text-muted-foreground">
                    RF: release lịch phát hành | Fan: ý tưởng fan gửi về theo ngày đề xuất.
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="timeline" className="mt-0">
              {timelineGroups.length === 0 ? (
                <p className="text-sm text-muted-foreground">Chưa có dữ liệu để hiển thị timeline.</p>
              ) : (
                <div className="space-y-6">
                  {timelineGroups.map((group) => (
                    <div key={group.key} className="space-y-3">
                      <p className="text-sm font-semibold text-foreground">{group.label}</p>
                      <div className="space-y-2">
                        {group.items.map((event) => (
                          <div
                            key={event.id}
                            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/10 bg-white px-3 py-2 text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <SourceBadge source={event.source} />
                              <span className="font-medium text-foreground line-clamp-1">{event.title}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {format(event.date, "dd/MM/yyyy", { locale: vi })}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </CardContent>
        </Tabs>
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

function SourceBadge({ source }: { source: "rf" | "fan" }) {
  if (source === "fan") {
    return <Badge className="rounded-full bg-accent text-accent-foreground">Fan</Badge>;
  }
  return <Badge className="rounded-full">RF</Badge>;
}

function DashboardDayButton({
  className,
  day,
  modifiers,
  locale,
  eventMap,
  ...props
}: React.ComponentProps<typeof DayButton> & {
  locale?: Partial<Locale>;
  eventMap: Map<string, { rf: number; fan: number }>;
}) {
  const defaultClassNames = getDefaultClassNames();
  const isSelected = modifiers.selected && !modifiers.range_end && !modifiers.range_start;
  const key = format(day.date, "yyyy-MM-dd");
  const summary = eventMap.get(key);

  return (
    <button
      type="button"
      data-day={day.date.toLocaleDateString(locale?.code)}
      data-selected-single={isSelected}
      className={cn(
        "relative isolate flex aspect-square size-auto w-full min-w-(--cell-size) flex-col items-center justify-center gap-1 border-0 leading-none font-normal data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground",
        defaultClassNames.day,
        className
      )}
      {...props}
    >
      <span className="text-xs">{day.date.getDate()}</span>
      {summary ? (
        <span className="flex items-center gap-1">
          {summary.rf > 0 ? <span className="size-1.5 rounded-full bg-primary" /> : null}
          {summary.fan > 0 ? <span className="size-1.5 rounded-full bg-accent" /> : null}
        </span>
      ) : null}
    </button>
  );
}
