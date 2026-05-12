export type ApifyReel = {
  id: string;
  url: string;
  thumbnailUrl: string;
  caption: string;
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  timestamp: string;
};

export async function scrapeInstagramReels(username: string, limit = 20): Promise<ApifyReel[]> {
  const apiKey = process.env.APIFY_API_KEY;
  if (!apiKey || apiKey === 'placeholder_replace_me') {
    console.warn('APIFY_API_KEY not configured — returning empty reels array');
    return [];
  }

  const runRes = await fetch(
    `https://api.apify.com/v2/acts/apify~instagram-reel-scraper/runs?token=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: [username], resultsLimit: limit }),
    }
  );

  if (!runRes.ok) throw new Error(`Apify run failed: ${runRes.status}`);
  const run = await runRes.json();
  const runId = run.data?.id;
  if (!runId) throw new Error("No run ID returned from Apify");

  // Poll until finished (max 2 minutes, 5s intervals)
  for (let i = 0; i < 24; i++) {
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
  return (items ?? []).map((item: Record<string, unknown>) => ({
    id: String(item.id ?? item.shortCode ?? ""),
    url: String(item.url ?? ""),
    thumbnailUrl: String(item.displayUrl ?? item.thumbnailUrl ?? ""),
    caption: String(item.caption ?? ""),
    viewsCount: Number(item.videoViewCount ?? item.viewsCount ?? 0),
    likesCount: Number(item.likesCount ?? 0),
    commentsCount: Number(item.commentsCount ?? 0),
    timestamp: String(item.timestamp ?? new Date().toISOString()),
  }));
}
