"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Send } from "lucide-react";
import { toast } from "sonner";

type ContactPayload = {
  name: string;
  email: string;
  organization?: string;
  budget?: string;
  deadline?: string;
  message: string;
  company?: string;
};

export function ContactSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const payload: ContactPayload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      organization: String(formData.get("organization") ?? ""),
      budget: String(formData.get("budget") ?? ""),
      deadline: String(formData.get("deadline") ?? ""),
      message: String(formData.get("message") ?? ""),
      company: String(formData.get("company") ?? ""),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Gửi thất bại");
      }

      toast.success("Đã gửi tin nhắn! RF sẽ phản hồi sớm.");
      event.currentTarget.reset();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Lỗi không xác định";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-16 md:py-24 bg-primary/5">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4 flex items-center justify-center gap-2">
            <Mail className="w-8 h-8 text-primary" />
            Kết nối hợp tác
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Bạn có dự án muốn hợp tác cùng RF? Gửi thông tin để mình phản hồi nhanh nhất.
          </p>
        </div>

        <Card className="border-none shadow-lg shadow-primary/5 bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <form onSubmit={onSubmit} className="space-y-6">
              <input type="text" name="company" className="hidden" tabIndex={-1} autoComplete="off" />

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Tên liên hệ</Label>
                  <Input id="name" name="name" required placeholder="Tên của bạn" className="bg-white/50 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required placeholder="hello@company.com" className="bg-white/50 rounded-xl" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="organization">Tổ chức / team</Label>
                <Input id="organization" name="organization" placeholder="Studio, brand, agency..." className="bg-white/50 rounded-xl" />
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="budget">Ngân sách dự kiến</Label>
                  <Input id="budget" name="budget" placeholder="Ví dụ: 10-30 triệu" className="bg-white/50 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline mong muốn</Label>
                  <Input id="deadline" name="deadline" placeholder="Ví dụ: 30/07/2026" className="bg-white/50 rounded-xl" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Nội dung hợp tác</Label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  placeholder="Mô tả brief, mục tiêu, kỳ vọng..."
                  className="min-h-[150px] bg-white/50 rounded-xl resize-none"
                />
              </div>

              <Button type="submit" size="lg" disabled={isSubmitting} className="w-full rounded-xl font-semibold text-base h-12">
                <Send className="w-5 h-5 mr-2" />
                {isSubmitting ? "Đang gửi..." : "Gửi liên hệ"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
