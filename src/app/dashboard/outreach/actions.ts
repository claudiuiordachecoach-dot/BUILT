"use server";
import Anthropic from "@anthropic-ai/sdk";
import { getSupabaseServer } from "@/lib/supabase/server";

const anthropic = new Anthropic();

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

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
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
