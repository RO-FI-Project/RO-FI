import { NextResponse } from "next/server";

const youtubeApiKey = process.env.YOUTUBE_API_KEY;
const youtubeChannelId = process.env.YOUTUBE_CHANNEL_ID;

type YouTubeSearchItem = {
  id?: {
    videoId?: string;
  };
  snippet?: {
    title?: string;
    publishedAt?: string;
    liveBroadcastContent?: string;
    thumbnails?: {
      high?: { url?: string };
      medium?: { url?: string };
      default?: { url?: string };
    };
  };
};

type YouTubeVideosItem = {
  id?: string;
  contentDetails?: {
    duration?: string;
  };
};

function parseDurationToSeconds(duration: string) {
  const matches = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!matches) return 0;

  const hours = Number(matches[1] ?? 0);
  const minutes = Number(matches[2] ?? 0);
  const seconds = Number(matches[3] ?? 0);
  return hours * 3600 + minutes * 60 + seconds;
}

export async function GET() {
  if (!youtubeApiKey || !youtubeChannelId) {
    return NextResponse.json({ error: "Missing YouTube configuration." }, { status: 500 });
  }

  try {
    const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
    searchUrl.searchParams.set("key", youtubeApiKey);
    searchUrl.searchParams.set("channelId", youtubeChannelId);
    searchUrl.searchParams.set("part", "snippet");
    searchUrl.searchParams.set("type", "video");
    searchUrl.searchParams.set("order", "date");
    searchUrl.searchParams.set("maxResults", "25");

    const searchResponse = await fetch(searchUrl.toString(), {
      next: { revalidate: 60 * 60 * 24 },
    });

    if (!searchResponse.ok) {
      throw new Error("Failed to fetch channel videos.");
    }

    const searchData = (await searchResponse.json()) as { items?: YouTubeSearchItem[] };
    const searchItems = Array.isArray(searchData.items) ? searchData.items : [];

    const baseItems = searchItems
      .map((item) => {
        const videoId = item.id?.videoId;
        const title = item.snippet?.title?.trim();
        const publishedAt = item.snippet?.publishedAt;
        const liveBroadcastContent = item.snippet?.liveBroadcastContent;
        const thumbnail =
          item.snippet?.thumbnails?.high?.url ??
          item.snippet?.thumbnails?.medium?.url ??
          item.snippet?.thumbnails?.default?.url ??
          "";

        if (!videoId || !title || !publishedAt || liveBroadcastContent !== "none") {
          return null;
        }

        return {
          videoId,
          title,
          thumbnail,
          publishedAt,
        };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    const videoIds = baseItems.map((item) => item.videoId);
    if (videoIds.length === 0) {
      return NextResponse.json({ videos: [] });
    }

    const videosUrl = new URL("https://www.googleapis.com/youtube/v3/videos");
    videosUrl.searchParams.set("key", youtubeApiKey);
    videosUrl.searchParams.set("part", "contentDetails");
    videosUrl.searchParams.set("id", videoIds.join(","));

    const videosResponse = await fetch(videosUrl.toString(), {
      next: { revalidate: 60 * 60 * 24 },
    });

    if (!videosResponse.ok) {
      throw new Error("Failed to fetch video details.");
    }

    const videosData = (await videosResponse.json()) as { items?: YouTubeVideosItem[] };
    const durationMap = new Map<string, number>();

    for (const item of videosData.items ?? []) {
      const videoId = item.id;
      const duration = item.contentDetails?.duration;
      if (!videoId || !duration) continue;
      durationMap.set(videoId, parseDurationToSeconds(duration));
    }

    const videos = baseItems
      .map((item) => {
        const durationSec = durationMap.get(item.videoId) ?? 0;
        if (durationSec < 70) {
          return null;
        }

        return {
          videoId: item.videoId,
          title: item.title,
          thumbnail: item.thumbnail,
          publishedAt: item.publishedAt,
          durationSec,
          youtubeWatchUrl: `https://www.youtube.com/watch?v=${item.videoId}`,
          youtubeEmbedUrl: `https://www.youtube.com/embed/${item.videoId}?autoplay=1&rel=0`,
        };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    return NextResponse.json({ videos });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown YouTube API error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
