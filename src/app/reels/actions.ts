"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import { readCreierFromSupabase } from "@/lib/creier";
import { buildSystemBlocks, getAnthropicClient, MODELS } from "@/lib/anthropic";

export type Pillar = "B" | "U" | "I" | "L" | "T" | "mix";

export interface ReelVariant {
  hook: string;
  problem_validation: string;
  built_system: string;
  cta: string;
  psychological_trigger: string;
  estimated_duration_sec: number;
}

export interface ReelBody {
  angle: string;
  pillar: Pillar;
  variants: ReelVariant[];
  generated_at: string;
  model_used: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
    cache_creation_input_tokens: number;
    cache_read_input_tokens: number;
  };
}

export interface ReelRecord {
  id: number;
  pillar: Pillar;
  hook: string;
  body: ReelBody;
  status: "draft" | "edited" | "posted" | "archived";
  scheduled_for: string | null;
  posted_at: string | null;
  created_at: string;
  updated_at: string;
}

export type GenerateReelResult =
  | { ok: true; reel: ReelRecord }
  | { ok: false; error: string };

const VALID_PILLARS = new Set<Pillar>(["B", "U", "I", "L", "T", "mix"]);
const PILLAR_DESCRIPTIONS: Record<Pillar, string> = {
  B: "Base Strength — forță compusă, progresie logaritmică, reconstrucția capacității de a ridica greutate cu structura corectă",
  U: "Unbreakable Capacity — rezistență, Zone 2, capacitate cardiovasculară, energie zilnică care nu mai cade la ora 15",
  I: "Intelligent Fueling — nutriție ca sistem, 80/20, anti-binge, fără obsesie, fără înfometare",
  L: "Lifestyle Integration — integrare în viața reală cu job, familie, deplasări, oboseală, fără să destabilizezi totul",
  T: "Tough Mindset — psihologie, identitate de om echilibrat, automatisme zilnice, nu motivație ocazională",
  mix: "Combinație de piloni — pentru unghiuri care nu țin de un singur pilon",
};

function buildSkill1Task(pillar: Pillar, angle: string): string {
  return `# TASK: Generează 3 variante de Reel BUILT

## Pilon principal
${pillar} — ${PILLAR_DESCRIPTIONS[pillar]}

## Unghi / temă
${angle}

## Structură obligatorie pentru fiecare variantă
1. **Hook (0–3 sec)** — declarație contraintuitivă SAU cifră + durere SAU oglindire directă. Oprești scrollul sau clipul nu există. ZERO clișee gen "salut", "azi vorbim despre", "știai că".
2. **Problemă / Validare (3–20 sec)** — numești situația exactă a clientului ideal, validezi ("Nu e lipsă de voință — e lipsă de sistem"), explici mecanismul fiziologic dacă e relevant.
3. **Sistemul BUILT (20–50 sec)** — soluția specifică legată de pilonul ${pillar}. Specificitate extremă. Arhitectură, nu promisiune. Folosește vocabularul: sistem · arhitectură · reconstrucție · protocol · piloni · execuție · diagnostic.
4. **CTA discret (ultimele 3–5 sec)** — o singură acțiune, ton de diagnostic nu de vânzare. Ex: "Dacă te regăsești în asta, scrie-mi în DM: ARHITECTURĂ."

## Triggere psihologice de activat (alege unul per variantă)
- **Capcana Cortizolului** — Stres → cortizol → grăsime abdominală → mai mult stres. Buclă biologică, nu problemă de caracter.
- **Paradoxul Competenței** — Reușește la orice în afară de corp; tocmai de aceea eșecul fizic doare cel mai tare.
- **Prețul Invizibilității** — Costul inacțiunii: energie, relație, sănătate erodată zi după zi.
- **Identitatea înainte de comportament** — Devii "om de sistem" prima oară, comportamentul urmează.
- **Sistemul bate voința** — Voința nu e resursă infinită; sistemul există tocmai pentru asta.

## Cele 3 variante
- **Varianta 1**: trigger principal — cel mai potrivit pentru unghi
- **Varianta 2**: alt trigger, alt unghi de atac (ex: dacă V1 e logic, V2 e emoțional)
- **Varianta 3**: cea mai îndrăzneață, cea mai contraintuitivă — testează limita

## INTERZIS
- Clișee de fitness ("trage tare", "consistency is key", "transformare totală", "crede în tine")
- Promisiuni vagi ("vei arăta uimitor", "vei fi cea mai bună versiune")
- Exces de emoji
- Bro-science fără logică
- Introducere lungă tip "salut, sunt Claudiu, azi vorbim despre"
- Concluzii siropoase

## Format răspuns
Returnează STRICT JSON valid, fără markdown, fără text înainte sau după:

\`\`\`
{
  "variants": [
    {
      "hook": "string (1 propoziție)",
      "problem_validation": "string (2-3 propoziții)",
      "built_system": "string (3-5 propoziții)",
      "cta": "string (1 propoziție)",
      "psychological_trigger": "Capcana Cortizolului|Paradoxul Competenței|Prețul Invizibilității|Identitatea înainte de comportament|Sistemul bate voința",
      "estimated_duration_sec": 45
    },
    { /* variant 2 */ },
    { /* variant 3 */ }
  ]
}
\`\`\`

Nu adăuga câmpuri extra. Nu folosi markdown. Doar JSON.`;
}

