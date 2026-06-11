"use server";
import { buildSystemBlocks, getAnthropicClient, MODELS } from "@/lib/anthropic";
import { readCreierFromSupabase } from "@/lib/creier";
import { getSupabaseServer } from "@/lib/supabase/server";

// ════════════════════════════════════════════════════════════════════
// DM CO-PILOT — pe playbook-ul BUILT DM-to-Client (4 faze)
// ════════════════════════════════════════════════════════════════════

export interface DmCopilotResult {
  phase: string;      // faza detectată în funnel
  signal: string;     // lumină verde / steag roșu / semnal de alarmă / ok
  reply: string;      // mesajul de trimis
  next_step: string;  // ce urmărești cu mesajul ăsta
}

const DM_PLAYBOOK = `# PLAYBOOK BUILT DM-to-Client (4 faze) — urmează-l EXACT
Filosofie: DM = instrument de DIAGNOSTIC, nu de vânzare. Nu vinzi — califici. Nu convingi — diagnostichezi.

## FAZA 2 — DESCHIDEREA
Scop: să se simtă om, nu lead. Fără pitch.
Reguli: folosește numele dacă există · referință specifică (comentariu/story/resursă) · TERMINĂ MEREU cu o întrebare · scurt (3-4 rânduri) · ZERO link de plată · ZERO ziduri de text.
Când răspunde: acceptă ce spune → sapă mai adânc → treci la Faza 3.

## FAZA 3 — DESCOPERIREA (inima — aici se câștigă apelul)
A) Situația curentă: 2-3 întrebări (rutină, alimentație, antrenament, cea mai mare piedică, ce a încercat, de ce n-a mers). Nu interoga.
   Semnale de alarmă: "am încercat tot" → nevoie de SISTEM, nu trucuri · "mănânc o salată pe zi / sunt epuizat" → metabolism prăbușit, reconstrucție nu restricție · "nu știu ce greșesc" → nevoie de ochi de expert.
B) Situația dorită (întrebarea magică): "Dacă dăm pe repede-înainte 6 luni și totul merge fix cum vrei — cum arată corpul tău, câte kg, cum te simți?" + follow-up "de ce e important ACUM?" / "cum ți-ar schimba energia la birou/cu copiii?".
C) Decalajul: reflectă curent vs dorit CU CUVINTELE LUI + "Ce crezi tu că stă între tine și rezultatul ăsta acum?". Îl forțează să spună "nu știu cum" → te invită ca expert.
Calificare: VERDE (vrea ACUM + problema o rezolvi tu + minte deschisă) → programezi. ROȘU (caută trucuri/pastile · vrea garanții înainte să vorbească · defensiv) → NU intri în apel.

## FAZA 4 — PUNTEA (invitația la apel)
NICIODATĂ preț pe chat. Inviți la apel 15-20 min: "Pe baza la tot ce mi-ai zis, chiar cred că te pot ajuta. Ai 15-20 min săptămâna asta pentru un scurt apel? Îți arăt exact cum ar arăta sistemul pe situația ta."
Obiecții: DA → "Ce zi: Joi sau Vineri? Dimineața sau seara?" (2 opțiuni), apoi link Calendly · "mă mai gândesc" → "Normal. Ce anume vrei să analizezi — momentul, timpul de alocat, altceva?" · "nu-s pregătit" → "Zero presiune. Cum arată 'pregătit' pentru tine? Ce ar trebui să se schimbe?" · "vreau fără apel" → confirmă + pachet scurt + link.

## FOLLOW-UP: o singură re-invitație (ziua 21): "Știu că nu era timing-ul atunci. Mi s-au eliberat câteva locuri și m-am gândit la tine. Mai e [obiectivul] activ?"

## Voce: română, direct, matur, structural. Empatic cu situația, tăios cu scuzele. Fără clișee de fitness. Maxim 3-4 propoziții per mesaj.`;

export async function dmCopilot(opts: {
  conversation: string;
  extraContext?: string;
}): Promise<{ ok: true; data: DmCopilotResult } | { ok: false; error: string }> {
  if (!opts.conversation.trim()) return { ok: false, error: "Lipește conversația." };

  const task = `${DM_PLAYBOOK}

## CONVERSAȚIA DE PÂNĂ ACUM (prospect ↔ tu)
${opts.conversation.slice(0, 4000)}
${opts.extraContext ? `\n## CONTEXT EXTRA: ${opts.extraContext}` : ""}

## CE FACI ACUM
1. Detectează în ce FAZĂ e conversația (Deschidere / Descoperire-Situație / Descoperire-Dorință / Descoperire-Decalaj / Punte / Obiecție / Follow-up).
2. Scrie URMĂTORUL mesaj de trimis, EXACT pe playbook, în vocea BUILT.
3. Dă un SEMNAL: lumină verde / steag roșu / semnal de alarmă relevant (din playbook), sau "ok, continuă".
4. Spune pe scurt CE URMĂREȘTI cu mesajul ăsta.

JSON strict (FĂRĂ markdown, FĂRĂ text înainte/după):
{"phase":"...","signal":"...","reply":"mesajul de trimis","next_step":"..."}`;

  try {
    const creier = await readCreierFromSupabase();
    const client = getAnthropicClient();
    const systemBlocks = buildSystemBlocks({
      creierJson: JSON.stringify(creier, null, 2),
      taskContext: task,
    });
    const message = await client.messages.create({
      model: MODELS.deep,
      max_tokens: 1200,
      system: systemBlocks,
      messages: [{ role: "user", content: "Generează pasul de DM. JSON strict." }],
    });
    const tb = message.content.find((b) => b.type === "text");
    if (!tb || tb.type !== "text") return { ok: false, error: "Răspuns gol." };
    const t = tb.text.trim();
    const a = t.indexOf("{");
    const b = t.lastIndexOf("}");
    if (a === -1 || b <= a) return { ok: false, error: "JSON invalid." };
    return { ok: true, data: JSON.parse(t.slice(a, b + 1)) as DmCopilotResult };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Eroare." };
  }
}

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
