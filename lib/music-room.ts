"use client";

export type SongRarity = "Common" | "Rare" | "Super Rare";

export type MusicRoomSong = {
  id: string;
  title: string;
  rarity: SongRarity;
  theme: string;
  durationLabel: string;
  thumbnail: string;
  videoId: string;
  youtubeWatchUrl: string;
  youtubeEmbedUrl: string;
};

export type RollHistoryItem = {
  songId: string;
  rarity: SongRarity;
  rolledAt: number;
};

export type MusicRoomState = {
  lastSongId: string;
  rollHistory: RollHistoryItem[];
};

export const musicRoomStorageKey = "rf_music_room_state";
export const musicRoomYouTubeCacheKey = "rf_music_room_yt_cache";
export const musicRoomCacheTtlMs = 24 * 60 * 60 * 1000;

export function getDefaultMusicRoomState(songId = ""): MusicRoomState {
  return {
    lastSongId: songId,
    rollHistory: [],
  };
}

export function formatDurationLabel(durationSec: number) {
  const safeDuration = Math.max(0, durationSec);
  const minutes = Math.floor(safeDuration / 60);
  const seconds = safeDuration % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function assignRarityByIndex(index: number, total: number): SongRarity {
  const ratio = total <= 0 ? 1 : index / total;
  if (ratio < 0.1) return "Super Rare";
  if (ratio < 0.35) return "Rare";
  return "Common";
}

export function buildThemeFromTitle(title: string) {
  return `From RosaFlora public channel • ${title}`;
}

export function normalizeYouTubeSongs(
  videos: Array<{
    videoId: string;
    title: string;
    thumbnail: string;
    publishedAt: string;
    durationSec: number;
    youtubeWatchUrl: string;
    youtubeEmbedUrl: string;
  }>
): MusicRoomSong[] {
  return videos.map((video, index) => ({
    id: video.videoId,
    title: video.title,
    rarity: assignRarityByIndex(index, videos.length),
    theme: buildThemeFromTitle(video.title),
    durationLabel: formatDurationLabel(video.durationSec),
    thumbnail: video.thumbnail,
    videoId: video.videoId,
    youtubeWatchUrl: video.youtubeWatchUrl,
    youtubeEmbedUrl: video.youtubeEmbedUrl,
  }));
}

export function getSongById(songId: string, songs: MusicRoomSong[]) {
  return songs.find((song) => song.id === songId) ?? songs[0];
}

export function loadMusicRoomState(songs: MusicRoomSong[]): MusicRoomState {
  if (typeof window === "undefined") {
    return getDefaultMusicRoomState(songs[0]?.id ?? "");
  }

  try {
    const raw = window.localStorage.getItem(musicRoomStorageKey);
    if (!raw) {
      return getDefaultMusicRoomState(songs[0]?.id ?? "");
    }

    const parsed = JSON.parse(raw) as Partial<MusicRoomState>;
    const fallback = getDefaultMusicRoomState(songs[0]?.id ?? "");

    const rollHistory = Array.isArray(parsed.rollHistory)
      ? parsed.rollHistory.filter(
          (item): item is RollHistoryItem =>
            Boolean(item) &&
            typeof item === "object" &&
            typeof item.songId === "string" &&
            typeof item.rarity === "string" &&
            typeof item.rolledAt === "number"
        )
      : fallback.rollHistory;

    const songId =
      typeof parsed.lastSongId === "string" && getSongById(parsed.lastSongId, songs)
        ? parsed.lastSongId
        : fallback.lastSongId;

    return {
      lastSongId: songId,
      rollHistory: rollHistory.slice(0, 20),
    };
  } catch {
    return getDefaultMusicRoomState();
  }
}

export function saveMusicRoomState(state: MusicRoomState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(musicRoomStorageKey, JSON.stringify(state));
}

export function loadCachedYouTubeSongs(): MusicRoomSong[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(musicRoomYouTubeCacheKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { fetchedAt?: number; songs?: MusicRoomSong[] };
    if (!Array.isArray(parsed.songs)) return [];
    return parsed.songs.filter(
      (song): song is MusicRoomSong =>
        Boolean(song) &&
        typeof song.id === "string" &&
        typeof song.title === "string" &&
        typeof song.rarity === "string" &&
        typeof song.videoId === "string" &&
        typeof song.youtubeEmbedUrl === "string"
    );
  } catch {
    return [];
  }
}

export function getFreshCachedYouTubeSongs(): MusicRoomSong[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(musicRoomYouTubeCacheKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { fetchedAt?: number; songs?: MusicRoomSong[] };
    if (typeof parsed.fetchedAt !== "number") return [];
    if (Date.now() - parsed.fetchedAt > musicRoomCacheTtlMs) return [];
    return loadCachedYouTubeSongs();
  } catch {
    return [];
  }
}

export function saveCachedYouTubeSongs(songs: MusicRoomSong[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    musicRoomYouTubeCacheKey,
    JSON.stringify({
      fetchedAt: Date.now(),
      songs,
    })
  );
}

export function rollWeightedSong(songs: MusicRoomSong[]) {
  const weights: Record<SongRarity, number> = {
    Common: 75,
    Rare: 20,
    "Super Rare": 5,
  };

  const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
  let threshold = Math.random() * totalWeight;
  let selectedRarity: SongRarity = "Common";

  for (const rarity of Object.keys(weights) as SongRarity[]) {
    threshold -= weights[rarity];
    if (threshold <= 0) {
      selectedRarity = rarity;
      break;
    }
  }

  const pool = songs.filter((song) => song.rarity === selectedRarity);
  const fallbackPool = pool.length > 0 ? pool : songs;
  const song = fallbackPool[Math.floor(Math.random() * fallbackPool.length)];

  return {
    song,
    rarity: song.rarity,
  };
}
