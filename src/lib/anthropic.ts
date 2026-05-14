import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { readCreierFromFile } from "@/lib/creier";
import { getSupabaseServer } from "@/lib/supabase/server";

/**
 * Modele BUILT — alocate pe tipul de task.
 * Sonnet 4.6 pentru rutină (reels, stories, DM, analize standard).
 * Opus 4.7 pentru analize profunde (KB chat, audit profil, decizii strategice).
 */
export const MODELS = {
  routine: "claude-sonnet-4-6",
  deep: "claude-opus-4-7",
} as const;

export type ModelTier = keyof typeof MODELS;

let cachedClient: Anthropic | null = null;

/**
 * Returnează clientul Anthropic singleton.
 * Aruncă explicit dacă lipsește ANTHROPIC_API_KEY — facem clar ce trebuie pus în .env.local.
 */
export function getAnthropicClient(): Anthropic {
  if (cachedClient) return cachedClient;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY lipsește din .env.local. " +
        "Generează cheia la https://console.anthropic.com/settings/keys " +
        "și adaug-o în built-ai-command-center/.env.local."
    );
  }

  cachedClient = new Anthropic({ apiKey });
  return cachedClient;
}

/**
 * Construiește blocurile de system pentru un request, optimizate pentru prompt caching.
 *
 * Ordinea blocurilor (importantă — caching e prefix match):
 * 1. Identitate BUILT (fixă, ~500 tokens)         ← cached împreună cu (2)
 * 2. Creierul lui Claudiu (50KB ≈ 13K tokens)     ← cached, marker aici
 * 3. Context specific task-ului (per request)      ← NU se cache-uie
 *
 * Astfel, prefixul (1+2) rămâne identic între request-uri și se servește din cache
 * la 1/10 din cost.
 */
export function buildSystemBlocks(opts: {
  creierJson?: string;
  unifiedContext?: string;
  taskContext?: string;
}): Anthropic.TextBlockParam[] {
  const contextText = opts.unifiedContext
    ? `# Context complet BUILT\n\n${opts.unifiedContext}`
    : `# Creierul lui Claudiu — sursa de adevăr\n\nAcesta este JSON-ul complet cu identitatea, povestea, filosofia, ICP, vocea, dovezile sociale, obiectivele, oferta, liniile roșii și întrebările de calificare ale lui Claudiu. Folosește-l ca bază pentru orice output. Nu inventa fapte care nu sunt aici.\n\n\`\`\`json\n${opts.creierJson ?? ""}\n\`\`\``;

  const blocks: Anthropic.TextBlockParam[] = [
    { type: "text", text: BUILT_IDENTITY_PROMPT },
    { type: "text", text: contextText, cache_control: { type: "ephemeral" } },
  ];

  if (opts.taskContext) {
    blocks.push({ type: "text", text: opts.taskContext });
  }

  return blocks;
}

/**
 * Adună toate sursele de context despre Claudiu într-un singur string.
 * Ordinea: Creier (fundație) → Onboarding (profil live) → Date recente (context curent)
 */
export async function buildUnifiedContext(): Promise<string> {
  const parts: string[] = [];

  // 1. Creierul lui Claudiu — fundația
  try {
    const creier = await readCreierFromFile();
    parts.push(`# CREIERUL LUI CLAUDIU (fundație filozofică + identitate)\n\`\`\`json\n${JSON.stringify(creier, null, 2)}\n\`\`\``);
  } catch {}

  // 2. Onboarding — profilul live completat de Claudiu
  try {
    const supabase = getSupabaseServer();
    const { data: onboarding } = await supabase.from("onboarding").select("*").eq("id", 1).single();
    if (onboarding) {
      const filtered = Object.fromEntries(Object.entries(onboarding).filter(([k, v]) => v && !["id", "created_at", "updated_at"].includes(k)));
      parts.push(`# PROFIL ONBOARDING (date completate de Claudiu)\n${Object.entries(filtered).map(([k, v]) => `- **${k}**: ${v}`).join("\n")}`);
    }
  } catch {}

  // 3. Clienți activi — context real curent
  try {
    const supabase = getSupabaseServer();
    const { data: clients } = await supabase.from("profiles").select("full_name, role, created_at").eq("role", "client").limit(10);
    if (clients && clients.length > 0) {
      parts.push(`# CLIENȚI ACTIVI (${clients.length} clienți)\n${clients.map((c) => `- ${c.full_name}`).join("\n")}`);
    }
  } catch {}

  // 4. Conținut recent generat
  try {
    const supabase = getSupabaseServer();
    const { data: reels } = await supabase.from("reels").select("hook, script, created_at").order("created_at", { ascending: false }).limit(5);
    if (reels && reels.length > 0) {
      parts.push(`# REELS RECENTE (ultimele ${reels.length} generate)\n${reels.map((r, i) => `${i + 1}. Hook: "${r.hook}"`).join("\n")}`);
    }
  } catch {}

  return parts.join("\n\n---\n\n");
}

const BUILT_IDENTITY_PROMPT = `Ești CMO și arhitect de sisteme pentru "Metoda BUILT" — fondată de Iordache Claudiu.

# Reguli inviolabile
1. Vocea autentică a lui Claudiu > orice altceva. Niciodată conținut generic.
2. Scrii exclusiv în română, paragrafe scurte (max 3 rânduri), bold pe cuvintele de impact.
3. Începi direct cu ideea principală. Fără introduceri lungi. Fără concluzii siropoase.
4. Nu folosești NICIODATĂ clișee de fitness ("trage tare", "consistency is key", "transformare totală", etc).
5. Nu vinzi. Diagnostichezi. Nu convingi. Califici.
6. Nu inventezi rezultate sau dovezi sociale care nu există în creier.

# Vocabular BUILT obligatoriu
sistem · arhitectură · reconstrucție · protocol · piloni · execuție · diagnostic

# Cei 5 piloni BUILT
- B: Base Strength (forță compusă)
- U: Unbreakable Capacity (rezistență, Zone 2)
- I: Intelligent Fueling (nutriție ca sistem, 80/20)
- L: Lifestyle Integration (integrare în viața reală)
- T: Tough Mindset (psihologie, automatisme)

# Tonul
Direct, matur, structural. Arhitect al corpului, nu majoretă.
Empatic cu situația, tăios cu scuzele.

Înainte de fiecare output, citește creierul și folosește-l ca sursă unică de adevăr.`;
