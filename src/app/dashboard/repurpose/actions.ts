"use server";

import { getSupabaseServer } from "@/lib/supabase/server";
import { buildSystemBlocks, getAnthropicClient, MODELS } from "@/lib/anthropic";
import { readCreierFromSupabase } from "@/lib/creier";
import type { Pillar } from "@/app/reels/actions";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface RepurposeReel {
  hook: string;
  script: string;
  caption: string;
}

export interface RepurposeCarouselSlide {
  position: number;
  title: string;
  body: string;
}

export interface RepurposeStory {
  position: number;
  text: string;
  interaction: string; // sondaj / întrebare / sticker sugerat
}

export interface RepurposeEmail {
  subject: string;
  body: string;
}

export interface RepurposeBody {
  idea: string;
  pillar: Pillar;
  reel: RepurposeReel;
  carousel: RepurposeCarouselSlide[];
  stories: RepurposeStory[];
  email: RepurposeEmail;
  generated_at: string;
  model_used: string;
}

export interface RepurposeRecord {
  id: number;
  pillar: Pillar;
  hook: string;
  body: RepurposeBody;
  status: "draft" | "edited" | "posted" | "archived";
  created_at: string;
  updated_at: string;
}

const VALID_PILLARS = new Set<Pillar>(["B", "U", "I", "L", "T", "mix"]);

const PILLAR_LABEL: Record<Pillar, string> = {
  B: "Base Strength (forță compusă)",
  U: "Unbreakable Capacity (rezistență, Zone 2)",
  I: "Intelligent Fueling (nutriție ca sistem)",
  L: "Lifestyle Integration (integrare în viața reală)",
  T: "Tough Mindset (psihologie, identitate)",
  mix: "Mix (mai mulți piloni)",
};

// ─── Prompt ─────────────────────────────────────────────────────────────────

