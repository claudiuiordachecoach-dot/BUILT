"use server";
import { getAnthropicClient, MODELS } from "@/lib/anthropic";
import { getSupabaseServer } from "@/lib/supabase/server";

const STAGE_CONTEXT: Record<string, string> = {
  "initial_contact": "Este primul contact. Nu vinde nimic. Pune o singură întrebare care forțează verbalizarea durerii.",
  "follow_up": "A răspuns anterior dar s-a oprit. Un singur mesaj, fără presiune.",
  "booking_call": "E cald. Tranziționezi spre 15 minute de diagnostic. Nu pitch.",
  "objection": "A ridicat o obiecție. Validezi, reîncadrezi, returnezi controlul.",
  "closing": "E în apel sau post-apel. Decizie clară, ferm, fără scuze pentru preț.",
  "post_call": "Post-apel. Follow-up sau gestionezi o decizie amânată.",
};

export async function generateDmReply(opts: {
  theirMessage: string;
  stage: string;
  extraContext?: string;
}) {
  const supabase = getSupabaseServer();
  const { data: creierSections } = await supabase
    .from("creier_sections").select("title, content").eq("status", "completed").order("order_index");
  const creierContext = creierSections?.map(s => `## ${s.title}\n${JSON.stringify(s.content)}`).join('\n\n') ?? "";

  const stageInstruction = STAGE_CONTEXT[opts.stage] ?? "";

  const prompt = `Ești Iordache Claudiu și răspunzi unui mesaj DM pe Instagram.

PROFILUL TĂU (BUILT):
${creierContext}

MESAJUL LOR: "${opts.theirMessage}"

STAGE: ${opts.stage} — ${stageInstruction}

${opts.extraContext ? `CONTEXT EXTRA: ${opts.extraContext}` : ""}

Scrie UN răspuns DM în română. Direct, maxim 3-4 propoziții. Nu vindem — diagnosticăm. Nu convingem — calificăm. Fără emoji excesiv. Ton: matur, sigur pe sine, empatic cu situația dar ferm cu sistemul.`;

  const client = getAnthropicClient();
  const response = await client.messages.create({
    model: MODELS.routine,
    max_tokens: 300,
    messages: [{ role: "user", content: prompt }],
  });

  return response.content[0].type === "text" ? response.content[0].text : "";
}

export async function saveDmTemplate(name: string, content: string) {
  const supabase = getSupabaseServer();
  await supabase.from("dm_templates").upsert({ name, content }, { onConflict: "name" });
}

export async function listDmTemplates() {
  const supabase = getSupabaseServer();
  const { data } = await supabase.from("dm_templates").select("*").order("created_at", { ascending: false });
  return data ?? [];
}

export async function calculateLeadScore(opts: {
  prospect: string;
  stage: string;
  outcome: string;
  recentMessagesCount: number;
}): Promise<{ score: number; temperature: "Cold" | "Warm" | "Hot"; recommendation: string }> {
  // Calcul algoritmic pe baza stadiului și rezultatului
  let baseScore = 30;

  switch (opts.stage) {
    case "initial_contact": baseScore += 10; break;
    case "follow_up": baseScore += 20; break;
    case "objection": baseScore += 25; break;
    case "booking_call": baseScore += 40; break;
    case "closing": baseScore += 50; break;
    case "price_call": baseScore += 45; break;
  }

  if (opts.outcome === "positive") baseScore += 20;
  else if (opts.outcome === "negative") baseScore -= 20;

  // Bonus de interacțiune
  baseScore += Math.min(opts.recentMessagesCount * 3, 15);

  const finalScore = Math.max(10, Math.min(100, baseScore));

  let temperature: "Cold" | "Warm" | "Hot" = "Cold";
  let recommendation = "Continuă nurturing-ul cu conținut de valoare (Pilonul I sau T).";

  if (finalScore >= 75) {
    temperature = "Hot";
    recommendation = "Tranziționează imediat spre apel de diagnostic 15 min. Trimite link de calificare.";
  } else if (finalScore >= 50) {
    temperature = "Warm";
    recommendation = "Adresează durerea specifică și oferă un Lead Magnet sau un video de valoare.";
  }

  return { score: finalScore, temperature, recommendation };
}

export interface DmLog {
  id: string;
  prospect: string;
  stage: string;
  outcome: string;
  notes: string | null;
  score: number | null;
  temperature: string | null;
  recommendation: string | null;
  logged_at: string;
}

export async function saveDmLog(entry: {
  prospect: string;
  stage: string;
  outcome: string;
  notes?: string;
  score?: number;
  temperature?: string;
  recommendation?: string;
}): Promise<{ ok: true; log: DmLog } | { ok: false; error: string }> {
  const supabase = getSupabaseServer({ useServiceRole: true });
  const { data, error } = await supabase
    .from("dm_logs")
    .insert({
      prospect: entry.prospect,
      stage: entry.stage,
      outcome: entry.outcome,
      notes: entry.notes ?? null,
      score: entry.score ?? null,
      temperature: entry.temperature ?? null,
      recommendation: entry.recommendation ?? null,
    })
    .select()
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, log: data as DmLog };
}

export async function listDmLogs(limit = 50): Promise<DmLog[]> {
  const supabase = getSupabaseServer({ useServiceRole: true });
  const { data } = await supabase
    .from("dm_logs")
    .select("*")
    .order("logged_at", { ascending: false })
    .limit(limit);
  return (data ?? []) as DmLog[];
}
