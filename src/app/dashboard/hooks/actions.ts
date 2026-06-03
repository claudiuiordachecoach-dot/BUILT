"use server";

import { getSupabaseServer } from "@/lib/supabase/server";
import { buildSystemBlocks, getAnthropicClient, MODELS } from "@/lib/anthropic";
import { readCreierFromSupabase } from "@/lib/creier";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface HookItem {
  text: string;
  type: string; // contraintuitiv / cifră+durere / oglindire / provocare
  pillar: string;
}

export interface HookBankBody {
  angle: string;
  hooks: HookItem[];
  fed_by: string; // ce date au alimentat generarea
  generated_at: string;
  model_used: string;
}

export interface HookBankRecord {
  id: number;
  hook: string;
  body: HookBankBody;
  created_at: string;
}

// ─── Prompt ─────────────────────────────────────────────────────────────────

function buildHooksTask(angle: string, topPerformers: string[]): string {
  const performersBlock = topPerformers.length > 0
    ? `## Ce a funcționat deja la Claudiu (hook-uri din reels cu cele mai multe vizualizări)\n${topPerformers.map((t, i) => `${i + 1}. ${t}`).join("\n")}\n\nFolosește pattern-urile care au mers, dar nu copia — generează variante noi în aceeași direcție.`
    : "";

  return `# TASK: Generează o bancă de 12 hook-uri BUILT gata de folosit

${angle ? `## Unghi / temă: ${angle}` : "## Unghi: liber — acoperă toți cei 5 piloni BUILT"}

${performersBlock}

## Reguli hook BUILT (primele 3 secunde dintr-un reel)
Un hook bun face UNA din:
- **Contraintuitiv**: contrazice o credință comună ("Cardio-ul zilnic te ține gras")
- **Cifră + durere**: număr specific legat de o frustrare ("Lucrezi 50h/săptămână și corpul tău plătește prețul")
- **Oglindire directă**: descrie exact situația clientului ("Ai 38 de ani, burtă, și senzația că ai ratat trenul")
- **Provocare**: pune sub semnul întrebării efortul lui ("Nu ai nevoie de mai multă voință. Ai nevoie de mai puțin haos.")

Zero clișee motivaționale. Zero "transformare". Fiecare hook trebuie să oprească scrollul.

## Format răspuns — JSON strict, fără markdown:
{
  "hooks": [
    { "text": "string (hook-ul complet)", "type": "contraintuitiv|cifră+durere|oglindire|provocare", "pillar": "B|U|I|L|T|mix" }
  ]
}

Generează exact 12 hook-uri, variate ca tip și pilon.`;
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

function parseHooks(parsed: unknown): HookItem[] {
  const obj = parsed as Record<string, unknown>;
  const arr = Array.isArray(obj.hooks) ? obj.hooks : [];
  return arr.map((h) => {
    const r = h as Record<string, unknown>;
    return {
      text: String(r.text ?? ""),
      type: String(r.type ?? "mix"),
      pillar: String(r.pillar ?? "mix"),
    };
  }).filter((h) => h.text.length > 0);
}

export type GenerateHooksResult =
  | { ok: true; record: HookBankRecord }
  | { ok: false; error: string };

export async function generateHooks(angle: string = ""): Promise<GenerateHooksResult> {
  try {
    const supabase = getSupabaseServer({ useServiceRole: true });

    // Alimentăm cu hook-urile reale care au performat (top reels după views)
    const { data: topReels } = await supabase
      .from("instagram_media")
      .select("caption, views")
      .order("views", { ascending: false })
      .limit(8);

    const topPerformers = (topReels ?? [])
      .map((r) => (r.caption ?? "").split("\n")[0].slice(0, 120))
      .filter((c) => c.trim().length > 10);

    const fedBy = topPerformers.length > 0
      ? `${topPerformers.length} hook-uri din reels-urile tale de top + Creierul lui Claudiu`
      : "Creierul lui Claudiu (încă fără date de reels — sincronizează în Analytics)";

    const creier = await readCreierFromSupabase();
    const client = getAnthropicClient();
    const systemBlocks = buildSystemBlocks({
      creierJson: JSON.stringify(creier, null, 2),
      taskContext: buildHooksTask(angle.trim(), topPerformers),
    });

    const message = await client.messages.create({
      model: MODELS.routine,
      max_tokens: 2000,
      system: systemBlocks,
      messages: [{ role: "user", content: `Generează banca de 12 hook-uri${angle.trim() ? ` pe unghiul: "${angle.trim()}"` : ""}. JSON strict.` }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") return { ok: false, error: "Răspuns AI fără text." };

    let parsed: unknown;
    try { parsed = extractJson(textBlock.text); }
    catch (e) { return { ok: false, error: `Parse eșuat: ${e instanceof Error ? e.message : "necunoscut"}` }; }

    const hooks = parseHooks(parsed);
    if (hooks.length === 0) return { ok: false, error: "AI nu a returnat hook-uri." };

    const body: HookBankBody = {
      angle: angle.trim(), hooks, fed_by: fedBy,
      generated_at: new Date().toISOString(),
      model_used: MODELS.routine,
    };

    // Persistăm în istoric — dar nu blocăm dacă eșuează (ex. constrângere pe tabel).
    const { data } = await supabase.from("generated_outputs").insert({
      module: "M_hooks", pillar: "mix", hook: hooks[0]?.text ?? "", body, status: "draft",
    }).select().single();

    return {
      ok: true,
      record: {
        id: data?.id ?? Date.now(),
        hook: hooks[0]?.text ?? "",
        body,
        created_at: data?.created_at ?? new Date().toISOString(),
      },
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Eroare necunoscută." };
  }
}

export async function listHookBanks(): Promise<HookBankRecord[]> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase.from("generated_outputs")
    .select("id, hook, body, created_at")
    .eq("module", "M_hooks").order("created_at", { ascending: false }).limit(20);
  if (error) throw new Error(`Supabase listHookBanks: ${error.message}`);
  return (data ?? []).map((row) => ({
    id: row.id, hook: row.hook, body: row.body as HookBankBody, created_at: row.created_at,
  }));
}