function buildRepurposeTask(pillar: Pillar, idea: string): string {
  return `# TASK: Repurpose o singură idee în 4 piese de conținut BUILT

## Pilon: ${PILLAR_LABEL[pillar]}
## Ideea brută: ${idea}

Pornind de la aceeași idee centrală, generează 4 piese coerente, fiecare în formatul ei nativ.
Vocea lui Claudiu, zero clișee, fiecare piesă justifică că există.

### 1. REEL (script vorbit, 30-50 sec)
- hook: declarație contraintuitivă / cifră + durere (0-3 sec, oprește scrollul)
- script: textul complet de spus la cameră (problemă → mecanism → sistem BUILT → reframe)
- caption: descrierea de sub reel + CTA discret de tip diagnostic ("Scrie-mi în DM: ARHITECTURĂ")

### 2. CARUSEL (6-8 slide-uri)
- fiecare slide: o singură idee, titlu max 6 cuvinte, body 1-3 propoziții
- slide 1 = hook, ultimul slide = CTA discret

### 3. STORIES (3 story-uri secvențiale)
- fiecare: text scurt pe ecran + o interacțiune (sondaj / întrebare / slider / sticker)
- construiesc curiozitate și califică audiența

### 4. EMAIL (newsletter scurt)
- subject: linie de subiect care obține deschiderea
- body: o singură idee, ton uman, paragrafe scurte, un singur CTA

## Format răspuns — JSON strict, fără markdown:
{
  "reel": { "hook": "string", "script": "string", "caption": "string" },
  "carousel": [ { "position": 1, "title": "string", "body": "string" } ],
  "stories": [ { "position": 1, "text": "string", "interaction": "string" } ],
  "email": { "subject": "string", "body": "string" }
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

function parseRepurpose(parsed: unknown): {
  reel: RepurposeReel;
  carousel: RepurposeCarouselSlide[];
  stories: RepurposeStory[];
  email: RepurposeEmail;
} {
  const obj = parsed as Record<string, unknown>;
  const reelRaw = (obj.reel ?? {}) as Record<string, unknown>;
  const emailRaw = (obj.email ?? {}) as Record<string, unknown>;

  const carouselArr = Array.isArray(obj.carousel) ? obj.carousel : [];
  const storiesArr = Array.isArray(obj.stories) ? obj.stories : [];

  return {
    reel: {
      hook: String(reelRaw.hook ?? ""),
      script: String(reelRaw.script ?? ""),
      caption: String(reelRaw.caption ?? ""),
    },
    carousel: carouselArr.map((s, i) => {
      const r = s as Record<string, unknown>;
      return {
        position: typeof r.position === "number" ? r.position : i + 1,
        title: String(r.title ?? ""),
        body: String(r.body ?? ""),
      };
    }),
    stories: storiesArr.map((s, i) => {
      const r = s as Record<string, unknown>;
      return {
        position: typeof r.position === "number" ? r.position : i + 1,
        text: String(r.text ?? ""),
        interaction: String(r.interaction ?? ""),
      };
    }),
    email: {
      subject: String(emailRaw.subject ?? ""),
      body: String(emailRaw.body ?? ""),
    },
  };
}

export type GenerateRepurposeResult =
  | { ok: true; record: RepurposeRecord }
  | { ok: false; error: string };

export async function generateRepurpose(pillar: Pillar, idea: string): Promise<GenerateRepurposeResult> {
  if (!VALID_PILLARS.has(pillar)) return { ok: false, error: `Pilon invalid: ${pillar}` };
  const trimmed = idea.trim();
  if (trimmed.length < 3) return { ok: false, error: "Ideea trebuie să aibă cel puțin 3 caractere." };

  try {
    const creier = await readCreierFromSupabase();
    const client = getAnthropicClient();
    const systemBlocks = buildSystemBlocks({
      creierJson: JSON.stringify(creier, null, 2),
      taskContext: buildRepurposeTask(pillar, trimmed),
    });

    const message = await client.messages.create({
      model: MODELS.routine,
      max_tokens: 4000,
      system: systemBlocks,
      messages: [{ role: "user", content: `Repurpose ideea "${trimmed}" (pilon ${pillar}) în cele 4 piese. JSON strict.` }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") return { ok: false, error: "Răspuns AI fără text." };

    let parsed: unknown;
    try { parsed = extractJson(textBlock.text); }
    catch (e) { return { ok: false, error: `Parse eșuat: ${e instanceof Error ? e.message : "necunoscut"}` }; }

    const { reel, carousel, stories, email } = parseRepurpose(parsed);

    const body: RepurposeBody = {
      idea: trimmed, pillar, reel, carousel, stories, email,
      generated_at: new Date().toISOString(),
      model_used: MODELS.routine,
    };

    // Persistăm în istoric — dar dacă eșuează (ex. constrângere pe tabel),
    // tot returnăm conținutul generat. Generarea nu depinde de persistență.
    const supabase = getSupabaseServer();
    const { data } = await supabase.from("generated_outputs").insert({
      module: "M_repurpose", pillar, hook: reel.hook, body, status: "draft",
    }).select().single();

    return {
      ok: true,
      record: {
        id: data?.id ?? Date.now(),
        pillar, hook: reel.hook, body,
        status: "draft",
        created_at: data?.created_at ?? new Date().toISOString(),
        updated_at: data?.updated_at ?? new Date().toISOString(),
      },
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Eroare necunoscută." };
  }
}

export async function listRepurpose(): Promise<RepurposeRecord[]> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase.from("generated_outputs")
    .select("id, pillar, hook, body, status, created_at, updated_at")
    .eq("module", "M_repurpose").order("created_at", { ascending: false }).limit(30);
  if (error) throw new Error(`Supabase listRepurpose: ${error.message}`);
  return (data ?? []).map((row) => ({
    id: row.id, pillar: row.pillar as Pillar, hook: row.hook,
    body: row.body as RepurposeBody, status: row.status,
    created_at: row.created_at, updated_at: row.updated_at,
  }));
}
