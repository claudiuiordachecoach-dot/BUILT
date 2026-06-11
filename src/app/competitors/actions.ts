"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import { readCreierFromSupabase } from "@/lib/creier";
import { buildSystemBlocks, getAnthropicClient, MODELS } from "@/lib/anthropic";

// ════════════════════════════════════════════════════════════════════
// Types
// ════════════════════════════════════════════════════════════════════

export interface Competitor {
  id: number;
  handle: string;
  display_name: string | null;
  niche_notes: string | null;
  followers_count: number | null;
  last_scraped_at: string | null;
  is_active: boolean;
  created_at: string;
  reels_count?: number;
}

export interface CompetitorReel {
  id: number;
  competitor_id: number;
  shortcode: string;
  url: string;
  posted_at: string | null;
  caption: string | null;
  transcript: string | null;
  thumbnail_url: string | null;
  views: number | null;
  likes: number | null;
  comments_count: number | null;
  duration_seconds: number | null;
  ai_analysis: ReelAnalysis | null;
  remake: RemakeOutput | null;
}

export interface ReelAnalysis {
  hook_type: string;
  why_worked: string;
  format: string;
  built_adaptation: string;
}

export interface RemakeOutput {
  analysis: {
    viral_elements: string[];   // ce a oprit scrollul
    strengths: string[];        // ce face postarea puternică
    adaptation_tips: string[];  // cum o adaptezi la tine
    risks: string[];            // ce să NU copiezi orbește
  };
  regenerated: {
    hook: string;               // hook-ul regenerat
    script: string;             // scriptul/caption-ul complet, vocea BUILT
    pillar: "B" | "U" | "I" | "L" | "T" | "mix";
  };
}

export interface WeeklyReportData {
  patterns: {
    top_hooks: string[];
    top_formats: string[];
    common_themes: string[];
  };
  generated_scripts: Array<{
    day: number;
    hook: string;
    angle: string;
    pillar: "B" | "U" | "I" | "L" | "T" | "mix";
    estimated_duration_sec: number;
  }>;
  raw_summary: string;
}

export interface WeeklyReport extends WeeklyReportData {
  id: number;
  week_start: string;
  week_end: string;
  total_reels: number;
  competitors_count: number;
  status: "draft" | "published" | "archived";
  created_at: string;
}

type Result<T> = { ok: true; data: T } | { ok: false; error: string };

export interface CompetitorBrief {
  positioning: string;
  target_audience: string;
  tone: string;
  patterns: string[];
  opportunities: string[];
  weaknesses: string[];
  built_angle: string;
}

// ════════════════════════════════════════════════════════════════════
// AI: Analiză competitor manual (handle + bio + posturi)
// ════════════════════════════════════════════════════════════════════

export async function analyzeCompetitor(
  handle: string,
  posts: string,
  bio: string,
): Promise<{ ok: true; brief: CompetitorBrief } | { ok: false; error: string }> {
  if (!posts.trim()) return { ok: false, error: "Lipesc postările competitorului." };

  const task = `# TASK: Analiză competitor — identifică pattern-uri și oportunități pentru BUILT

## Date competitor
- Handle: ${handle || "necunoscut"}
- Bio: "${bio.slice(0, 500)}"
- Ultimele posturi (hook-uri / captions):
${posts.slice(0, 3000)}

## Misiunea ta
Analizează competitorul din perspectiva BUILT. Returnează JSON strict:

{
  "positioning": "cum se poziționează (1 propoziție clară)",
  "target_audience": "audiența lui țintă (1 propoziție)",
  "tone": "tonul dominant (ex: motivațional, educational, entertainment, provocator)",
  "patterns": ["pattern recurent 1", "pattern 2", "pattern 3"],
  "opportunities": ["oportunitate BUILT 1", "oportunitate 2", "oportunitate 3"],
  "weaknesses": ["slăbiciune exploatabilă 1", "slăbiciune 2"],
  "built_angle": "fraza exactă de contraatac BUILT (1 frază, ton direct)"
}`;

  try {
    const creier = await readCreierFromSupabase();
    const client = getAnthropicClient();
    const systemBlocks = buildSystemBlocks({
      creierJson: JSON.stringify(creier, null, 2),
      taskContext: task,
    });
    const message = await client.messages.create({
      model: MODELS.routine,
      max_tokens: 1000,
      system: systemBlocks,
      messages: [{ role: "user", content: "Analizează competitorul. JSON strict." }],
    });
    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") return { ok: false, error: "Răspuns gol." };

    const t = textBlock.text.trim();
    const a = t.indexOf("{");
    const b = t.lastIndexOf("}");
    if (a === -1 || b <= a) return { ok: false, error: "JSON invalid." };
    const brief = JSON.parse(t.slice(a, b + 1)) as CompetitorBrief;
    return { ok: true, brief };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Eroare." };
  }
}

