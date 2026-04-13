"use client";

import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";

type FanIdeaPayload = {
  fanName: string;
  idea: string;
  proposedDate: string;
};

export default function FanIdeasPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);
  const submitIdea = useMutation(api.fanIdeas.submit);
  const releases = useQuery(api.releases.listPublic, {});
  const todayIso = new Date().toISOString().slice(0, 10);

  const releaseDates = useMemo(
    () => (releases ?? []).map((release) => release.releaseDate).sort((a, b) => a.localeCompare(b)),
    [releases]
  );
  const releaseDatesSet = useMemo(() => new Set(releaseDates), [releaseDates]);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const form = formRef.current;
    if (!form) {
      toast.error("Không tìm thấy form để gửi.");
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData(form);
    const payload: FanIdeaPayload = {
      fanName: String(formData.get("fanName") ?? "").trim(),
      idea: String(formData.get("idea") ?? "").trim(),
      proposedDate: String(formData.get("proposedDate") ?? ""),
    };

    if (!payload.fanName || !payload.idea || !payload.proposedDate) {
      toast.error("Vui lòng điền đầy đủ thông tin.");
      setIsSubmitting(false);
      return;
    }

    if (releaseDatesSet.has(payload.proposedDate)) {
      toast.error("Ngày này đã có lịch phát hành. Hãy chọn ngày khác nhé.");
      setIsSubmitting(false);
      return;
    }

    try {
      await submitIdea(payload);
      toast.success("Đã gửi ý tưởng! RF sẽ cân nhắc và cập nhật sớm.");
      form.reset();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Lỗi không xác định";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 pt-24">
        <section className="py-16 md:py-24 bg-primary/5">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-12">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                Fan Space
              </p>
              <h1 className="font-display text-3xl md:text-4xl font-semibold mb-4 flex items-center justify-center gap-2">
                <Sparkles className="w-8 h-8 text-primary" />
                Fan Ideas
              </h1>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Fan góp ý lịch ra nhạc mong muốn. RF sẽ cân nhắc và cập nhật khi phù hợp.
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
              <Card className="border-none shadow-lg shadow-primary/5 bg-white/80 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="rounded-2xl border border-primary/10 bg-white/70 p-4 text-sm text-muted-foreground mb-6">
                    Ngày đề xuất không được trùng exact với lịch phát hành đã công bố.
                  </div>
                  <form ref={formRef} onSubmit={onSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="fanName">Tên fan</Label>
                      <Input id="fanName" name="fanName" required placeholder="Tên của bạn" className="bg-white/50 rounded-xl" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="proposedDate">Ngày phát hành đề xuất</Label>
                      <Input
                        id="proposedDate"
                        name="proposedDate"
                        type="date"
                        required
                        min={todayIso}
                        className="bg-white/50 rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="idea">Ý tưởng của bạn</Label>
                      <Textarea
                        id="idea"
                        name="idea"
                        required
                        placeholder="Ví dụ: Concept, cảm hứng, thể loại, collab..."
                        className="min-h-[160px] bg-white/50 rounded-xl resize-none"
                      />
                    </div>

                    <Button type="submit" size="lg" disabled={isSubmitting} className="w-full rounded-xl font-semibold text-base h-12">
                      {isSubmitting ? "Đang gửi..." : "Gửi ý tưởng"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card className="border-none shadow-lg shadow-primary/5 bg-white/80 backdrop-blur-sm">
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                        <CalendarDays className="w-5 h-5 text-primary" />
                        Ngày đã có lịch
                      </h2>
                      <Badge className="rounded-full px-3">Public</Badge>
                    </div>
                    {releaseDates.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Chưa có lịch phát hành công khai.</p>
                    ) : (
                      <div className="space-y-2">
                        {releaseDates.slice(0, 10).map((date) => (
                          <div key={date} className="rounded-xl border border-primary/10 bg-white/70 px-3 py-2 text-sm">
                            {format(new Date(date), "dd/MM/yyyy", { locale: vi })}
                          </div>
                        ))}
                      </div>
                    )}
                    {releaseDates.length > 10 && (
                      <p className="text-xs text-muted-foreground">Đã hiển thị 10 ngày gần nhất.</p>
                    )}
                  </CardContent>
                </Card>
                <Card className="border-none shadow-lg shadow-primary/5 bg-white/80 backdrop-blur-sm">
                  <CardContent className="pt-6 text-sm text-muted-foreground">
                    Mọi ý tưởng đều được ghi nhận. RF sẽ chủ động liên hệ hoặc cập nhật lịch nếu phù hợp.
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
