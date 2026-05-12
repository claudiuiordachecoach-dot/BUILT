"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { Pillar } from "@/app/reels/actions";

export interface ReelWithPerf {
  id: number; pillar: Pillar; hook: string; status: string;
  performance: unknown; created_at: string;
}

export async function listReelsWithPerformance(): Promise<ReelWithPerf[]> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase.from("generated_outputs")
    .select("id, pillar, hook, status, performance, created_at")
    .eq("module", "M2_reel").order("created_at", { ascending: false }).limit(100);
  if (error) throw new Error(error.message);
  return (data ?? []) as ReelWithPerf[];
}

export async function saveReelPerformance(id: number, data: { views: number; likes: number; saves: number; comments: number }) {
  const supabase = getSupabaseServer();
  await supabase.from("generated_outputs").update({ performance: data, status: "posted" }).eq("id", id);
  revalidatePath("/analytics");
}

// ════════════════════════════════════════════════════════════════════
// Instagram account + media (M11)
// ════════════════════════════════════════════════════════════════════

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
}

export async function getIgAccount(): Promise<IgAccount | null> {
  const sb = getSupabaseServer();
  const { data } = await sb
    .from("instagram_account")
    .select("ig_user_id, username, followers_count, token_expires_at, connected_at")
    .maybeSingle();
  return (data as IgAccount | null) ?? null;
}

export async function listIgMedia(limit = 30): Promise<IgMediaRow[]> {
  const sb = getSupabaseServer();
  const { data, error } = await sb
    .from("instagram_media")
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as IgMediaRow[];
}

export async function triggerSync(): Promise<{ ok: boolean; synced?: number; error?: string }> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  try {
    const res = await fetch(`${appUrl}/api/instagram/sync`, { method: "POST" });
    const json = (await res.json()) as { ok?: boolean; synced?: number; error?: string };
    revalidatePath("/analytics");
    return { ok: res.ok, synced: json.synced, error: json.error };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Eroare sync" };
  }
}
