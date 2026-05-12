/**
 * Instagram Graph API client — BUILT M11
 *
 * Acoperă:
 *  - OAuth: URL de autorizare + exchange code → long-lived token
 *  - Fetch media (reels + posts) cu paginare
 *  - Fetch insights per media (plays, likes, saves, reach, etc.)
 *  - Fetch profil (followers_count, username)
 *  - Refresh long-lived token (înainte de expirare 60 zile)
 */

const GRAPH = "https://graph.facebook.com/v21.0";

// Scope-uri necesare — toate pentru insights private
export const IG_SCOPE = [
  "instagram_basic",
  "instagram_manage_insights",
  "pages_show_list",
  "pages_read_engagement",
].join(",");

// ════════════════════════════════════════════════════════════════════
// OAuth helpers
// ════════════════════════════════════════════════════════════════════

export function getOAuthUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.INSTAGRAM_APP_ID ?? "",
    redirect_uri: redirectUri,
    scope: IG_SCOPE,
    response_type: "code",
    state,
  });
  return `https://www.facebook.com/v21.0/dialog/oauth?${params}`;
}

interface ShortTokenResponse {
  access_token: string;
  token_type: string;
}

interface LongTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number; // seconds (~5184000 = 60 zile)
}

export async function exchangeCodeForToken(
  code: string,
  redirectUri: string,
): Promise<{ accessToken: string; expiresIn: number }> {
  const appId = process.env.INSTAGRAM_APP_ID ?? "";
  const appSecret = process.env.INSTAGRAM_APP_SECRET ?? "";

  // 1. Short-lived token (1h)
  const shortRes = await fetch(`${GRAPH}/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: appId,
      client_secret: appSecret,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
      code,
    }),
  });
  if (!shortRes.ok) {
    const err = await shortRes.text();
    throw new Error(`Short token error: ${err}`);
  }
  const short = (await shortRes.json()) as ShortTokenResponse;

  // 2. Long-lived token (60 zile)
  const longRes = await fetch(
    `${GRAPH}/oauth/access_token?` +
      new URLSearchParams({
        grant_type: "fb_exchange_token",
        client_id: appId,
        client_secret: appSecret,
        fb_exchange_token: short.access_token,
      }),
  );
  if (!longRes.ok) {
    const err = await longRes.text();
    throw new Error(`Long token error: ${err}`);
  }
  const long = (await longRes.json()) as LongTokenResponse;
  return { accessToken: long.access_token, expiresIn: long.expires_in };
}

export async function refreshLongLivedToken(
  token: string,
): Promise<{ accessToken: string; expiresIn: number }> {
  const res = await fetch(
    `${GRAPH}/refresh_access_token?` +
      new URLSearchParams({
        grant_type: "ig_refresh_token",
        access_token: token,
      }),
  );
  if (!res.ok) throw new Error(`Refresh token error: ${await res.text()}`);
  const data = (await res.json()) as LongTokenResponse;
  return { accessToken: data.access_token, expiresIn: data.expires_in };
}

// ════════════════════════════════════════════════════════════════════
// Resolve IG User ID din Facebook Pages (necesar pentru Graph API)
// ════════════════════════════════════════════════════════════════════

interface FbPage {
  id: string;
  instagram_business_account?: { id: string };
}

export async function resolveIgUserId(
  userToken: string,
): Promise<{ igUserId: string; username: string }> {
  // Listăm paginile FB ale userului
  const pagesRes = await fetch(
    `${GRAPH}/me/accounts?fields=id,instagram_business_account&access_token=${userToken}`,
  );
  if (!pagesRes.ok) throw new Error(`Pages error: ${await pagesRes.text()}`);
  const pages = (await pagesRes.json()) as { data: FbPage[] };

  const igPage = pages.data.find((p) => p.instagram_business_account);
  if (!igPage?.instagram_business_account) {
    throw new Error(
      "Nu s-a găsit un cont Instagram Business/Creator conectat la o pagină Facebook. " +
        "Asigură-te că @iordacheclaudiu_ e setat pe Professional și conectat la o pagină FB.",
    );
  }

  const igUserId = igPage.instagram_business_account.id;

  // Fetch username
  const profileRes = await fetch(
    `${GRAPH}/${igUserId}?fields=username,followers_count&access_token=${userToken}`,
  );
  if (!profileRes.ok) throw new Error(`Profile error: ${await profileRes.text()}`);
  const profile = (await profileRes.json()) as { username: string; followers_count?: number };

  return { igUserId, username: profile.username };
}

// ════════════════════════════════════════════════════════════════════
// Media fetch
// ════════════════════════════════════════════════════════════════════

export interface IgMedia {
  id: string;
  media_type: string;
  timestamp: string;
  caption?: string;
  permalink: string;
  thumbnail_url?: string;
  media_url?: string;
}

export async function fetchMedia(
  igUserId: string,
  accessToken: string,
  limit = 50,
): Promise<IgMedia[]> {
  const fields = "id,media_type,timestamp,caption,permalink,thumbnail_url,media_url";
  const res = await fetch(
    `${GRAPH}/${igUserId}/media?fields=${fields}&limit=${limit}&access_token=${accessToken}`,
  );
  if (!res.ok) throw new Error(`Media fetch error: ${await res.text()}`);
  const data = (await res.json()) as { data: IgMedia[] };
  return data.data ?? [];
}

// ════════════════════════════════════════════════════════════════════
// Insights per media
// ════════════════════════════════════════════════════════════════════

export interface IgInsights {
  plays?: number;
  likes?: number;
  comments?: number;
  saved?: number;
  shares?: number;
  reach?: number;
  impressions?: number;
}

export async function fetchMediaInsights(
  mediaId: string,
  mediaType: string,
  accessToken: string,
): Promise<IgInsights> {
  // Metrici disponibile per tip de conținut
  const isVideo = mediaType === "VIDEO" || mediaType === "REELS";
  const metrics = isVideo
    ? "plays,likes,comments,saved,shares,reach,impressions"
    : "likes,comments,saved,reach,impressions";

  const res = await fetch(
    `${GRAPH}/${mediaId}/insights?metric=${metrics}&access_token=${accessToken}`,
  );
  if (!res.ok) {
    // unele posturi mai vechi nu au insights — nu aruncăm eroare
    return {};
  }

  const data = (await res.json()) as {
    data: Array<{ name: string; values: Array<{ value: number }> }>;
  };

  const result: IgInsights = {};
  for (const metric of data.data ?? []) {
    const val = metric.values?.[0]?.value ?? 0;
    switch (metric.name) {
      case "plays":        result.plays = val; break;
      case "likes":        result.likes = val; break;
      case "comments":     result.comments = val; break;
      case "saved":        result.saved = val; break;
      case "shares":       result.shares = val; break;
      case "reach":        result.reach = val; break;
      case "impressions":  result.impressions = val; break;
    }
  }
  return result;
}

// ════════════════════════════════════════════════════════════════════
// Profile info
// ════════════════════════════════════════════════════════════════════

export async function fetchProfile(
  igUserId: string,
  accessToken: string,
): Promise<{ username: string; followers_count: number }> {
  const res = await fetch(
    `${GRAPH}/${igUserId}?fields=username,followers_count&access_token=${accessToken}`,
  );
  if (!res.ok) throw new Error(`Profile fetch error: ${await res.text()}`);
  return (await res.json()) as { username: string; followers_count: number };
}
