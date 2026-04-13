"use client";

import { useRef, useState } from "react";
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
  const formRef = useRef<HTMLFormElement | null>(null);
  const todayIso = new Date().toISOString().slice(0, 10);

  const getFormString = (formData: FormData, key: string) => {
    const value = formData.get(key);
    return typeof value === "string" ? value : "";
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const form = formRef.current;
    if (!form) {
      toast.error("Unable to find the form.");
      setIsSubmitting(false);
      return;
    }
    const formData = new FormData(form);
    const rawDeadline = getFormString(formData, "deadline");
    const normalizedDeadline = rawDeadline
      ? (() => {
          const [year, month, day] = rawDeadline.split("-");
          if (!year || !month || !day) return rawDeadline;
          return `${day}/${month}/${year}`;
        })()
      : "";
    const payload: ContactPayload = {
      name: getFormString(formData, "name"),
      email: getFormString(formData, "email"),
      organization: getFormString(formData, "organization"),
      budget: getFormString(formData, "budget"),
      deadline: normalizedDeadline,
      message: getFormString(formData, "message"),
      company: getFormString(formData, "company"),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        const message = typeof data?.message === "string" ? data.message : "Submission failed.";
        throw new Error(message);
      }

      toast.success("Message sent! RF will get back soon.");
      form.reset();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected error.";
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
            Collaboration
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Have a project in mind? Share the details and RF will reply soon.
          </p>
        </div>

        <Card className="border-none shadow-lg shadow-primary/5 bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-6">
            <form ref={formRef} onSubmit={onSubmit} className="space-y-6">
              <input type="text" name="company" className="hidden" tabIndex={-1} autoComplete="off" />

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Contact name</Label>
                  <Input id="name" name="name" required placeholder="Your name" className="bg-white/50 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required placeholder="hello@company.com" className="bg-white/50 rounded-xl" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="organization">Organization / team</Label>
                <Input id="organization" name="organization" placeholder="Studio, brand, agency..." className="bg-white/50 rounded-xl" />
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="budget">Estimated budget</Label>
                  <Input id="budget" name="budget" placeholder="e.g., $500 - $1,500" className="bg-white/50 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deadline">Preferred deadline</Label>
                  <Input
                    id="deadline"
                    name="deadline"
                    type="date"
                    min={todayIso}
                    className="bg-white/50 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Collaboration brief</Label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  placeholder="Describe the brief, goals, and expectations..."
                  className="min-h-[150px] bg-white/50 rounded-xl resize-none"
                />
              </div>

              <Button type="submit" size="lg" disabled={isSubmitting} className="w-full rounded-xl font-semibold text-base h-12">
                <Send className="w-5 h-5 mr-2" />
                {isSubmitting ? "Sending..." : "Send inquiry"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
