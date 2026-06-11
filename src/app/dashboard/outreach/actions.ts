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

const DM_PLAYBOOK = `# PLAYBOOK BUILT DM-to-Client — urmează-l EXACT
Filosofie: DM = instrument de DIAGNOSTIC, nu de vânzare. Nu vinzi — califici. Nu convingi — diagnostichezi.

## REGULĂ DE AUR — GATING (cea mai importantă): NU propui apelul prematur.
Treci la Faza 4 (apel) DOAR după ce arcul de descoperire e COMPLET: situația e clară + dorința e verbalizată de EL + decalajul e recunoscut (a spus o variantă de "nu știu cum / asta-i problema") + e calificat VERDE. Dacă lipsește oricare → următorul mesaj e următoarea ÎNTREBARE de descoperire, NU apelul. După 2 întrebări NU ești gata de apel — arcul are nevoie de mai multe schimburi. A grăbi puntea = prospectul nu vrea apelul = "nu ține".

## RITM: 1-2 întrebări per mesaj (nu interogatoriu). Arcul se întinde pe mai multe mesaje. Scurt, uman, termini MEREU cu o întrebare.

## FAZA 2 — DESCHIDEREA
Scop: să se simtă om, nu lead. Fără pitch. Folosește numele · referință specifică (comentariu/story/resursă) · scurt (3-4 rânduri) · ZERO link de plată · ZERO ziduri de text. Când răspunde: acceptă → sapă → treci la Faza 3.

## FAZA 3 — DESCOPERIREA (inima — NU o grăbi)
A) Situația curentă: pe rând (1-2/mesaj): rutină, alimentație, antrenament, cea mai mare piedică, ce a încercat, de ce n-a mers.
   Semnale de alarmă: "am încercat tot" → nevoie de SISTEM, nu trucuri · "mănânc puțin / sunt epuizat" → metabolism prăbușit, reconstrucție nu restricție · "nu știu ce greșesc" → nevoie de ochi de expert.
B) Situația dorită (întrebarea magică): "Dacă dăm pe repede-înainte 6 luni și totul merge fix cum vrei — cum arată corpul tău, câte kg, cum te simți?" + follow-up "de ce e important ACUM?".
C) Decalajul: reflectă curent vs dorit CU CUVINTELE LUI + "Ce crezi tu că stă între tine și rezultatul ăsta acum?". Țintă: EL să spună "nu știu cum". ABIA atunci ești copt pentru Faza 4.
Calificare: VERDE (vrea ACUM + problema o rezolvi tu + minte deschisă) → programezi. ROȘU (caută trucuri/pastile · vrea garanții înainte să vorbească · defensiv) → NU intri în apel.

## FAZA 4 — PUNTEA (DOAR după arc complet + verde)
NICIODATĂ preț pe chat. "Pe baza la tot ce mi-ai zis, chiar cred că te pot ajuta. Ai 15-20 min săptămâna asta pentru un scurt apel? Îți arăt exact cum ar arăta sistemul pe situația ta."
DA → "Ce zi: Joi sau Vineri? Dimineața sau seara?" (2 opțiuni), apoi link · "mă mai gândesc" → "Normal. Ce anume vrei să analizezi — momentul, timpul, altceva?" · "nu-s pregătit" → "Zero presiune. Cum arată 'pregătit' pentru tine?".

## FAZA 5 — CONFIRMARE & ANTI-NO-SHOW (după ce acceptă apelul — AICI se pierde jumătate din apeluri)
După ce alege ziua, NU dispari:
- Confirmare imediată: rezumi în cuvintele LUI de ce facem apelul + ce pregătește el (ex. "vino cu greutatea de azi și o zi tipică de mâncare").
- Reminder cu 1 zi înainte: "Mâine la [oră] ne auzim. Pregătește [1 lucru concret]. Confirmă-mi cu un OK."
- Dacă nu confirmă → un singur mesaj scurt, nu insistent.
Scopul: să vină PREGĂTIT, nu doar să vină.

## OBIECȚII — FRAMEWORK CAR (din N2): Calibrează → Articulează → Returnează.
C: etichetezi emoția înainte să răspunzi faptic ("Sună ca și cum...", "S-ar putea să fi existat o oboseală de a..."). NU argumenta.
A: reîncadrezi în termenii tăi — prețul devine COST AL INACȚIUNII, timpul devine LIPSĂ DE SISTEM, eșecul anterior devine PROBLEMĂ DE METODĂ.
R: închizi cu o ÎNTREBARE care pune decizia înapoi la el, nu cu o afirmație.
Categorii: Preț / Timp / Încredere / Capacitate / Context. Ton:
- "500 e mult" → "E semn bun că te oprești aici. Întrebarea corectă nu e dacă 500 e mult, ci ce te-a costat ultimul an fără un sistem. [R:] Cât te-a costat 2025, în cifre reci?"
- "Mă mai gândesc" → "Are sens. O parte vrea, o parte nu e sigură ce ar opri decizia. [R:] Ce anume te face să nu fii sigur — concret, nu varianta politicoasă?"
- "Nu am timp" → "BUILT e construit pentru tine, nu în pofida ta — Pilonul L pleacă de la 3 zile haotice. Protocol de Urgență = 20 min. [R:] Ai 20 de minute în 3 zile din 7?"
Preț: 500 EUR ferm, fără reduceri (reducerea atrage cea mai slabă execuție), fără excepții.

## FOLLOW-UP: o singură re-invitație, FĂRĂ urgență falsă. "Salut [Nume], mă gândeam la tine — mai e [obiectivul] activ pentru tine acum?" NU inventa "locuri eliberate" dacă nu e adevărat (încalcă regula BUILT de zero urgență artificială).

## Voce: română, direct, matur, structural. Empatic cu situația, tăios cu scuzele. Fără clișee de fitness. Max 3-4 propoziții per mesaj.`;

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
1. Detectează în ce FAZĂ e conversația (Deschidere / Descoperire-Situație / Descoperire-Dorință / Descoperire-Decalaj / Punte / Confirmare-AntiNoShow / Obiecție / Follow-up).
2. APLICĂ GATING-ul: dacă ești încă în Descoperire și arcul nu e complet (situație + dorință verbalizată + decalaj recunoscut + verde), următorul mesaj e o ÎNTREBARE de descoperire — NU propui apelul. Nu sări la punte după 2 întrebări.
3. Scrie URMĂTORUL mesaj de trimis, EXACT pe playbook, în vocea BUILT. Termină cu o întrebare.
4. Dă un SEMNAL: lumină verde / steag roșu / semnal de alarmă relevant (din playbook), sau "ok, continuă — încă în descoperire".
5. Spune pe scurt CE URMĂREȘTI cu mesajul ăsta.

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
