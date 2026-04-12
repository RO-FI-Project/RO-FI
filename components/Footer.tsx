"use client";

import { useQuery } from "convex/react";
import { Heart, Music } from "lucide-react";
import { api } from "@/convex/_generated/api";

export function Footer() {
  const settings = useQuery(api.siteSettings.getPublic);
  const socials: { label: string; url: string }[] = settings?.socials ?? [];

  return (
    <footer className="bg-white border-t border-primary/10 py-12">
      <div className="container mx-auto px-4 flex flex-col items-center justify-center text-center">
        <a href="#" className="flex items-center gap-2 text-foreground font-display font-bold text-2xl mb-4">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
            <Music className="w-4 h-4" />
          </div>
          RF
        </a>

        <p className="text-muted-foreground mb-6 max-w-md">
          Cảm ơn bạn đã đồng hành cùng RF. Mỗi donate là một nguồn động lực để ra mắt sản phẩm mới.
        </p>

        {socials.length > 0 && (
          <div className="flex items-center gap-4 mb-8">
            {socials.map((item, index) => (
              <span key={`${item.label}-${index}`} className="flex items-center gap-4">
                {index > 0 && <span className="text-muted-foreground">•</span>}
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:underline">
                  {item.label}
                </a>
              </span>
            ))}
          </div>
        )}

        <p className="text-sm text-muted-foreground flex items-center gap-1">
          Made with <Heart className="w-4 h-4 text-primary fill-primary mx-1" /> by RF © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
