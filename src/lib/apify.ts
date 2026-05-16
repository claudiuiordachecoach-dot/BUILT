export type ApifyReel = {
  id: string;
  url: string;
  videoUrl: string;
  thumbnailUrl: string;
  caption: string;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  timestamp: string;
};

export type ApifyScrapeResult = {
  reels: ApifyReel[];
  followersCount: number | null;
};

export type ApifyComment = {
  text: string;
  ownerUsername: string;
  likesCount: number;
};

export async function scrapeReelComments(reelUrl: string, limit = 30): Promise<ApifyComment[]> {
  const apiKey = process.env.APIFY_API_KEY;
  if (!apiKey || apiKey === "placeholder_replace_me") return [];

  const runRes = await fetch(
    `https://api.apify.com/v2/acts/apify~instagram-comment-scraper/runs?token=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ directUrls: [reelUrl], resultsLimit: limit }),
    }
  );
  if (!runRes.ok) return [];

  const run = await runRes.json();
  const runId = run.data?.id;
  if (!runId) return [];

  for (let i = 0; i < 24; i++) {
    await new Promise(r => setTimeout(r, 5000));
    const statusRes = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${apiKey}`);
    const status = await statusRes.json();
    if (status.data?.status === "SUCCEEDED") break;
    if (status.data?.status === "FAILED") return [];
  }

  const dataRes = await fetch(`https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${apiKey}`);
  const items = await dataRes.json();

  return (items ?? []).map((item: Record<string, unknown>) => ({
    text: String(item.text ?? item.comment ?? ""),
    ownerUsername: String(item.ownerUsername ?? item.username ?? ""),
    likesCount: Number(item.likesCount ?? 0),
  })).filter((c: ApifyComment) => c.text.length > 0);
}

export async function scrapeInstagramReels(username: string, limit = 0): Promise<ApifyReel[]> {
  const result = await scrapeInstagramProfile(username, limit);
  return result.reels;
}

export async function scrapeInstagramProfile(username: string, limit = 0): Promise<ApifyScrapeResult> {
  const apiKey = process.env.APIFY_API_KEY;
  if (!apiKey || apiKey === 'placeholder_replace_me') {
    console.warn('APIFY_API_KEY not configured — returning empty reels array');
    return { reels: [], followersCount: null };
  }

  const runRes = await fetch(
    `https://api.apify.com/v2/acts/apify~instagram-reel-scraper/runs?token=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // limit=0 → Apify returnează toate reels-urile disponibile
      body: JSON.stringify({ username: [username], resultsLimit: limit || 500 }),
    }
  );

  if (!runRes.ok) throw new Error(`Apify run failed: ${runRes.status}`);
  const run = await runRes.json();
  const runId = run.data?.id;
  if (!runId) throw new Error("No run ID returned from Apify");

  // Poll până la finalizare (max 5 minute)
  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 5000));
    const statusRes = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}?token=${apiKey}`
    );
    const status = await statusRes.json();
    if (status.data?.status === "SUCCEEDED") break;
    if (status.data?.status === "FAILED") throw new Error("Apify run failed");
  }

  const dataRes = await fetch(
    `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${apiKey}`
  );
  const items = await dataRes.json();

  // Followers count — Apify îl include în fiecare item ca ownerFollowersCount
  let followersCount: number | null = null;
  if (Array.isArray(items) && items.length > 0) {
    const first = items[0] as Record<string, unknown>;
    const raw = first.ownerFollowersCount ?? first.followersCount ?? first.ownerFollowers ?? first.profileFollowersCount;
    if (raw != null && Number(raw) > 0) followersCount = Number(raw);
  }

  const reels = (items ?? []).map((item: Record<string, unknown>) => ({
    id: String(item.id ?? item.shortCode ?? ""),
    url: String(item.url ?? ""),
    videoUrl: String(item.videoUrl ?? (Array.isArray(item.videoUrlList) ? item.videoUrlList[0] : undefined) ?? item.video_url ?? ""),
    thumbnailUrl: String(item.displayUrl ?? item.thumbnailUrl ?? ""),
    caption: String(item.caption ?? ""),
    viewsCount: Number(item.videoViewCount ?? item.viewsCount ?? 0),
    likesCount: Number(item.likesCount ?? 0),
    commentsCount: Number(item.commentsCount ?? 0),
    timestamp: String(item.timestamp ?? new Date().toISOString()),
  }));

  return { reels, followersCount };
}
