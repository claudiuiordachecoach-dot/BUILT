import "server-only";
import { Composio } from "@composio/core";

const COMPOSIO_USER_ID = "claudiu";

function getComposio() {
  const apiKey = process.env.COMPOSIO_API_KEY;
  if (!apiKey) throw new Error("COMPOSIO_API_KEY lipsă din .env.local");
  return new Composio({ apiKey });
}

export async function getComposioConnectUrl(callbackUrl: string): Promise<string> {
  const composio = getComposio();
  const session = await composio.create(COMPOSIO_USER_ID);
  const auth = await session.authorize("instagram", { callbackUrl });
  return auth.redirectUrl ?? "";
}

export async function isComposioConnected(): Promise<boolean> {
  try {
    const composio = getComposio();
    const accounts = await composio.connectedAccounts.list({ userIds: [COMPOSIO_USER_ID] });
    return (accounts.items ?? []).some(
      (a: { toolkit?: { slug?: string }; status?: string }) =>
        a.toolkit?.slug === "instagram" && a.status === "active",
    );
  } catch {
    return false;
  }
}

export interface ComposioMedia {
  id: string;
  media_type: string;
  timestamp: string;
  caption?: string;
  permalink: string;
  thumbnail_url?: string;
  media_url?: string;
}

export interface ComposioInsights {
  plays?: number;
  likes?: number;
  comments?: number;
  saved?: number;
  shares?: number;
  reach?: number;
  impressions?: number;
  avg_watch_time_ms?: number;
  total_watch_time_ms?: number;
  replays?: number;
  follows?: number;
  profile_visits?: number;
}

export async function fetchComposioMedia(limit = 50): Promise<ComposioMedia[]> {
  const composio = getComposio();
  const result = await composio.tools.execute("INSTAGRAM_GET_IG_USER_MEDIA", {
    userId: COMPOSIO_USER_ID,
    arguments: { ig_user_id: "me", limit },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = (result as any)?.data ?? (result as any)?.response?.data ?? [];
  if (!Array.isArray(data)) return [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return data.map((item: any) => ({
    id: String(item.id ?? ""),
    media_type: String(item.media_type ?? "IMAGE"),
    timestamp: String(item.timestamp ?? new Date().toISOString()),
    caption: item.caption ?? undefined,
    permalink: String(item.permalink ?? ""),
    thumbnail_url: item.thumbnail_url ?? undefined,
    media_url: item.media_url ?? undefined,
  }));
}

export async function fetchComposioInsights(
  mediaId: string,
  mediaType: string,
): Promise<ComposioInsights> {
  const composio = getComposio();
  const isReel = mediaType === "VIDEO" || mediaType === "REELS";

  const metric = isReel
    ? "reach,views,likes,comments,shares,saved,total_interactions,ig_reels_avg_watch_time"
    : "reach,impressions,likes,comments,shares,saved";

  try {
    const result = await composio.tools.execute("INSTAGRAM_GET_IG_MEDIA_INSIGHTS", {
      userId: COMPOSIO_USER_ID,
      arguments: { ig_media_id: mediaId, metric },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items: Array<{ name: string; values?: Array<{ value: number }>; value?: number }> =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (result as any)?.data?.data ?? (result as any)?.response?.data ?? [];

    const insights: ComposioInsights = {};
    for (const item of items) {
      const val = item.values?.[0]?.value ?? (item.value as number | undefined) ?? 0;
      switch (item.name) {
        case "plays":
        case "views":                          insights.plays = val; break;
        case "likes":                          insights.likes = val; break;
        case "comments":                       insights.comments = val; break;
        case "saved":                          insights.saved = val; break;
        case "shares":                         insights.shares = val; break;
        case "reach":                          insights.reach = val; break;
        case "impressions":                    insights.reach = insights.reach ?? val; break;
        case "ig_reels_avg_watch_time":        insights.avg_watch_time_ms = val; break;
        case "ig_reels_video_view_total_time": insights.total_watch_time_ms = val; break;
        case "clips_replays_count":            insights.replays = val; break;
        case "follows":                        insights.follows = val; break;
        case "profile_visits":                 insights.profile_visits = val; break;
      }
    }
    return insights;
  } catch {
    return {};
  }
}

export async function fetchComposioProfile(): Promise<{ username: string; followers_count: number } | null> {
  try {
    const composio = getComposio();
    const result = await composio.tools.execute("INSTAGRAM_GET_IG_USER", {
      userId: COMPOSIO_USER_ID,
      arguments: { ig_user_id: "me", fields: "username,followers_count" },
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const d = (result as any)?.data ?? (result as any)?.response;
    if (!d?.username) return null;
    return { username: String(d.username), followers_count: Number(d.followers_count ?? 0) };
  } catch {
    return null;
  }
}