function extractJsonObject(text: string): unknown {
  const trimmed = text.trim();
  if (trimmed.startsWith("{")) {
    return JSON.parse(trimmed);
  }
  const fenced = trimmed.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  if (fenced) {
    return JSON.parse(fenced[1]);
  }
  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1));
  }
  throw new Error("Nu am găsit JSON în răspunsul AI.");
}

function validateVariants(parsed: unknown): ReelVariant[] {
  if (typeof parsed !== "object" || parsed === null) {
    throw new Error("Răspuns AI invalid (nu e obiect).");
  }
  const obj = parsed as Record<string, unknown>;
  const variants = obj.variants;
  if (!Array.isArray(variants) || variants.length === 0) {
    throw new Error("Răspuns AI invalid — lipsește array-ul 'variants'.");
  }
  return variants.map((v, i) => {
    if (typeof v !== "object" || v === null) {
      throw new Error(`Varianta ${i + 1} nu e obiect.`);
    }
    const r = v as Record<string, unknown>;
    return {
      hook: String(r.hook ?? ""),
      problem_validation: String(r.problem_validation ?? ""),
      built_system: String(r.built_system ?? ""),
      cta: String(r.cta ?? ""),
      psychological_trigger: String(r.psychological_trigger ?? ""),
      estimated_duration_sec:
        typeof r.estimated_duration_sec === "number"
          ? r.estimated_duration_sec
          : 45,
    };
  });
}

