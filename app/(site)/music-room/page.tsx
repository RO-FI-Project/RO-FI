"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dices, Disc3, Music, Pause, Play, Sparkles } from "lucide-react";

const songs = [
  "Sakura Dreams (Lofi Mix)",
  "Neon Nights (Acoustic)",
  "Cyberpunk City Pop",
  "Autumn Leaves",
  "Midnight Drive",
  "Starlight Melody",
];

export default function MusicRoomPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState(songs[0]);
  const [isRolling, setIsRolling] = useState(false);
  const [gachaResult, setGachaResult] = useState<{ title: string; rarity: string } | null>(null);

  const rollGacha = () => {
    if (isRolling) return;
    setIsRolling(true);
    setGachaResult(null);

    setTimeout(() => {
      const nextSong = songs[Math.floor(Math.random() * songs.length)];
      const isRare = Math.random() > 0.8;
      setGachaResult({
        title: nextSong,
        rarity: isRare ? "Super Rare" : "Common",
      });
      setCurrentSong(nextSong);
      setIsPlaying(true);
      setIsRolling(false);
    }, 1600);
  };

  return (
    <main className="min-h-screen flex flex-col bg-background overflow-hidden">
      <Navbar />
      <div className="flex-1 pt-24 pb-16 md:pt-32 md:pb-24 relative">
        <div className="absolute top-1/2 left-1/2 size-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl -z-10" />

        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
              Music Experience
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-4">
              Music Room
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Không gian gacha 3D và singer ảo. Demo UI/animation để RF test trải nghiệm fan.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="relative flex flex-col items-center justify-center">
              <div className="absolute bottom-4 size-56 rounded-full bg-primary/20 blur-2xl" />

              <motion.div
                className="relative z-10 w-48 h-64 flex flex-col items-center justify-end mb-10"
                animate={{
                  y: isPlaying ? [0, -12, 0] : [0, -4, 0],
                  rotate: isPlaying ? [0, 2, -2, 0] : 0,
                }}
                transition={{
                  repeat: Infinity,
                  duration: isPlaying ? 0.8 : 3,
                  ease: "easeInOut",
                }}
              >
                <div className="w-24 h-24 bg-secondary rounded-full mb-[-10px] z-20 relative shadow-inner">
                  <div className="absolute top-9 left-4 w-3 h-4 bg-foreground rounded-full" />
                  <div className="absolute top-9 right-4 w-3 h-4 bg-foreground rounded-full" />
                  <div className="absolute top-14 left-2 w-4 h-2 bg-primary/40 rounded-full blur-sm" />
                  <div className="absolute top-14 right-2 w-4 h-2 bg-primary/40 rounded-full blur-sm" />
                  <motion.div
                    className="absolute top-14 left-1/2 -translate-x-1/2 w-4 bg-foreground rounded-b-full"
                    animate={{ height: isPlaying ? [2, 8, 2] : 2 }}
                    transition={{ repeat: Infinity, duration: 0.4 }}
                  />
                  <div className="absolute top-1/2 -left-3 w-6 h-10 bg-primary rounded-full -translate-y-1/2" />
                  <div className="absolute top-1/2 -right-3 w-6 h-10 bg-primary rounded-full -translate-y-1/2" />
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-28 h-12 border-t-4 border-primary rounded-t-full" />
                </div>
                <div className="w-20 h-28 bg-primary rounded-t-3xl relative z-10 overflow-hidden">
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-white/20 rounded-full" />
                </div>

                <AnimatePresence>
                  {isPlaying ? (
                    <motion.div
                      key="notes"
                      className="absolute -top-6 -right-10 text-primary"
                      initial={{ opacity: 0, y: 10, scale: 0.5 }}
                      animate={{ opacity: [0, 1, 0], y: -40, scale: 1, rotate: 10 }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      <Music className="w-6 h-6" />
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </motion.div>

              <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-primary/10 w-full max-w-sm flex flex-col items-center gap-3 relative z-20">
                <div className="text-center">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Now Playing
                  </p>
                  <p className="font-display font-semibold text-foreground truncate w-56">{currentSong}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    size="icon"
                    className="w-12 h-12 rounded-full shadow-md shadow-primary/20"
                    onClick={() => setIsPlaying((value) => !value)}
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="bg-white/70 backdrop-blur-sm p-8 rounded-3xl border border-primary/10 shadow-xl w-full max-w-sm flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <Dices className="w-8 h-8 text-primary" />
                </div>
                <h2 className="font-display text-2xl font-semibold mb-2">Music Gacha</h2>
                <p className="text-muted-foreground mb-6 text-sm">
                  Roll để mở một track ngẫu nhiên. Có cơ hội mở demo chưa phát hành.
                </p>

                <div className="h-32 w-full flex items-center justify-center mb-6">
                  <AnimatePresence mode="wait">
                    {isRolling ? (
                      <motion.div
                        key="rolling"
                        animate={{ rotateY: [0, 360, 720], scale: [1, 1.15, 1] }}
                        transition={{ duration: 1.6, ease: "easeInOut" }}
                        className="w-20 h-20 rounded-full bg-linear-to-br from-primary to-secondary shadow-inner flex items-center justify-center"
                      >
                        <Sparkles className="w-8 h-8 text-white animate-pulse" />
                      </motion.div>
                    ) : gachaResult ? (
                      <motion.div
                        key="result"
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="flex flex-col items-center"
                      >
                        <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center mb-3 border-4 border-primary">
                          <Disc3 className="w-8 h-8 text-primary" />
                        </div>
                        <Badge className="mb-2 rounded-full bg-muted text-muted-foreground">{gachaResult.rarity}</Badge>
                        <span className="font-display font-semibold text-primary">{gachaResult.title}</span>
                      </motion.div>
                    ) : (
                      <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center opacity-50">
                        <Disc3 className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                  </AnimatePresence>
                </div>

                <Button
                  size="lg"
                  className="w-full rounded-xl h-14 text-lg font-semibold shadow-lg shadow-primary/20"
                  onClick={rollGacha}
                  disabled={isRolling}
                >
                  {isRolling ? "Rolling..." : "Roll Gacha"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
