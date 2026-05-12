"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import { buildSystemBlocks, getAnthropicClient, MODELS } from "@/lib/anthropic";
import { readCreierFromSupabase } from "@/lib/creier";
import type { Pillar } from "@/app/reels/actions";

export interface CaruselSlide {
  position: number;
  title: string;
  body: string;
  design_brief: string;
}

export interface CaruselBody {
  theme: string;
  pillar: Pillar;
  slides: CaruselSlide[];
  generated_at: string;
  model_used: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
    cache_creation_input_tokens: number;
    cache_read_input_tokens: number;
  };
}

export interface CaruselRecord {
  id: number;
  pillar: Pillar;
  hook: string;
  body: CaruselBody;
  status: "draft" | "edited" | "posted" | "archived";
  scheduled_for: string | null;
  created_at: string;
  updated_at: string;
}

const VALID_PILLARS = new Set<Pillar>(["B", "U", "I", "L", "T", "mix"]);

function buildCaruselTask(pillar: Pillar, theme: string): string {
  return `# TASK: Generează un Carusel Instagram BUILT

## Pilon: ${pillar}
## Temă: ${theme}

## Structura caruselului (8-10 slide-uri)
Slide 1 — HOOK: Declarație contraintuitivă sau cifră șoc. Oprești scrollul.
Slide 2 — PROBLEMA: Numiți exact situația clientului. Validare.
Slide 3–6 — SISTEMUL: Conținut valoros, pași sau principii BUILT. Specificitate extremă.
Slide 7 — APLICAREA: Cum aplici azi, concret.
Slide 8 — REFRAME: Schimbi perspectiva. Credința falsă → adevărul BUILT.
Slide 9 — CTA: O singură acțiune. Ton diagnostic, nu vânzare.
(Slide 10 opțional — extra valoare sau citat)

## Regulile caruselului BUILT
- Fiecare slide = o singură idee
- Titlu: max 6 cuvinte, impactant
- Body: 1-3 propoziții, valoare densă
- Design brief: instrucțiuni simple pentru Canva (culori BUILT: #0A0A0A fond, #C0392B accent, #F5F5F5 text)

## Format răspuns — JSON strict, fără markdown:
{
  "slides": [
    {
      "position": 1,
      "title": "string (max 6 cuvinte)",
      "body": "string (1-3 propoziții)",
      "design_brief": "string (instrucțiuni Canva pe scurt)"
    }
  ]
}

Zero clișee. Zero generic. Fiecare slide trebuie să justifice că există.`;
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

function validateSlides(parsed: unknown): CaruselSlide[] {
  const obj = parsed as Record<string, unknown>;
  const arr = obj.slides;
  if (!Array.isArray(arr)) throw new Error("Lipsește array-ul 'slides'.");
  return arr.map((s, i) => {
    const r = s as Record<string, unknown>;
    return {
      position: typeof r.position === "number" ? r.position : i + 1,
      title: String(r.title ?? ""),
      body: String(r.body ?? ""),
      design_brief: String(r.design_brief ?? ""),
    };
  });
}

export type GenerateCaruselResult = { ok: true; carusel: CaruselRecord } | { ok: false; error: string };

export async function generateCarusel(pillar: Pillar, theme: string): Promise<GenerateCaruselResult> {
  if (!VALID_PILLARS.has(pillar)) return { ok: false, error: `Pilon invalid: ${pillar}` };
  const trimmed = theme.trim();
  if (trimmed.length < 3) return { ok: false, error: "Tema trebuie să aibă cel puțin 3 caractere." };

  try {
    const creier = await readCreierFromSupabase();
    const client = getAnthropicClient();
    const systemBlocks = buildSystemBlocks({ creierJson: JSON.stringify(creier, null, 2), taskContext: buildCaruselTask(pillar, trimmed) });

    const message = await client.messages.create({
      model: MODELS.routine,
      max_tokens: 2000,
      system: systemBlocks,
      messages: [{ role: "user", content: `Generează caruselul pentru pilon ${pillar} și temă: "${trimmed}". JSON strict.` }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") return { ok: false, error: "Răspuns AI fără text." };

    let parsed: unknown;
    try { parsed = extractJson(textBlock.text); }
    catch (e) { return { ok: false, error: `Parse eșuat: ${e instanceof Error ? e.message : "necunoscut"}` }; }

    const slides = validateSlides(parsed);

    const body: CaruselBody = {
      theme: trimmed, pillar, slides,
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
      module: "M4_carusel", pillar, hook: slides[0]?.title ?? "", body, status: "draft",
    }).select().single();

    if (error) return { ok: false, error: `Supabase: ${error.message}` };

    revalidatePath("/carusele");
    return { ok: true, carusel: { id: data.id, pillar: data.pillar as Pillar, hook: data.hook, body: data.body as CaruselBody, status: data.status, scheduled_for: data.scheduled_for, created_at: data.created_at, updated_at: data.updated_at } };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Eroare necunoscută." };
  }
}

export async function listCarusele(): Promise<CaruselRecord[]> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase.from("generated_outputs")
    .select("id, pillar, hook, body, status, scheduled_for, created_at, updated_at")
    .eq("module", "M4_carusel").order("created_at", { ascending: false }).limit(50);
  if (error) throw new Error(`Supabase listCarusele: ${error.message}`);
  return (data ?? []).map((row) => ({ id: row.id, pillar: row.pillar as Pillar, hook: row.hook, body: row.body as CaruselBody, status: row.status, scheduled_for: row.scheduled_for, created_at: row.created_at, updated_at: row.updated_at }));
}