// ════════════════════════════════════════════════════════════════════
// CRUD competitori
// ════════════════════════════════════════════════════════════════════

function normalizeHandle(raw: string): string {
  const t = raw.trim().toLowerCase();
  if (!t) return "";
  return t.startsWith("@") ? t : "@" + t;
}

export async function addCompetitor(
  handle: string,
  nicheNotes: string,
): Promise<Result<Competitor>> {
  const normalized = normalizeHandle(handle);
  if (!normalized || normalized.length < 3) {
    return { ok: false, error: "Handle prea scurt." };
  }
  if (!/^@[a-z0-9._]+$/.test(normalized)) {
    return { ok: false, error: "Handle invalid. Doar litere mici, cifre, . și _" };
  }

  const sb = getSupabaseServer();
  const { data, error } = await sb
    .from("competitors")
    .insert({
      handle: normalized,
      niche_notes: nicheNotes.trim() || null,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "Competitorul există deja." };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/competitors");
  return { ok: true, data: data as Competitor };
}

export async function removeCompetitor(id: number): Promise<Result<true>> {
  const sb = getSupabaseServer();
  const { error } = await sb.from("competitors").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/competitors");
  return { ok: true, data: true };
}

export async function toggleCompetitor(id: number): Promise<Result<true>> {
  const sb = getSupabaseServer();
  const { data: current } = await sb
    .from("competitors")
    .select("is_active")
    .eq("id", id)
    .single();
  const next = !(current?.is_active ?? true);
  const { error } = await sb
    .from("competitors")
    .update({ is_active: next })
    .eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/competitors");
  return { ok: true, data: true };
}

export async function listCompetitors(): Promise<Competitor[]> {
  const sb = getSupabaseServer();
  const { data, error } = await sb
    .from("competitors")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);

  const competitors = (data ?? []) as Competitor[];

  // adaugă count reels per competitor (cheap query)
  const ids = competitors.map((c) => c.id);
  if (ids.length === 0) return competitors;

  const { data: reelCounts } = await sb
    .from("competitor_reels")
    .select("competitor_id")
    .in("competitor_id", ids);

  const counts = new Map<number, number>();
  for (const r of reelCounts ?? []) {
    counts.set(r.competitor_id, (counts.get(r.competitor_id) ?? 0) + 1);
  }

  return competitors.map((c) => ({ ...c, reels_count: counts.get(c.id) ?? 0 }));
}

