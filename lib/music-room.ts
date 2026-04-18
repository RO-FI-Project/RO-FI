"use client";

export type SongRarity = "Common" | "Rare" | "Super Rare";

export type MusicRoomSong = {
  id: string;
  title: string;
  rarity: SongRarity;
  theme: string;
  durationLabel: string;
  src: string;
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

export const musicRoomSongs: MusicRoomSong[] = [
  {
    id: "sakura-dreams",
    title: "Sakura Dreams (Lofi Mix)",
    rarity: "Common",
    theme: "Soft petals and spring air",
    durationLabel: "2:41",
    src: "/audio/music-room/sakura-dreams.mp3",
  },
  {
    id: "neon-nights",
    title: "Neon Nights (Acoustic)",
    rarity: "Common",
    theme: "Late night city lights",
    durationLabel: "3:05",
    src: "/audio/music-room/neon-nights.mp3",
  },
  {
    id: "cyberpunk-city-pop",
    title: "Cyberpunk City Pop",
    rarity: "Rare",
    theme: "Retro-future dance groove",
    durationLabel: "3:22",
    src: "/audio/music-room/cyberpunk-city-pop.mp3",
  },
  {
    id: "autumn-leaves",
    title: "Autumn Leaves",
    rarity: "Common",
    theme: "Warm afternoon comfort",
    durationLabel: "2:58",
    src: "/audio/music-room/autumn-leaves.mp3",
  },
  {
    id: "midnight-drive",
    title: "Midnight Drive",
    rarity: "Rare",
    theme: "Night highway drifting",
    durationLabel: "3:10",
    src: "/audio/music-room/midnight-drive.mp3",
  },
  {
    id: "starlight-melody",
    title: "Starlight Melody",
    rarity: "Super Rare",
    theme: "Dreamy encore under stars",
    durationLabel: "3:44",
    src: "/audio/music-room/starlight-melody.mp3",
  },
];

export const rarityWeights: Array<{ rarity: SongRarity; weight: number }> = [
  { rarity: "Common", weight: 75 },
  { rarity: "Rare", weight: 20 },
  { rarity: "Super Rare", weight: 5 },
];

export function getDefaultMusicRoomState(): MusicRoomState {
  return {
    lastSongId: musicRoomSongs[0]?.id ?? "",
    rollHistory: [],
  };
}

export function getSongById(songId: string) {
  return musicRoomSongs.find((song) => song.id === songId) ?? musicRoomSongs[0];
}

export function loadMusicRoomState(): MusicRoomState {
  if (typeof window === "undefined") {
    return getDefaultMusicRoomState();
  }

  try {
    const raw = window.localStorage.getItem(musicRoomStorageKey);
    if (!raw) {
      return getDefaultMusicRoomState();
    }

    const parsed = JSON.parse(raw) as Partial<MusicRoomState>;
    const fallback = getDefaultMusicRoomState();

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
      typeof parsed.lastSongId === "string" && getSongById(parsed.lastSongId)
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

export function rollWeightedSong() {
  const totalWeight = rarityWeights.reduce((sum, item) => sum + item.weight, 0);
  let threshold = Math.random() * totalWeight;

  let selectedRarity: SongRarity = "Common";
  for (const item of rarityWeights) {
    threshold -= item.weight;
    if (threshold <= 0) {
      selectedRarity = item.rarity;
      break;
    }
  }

  const pool = musicRoomSongs.filter((song) => song.rarity === selectedRarity);
  const fallbackPool = pool.length > 0 ? pool : musicRoomSongs;
  const song = fallbackPool[Math.floor(Math.random() * fallbackPool.length)];

  return {
    song,
    rarity: song.rarity,
  };
}
