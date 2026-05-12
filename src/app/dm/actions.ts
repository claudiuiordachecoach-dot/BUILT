"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import { buildSystemBlocks, getAnthropicClient, MODELS } from "@/lib/anthropic";
import { readCreierFromSupabase } from "@/lib/creier";

export type DMStage =
  | "opener" | "q1" | "q2" | "q3"
  | "call_booked" | "objection" | "post_call"
  | "lost" | "won";

export type ProfileType =
  | "antreprenor_inecat" | "tata_uitat"
  | "profesionista_postburnout" | "skinny_fat" | "unknown";

export interface DMConversation {
  id: number;
  prospect_handle: string;
  profile_type: ProfileType;
  stage: DMStage;
  red_flags: string[];
  last_message_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface DMMessage {
  id: number;
  conversation_id: number;
  direction: "in" | "out";
  content: string;
  created_at: string;
}

export interface AIsuggestion {
  message: string;
  red_flags: string[];
  next_stage: DMStage | null;
  reasoning: string;
}

const STAGE_LABELS: Record<DMStage, string> = {
  opener: "Deschidere",
  q1: "Întrebarea 1 — Unde ești acum?",
  q2: "Întrebarea 2 — Ce te-a oprit?",
  q3: "Întrebarea 3 — Cum arată ziua ideală?",
  call_booked: "Apel rezervat",
  objection: "Obiecție",
  post_call: "Post-apel",
  lost: "Pierdut",
  won: "Client ✅",
};
// Definit local pentru buildDMTask — exportul public e în src/lib/dm-constants.ts

function buildDMTask(conversation: DMConversation, messages: DMMessage[], incomingMessage: string): string {
  const history = messages.map((m) => `[${m.direction === "in" ? "PROSPECT" : "CLAUDIU"}]: ${m.content}`).join("\n");

  return `# TASK: Generează răspunsul DM BUILT

## Contextul conversației
**Prospect:** @${conversation.prospect_handle}
**Profil:** ${conversation.profile_type}
**Stage curent:** ${STAGE_LABELS[conversation.stage]}
**Red flags detectate anterior:** ${conversation.red_flags?.length ? conversation.red_flags.join(", ") : "niciunul"}
**Note:** ${conversation.notes ?? "—"}

## Istoricul conversației
${history || "(conversație nouă)"}

## Mesajul nou primit de la prospect
"${incomingMessage}"

## Misiunea ta
Ești Claudiu Iordache, Hybrid Athlete BUILT. Nu vinzi. Diagnostichezi. Nu convingi. Califici.

Generează răspunsul potrivit pentru stage-ul **${STAGE_LABELS[conversation.stage]}**.

### Reguli stricte:
- Stage OPENER: Prima întrebare = "Ce te-a făcut să comentezi chiar azi?" — niciodată nu vinzi în primul mesaj
- Stage Q1: "Unde ești acum, concret?" — ascultă profilul
- Stage Q2: "Ce te-a oprit până acum? Nu mă refer la timp sau bani..." — dezarmezi apărarea
- Stage Q3: "Dacă în 90 de zile ai fi exact omul pe care ți-l dorești — cum arată ziua ta?" — tensiune pozitivă
- Stage CALL_BOOKED: confirmă detaliile apelului, pregătești terenul
- Stage OBJECTION: Validare → Adâncire → Reîncadrare → Returnare control. NICIODATĂ nu te aperi.
- Ton: direct, cald, fără presiune, fără grabă

### Red flags (dacă detectezi oricare, marchează-le):
- "vreau să slăbesc X kg în Y luni" (expectații nerealiste)
- Răspunsuri monosilabice repetate (lipsă interes real)
- "nu am deloc timp" (obiecție absolută)
- Atacuri sau cinism față de fitness/nutriție

### Follow-up: O singură dată la 24-48h dacă nu răspunde. Dacă nu răspunde după follow-up — NU mai contactezi.

## Format răspuns — JSON strict:
{
  "message": "string — mesajul exact de trimis (max 3 propoziții, ton uman)",
  "red_flags": ["string array — red flags detectate, sau array gol"],
  "next_stage": "opener|q1|q2|q3|call_booked|objection|post_call|lost|won|null (null = rămâi pe același stage)",
  "reasoning": "string — de ce ai ales acest răspuns și acest stage (intern, nu se trimite)"
}`;
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  if (trimmed.startsWith("{")) return JSON.parse(trimmed);
  const fenced = trimmed.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  if (fenced) return JSON.parse(fenced[1]);
  const a = trimmed.indexOf("{"), b = trimmed.lastIndexOf("}");
  if (a !== -1 && b > a) return JSON.parse(trimmed.slice(a, b + 1));
  throw new Error("Nu am găsit JSON.");
}

// ── Queries ──────────────────────────────────────────────────────────────────

export async function listConversations(): Promise<DMConversation[]> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase.from("dm_conversations")
    .select("*").order("last_message_at", { ascending: false, nullsFirst: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as DMConversation[];
}

export async function getConversation(id: number): Promise<DMConversation | null> {
  const supabase = getSupabaseServer();
  const { data } = await supabase.from("dm_conversations").select("*").eq("id", id).maybeSingle();
  return data as DMConversation | null;
}

export async function getMessages(conversationId: number): Promise<DMMessage[]> {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase.from("dm_messages")
    .select("*").eq("conversation_id", conversationId).order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as DMMessage[];
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export type CreateResult = { ok: true; id: number } | { ok: false; error: string };

export async function createConversation(handle: string): Promise<CreateResult> {
  const h = handle.trim().replace(/^@/, "");
  if (!h) return { ok: false, error: "Handle-ul nu poate fi gol." };
  const supabase = getSupabaseServer();
  const { data, error } = await supabase.from("dm_conversations")
    .insert({ prospect_handle: h, profile_type: "unknown", stage: "opener", red_flags: [] })
    .select("id").single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dm");
  return { ok: true, id: data.id };
}

export type SendResult = { ok: true } | { ok: false; error: string };

export async function addMessage(conversationId: number, direction: "in" | "out", content: string): Promise<SendResult> {
  const trimmed = content.trim();
  if (!trimmed) return { ok: false, error: "Mesajul nu poate fi gol." };
  const supabase = getSupabaseServer();
  const { error } = await supabase.from("dm_messages")
    .insert({ conversation_id: conversationId, direction, content: trimmed });
  if (error) return { ok: false, error: error.message };
  await supabase.from("dm_conversations").update({ last_message_at: new Date().toISOString() }).eq("id", conversationId);
  revalidatePath(`/dm/${conversationId}`);
  return { ok: true };
}

export type SuggestResult = { ok: true; suggestion: AIsuggestion } | { ok: false; error: string };

export async function generateDMResponse(conversationId: number, incomingMessage: string): Promise<SuggestResult> {
  const trimmed = incomingMessage.trim();
  if (!trimmed) return { ok: false, error: "Mesajul primit nu poate fi gol." };

  const supabase = getSupabaseServer();
  const conv = await getConversation(conversationId);
  if (!conv) return { ok: false, error: "Conversație negăsită." };
  const messages = await getMessages(conversationId);

  try {
    const creier = await readCreierFromSupabase();
    const client = getAnthropicClient();
    const systemBlocks = buildSystemBlocks({ creierJson: JSON.stringify(creier, null, 2), taskContext: buildDMTask(conv, messages, trimmed) });

    const message = await client.messages.create({
      model: MODELS.routine,
      max_tokens: 800,
      system: systemBlocks,
      messages: [{ role: "user", content: `Generează răspunsul pentru mesajul: "${trimmed}". JSON strict.` }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") return { ok: false, error: "Răspuns AI fără text." };

    let parsed: unknown;
    try { parsed = extractJson(textBlock.text); }
    catch (e) { return { ok: false, error: `Parse eșuat: ${e instanceof Error ? e.message : "necunoscut"}` }; }

    const p = parsed as Record<string, unknown>;
    const suggestion: AIsuggestion = {
      message: String(p.message ?? ""),
      red_flags: Array.isArray(p.red_flags) ? p.red_flags.map(String) : [],
      next_stage: (p.next_stage as DMStage) ?? null,
      reasoning: String(p.reasoning ?? ""),
    };

    // Auto-save mesajul incoming + update red flags dacă există
    await supabase.from("dm_messages").insert({ conversation_id: conversationId, direction: "in", content: trimmed });
    await supabase.from("dm_conversations").update({
      last_message_at: new Date().toISOString(),
      red_flags: [...(conv.red_flags ?? []), ...suggestion.red_flags].filter((v, i, a) => a.indexOf(v) === i),
    }).eq("id", conversationId);

    revalidatePath(`/dm/${conversationId}`);
    return { ok: true, suggestion };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Eroare necunoscută." };
  }
}

export async function updateStage(conversationId: number, stage: DMStage): Promise<SendResult> {
  const supabase = getSupabaseServer();
  const { error } = await supabase.from("dm_conversations").update({ stage }).eq("id", conversationId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/dm/${conversationId}`);
  revalidatePath("/dm");
  return { ok: true };
}

export async function updateProfile(conversationId: number, profile_type: ProfileType): Promise<SendResult> {
  const supabase = getSupabaseServer();
  const { error } = await supabase.from("dm_conversations").update({ profile_type }).eq("id", conversationId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/dm/${conversationId}`);
  return { ok: true };
}

export async function updateNotes(conversationId: number, notes: string): Promise<SendResult> {
  const supabase = getSupabaseServer();
  const { error } = await supabase.from("dm_conversations").update({ notes }).eq("id", conversationId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/dm/${conversationId}`);
  return { ok: true };
}

