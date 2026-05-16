// Shared types and pure utilities — no "use server", safe to import from client components

export interface IgAccount {
  ig_user_id: string;
  username: string;
  followers_count: number | null;
  token_expires_at: string | null;
  connected_at: string;
}

export interface IgMediaRow {
  id: number;
  ig_media_id: string;
  media_type: string;
  timestamp: string | null;
  caption: string | null;
  permalink: string;
  thumbnail_url: string | null;
  plays: number | null;
  likes: number | null;
  comments: number | null;
  saves: number | null;
  shares: number | null;
  reach: number | null;
  impressions: number | null;
  // Metrici private noi
  avg_watch_time_ms: number | null;
  total_watch_time_ms: number | null;
  replays: number | null;
  follows: number | null;
  profile_visits: number | null;
  // Calculat + diagnoze
  hook_score: number | null;
  hook_diagnosis: string | null;
  hook_action: string | null;
  diagnosed_at: string | null;
}

export function computeHookScore(m: IgMediaRow): number | null {
  const watch_s = m.avg_watch_time_ms != null ? m.avg_watch_time_ms / 1000 : null;
  const reach = m.reach ?? 0;
  if (watch_s == null || reach === 0) return null;
  const share_pct = ((m.shares ?? 0) / reach) * 100;
  const save_pct  = ((m.saves  ?? 0) / reach) * 100;
  return watch_s * Math.sqrt(reach) * (1 + share_pct / 100 + save_pct / 200);
}
