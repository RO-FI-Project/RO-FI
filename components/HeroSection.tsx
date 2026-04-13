"use client";

import { buttonVariants } from "@/components/ui/button";
import { Heart, Music } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function HeroSection() {
  const settings = useQuery(api.siteSettings.getPublic);
  const heroSubtitle = settings?.heroSubtitle ?? "Artist hub for the music & anime community";

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background pt-16">
      <div className="absolute inset-0 flex flex-col justify-between p-4 md:p-8 pointer-events-none z-0 select-none overflow-hidden">
        <h1 className="font-display text-[28vw] leading-[0.75] text-primary/10 tracking-tighter -ml-[2vw] mt-12 md:mt-0">
          RF
        </h1>
        <h1 className="font-display text-[28vw] leading-[0.75] text-primary/10 tracking-tighter text-right -mr-[2vw] mb-12 md:mb-0">
          MUSIC
        </h1>
      </div>

      <div className="absolute top-24 right-4 md:top-32 md:right-12 max-w-[220px] text-right z-10 hidden md:block">
        <p className="text-xs font-bold uppercase tracking-widest text-foreground/50">
          {heroSubtitle}
        </p>
      </div>

      <div className="absolute bottom-8 left-4 md:bottom-12 md:left-12 max-w-[320px] z-10 hidden md:block">
        <p className="text-xs font-bold uppercase tracking-widest text-foreground/50 leading-relaxed">
          RF blends pop and anime-inspired sounds, focusing on emotion and storytelling in every track.
        </p>
      </div>

      <div className="relative z-20 flex flex-col items-center w-full px-4">
        <div className="relative w-[280px] h-[280px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] animate-[spin_12s_linear_infinite] shadow-2xl rounded-full">
          <div className="absolute inset-0 rounded-full bg-foreground overflow-hidden shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
            <div className="absolute inset-[4%] rounded-full border border-white/5" />
            <div className="absolute inset-[8%] rounded-full border border-white/5" />
            <div className="absolute inset-[12%] rounded-full border border-white/5" />
            <div className="absolute inset-[16%] rounded-full border border-white/5" />
            <div className="absolute inset-[20%] rounded-full border border-white/5" />
            <div className="absolute inset-[24%] rounded-full border border-white/5" />
            <div className="absolute inset-[28%] rounded-full border border-white/5" />
            <div className="absolute inset-[32%] rounded-full border border-white/5" />

            <div className="absolute inset-0 bg-linear-to-tr from-white/0 via-white/10 to-white/0" />
            <div className="absolute inset-0 bg-linear-to-bl from-white/0 via-white/10 to-white/0" />
            <div
              className="absolute inset-0 mix-blend-overlay opacity-50"
              style={{
                background:
                  "conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.3) 45deg, transparent 90deg, transparent 180deg, rgba(255,255,255,0.3) 225deg, transparent 270deg)",
              }}
            />
          </div>

          <div className="absolute inset-[32%] rounded-full bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.3)]">
            <div className="absolute inset-2 rounded-full border border-white/30" />

            <div className="w-3 h-3 md:w-4 md:h-4 bg-background rounded-full shadow-inner z-10" />

            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
              <path id="curve" d="M 50, 50 m -36, 0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0" fill="transparent" />
              <text className="text-[6.5px] font-bold fill-white uppercase tracking-[0.15em]" style={{ fontFamily: "var(--font-sans)" }}>
                <textPath href="#curve" startOffset="0%">
                  RF • ANIME & POP MUSIC • 33 ⅓ RPM • RF • ANIME & POP MUSIC • 33 ⅓ RPM •
                </textPath>
              </text>
            </svg>

            <div className="absolute font-display text-4xl md:text-5xl text-white font-bold tracking-tighter drop-shadow-md">
              RF
            </div>
          </div>
        </div>

        <div className="mt-12 text-center md:hidden px-4">
          <p className="text-sm font-bold uppercase tracking-widest text-foreground/60 mb-2">
            Anime & Pop Music Vibe
          </p>
        </div>

        <div className="mt-8 md:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 z-30 w-full max-w-md mx-auto">
          <a href="#donate" className={buttonVariants({ size: "lg", className: "w-full sm:w-auto rounded-full font-semibold text-base px-8 shadow-lg shadow-primary/20" })}>
            <Heart className="w-5 h-5 mr-2 fill-current" />
            Support RF
          </a>
          <a href="#releases" className={buttonVariants({ size: "lg", variant: "secondary", className: "w-full sm:w-auto rounded-full font-semibold text-base px-8 shadow-lg shadow-secondary/20 bg-white" })}>
            <Music className="w-5 h-5 mr-2" />
            View release calendar
          </a>
        </div>
      </div>
    </section>
  );
}
