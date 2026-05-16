"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getAnthropicClient, MODELS } from "@/lib/anthropic";
import type { Pillar } from "@/app/reels/actions";
import type { IgAccount, IgMediaRow } from "./types";
import { computeHookScore } from "./types";

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

export type DiagnoseResult =
  | { ok: true; diagnosed: number }
  | { ok: false; error: string };

export async function diagnoseReels(): Promise<DiagnoseResult> {
  const sb = getSupabaseServer();
  const { data: rows, error } = await sb
    .from("instagram_media")
    .select("*")
    .eq("media_type", "VIDEO")
    .order("timestamp", { ascending: false })
    .limit(30);

  if (error || !rows || rows.length === 0) {
    return { ok: false, error: error?.message ?? "Niciun Reel găsit pentru diagnoză." };
  }

  const media = rows as IgMediaRow[];

  const withScores = media.map((m) => ({
    id: m.id,
    caption: (m.caption ?? "").slice(0, 80),
    permalink: m.permalink,
    watch_s: m.avg_watch_time_ms != null ? (m.avg_watch_time_ms / 1000).toFixed(1) : null,
    reach: m.reach,
    shares: m.shares,
    saves: m.saves,
    replays: m.replays,
    follows: m.follows,
    hook_score: computeHookScore(m),
  }));

  const sorted = [...withScores].sort((a, b) => (b.hook_score ?? 0) - (a.hook_score ?? 0));
  const medianReach = (() => {
    const reaches = media.map((m) => m.reach ?? 0).sort((a, b) => a - b);
    return reaches[Math.floor(reaches.length / 2)] ?? 0;
  })();

  const prompt = `Ești expert în performanța conținutului Instagram pentru BUILT (fitness coaching, bărbați 28-42 ani, brand voce: direct, arhitectural, no-BS).

Analizează aceste Reels și atribuie fiecăruia o diagnoză și o acțiune.

Reach median: ${medianReach}

Date Reels (JSON):
${JSON.stringify(sorted, null, 2)}

Returnează STRICT un array JSON, câte un obiect per Reel, cu exact aceste câmpuri:
- "id": numărul exact din input
- "diagnosis": una din: "Winner — toate cele 3 axe funcționează" | "Hook puternic, IG nu l-a împins" | "Lumea a dat click, conținutul nu a ținut" | "Concept viral, livrare slabă" | "Slab pe toate axele — elimină formatul" | "Hook aterizat" | "Subperformanță"
- "action": una din: "do_more" | "stop" | "fix"

Logică de diagnoză:
- watch_s >= 12 AND reach >= medianReach AND (shares > 0 OR saves > 0) → "Winner — toate cele 3 axe funcționează", action: "do_more"
- watch_s >= 12 AND reach < medianReach → "Hook puternic, IG nu l-a împins", action: "fix"
- watch_s < 8 AND reach >= medianReach → "Lumea a dat click, conținutul nu a ținut", action: "fix"
- shares > 0 OR saves > 0 AND watch_s < 8 → "Concept viral, livrare slabă", action: "fix"
- watch_s < 8 AND reach < medianReach → "Slab pe toate axele — elimină formatul", action: "stop"
- watch_s >= 8 AND watch_s < 12 AND reach >= medianReach → "Hook aterizat", action: "do_more"
- altfel → "Subperformanță", action: "stop"

Răspunde DOAR cu array-ul JSON, fără markdown, fără text înainte sau după.`;

  try {
    const client = getAnthropicClient();
    const msg = await client.messages.create({
      model: MODELS.routine,
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = msg.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return { ok: false, error: "Răspuns Claude fără text." };
    }

    const t = textBlock.text.trim();
    const start = t.indexOf("[");
    const end = t.lastIndexOf("]");
    if (start === -1) return { ok: false, error: "JSON invalid de la Claude." };

    type DiagRow = { id: number; diagnosis: string; action: string };
    const diagnoses = JSON.parse(t.slice(start, end + 1)) as DiagRow[];

    const now = new Date().toISOString();
    for (const d of diagnoses) {
      const score = withScores.find((w) => w.id === d.id)?.hook_score ?? null;
      await sb
        .from("instagram_media")
        .update({
          hook_score:     score,
          hook_diagnosis: d.diagnosis,
          hook_action:    d.action,
          diagnosed_at:   now,
        })
        .eq("id", d.id);
    }

    revalidatePath("/analytics");
    return { ok: true, diagnosed: diagnoses.length };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Eroare diagnoză." };
  }
}
