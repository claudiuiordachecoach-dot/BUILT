import "server-only";
import { readCreierFromSupabase } from "@/lib/creier";
import { getSupabaseServer } from "@/lib/supabase/server";

/**
 * Modele BUILT — Groq (tier GRATUIT, fără card, fără billing).
 * routine: Llama 3.1 8B Instant — rapid, task-uri simple/dese.
 * deep: Llama 3.3 70B Versatile — calitate, Remake/DM/audit/intervenții.
 */
export const MODELS = {
  routine: "llama-3.1-8b-instant",
  deep: "llama-3.3-70b-versatile",
} as const;

export type ModelTier = keyof typeof MODELS;

export type TextBlockParam = {
  type: "text";
  text: string;
  cache_control?: { type: "ephemeral" };
};

// ════════════════════════════════════════════════════════════════════
// Shim peste API-ul Gemini, cu aceeași interfață ca Anthropic (.messages.create)
// — astfel nu trebuie atins niciun call site din aplicație.
// ════════════════════════════════════════════════════════════════════

type ImageBlock = { type: "image"; source: { type: "base64"; media_type: string; data: string } };
type AnyBlock = { type?: string; text?: string } | ImageBlock;

type CreateOpts = {
  model: string;
  max_tokens?: number;
  system?: TextBlockParam[] | string;
  // tools / tool_choice acceptate dar IGNORATE (Gemini primește schema ca JSON-in-text)
  tools?: unknown;
  tool_choice?: unknown;
  messages: Array<{ role: string; content: string | AnyBlock[] }>;
};
type Usage = {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens: number;
  cache_read_input_tokens: number;
};
type CreateResult = { content: Array<{ type: "text"; text: string }>; usage: Usage };
export type AIClient = { messages: { create(opts: CreateOpts): Promise<CreateResult> } };

function blockText(content: string | AnyBlock[]): string {
  if (typeof content === "string") return content;
  // Groq (text-only): extragem textul; imaginile (audit) sunt ignorate — audit-ul
  // cade pe contextul text (bio + postări), ceea ce e suficient.
  return content
    .map((b) => ((b as { type?: string }).type === "image" ? "" : ((b as { text?: string }).text ?? "")))
    .filter(Boolean)
    .join("\n");
}

async function groqCreate(opts: CreateOpts): Promise<CreateResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY lipsește din .env.local. " +
        "Ia o cheie GRATUITĂ de la https://console.groq.com/keys (fără card) " +
        "și adaug-o ca GROQ_API_KEY=... în built-ai-command-center/.env.local (și în Vercel).",
    );
  }

  const sysText = Array.isArray(opts.system)
    ? opts.system.map((b) => b.text).join("\n\n")
    : (opts.system ?? "");

  const messages: Array<{ role: string; content: string }> = [];
  if (sysText) messages.push({ role: "system", content: sysText });
  for (const m of opts.messages) {
    messages.push({ role: m.role === "assistant" ? "assistant" : "user", content: blockText(m.content) });
  }

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: opts.model,
      messages,
      max_tokens: opts.max_tokens ?? 2048,
      temperature: 0.8,
    }),
  });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Groq ${res.status}: ${t.slice(0, 400)}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string }; finish_reason?: string }>;
    usage?: { prompt_tokens?: number; completion_tokens?: number };
  };
  const text = data.choices?.[0]?.message?.content ?? "";
  if (!text) {
    const reason = data.choices?.[0]?.finish_reason ?? "necunoscut";
    throw new Error(`Groq a returnat gol (finish_reason: ${reason}).`);
  }
  return {
    content: [{ type: "text", text }],
    usage: {
      input_tokens: data.usage?.prompt_tokens ?? 0,
      output_tokens: data.usage?.completion_tokens ?? 0,
      cache_creation_input_tokens: 0,
      cache_read_input_tokens: 0,
    },
  };
}

let cachedClient: AIClient | null = null;

/**
 * Returnează clientul AI (Groq, tier gratuit) cu interfață compatibilă Anthropic.
 * Numele e păstrat (`getAnthropicClient`) ca să nu atingem call site-urile.
 */
export function getAnthropicClient(): AIClient {
  if (cachedClient) return cachedClient;
  cachedClient = { messages: { create: groqCreate } };
  return cachedClient;
}

export function stripLoneSurrogates(s: string): string {
  return s
    .replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/g, "")
    .replace(/(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, "");
}

/**
 * Construiește blocurile de system pentru un request.
 * 1. Identitate BUILT (fixă) · 2. Creierul lui Claudiu · 3. Context task.
 */
export function buildSystemBlocks(opts: {
  creierJson?: string;
  unifiedContext?: string;
  taskContext?: string;
}): TextBlockParam[] {
  const contextText = opts.unifiedContext
    ? `# Context complet BUILT\n\n${opts.unifiedContext}`
    : `# Creierul lui Claudiu — sursa de adevăr\n\nAcesta este JSON-ul complet cu identitatea, povestea, filosofia, ICP, vocea, dovezile sociale, obiectivele, oferta, liniile roșii și întrebările de calificare ale lui Claudiu. Folosește-l ca bază pentru orice output. Nu inventa fapte care nu sunt aici.\n\n\`\`\`json\n${opts.creierJson ?? ""}\n\`\`\``;

  const blocks: TextBlockParam[] = [
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
    const completedSections = creier.sections.filter((s) => s.status === "completed" && s.data);
    if (completedSections.length > 0) {
      parts.push(`# CREIERUL LUI CLAUDIU (${completedSections.length} secțiuni completate)\n${completedSections.map((s) => `## ${s.title}\n${JSON.stringify(s.data)}`).join("\n\n")}`);
    }
  } catch {}

  // 2. Onboarding — profilul live completat
  try {
    const supabase = getSupabaseServer();
    const { data: onboarding } = await supabase.from("onboarding").select("*").eq("id", 1).single();
    if (onboarding) {
      const filtered = Object.fromEntries(
        Object.entries(onboarding).filter(([k, v]) => v && !["id", "created_at", "updated_at", "ai_niche_summary", "ai_ideal_client_summary"].includes(k)),
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
      parts.push(`# CLIENȚI ACTIVI (${clients.length})\n${clients.map((c) => `- ${c.full_name}`).join("\n")}`);
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
