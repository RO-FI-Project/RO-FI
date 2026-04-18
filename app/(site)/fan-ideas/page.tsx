"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Heart, Send } from "lucide-react";
import { toast } from "sonner";

type FanIdeaPayload = {
  fanName: string;
  title: string;
  idea: string;
  proposedDate: string;
};

type SubmissionStatus = {
  id: Id<"fanIdeas">;
  createdAt: number;
};

const submissionStorageKey = "rf_fan_idea_submissions";

export default function FanIdeasPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likePendingId, setLikePendingId] = useState<Id<"fanIdeas"> | null>(null);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [submissionIds, setSubmissionIds] = useState<Id<"fanIdeas">[]>([]);
  const formRef = useRef<HTMLFormElement | null>(null);
  const submitIdea = useMutation(api.fanIdeas.submit);
  const incrementLike = useMutation(api.fanIdeas.incrementLike);
  const decrementLike = useMutation(api.fanIdeas.decrementLike);
  const ideas = useQuery(api.fanIdeas.listPublicRecent, { limit: 12 });
  const mySubmissions = useQuery(
    api.fanIdeas.listByIdsPublicStatus,
    submissionIds.length > 0 ? { ids: submissionIds, limit: 10 } : "skip"
  );
  const todayIso = new Date().toISOString().slice(0, 10);
  const likeStorageKey = "rf_fan_idea_likes";

  const getFormString = (formData: FormData, key: string) => {
    const value = formData.get(key);
    return typeof value === "string" ? value : "";
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(likeStorageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Record<string, boolean>;
      if (parsed && typeof parsed === "object") {
        setLikedMap(parsed);
      }
    } catch {
      setLikedMap({});
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(submissionStorageKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as SubmissionStatus[];
      if (!Array.isArray(parsed)) return;

      const nextIds = parsed
        .filter(
          (entry): entry is SubmissionStatus =>
            Boolean(entry) && typeof entry === "object" && typeof entry.id === "string"
        )
        .sort((left, right) => right.createdAt - left.createdAt)
        .map((entry) => entry.id);

      setSubmissionIds(nextIds);
    } catch {
      setSubmissionIds([]);
    }
  }, []);

  const mySubmissionItems = useMemo(() => mySubmissions ?? [], [mySubmissions]);

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
    const payload: FanIdeaPayload = {
      fanName: getFormString(formData, "fanName").trim(),
      title: getFormString(formData, "title").trim(),
      idea: getFormString(formData, "idea").trim(),
      proposedDate: getFormString(formData, "proposedDate"),
    };

    if (!payload.fanName || !payload.title || !payload.idea || !payload.proposedDate) {
      toast.error("Please complete all required fields.");
      setIsSubmitting(false);
      return;
    }

    try {
      const ideaId = await submitIdea(payload);
      const nextEntries: SubmissionStatus[] = [{ id: ideaId, createdAt: Date.now() }];

      if (typeof window !== "undefined") {
        try {
          const raw = window.localStorage.getItem(submissionStorageKey);
          const parsed = raw ? (JSON.parse(raw) as SubmissionStatus[]) : [];
          if (Array.isArray(parsed)) {
            nextEntries.push(
              ...parsed.filter(
                (entry): entry is SubmissionStatus =>
                  Boolean(entry) &&
                  typeof entry === "object" &&
                  typeof entry.id === "string" &&
                  entry.id !== ideaId
              )
            );
          }
        } catch {
          // noop
        }

        const trimmedEntries = nextEntries.slice(0, 10);
        window.localStorage.setItem(submissionStorageKey, JSON.stringify(trimmedEntries));
        setSubmissionIds(trimmedEntries.map((entry) => entry.id));
      }

      toast.success("Idea sent! You can track its status below.");
      form.reset();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected error.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (id: Id<"fanIdeas">) => {
    if (likePendingId) return;
    setLikePendingId(id);
    try {
      if (likedMap[id]) {
        await decrementLike({ id });
      } else {
        await incrementLike({ id });
      }
      const nextMap = { ...likedMap, [id]: !likedMap[id] };
      if (!nextMap[id]) {
        delete nextMap[id];
      }
      setLikedMap(nextMap);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(likeStorageKey, JSON.stringify(nextMap));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unexpected error.";
      toast.error(message);
    } finally {
      setLikePendingId(null);
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex-1 pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Community Space
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-4">
              Fan Ideas & Requests
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Share ideas for upcoming releases, cover suggestions, or concepts RF should explore.
            </p>
          </div>

          <div className="grid lg:grid-cols-[1fr_400px] gap-12 items-start">
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-display font-semibold flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-primary" />
                  Recent Ideas
                </h2>
              </div>

              <Card className="border-primary/10 bg-white/70">
                <CardHeader>
                  <CardTitle className="text-xl font-display">Your recent submissions</CardTitle>
                  <CardDescription>Track whether your latest idea is being reviewed or approved.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mySubmissionItems.length > 0 ? (
                    mySubmissionItems.map((idea) => (
                      <div
                        key={idea._id}
                        className="flex items-center justify-between gap-3 rounded-2xl border border-primary/10 px-4 py-3"
                      >
                        <div>
                          <p className="font-medium text-foreground">{idea.title?.trim() || "Untitled Idea"}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(idea.createdAt).toLocaleString("en-US")}
                          </p>
                        </div>
                        <Badge className="rounded-full">{idea.status}</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Submit an idea to start tracking its review status here.
                    </p>
                  )}
                </CardContent>
              </Card>

              {ideas && ideas.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-6">
                  {ideas.map((idea) => {
                    const title = idea.title?.trim() || "Untitled Idea";
                    const rawLikes = Number(idea.likes ?? 0);
                    const likes = Number.isFinite(rawLikes) ? rawLikes : 0;
                    const hasLiked = Boolean(likedMap[idea._id]);
                    return (
                    <Card
                      key={idea._id}
                      className="border-primary/10 shadow-sm hover:shadow-md transition-all bg-white/60 backdrop-blur-sm"
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-display leading-tight">{title}</CardTitle>
                        <p className="text-sm text-muted-foreground">by {idea.fanName}</p>
                      </CardHeader>
                      <CardContent>
                        <p className="text-foreground/80 text-sm mb-4 line-clamp-3">“{idea.idea}”</p>
                        <div className="flex items-center gap-2 text-primary">
                          <button
                            type="button"
                            disabled={likePendingId === idea._id}
                            onClick={() => handleLike(idea._id)}
                            className={`p-1.5 rounded-full transition-colors disabled:opacity-60 ${
                              hasLiked ? "text-primary" : "hover:bg-primary/10"
                            }`}
                          >
                            <Heart className={`w-5 h-5 ${hasLiked ? "fill-current" : ""}`} />
                          </button>
                          <span className="text-sm font-semibold">{likes}</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-primary/20 bg-white/70 p-6 text-sm text-muted-foreground">
                  No ideas yet. Be the first to share one.
                </div>
              )}
            </div>

            <div className="sticky top-28">
              <Card className="border-none shadow-xl shadow-primary/5 bg-primary/5">
                <CardHeader>
                  <CardTitle className="font-display text-2xl">Submit an Idea</CardTitle>
                </CardHeader>
                <CardContent>
                  <form ref={formRef} onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="fanName" className="text-sm font-medium">
                        Your Name / Nickname
                      </label>
                      <Input id="fanName" name="fanName" required placeholder="How should I call you?" className="bg-white/80" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="title" className="text-sm font-medium">
                        Idea Title
                      </label>
                      <Input id="title" name="title" required placeholder="e.g., Acoustic Cover of..." className="bg-white/80" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="idea" className="text-sm font-medium">
                        Details
                      </label>
                      <Textarea
                        id="idea"
                        name="idea"
                        required
                        placeholder="Tell me more about your idea! What's the vibe?"
                        className="min-h-[120px] bg-white/80 resize-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="proposedDate" className="text-sm font-medium">
                        Proposed Date
                      </label>
                      <Input
                        id="proposedDate"
                        name="proposedDate"
                        type="date"
                        required
                        min={todayIso}
                        className="bg-white/80"
                      />
                      <p className="text-xs text-muted-foreground">The proposed date should not conflict with announced releases.</p>
                    </div>
                    <Button type="submit" disabled={isSubmitting} className="w-full rounded-xl h-12 mt-2">
                      <Send className="w-4 h-4 mr-2" />
                      {isSubmitting ? "Submitting..." : "Send Idea"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
