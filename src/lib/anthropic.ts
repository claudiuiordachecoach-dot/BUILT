import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { readCreierFromSupabase } from "@/lib/creier";
import { getSupabaseServer } from "@/lib/supabase/server";

/**
 * Modele BUILT — alocate pe tipul de task.
 * Sonnet 4.6 pentru rutină (reels, stories, DM, analize standard).
 * Opus 4.7 pentru analize profunde (KB chat, audit profil, decizii strategice).
 */
export const MODELS = {
  routine: "claude-haiku-4-5-20251001",
  deep: "claude-sonnet-4-6",
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
/**
 * Elimină surogații Unicode orfani (emoji rupte la mijloc de `.slice()`),
 * care fac request-ul body invalid JSON pentru API-ul Anthropic.
 */
export function stripLoneSurrogates(s: string): string {
  return s
    .replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/g, "")
    .replace(/(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, "");
}

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
    { type: "text", text: stripLoneSurrogates(contextText), cache_control: { type: "ephemeral" } },
  ];

  if (opts.taskContext) {
    blocks.push({ type: "text", text: stripLoneSurrogates(opts.taskContext) });
  }

  return blocks;
}

/**
 * Adună toate sursele de context despre Claudiu într-un singur string.
 * Ordinea: Creier (fundație) → Onboarding (profil live) → Date recente (context curent)
 */
export async function buildUnifiedContext(): Promise<string> {
  const parts: string[] = [];

  // 1. Creierul lui Claudiu din Supabase (sursa de adevăr live)
  try {
    const creier = await readCreierFromSupabase();
    const completedSections = creier.sections.filter(s => s.status === "completed" && s.data);
    if (completedSections.length > 0) {
      parts.push(`# CREIERUL LUI CLAUDIU (${completedSections.length} secțiuni completate)\n${completedSections.map(s => `## ${s.title}\n${JSON.stringify(s.data)}`).join("\n\n")}`);
    }
  } catch {}

  // 2. Onboarding — profilul live completat
  try {
    const supabase = getSupabaseServer();
    const { data: onboarding } = await supabase.from("onboarding").select("*").eq("id", 1).single();
    if (onboarding) {
      const filtered = Object.fromEntries(
        Object.entries(onboarding).filter(([k, v]) => v && !["id", "created_at", "updated_at", "ai_niche_summary", "ai_ideal_client_summary"].includes(k))
      );
      if (Object.keys(filtered).length > 0) {
        parts.push(`# PROFIL ONBOARDING\n${Object.entries(filtered).map(([k, v]) => `- **${k}**: ${v}`).join("\n")}`);
      }
    }
  } catch {}

  // 3. Analytics live — performanța reală a reels-urilor
  try {
    const supabase = getSupabaseServer();
    const { data: reels } = await supabase
      .from("instagram_media")
      .select("caption, views, likes, format_type, posted_at")
      .order("posted_at", { ascending: false })
      .limit(10);
    if (reels && reels.length > 0) {
      const totalViews = reels.reduce((s, r) => s + (r.views ?? 0), 0);
      const topReel = [...reels].sort((a, b) => (b.views ?? 0) - (a.views ?? 0))[0];
      const byFormat: Record<string, number[]> = {};
      for (const r of reels) {
        const f = r.format_type ?? "other";
        byFormat[f] = [...(byFormat[f] ?? []), r.views ?? 0];
      }
      const formatAvg = Object.entries(byFormat).map(([f, vs]) => `${f}: avg ${Math.round(vs.reduce((a, b) => a + b, 0) / vs.length / 1000)}K views`).join(", ");
      parts.push(`# ANALYTICS LIVE (ultimele ${reels.length} reels)\n- Total views: ${Math.round(totalViews / 1000)}K\n- Top reel: "${topReel?.caption?.slice(0, 80)}" — ${Math.round((topReel?.views ?? 0) / 1000)}K views\n- Performanță pe format: ${formatAvg}`);
    }
  } catch {}

  // 4. Clienți activi
  try {
    const supabase = getSupabaseServer();
    const { data: clients } = await supabase.from("profiles").select("full_name").eq("role", "client").limit(10);
    if (clients && clients.length > 0) {
      parts.push(`# CLIENȚI ACTIVI (${clients.length})\n${clients.map(c => `- ${c.full_name}`).join("\n")}`);
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
