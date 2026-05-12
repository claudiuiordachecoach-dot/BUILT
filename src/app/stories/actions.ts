"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import { buildSystemBlocks, getAnthropicClient, MODELS } from "@/lib/anthropic";
import { readCreierFromSupabase } from "@/lib/creier";
import type { Pillar } from "@/app/reels/actions";

export type StoryType = "question" | "bts" | "mini_lesson" | "recap" | "vulnerability";

export interface StoryItem {
  type: StoryType;
  title: string;
  body: string;
  cta: string;
  estimated_sec: number;
}

export interface StoryBody {
  theme: string;
  pillar: Pillar;
  stories: StoryItem[];
  generated_at: string;
  model_used: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
    cache_creation_input_tokens: number;
    cache_read_input_tokens: number;
  };
}

export interface StoryRecord {
  id: number;
  pillar: Pillar;
  hook: string;
  body: StoryBody;
  status: "draft" | "edited" | "posted" | "archived";
  scheduled_for: string | null;
  created_at: string;
  updated_at: string;
}

const VALID_PILLARS = new Set<Pillar>(["B", "U", "I", "L", "T", "mix"]);

const TYPE_LABELS: Record<StoryType, string> = {
  question: "Întrebare directă",
  bts: "Behind the scenes",
  mini_lesson: "Mini-lecție",
  recap: "Recap",
  vulnerability: "Vulnerabilitate",
};

function buildStoryTask(pillar: Pillar, theme: string): string {
  return `# TASK: Generează un pack de 5 Stories BUILT

## Pilon: ${pillar}
## Temă: ${theme}

## Regulile stories (diferite de reels)
- Durata: 15–30 secunde per story
- Ton: mai intim, mai uman, mai scurt decât un reel
- Format vizual: text mare pe ecran, background simplu sau video din viața reală

## Cele 5 tipuri (câte unul din fiecare)
1. **question** — O întrebare directă care pune degetul pe rană. Ex: "Câte luni ai zis că 'de luni' și nu s-a întâmplat nimic?"
2. **bts** — Behind the scenes autentic din viața lui Claudiu (antrenament, masă, muncă, familie). Real, fără filtru.
3. **mini_lesson** — O lecție în maximum 2 propoziții. Concisă, acționabilă, surprinzătoare.
4. **recap** — Recap al unei idei importante, al săptămânii sau al unui principiu BUILT. Structurat: "Săptămâna asta am…" / "Principiul #X: …"
5. **vulnerability** — Ceva personal și autentic din traseul lui Claudiu (greutate, bâlbâială, frustrare, eșec). Nu victimizare — putere prin onestitate.

## Format răspuns — JSON strict, fără markdown:
{
  "stories": [
    {
      "type": "question|bts|mini_lesson|recap|vulnerability",
      "title": "string — textul mare de pe ecran (max 8 cuvinte, impactant)",
      "body": "string — 1-2 propoziții explicative sau context pentru filmare",
      "cta": "string — opțional, max 1 propoziție (sau string gol dacă nu e nevoie)",
      "estimated_sec": 20
    }
  ]
}

Zero clișee. Zero motivational poster. Vocea BUILT: direct, uman, fără prefăcut.`;
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

function validateStories(parsed: unknown): StoryItem[] {
  const obj = parsed as Record<string, unknown>;
  const arr = obj.stories;
  if (!Array.isArray(arr)) throw new Error("Lipsește array-ul 'stories'.");
  return arr.map((s, i) => {
    const r = s as Record<string, unknown>;
    const type = String(r.type ?? "mini_lesson") as StoryType;
    return {
      type: Object.keys(TYPE_LABELS).includes(type) ? type : "mini_lesson",
      title: String(r.title ?? ""),
      body: String(r.body ?? ""),
      cta: String(r.cta ?? ""),
      estimated_sec: typeof r.estimated_sec === "number" ? r.estimated_sec : 20,
    };
  });
}

export type GenerateStoryResult = { ok: true; story: StoryRecord } | { ok: false; error: string };

export async function generateStory(pillar: Pillar, theme: string): Promise<GenerateStoryResult> {
  if (!VALID_PILLARS.has(pillar)) return { ok: false, error: `Pilon invalid: ${pillar}` };
  const trimmed = theme.trim();
  if (trimmed.length < 3) return { ok: false, error: "Tema trebuie să aibă cel puțin 3 caractere." };
  if (trimmed.length > 500) return { ok: false, error: "Tema e prea lungă (max 500 caractere)." };

  try {
    const creier = await readCreierFromSupabase();
    const client = getAnthropicClient();
    const systemBlocks = buildSystemBlocks({ creierJson: JSON.stringify(creier, null, 2), taskContext: buildStoryTask(pillar, trimmed) });

    const message = await client.messages.create({
      model: MODELS.routine,
      max_tokens: 1500,
      system: systemBlocks,
      messages: [{ role: "user", content: `Generează pack-ul de 5 stories pentru pilon ${pillar} și temă: "${trimmed}". JSON strict.` }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") return { ok: false, error: "Răspuns AI fără text." };

    let parsed: unknown;
    try { parsed = extractJson(textBlock.text); }
    catch (e) { return { ok: false, error: `Parse eșuat: ${e instanceof Error ? e.message : "necunoscut"}` }; }

    const stories = validateStories(parsed);

    const body: StoryBody = {
      theme: trimmed, pillar, stories,
      generated_at: new Date().toISOString(),
      model_used: MODELS.routine,
      usage: {
        input_tokens: message.usage.input_tokens,
        output_tokens: message.usage.output_tokens,
        cache_creation_input_tokens: message.usage.cache_creation_input_tokens ?? 0,
        cache_read_input_tokens: message.usage.cache_read_input_tokens ?? 0,
      },
    };

    const supabase = getSupabaseServer();
    const { data, error } = await supabase.from("generated_outputs").insert({
      module: "M3_story", pillar, hook: stories[0]?.title ?? "", body, status: "draft",
    }).select().single();

    if (error) return { ok: false, error: `Supabase: ${error.message}` };

    revalidatePath("/stories");
    return { ok: true, story: { id: data.id, pillar: data.pillar as Pillar, hook: data.hook, body: data.body as StoryBody, status: data.status, scheduled_for: data.scheduled_for, created_at: data.created_at, updated_at: data.updated_at } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Eroare necunoscută." };
  }
}

export async function listStories(): Promise<StoryRecord[]> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase.from("generated_outputs")
    .select("id, pillar, hook, body, status, scheduled_for, created_at, updated_at")
    .eq("module", "M3_story").order("created_at", { ascending: false }).limit(50);
  if (error) throw new Error(`Supabase listStories: ${error.message}`);
  return (data ?? []).map((row) => ({ id: row.id, pillar: row.pillar as Pillar, hook: row.hook, body: row.body as StoryBody, status: row.status, scheduled_for: row.scheduled_for, created_at: row.created_at, updated_at: row.updated_at }));
}
