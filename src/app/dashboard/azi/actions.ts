"use server";

import { getSupabaseServer } from "@/lib/supabase/server";
import { buildSystemBlocks, getAnthropicClient, MODELS } from "@/lib/anthropic";
import { readCreierFromSupabase } from "@/lib/creier";

// ─── Cadența săptămânală BUILT (Skill 10 — Personal Brand) ────────────────────

export interface DayCadence {
  day: string;
  format: string;
  focus: string;
}

const CADENCE: Record<number, DayCadence> = {
  1: { day: "Luni", format: "Reel", focus: "Conținut educativ + check-in clienți (start de săptămână)" },
  2: { day: "Marți", format: "Stories educaționale", focus: "Calificare audiență prin întrebări și sondaje" },
  3: { day: "Miercuri", format: "Newsletter", focus: "O singură idee, conversație reală cu lista" },
  4: { day: "Joi", format: "Reel", focus: "Mecanism + sistem BUILT, hook puternic" },
  5: { day: "Vineri", format: "Carusel / Text", focus: "Lecția săptămânii, valoare densă" },
  6: { day: "Sâmbătă", format: "Behind the scenes", focus: "Umanizare + check-in privat clienți" },
  0: { day: "Duminică", format: "Planificare", focus: "Pregătești săptămâna, fără presiune de postare" },
};

// ─── Types ──────────────────────────────────────────────────────────────────

export interface TodayBrief {
  date: string;
  cadence: DayCadence;
  content_idea: string;
  ready_hook: string;
  caption_starter: string;
  business_action: string;
  business_why: string;
  mindset_note: string;
  generated_at: string;
}

// ─── Prompt ─────────────────────────────────────────────────────────────────

function buildTodayTask(cadence: DayCadence, dmStats: string): string {
  return `# TASK: Briefingul lui Claudiu pentru AZI (${cadence.day})

## Cadența zilei
- Format recomandat: ${cadence.format}
- Focus: ${cadence.focus}

## Context business
${dmStats}

Generează un briefing scurt și acționabil care îi spune lui Claudiu EXACT ce să facă azi,
fără să fie nevoit să gândească. Concret, în vocea lui, zero clișee.

## Format răspuns — JSON strict, fără markdown:
{
  "content_idea": "O idee specifică de conținut pentru azi, legată de formatul zilei și de un pilon BUILT (1-2 propoziții).",
  "ready_hook": "Un hook gata de folosit pentru piesa de azi (oprește scrollul).",
  "caption_starter": "Primul rând din caption/descriere, gata de scris.",
  "business_action": "O singură acțiune de business pentru azi (DM follow-up, check-in client, calificare lead). Concretă.",
  "business_why": "De ce contează acțiunea asta azi (1 propoziție).",
  "mindset_note": "O notă scurtă de mindset pentru azi, în vocea BUILT — nu motivațională ieftină, ci structurală."
}`;
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  if (trimmed.startsWith("{")) return JSON.parse(trimmed);
  const fenced = trimmed.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  if (fenced) return JSON.parse(fenced[1]);
  const a = trimmed.indexOf("{"), b = trimmed.lastIndexOf("}");
  if (a !== -1 && b > a) return JSON.parse(trimmed.slice(a, b + 1));
  throw new Error("Nu am găsit JSON în răspuns.");
}

export type TodayBriefResult = { ok: true; brief: TodayBrief } | { ok: false; error: string };

export async function getTodayBrief(force = false): Promise<TodayBriefResult> {
  try {
    const now = new Date();
    const todayKey = now.toISOString().split("T")[0];
    const cadence = CADENCE[now.getDay()];

    const supabase = getSupabaseServer({ useServiceRole: true });

    // Cache: dacă există briefing pentru azi și nu forțăm, îl returnăm
    if (!force) {
      const { data: cached } = await supabase
        .from("creier_metadata")
        .select("value")
        .eq("key", "today_brief")
        .single();
      const v = cached?.value as TodayBrief | undefined;
      if (v && v.date === todayKey) return { ok: true, brief: v };
    }

    // Context DM/business (best effort)
    let dmStats = "Fără date DM încă.";
    try {
      const { data: dms } = await supabase
        .from("dm_conversations")
        .select("stage")
        .limit(100);
      if (dms && dms.length > 0) {
        const byStage: Record<string, number> = {};
        for (const d of dms) { const s = (d as { stage?: string }).stage ?? "necunoscut"; byStage[s] = (byStage[s] ?? 0) + 1; }
        dmStats = `Conversații DM active pe etape: ${Object.entries(byStage).map(([s, n]) => `${s}: ${n}`).join(", ")}.`;
      }
    } catch { /* tabelul poate lipsi — best effort */ }

    const creier = await readCreierFromSupabase();
    const client = getAnthropicClient();
    const systemBlocks = buildSystemBlocks({
      creierJson: JSON.stringify(creier, null, 2),
      taskContext: buildTodayTask(cadence, dmStats),
    });

    const message = await client.messages.create({
      model: MODELS.routine,
      max_tokens: 1200,
      system: systemBlocks,
      messages: [{ role: "user", content: `Generează briefingul de azi (${cadence.day}). JSON strict.` }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") return { ok: false, error: "Răspuns AI fără text." };

    let parsed: unknown;
    try { parsed = extractJson(textBlock.text); }
    catch (e) { return { ok: false, error: `Parse eșuat: ${e instanceof Error ? e.message : "necunoscut"}` }; }

    const p = parsed as Record<string, unknown>;
    const brief: TodayBrief = {
      date: todayKey,
      cadence,
      content_idea: String(p.content_idea ?? ""),
      ready_hook: String(p.ready_hook ?? ""),
      caption_starter: String(p.caption_starter ?? ""),
      business_action: String(p.business_action ?? ""),
      business_why: String(p.business_why ?? ""),
      mindset_note: String(p.mindset_note ?? ""),
      generated_at: new Date().toISOString(),
    };

    // Persistăm cache-ul (best effort)
    try {
      await supabase.from("creier_metadata").upsert({ key: "today_brief", value: brief });
    } catch { /* best effort */ }

    return { ok: true, brief };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Eroare necunoscută." };
  }
}