export async function listRecentReels(daysBack = 7, limit = 30): Promise<CompetitorReel[]> {
  const sb = getSupabaseServer();
  const since = new Date(Date.now() - daysBack * 86400_000).toISOString();
  const { data, error } = await sb
    .from("competitor_reels")
    .select("*")
    .gte("posted_at", since)
    .order("views", { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as CompetitorReel[];
}

export async function listReelsForCompetitor(
  competitorId: number,
  limit = 20,
): Promise<CompetitorReel[]> {
  const sb = getSupabaseServer();
  const { data, error } = await sb
    .from("competitor_reels")
    .select("*")
    .eq("competitor_id", competitorId)
    .order("posted_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as CompetitorReel[];
}

// ════════════════════════════════════════════════════════════════════
// AI: Analiză un singur reel (Skill din William: "click Analyze")
// ════════════════════════════════════════════════════════════════════

export async function analyzeReel(reelId: number): Promise<Result<ReelAnalysis>> {
  const sb = getSupabaseServer();
  const { data: reel, error } = await sb
    .from("competitor_reels")
    .select("*, competitors(handle, niche_notes)")
    .eq("id", reelId)
    .single();
  if (error || !reel) return { ok: false, error: error?.message ?? "Reel inexistent." };

  const handle = (reel.competitors as { handle: string } | null)?.handle ?? "?";
  const task = `# TASK: Analizează DE CE acest reel a funcționat (sau de ce nu)

## Reel competitor
- Cont: ${handle}
- Views: ${reel.views ?? "?"} · Likes: ${reel.likes ?? "?"} · Durată: ${reel.duration_seconds ?? "?"}s
- Caption: "${(reel.caption ?? "").slice(0, 800)}"
- Transcript: "${(reel.transcript ?? "").slice(0, 2000)}"

## Misiunea ta
Identifică EXACT de ce reel-ul ăsta a rezonat sau nu cu audiența. Raportează relativ la audiența BUILT (ICP-ul din Creier). Returnează JSON strict:

{
  "hook_type": "tipul de hook (ex: 'Declarație contraintuitivă', 'Cifră + durere', 'Story-time')",
  "why_worked": "explicație concretă, mecanistică, 2-3 propoziții — de ce hook-ul + format-ul a oprit scrollul",
  "format": "format dominant (talking head, story time, trend, rant, B-roll, etc.)",
  "built_adaptation": "cum ar adapta BUILT mesajul în vocea proprie (1 frază specifică, nu generic)"
}`;

  try {
    const creier = await readCreierFromSupabase();
    const client = getAnthropicClient();
    const systemBlocks = buildSystemBlocks({
      creierJson: JSON.stringify(creier, null, 2),
      taskContext: task,
    });
    const message = await client.messages.create({
      model: MODELS.routine,
      max_tokens: 800,
      system: systemBlocks,
      messages: [{ role: "user", content: "Analizează reel-ul. JSON strict." }],
    });
    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") return { ok: false, error: "Răspuns gol." };

    const t = textBlock.text.trim();
    const a = t.indexOf("{");
    const b = t.lastIndexOf("}");
    if (a === -1 || b <= a) return { ok: false, error: "JSON invalid." };
    const analysis = JSON.parse(t.slice(a, b + 1)) as ReelAnalysis;

    await sb
      .from("competitor_reels")
      .update({ ai_analysis: analysis })
      .eq("id", reelId);

    revalidatePath("/competitors");
    return { ok: true, data: analysis };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Eroare." };
  }
}

// ════════════════════════════════════════════════════════════════════
// Weekly Intelligence Report — flagship-ul lui William
// ════════════════════════════════════════════════════════════════════

function getWeekStart(d = new Date()): Date {
  const day = d.getUTCDay(); // 0 = duminică
  const diff = (day + 6) % 7; // distanță până la luni
  const monday = new Date(d);
  monday.setUTCDate(d.getUTCDate() - diff);
  monday.setUTCHours(0, 0, 0, 0);
  return monday;
}

export async function getCurrentWeekReport(): Promise<WeeklyReport | null> {
  const sb = getSupabaseServer();
  const weekStart = getWeekStart().toISOString().slice(0, 10);
  const { data, error } = await sb
    .from("weekly_intelligence_reports")
    .select("*")
    .eq("week_start", weekStart)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) return null;
  return {
    ...data,
    patterns: data.patterns,
    generated_scripts: data.generated_scripts,
  } as WeeklyReport;
}

export async function generateWeeklyReport(): Promise<Result<WeeklyReport>> {
  const sb = getSupabaseServer();
  const weekStart = getWeekStart();
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekStart.getUTCDate() + 6);

  // ia toate reels-urile din ultimele 7 zile
  const since = new Date(Date.now() - 7 * 86400_000).toISOString();
  const { data: reels, error: reelsErr } = await sb
    .from("competitor_reels")
    .select("*, competitors(handle)")
    .gte("posted_at", since)
    .order("views", { ascending: false, nullsFirst: false })
    .limit(50);
  if (reelsErr) return { ok: false, error: reelsErr.message };
  if (!reels || reels.length === 0) {
    return { ok: false, error: "Niciun reel scrape-uit în ultimele 7 zile. Rulează scrape-ul întâi." };
  }

  const { count: competitorsCount } = await sb
    .from("competitors")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true);

  const reelsList = reels
    .map((r, i) => {
      const handle = (r.competitors as { handle: string } | null)?.handle ?? "?";
      return `### Reel ${i + 1} — ${handle}
Views: ${r.views ?? "?"} · Likes: ${r.likes ?? "?"} · Durată: ${r.duration_seconds ?? "?"}s
Caption: "${(r.caption ?? "").slice(0, 400)}"
Transcript: "${(r.transcript ?? "").slice(0, 1200)}"`;
    })
    .join("\n\n");

  const task = `# TASK: Weekly Intelligence Report — analiză competitori + 7 scripturi BUILT

## Date analizate
- Săptămâna: ${weekStart.toISOString().slice(0, 10)} — ${weekEnd.toISOString().slice(0, 10)}
- ${reels.length} reels din ${competitorsCount ?? "?"} competitori

## Reels-urile (sortate desc după views)
${reelsList}

## Misiunea ta
1. Identifică pattern-urile reale: ce hook-uri funcționează, ce formate domină, ce teme se repetă
2. Generează 7 scripturi pentru săptămâna viitoare (Luni–Duminică) — nu copia, ADAPTEAZĂ în vocea BUILT
3. Fiecare script are unghi diferit, atribuit pilonilor B/U/I/L/T/mix conform metodei BUILT
4. Hook-uri scurte, contraintuitive, fără clișee fitness

## Format JSON strict (FĂRĂ markdown, FĂRĂ text înainte/după):
{
  "patterns": {
    "top_hooks": ["hook pattern 1", "hook pattern 2", "hook pattern 3"],
    "top_formats": ["talking head", "story time", "rant"],
    "common_themes": ["temă recurentă 1", "temă 2", "temă 3"]
  },
  "generated_scripts": [
    {"day": 1, "hook": "string scurt", "angle": "unghi 1-2 propoziții", "pillar": "B", "estimated_duration_sec": 45},
    {"day": 2, "hook": "...", "angle": "...", "pillar": "U", "estimated_duration_sec": 45},
    {"day": 3, "hook": "...", "angle": "...", "pillar": "I", "estimated_duration_sec": 45},
    {"day": 4, "hook": "...", "angle": "...", "pillar": "L", "estimated_duration_sec": 45},
    {"day": 5, "hook": "...", "angle": "...", "pillar": "T", "estimated_duration_sec": 45},
    {"day": 6, "hook": "...", "angle": "...", "pillar": "mix", "estimated_duration_sec": 45},
    {"day": 7, "hook": "...", "angle": "...", "pillar": "B", "estimated_duration_sec": 45}
  ],
  "raw_summary": "3-5 propoziții cu insight-ul cheie al săptămânii și ce ar trebui să facă BUILT diferit"
}`;

  try {
    const creier = await readCreierFromSupabase();
    const client = getAnthropicClient();
    const systemBlocks = buildSystemBlocks({
      creierJson: JSON.stringify(creier, null, 2),
      taskContext: task,
    });
    const message = await client.messages.create({
      model: MODELS.deep, // Opus pentru analiză densă
      max_tokens: 4000,
      system: systemBlocks,
      messages: [{ role: "user", content: "Generează raportul săptămânal. JSON strict." }],
    });
    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") return { ok: false, error: "Răspuns gol." };

    const t = textBlock.text.trim();
    const a = t.indexOf("{");
    const b = t.lastIndexOf("}");
    if (a === -1 || b <= a) return { ok: false, error: "JSON invalid." };
    const parsed = JSON.parse(t.slice(a, b + 1)) as WeeklyReportData;

    const { data: report, error: insertErr } = await sb
      .from("weekly_intelligence_reports")
      .upsert(
        {
          week_start: weekStart.toISOString().slice(0, 10),
          week_end: weekEnd.toISOString().slice(0, 10),
          total_reels: reels.length,
          competitors_count: competitorsCount ?? 0,
          patterns: parsed.patterns,
          generated_scripts: parsed.generated_scripts,
          raw_summary: parsed.raw_summary,
          status: "published",
        },
        { onConflict: "week_start" },
      )
      .select()
      .single();
    if (insertErr) return { ok: false, error: insertErr.message };

    revalidatePath("/competitors");
    return { ok: true, data: report as WeeklyReport };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Eroare." };
  }
}

