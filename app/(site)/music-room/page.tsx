"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dices, Disc3, Pause, Play, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { SingerAvatar } from "@/components/music-room/SingerAvatar";
import {
  type MusicRoomState,
  type RollHistoryItem,
  getDefaultMusicRoomState,
  getSongById,
  loadMusicRoomState,
  musicRoomSongs,
  rollWeightedSong,
  saveMusicRoomState,
} from "@/lib/music-room";

export default function MusicRoomPage() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rollTimerRef = useRef<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [beatLevel, setBeatLevel] = useState(0);
  const [musicRoomState, setMusicRoomState] = useState<MusicRoomState>(getDefaultMusicRoomState);
  const [isRolling, setIsRolling] = useState(false);
  const [gachaResult, setGachaResult] = useState<{ title: string; rarity: string } | null>(null);
  const currentSong = useMemo(
    () => getSongById(musicRoomState.lastSongId) ?? musicRoomSongs[0],
    [musicRoomState.lastSongId]
  );
  const singerState = isRolling ? "excited" : isPlaying ? "singing" : "idle";

  useEffect(() => {
    setMusicRoomState(loadMusicRoomState());
  }, []);

  useEffect(() => {
    saveMusicRoomState(musicRoomState);
  }, [musicRoomState]);

  useEffect(() => {
    if (!isPlaying) {
      setBeatLevel(0);
      return;
    }

    const interval = window.setInterval(() => {
      setBeatLevel((value) => (value >= 3 ? 0 : value + 1));
    }, 280);

    return () => window.clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      if (rollTimerRef.current) {
        window.clearTimeout(rollTimerRef.current);
      }
    };
  }, []);

  const playCurrentSong = async () => {
    if (!audioRef.current) return;
    try {
      audioRef.current.load();
      await audioRef.current.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
      toast.error("Không thể phát bài hát mẫu. Hãy thêm audio file vào public/audio/music-room.");
    }
  };

  const rollGacha = () => {
    if (isRolling) return;
    setIsRolling(true);
    setGachaResult(null);

    rollTimerRef.current = window.setTimeout(() => {
      setMusicRoomState((prev) => {
        const { song, rarity } = rollWeightedSong();
        const nextHistory: RollHistoryItem[] = [
          { songId: song.id, rarity, rolledAt: Date.now() },
          ...prev.rollHistory,
        ].slice(0, 20);

        setGachaResult({
          title: song.title,
          rarity,
        });

        return {
          ...prev,
          lastSongId: song.id,
          rollHistory: nextHistory,
        };
      });
      setIsRolling(false);
      void playCurrentSong();
    }, 1600);
  };

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      toast.error("Không thể tiếp tục phát bài hát.");
    }
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
              Roll a chill track, let the virtual singer perform, and keep your cozy listening history for this device.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div className="relative flex flex-col items-center justify-center">
              <SingerAvatar state={singerState} beatLevel={beatLevel} />

              <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-primary/10 w-full max-w-sm flex flex-col items-center gap-3 relative z-20">
                <div className="text-center">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Now Playing
                  </p>
                  <p className="font-display font-semibold text-foreground truncate w-56">{currentSong.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{currentSong.theme}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    size="icon"
                    className="w-12 h-12 rounded-full shadow-md shadow-primary/20"
                    onClick={togglePlayback}
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-1" />}
                  </Button>
                  <Badge className="rounded-full">{currentSong.rarity}</Badge>
                  <Badge variant="secondary" className="rounded-full">
                    {currentSong.durationLabel}
                  </Badge>
                </div>
                <audio
                  ref={audioRef}
                  src={currentSong.src}
                  preload="none"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                  onError={() => {
                    setIsPlaying(false);
                    toast.error("Không tìm thấy audio demo cho bài hát này.");
                  }}
                />
              </div>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div className="bg-white/70 backdrop-blur-sm p-8 rounded-3xl border border-primary/10 shadow-xl w-full max-w-sm flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                  <Dices className="w-8 h-8 text-primary" />
                </div>
                <h2 className="font-display text-2xl font-semibold mb-2">Music Gacha</h2>
                <p className="text-muted-foreground mb-6 text-sm">
                  Roll a random chill track. Super Rare pulls will feel like a little encore reward.
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

                <div className="mt-6 w-full rounded-2xl border border-primary/10 bg-white/70 p-4 text-left">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Recent rolls</p>
                  <div className="mt-3 space-y-2">
                    {musicRoomState.rollHistory.length > 0 ? (
                      musicRoomState.rollHistory.slice(0, 4).map((item) => {
                        const song = getSongById(item.songId);
                        return (
                          <div key={`${item.songId}-${item.rolledAt}`} className="flex items-center justify-between gap-3 text-sm">
                            <div className="min-w-0">
                              <p className="truncate font-medium text-foreground">{song?.title ?? "Unknown song"}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(item.rolledAt).toLocaleString("vi-VN")}
                              </p>
                            </div>
                            <Badge variant="secondary" className="rounded-full">
                              {item.rarity}
                            </Badge>
                          </div>
                        );
                      })
                    ) : (
                      <p className="text-sm text-muted-foreground">Roll your first song to start a cozy history.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