export async function generateReel(
  pillar: Pillar,
  angle: string
): Promise<GenerateReelResult> {
  if (!VALID_PILLARS.has(pillar)) {
    return { ok: false, error: `Pilon invalid: ${pillar}` };
  }
  const angleTrimmed = angle.trim();
  if (angleTrimmed.length < 3) {
    return { ok: false, error: "Unghiul trebuie să aibă cel puțin 3 caractere." };
  }
  if (angleTrimmed.length > 500) {
    return { ok: false, error: "Unghiul e prea lung (max 500 caractere)." };
  }

  try {
    const creier = await readCreierFromSupabase();
    const creierJson = JSON.stringify(creier, null, 2);

    const client = getAnthropicClient();
    const systemBlocks = buildSystemBlocks({
      creierJson,
      taskContext: buildSkill1Task(pillar, angleTrimmed),
    });

    const message = await client.messages.create({
      model: MODELS.routine,
      max_tokens: 2000,
      system: systemBlocks,
      messages: [
        {
          role: "user",
          content: `Generează cele 3 variante pentru pilon ${pillar} și unghi: "${angleTrimmed}". JSON strict.`,
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return { ok: false, error: "Răspuns AI fără text." };
    }

    let parsed: unknown;
    try {
      parsed = extractJsonObject(textBlock.text);
    } catch (e) {
      return {
        ok: false,
        error: `Parse JSON eșuat: ${e instanceof Error ? e.message : "necunoscut"}. Răspuns brut: ${textBlock.text.slice(0, 200)}`,
      };
    }

    const variants = validateVariants(parsed);

    const body: ReelBody = {
      angle: angleTrimmed,
      pillar,
      variants,
      generated_at: new Date().toISOString(),
      model_used: MODELS.routine,
      usage: {
        input_tokens: message.usage.input_tokens,
        output_tokens: message.usage.output_tokens,
        cache_creation_input_tokens:
          message.usage.cache_creation_input_tokens ?? 0,
        cache_read_input_tokens: message.usage.cache_read_input_tokens ?? 0,
      },
    };

    const supabase = getSupabaseServer();
    const { data, error } = await supabase
      .from("generated_outputs")
      .insert({
        module: "M2_reel",
        pillar,
        hook: variants[0]?.hook ?? "",
        body,
        status: "draft",
      })
      .select()
      .single();

    if (error) {
      return { ok: false, error: `Supabase: ${error.message}` };
    }

    revalidatePath("/reels");

    return {
      ok: true,
      reel: {
        id: data.id,
        pillar: data.pillar as Pillar,
        hook: data.hook,
        body: data.body as ReelBody,
        status: data.status,
        scheduled_for: data.scheduled_for,
        posted_at: data.posted_at,
        created_at: data.created_at,
        updated_at: data.updated_at,
      },
    };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Eroare necunoscută la generare.",
    };
  }
}

export async function listReels(): Promise<ReelRecord[]> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("generated_outputs")
    .select(
      "id, pillar, hook, body, status, scheduled_for, posted_at, created_at, updated_at"
    )
    .eq("module", "M2_reel")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(`Supabase listReels: ${error.message}`);
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    pillar: row.pillar as Pillar,
    hook: row.hook,
    body: row.body as ReelBody,
    status: row.status,
    scheduled_for: row.scheduled_for,
    posted_at: row.posted_at,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
}

export type SaveReelEditResult = { ok: true } | { ok: false; error: string };

export async function saveReelEdit(
  id: number,
  variantIndex: number,
  edited: ReelVariant
): Promise<SaveReelEditResult> {
  const supabase = getSupabaseServer();

  const { data: existing, error: fetchErr } = await supabase
    .from("generated_outputs")
    .select("body, user_edits")
    .eq("id", id)
    .single();

  if (fetchErr) {
    return { ok: false, error: `Supabase fetch: ${fetchErr.message}` };
  }

  const body = existing.body as ReelBody;
  if (!body.variants[variantIndex]) {
    return { ok: false, error: `Index variantă invalid: ${variantIndex}` };
  }

  const original = body.variants[variantIndex];
  body.variants[variantIndex] = edited;

  const userEdits = (existing.user_edits ?? {}) as Record<string, unknown>;
  const editLog = (userEdits.edits ?? []) as unknown[];
  editLog.push({
    variant_index: variantIndex,
    edited_at: new Date().toISOString(),
    original,
    edited,
  });
  userEdits.edits = editLog;

  const updates: Record<string, unknown> = {
    body,
    user_edits: userEdits,
    status: "edited",
  };
  if (variantIndex === 0) {
    updates.hook = edited.hook;
  }

  const { error: updateErr } = await supabase
    .from("generated_outputs")
    .update(updates)
    .eq("id", id);

  if (updateErr) {
    return { ok: false, error: `Supabase update: ${updateErr.message}` };
  }

  revalidatePath("/reels");
  return { ok: true };
}