// ════════════════════════════════════════════════════════════════════
// AI: Remake — analiză structurată + postare regenerată în vocea BUILT
// ════════════════════════════════════════════════════════════════════

export async function remakeReel(reelId: number): Promise<Result<RemakeOutput>> {
  const sb = getSupabaseServer();
  const { data: reel, error } = await sb
    .from("competitor_reels")
    .select("*, competitors(handle, niche_notes)")
    .eq("id", reelId)
    .single();
  if (error || !reel) return { ok: false, error: error?.message ?? "Reel inexistent." };

  const handle = (reel.competitors as { handle: string } | null)?.handle ?? "?";
  const task = `# TASK: REMAKE — transformă acest reel viral într-o postare BUILT gata de publicat

## Reel viral (sursă)
- Cont: ${handle}
- Views: ${reel.views ?? "?"} · Likes: ${reel.likes ?? "?"}
- Caption: "${(reel.caption ?? "").slice(0, 1000)}"
- Transcript (dacă există): "${(reel.transcript ?? "").slice(0, 2000)}"

## Misiunea ta
1. Analizează DE CE a funcționat postarea asta — mecanistic, nu generic.
2. Regenerează postarea COMPLET în vocea lui Claudiu (BUILT), adaptată la audiența BUILT.
   - NU traduci, NU copiezi — reconstruiești ideea în limbajul și mecanismul BUILT.
   - Folosește contextul din Creier ca sursă de adevăr despre cine e Claudiu și cui i se adresează.
   - NU forța o grilă de frici. NU folosi clișee de fitness ("trage tare", "crede în tine").
   - Ton: direct, matur, structural. Postarea trebuie gata de copiat și filmat/postat.
3. Atribuie un pilon BUILT (B/U/I/L/T sau mix) dacă se potrivește natural.

## Format JSON strict (FĂRĂ markdown, FĂRĂ text înainte/după):
{
  "analysis": {
    "viral_elements": ["element concret 1", "element 2", "element 3"],
    "strengths": ["punct forte 1", "punct forte 2"],
    "adaptation_tips": ["cum adaptezi la BUILT 1", "tip 2", "tip 3"],
    "risks": ["ce să NU copiezi orbește 1", "risc 2"]
  },
  "regenerated": {
    "hook": "hook-ul regenerat, scurt și contraintuitiv",
    "script": "scriptul/caption-ul complet în vocea BUILT, gata de copiat (paragrafe scurte)",
    "pillar": "B"
  }
}`;

  try {
    const creier = await readCreierFromSupabase();
    const client = getAnthropicClient();
    const systemBlocks = buildSystemBlocks({
      creierJson: JSON.stringify(creier, null, 2),
      taskContext: task,
    });
    const message = await client.messages.create({
      model: MODELS.deep,
      max_tokens: 2000,
      system: systemBlocks,
      messages: [{ role: "user", content: "Generează Remake-ul. JSON strict." }],
    });
    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") return { ok: false, error: "Răspuns gol." };

    const t = textBlock.text.trim();
    const a = t.indexOf("{");
    const b = t.lastIndexOf("}");
    if (a === -1 || b <= a) return { ok: false, error: "JSON invalid." };
    const remake = JSON.parse(t.slice(a, b + 1)) as RemakeOutput;

    await sb.from("competitor_reels").update({ remake }).eq("id", reelId);
    revalidatePath("/competitors");
    return { ok: true, data: remake };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Eroare." };
  }
}
