"use client";

import { useMemo, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Disc3, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { getDefaultClassNames, type DayButton, type Locale } from "react-day-picker";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

type ReleaseStatus = "planning" | "teaser" | "scheduled" | "released";

type ReleaseItem = {
  id: string;
  date: Date;
  title: string;
  type: string;
  status: ReleaseStatus;
  description: string;
};

const statusLabels: Record<ReleaseStatus, string> = {
  planning: "Planning",
  teaser: "Teaser",
  scheduled: "Scheduled",
  released: "Released",
};

const statusStyles: Record<ReleaseStatus, string> = {
  planning: "bg-secondary text-secondary-foreground",
  teaser: "bg-accent text-accent-foreground",
  scheduled: "bg-primary text-primary-foreground",
  released: "bg-foreground text-background",
};

const statusDotStyles: Record<ReleaseStatus, string> = {
  planning: "bg-secondary",
  teaser: "bg-accent",
  scheduled: "bg-primary",
  released: "bg-foreground",
};

const releaseYear = 2026;
const statusOrder: ReleaseStatus[] = ["planning", "teaser", "scheduled", "released"];

export function ReleaseSchedule() {
  const releaseData = useQuery(api.releases.listPublic, { year: releaseYear });
  const releases = useMemo<ReleaseItem[]>(
    () =>
      (releaseData ?? []).map((release) => ({
        id: release._id,
        date: new Date(release.releaseDate),
        title: release.title,
        type: release.type,
        status: (release.status as ReleaseStatus) ?? "planning",
        description: release.description,
      })),
    [releaseData]
  );
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined);
  const [selectedMonth, setSelectedMonth] = useState<Date | null>(null);
  const [activeView, setActiveView] = useState<"year" | "detail">("year");
  const fallbackMonth = useMemo(() => {
    const initialDate = releases[0]?.date ?? new Date(releaseYear, 0, 1);
    return new Date(initialDate.getFullYear(), initialDate.getMonth(), 1);
  }, [releases]);
  const displayMonth = selectedMonth ?? fallbackMonth;

  const releaseMap = useMemo(() => {
    const map = new Map<string, ReleaseItem[]>();
    releases.forEach((release) => {
      const key = format(release.date, "yyyy-MM-dd");
      const items = map.get(key) ?? [];
      items.push(release);
      map.set(key, items);
    });
    return map;
  }, [releases]);

  const releaseDates = useMemo(() => releases.map((release) => release.date), [releases]);
  const monthStats = useMemo(() => {
    const stats = Array.from({ length: 12 }, (_, index) => ({
      month: index,
      count: 0,
      statuses: new Set<ReleaseStatus>(),
    }));

    releases.forEach((release) => {
      if (release.date.getFullYear() !== releaseYear) return;
      const monthIndex = release.date.getMonth();
      stats[monthIndex].count += 1;
      stats[monthIndex].statuses.add(release.status);
    });

    return stats.map((stat) => ({
      ...stat,
      statusList: statusOrder.filter((status) => stat.statuses.has(status)).slice(0, 3),
    }));
  }, [releases]);
  const selectedMonthReleases = useMemo(
    () =>
      releases.filter(
        (release) =>
          release.date.getFullYear() === displayMonth.getFullYear() &&
          release.date.getMonth() === displayMonth.getMonth()
      ),
    [displayMonth, releases]
  );
  const defaultMonthRelease = selectedMonthReleases[0]?.date;
  const effectiveSelectedDay = selectedDay ?? defaultMonthRelease ?? releases[0]?.date;
  const selectedKey = effectiveSelectedDay ? format(effectiveSelectedDay, "yyyy-MM-dd") : "";
  const selectedReleases = selectedKey ? releaseMap.get(selectedKey) ?? [] : [];

  return (
    <section id="releases" className="py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4 flex items-center justify-center gap-2">
            <CalendarDays className="w-8 h-8 text-primary" />
            Release schedule {releaseYear}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Tap a day to see the details. RF will keep this calendar updated for everyone to follow.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1.35fr_1fr] gap-8 items-stretch">
          <div className="space-y-4">
            <div className="lg:hidden rounded-full bg-muted p-1 flex">
              <button
                type="button"
                onClick={() => setActiveView("year")}
                className={cn(
                  "flex-1 rounded-full px-4 py-2 text-sm font-medium transition",
                  activeView === "year" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground"
                )}
              >
                Year overview
              </button>
              <button
                type="button"
                onClick={() => setActiveView("detail")}
                className={cn(
                  "flex-1 rounded-full px-4 py-2 text-sm font-medium transition",
                  activeView === "detail" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground"
                )}
              >
                Schedule details
              </button>
            </div>

            <div className={cn("space-y-4", activeView === "year" ? "block" : "hidden lg:block")}>
              <Card className="h-full border-none shadow-xl shadow-primary/5 bg-white/80 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-xl font-semibold">{releaseYear} overview</h3>
                    <Badge className="rounded-full px-3">12 months</Badge>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                    {monthStats.map((stat) => {
                      const monthDate = new Date(releaseYear, stat.month, 1);
                      const isActiveMonth =
                        displayMonth.getFullYear() === releaseYear && displayMonth.getMonth() === stat.month;

                      return (
                        <button
                          key={stat.month}
                          type="button"
                          onClick={() => {
                            const nextMonth = new Date(releaseYear, stat.month, 1);
                            setSelectedMonth(nextMonth);
                            const nextRelease = releases.find(
                              (release) =>
                                release.date.getFullYear() === nextMonth.getFullYear() &&
                                release.date.getMonth() === nextMonth.getMonth()
                            );
                            setSelectedDay(nextRelease?.date);
                            setActiveView("detail");
                          }}
                          className={cn(
                            "rounded-3xl border border-primary/10 bg-white px-3 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md",
                            isActiveMonth ? "ring-2 ring-primary/30" : "hover:border-primary/30"
                          )}
                        >
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            {format(monthDate, "MMM", { locale: enUS })}
                          </p>
                          <p className="mt-1 text-2xl font-semibold text-foreground">{stat.count}</p>
                          <p className="text-xs text-muted-foreground">release(s)</p>
                          <div className="mt-2 flex items-center gap-1">
                            {stat.statusList.length === 0 ? (
                              <span className="text-xs text-muted-foreground">No schedule yet</span>
                            ) : (
                              stat.statusList.map((status) => (
                                <span key={status} className={cn("size-2 rounded-full", statusDotStyles[status])} />
                              ))
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className={cn("flex flex-col gap-6", activeView === "detail" ? "flex" : "hidden lg:flex")}>
            <Card className="border-none shadow-xl shadow-primary/5 bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-4 px-6 pb-5 flex justify-center">
                <Calendar
                  mode="single"
                  selected={effectiveSelectedDay}
                  fixedWeeks
                  month={displayMonth}
                  onMonthChange={(month) => {
                    setSelectedMonth(month);
                    if (selectedDay) {
                      const sameMonth =
                        selectedDay.getFullYear() === month.getFullYear() && selectedDay.getMonth() === month.getMonth();
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
                  locale={enUS}
                  className="mx-auto w-auto [--cell-size:--spacing(7)]"
                  classNames={{
                    root: "flex w-full justify-center",
                    months: "w-auto",
                    month: "w-auto",
                    month_caption: "relative flex h-(--cell-size) w-full items-center justify-center px-8 text-center",
                    nav: "absolute inset-y-0 left-5 right-5 flex items-center justify-between",
                    table: "w-full mt-2 mx-auto",
                    weekdays: "flex w-full justify-center gap-x-1.5",
                    weekday: "flex-1 text-center text-xs tracking-wide",
                    week: "flex w-full justify-center gap-x-1.5 mt-2",
                    day: "flex-1",
                  }}
                  modifiers={{ hasRelease: releaseDates }}
                  modifiersClassNames={{
                    hasRelease: "rdp-day_has-release",
                  }}
                  components={{
                    DayButton: (props) => <ReleaseDayButton locale={enUS} {...props} />,
                  }}
                />
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg shadow-primary/5 bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-7 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl font-semibold flex items-center gap-2">
                    <Disc3 className="w-5 h-5 text-primary" />
                    {effectiveSelectedDay ? format(effectiveSelectedDay, "dd MMMM yyyy", { locale: enUS }) : "Select a day"}
                  </h3>
                  <Badge className="rounded-full px-3">Release</Badge>
                </div>

                {selectedReleases.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-primary/20 bg-white/70 p-4 text-sm text-muted-foreground">
                    No releases scheduled for this day. Pick a day with a dot to see the details.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedReleases.map((release) => (
                      <div key={release.id} className="rounded-2xl border border-primary/10 p-4 bg-white">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm text-primary font-semibold">{release.type}</p>
                            <h4 className="font-display text-lg font-semibold">{release.title}</h4>
                          </div>
                          <span className={cn("text-xs font-semibold px-3 py-1 rounded-full", statusStyles[release.status])}>
                            {statusLabels[release.status]}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">{release.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="rounded-2xl border border-primary/10 bg-white/70 p-4 text-sm text-muted-foreground flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-primary mt-0.5" />
                  Release timing may shift with production. RF will announce updates as soon as possible.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

function ReleaseDayButton({
  className,
  day,
  modifiers,
  locale,
  ...props
}: React.ComponentProps<typeof DayButton> & { locale?: Partial<Locale> }) {
  const defaultClassNames = getDefaultClassNames();
  const isReleaseDay = modifiers.hasRelease;
  const isSelected = modifiers.selected && !modifiers.range_end && !modifiers.range_start;

  return (
    <Button
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString(locale?.code)}
      data-selected-single={isSelected}
      className={cn(
        "relative isolate z-10 flex aspect-square size-auto w-full min-w-(--cell-size) flex-col items-center justify-center gap-1 border-0 leading-none font-normal data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground [&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day,
        className
      )}
      {...props}
    >
      <span>{day.date.getDate()}</span>
      {isReleaseDay && <span className="size-1.5 rounded-full bg-primary" />}
    </Button>
  );
}
