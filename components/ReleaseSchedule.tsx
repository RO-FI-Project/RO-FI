"use client";

import { useMemo, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Disc3, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { getDefaultClassNames, type DayButton, type Locale } from "react-day-picker";

type ReleaseStatus = "planning" | "teaser" | "scheduled" | "released";

type ReleaseItem = {
  id: number;
  date: Date;
  title: string;
  type: "Single" | "EP" | "Album" | "MV" | "Cover";
  status: ReleaseStatus;
  description: string;
};

const releases: ReleaseItem[] = [
  {
    id: 1,
    date: new Date("2026-05-15"),
    title: "Sakura Dreams",
    type: "Single",
    status: "scheduled",
    description: "Single mở màn mùa hè với vibe anime dịu ngọt.",
  },
  {
    id: 2,
    date: new Date("2026-07-10"),
    title: "Neon Nights",
    type: "EP",
    status: "teaser",
    description: "EP synthwave đậm chất cyberpop, mở teaser vào đầu tháng 7.",
  },
  {
    id: 3,
    date: new Date("2026-09-22"),
    title: "Autumn Leaves",
    type: "Cover",
    status: "planning",
    description: "Cover acoustic bài hát anime kinh điển.",
  },
  {
    id: 4,
    date: new Date("2026-12-01"),
    title: "Winter Melancholy",
    type: "Album",
    status: "planning",
    description: "Album full-length đầu tay, hiện đang trong giai đoạn sản xuất.",
  },
];

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

export function ReleaseSchedule() {
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(releases[0]?.date);

  const releaseMap = useMemo(() => {
    const map = new Map<string, ReleaseItem[]>();
    releases.forEach((release) => {
      const key = format(release.date, "yyyy-MM-dd");
      const items = map.get(key) ?? [];
      items.push(release);
      map.set(key, items);
    });
    return map;
  }, []);

  const releaseDates = useMemo(() => releases.map((release) => release.date), []);
  const selectedKey = selectedDay ? format(selectedDay, "yyyy-MM-dd") : "";
  const selectedReleases = selectedKey ? releaseMap.get(selectedKey) ?? [] : [];

  return (
    <section id="releases" className="py-16 md:py-24">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4 flex items-center justify-center gap-2">
            <CalendarDays className="w-8 h-8 text-primary" />
            Lịch phát hành 2026
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Chạm vào ngày để xem chi tiết. RF sẽ cập nhật lịch năm nay để fan dễ theo dõi.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-start">
          <Card className="border-none shadow-xl shadow-primary/5 bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <Calendar
                mode="single"
                selected={selectedDay}
                onSelect={(day) => setSelectedDay(day ?? undefined)}
                locale={vi}
                modifiers={{ hasRelease: releaseDates }}
                modifiersClassNames={{
                  hasRelease: "rdp-day_has-release",
                }}
                components={{
                  DayButton: (props) => <ReleaseDayButton locale={vi} {...props} />,
                }}
              />
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="border-none shadow-lg shadow-primary/5 bg-white/80 backdrop-blur-sm">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl font-semibold flex items-center gap-2">
                    <Disc3 className="w-5 h-5 text-primary" />
                    {selectedDay ? format(selectedDay, "dd MMMM yyyy", { locale: vi }) : "Chọn một ngày"}
                  </h3>
                  <Badge className="rounded-full px-3">Release</Badge>
                </div>

                {selectedReleases.length === 0 ? (
                  <div className="text-muted-foreground text-sm">
                    Chưa có lịch phát hành cho ngày này. Hãy theo dõi cập nhật tiếp nhé.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedReleases.map((release) => (
                      <div key={release.id} className="rounded-2xl border border-primary/10 p-4 bg-white">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm text-primary font-semibold">
                              {release.type}
                            </p>
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
              </CardContent>
            </Card>

            <div className="rounded-2xl border border-primary/10 bg-white/70 p-4 text-sm text-muted-foreground flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-primary mt-0.5" />
              Lịch phát hành có thể điều chỉnh theo tiến độ sản xuất, RF sẽ thông báo sớm khi có thay đổi.
            </div>
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
        "relative isolate z-10 flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-1 border-0 leading-none font-normal data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground [&>span]:text-xs [&>span]:opacity-70",
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
