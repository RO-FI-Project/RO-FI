import { Heart, Music } from "lucide-react";

export function Footer() {
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

        <div className="flex items-center gap-4 mb-8">
          <a href="https://rfpage.vercel.app" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:underline">
            Main Portfolio
          </a>
          <span className="text-muted-foreground">•</span>
          <a href="#" className="text-sm font-medium text-primary hover:underline">
            YouTube
          </a>
          <span className="text-muted-foreground">•</span>
          <a href="#" className="text-sm font-medium text-primary hover:underline">
            Spotify
          </a>
          <span className="text-muted-foreground">•</span>
          <a href="#" className="text-sm font-medium text-primary hover:underline">
            Discord
          </a>
        </div>

        <p className="text-sm text-muted-foreground flex items-center gap-1">
          Made with <Heart className="w-4 h-4 text-primary fill-primary mx-1" /> by RF © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
