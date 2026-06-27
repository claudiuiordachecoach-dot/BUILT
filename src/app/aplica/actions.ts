"use server";

import { getSupabaseServer } from "@/lib/supabase/server";
import { buildSystemBlocks, getAnthropicClient, MODELS } from "@/lib/anthropic";
import { readCreierFromSupabase } from "@/lib/creier";

export type Budget = "gata" | "depinde" | "nu";

export interface ApplicationInput {
  name: string;
  contact: string;
  a1: string;
  a2: string;
  a3: string;
  budget: Budget;
}

export type SubmitResult = { ok: true; prospectId: number | null } | { ok: false; error: string };

const BUDGET_LABEL: Record<Budget, string> = {
  gata: "Gata să investească acum (200–700€)",
  depinde: "Depinde de plan și rezultat",
  nu: "Doar se informează deocamdată",
};

// Scor 0–6: buget (cel mai important semnal) + profunzimea răspunsurilor.
function scoreOf(i: ApplicationInput): number {
  let s = 0;
  s += i.budget === "gata" ? 3 : i.budget === "depinde" ? 1 : 0;
  for (const a of [i.a1, i.a2, i.a3]) if ((a ?? "").trim().length >= 25) s += 1;
  return s;
}

function labelOf(score: number): string {
  return score >= 5 ? "HOT" : score >= 3 ? "CALD" : "RECE";
}

// Detecție de profil din răspunsuri — doar pe potriviri clare, altfel îl lasă pe Claudiu.
function detectProfile(i: ApplicationInput): "atlet_blocat" | "ciclist" | null {
  const t = `${i.a1} ${i.a2}`.toLowerCase();
  if (/platou|fac tot|sal[ăa]\b|antren|sportiv|atlet|nu (mai )?scade|în formă/.test(t)) return "atlet_blocat";
  if (/diet|sl[ăa]b|pus la loc|yo-?yo|restric|[țt]inut|înfomet/.test(t)) return "ciclist";
  return null;
}

export async function submitApplication(input: ApplicationInput): Promise<SubmitResult> {
  const name = input.name?.trim();
  const contact = input.contact?.trim();

  if (!name) return { ok: false, error: "Spune-mi cum te cheamă." };
  if (!contact) return { ok: false, error: "Lasă-mi un contact (Instagram, telefon sau email)." };
  if (!input.a1?.trim()) return { ok: false, error: "Răspunde măcar la prima întrebare." };
  if (!input.budget) return { ok: false, error: "Alege o variantă la ultima întrebare." };

  const score = scoreOf(input);
  const label = labelOf(score);
  const today = new Date().toISOString().slice(0, 10);
  const dateRo = new Date().toLocaleDateString("ro-RO", { day: "numeric", month: "long" });

  const notes =
`APLICARE ${dateRo} · scor ${score}/6 · buget: ${BUDGET_LABEL[input.budget]}
Contact: ${contact}

Unde e acum:
${input.a1.trim()}

Ce a încercat / de ce n-a ținut:
${(input.a2 || "—").trim()}

Cum vrea să fie în 90 de zile:
${(input.a3 || "—").trim()}`;

  const row = {
    name,
    profile: detectProfile(input),
    status: "dm",
    next_step: `Aplicare ${label} — deschide conversația: „Ce te-a făcut să aplici chiar azi?”`,
    next_step_date: today,
    notes,
    source: `aplicare web · ${label}`,
  };

  const s = getSupabaseServer({ useServiceRole: true });
  let { data, error } = await s.from("prospects").insert(row).select("id").single();

  // Numele are constrângere UNIQUE — dacă mai există unul la fel, îl discriminăm cu contactul.
  if (error && (error.code === "23505" || /duplicate|unique/i.test(error.message))) {
    const short = contact.replace(/\s+/g, " ").slice(0, 20);
    ({ data, error } = await s.from("prospects").insert({ ...row, name: `${name} · ${short}` }).select("id").single());
  }

  if (error) return { ok: false, error: "Ceva n-a mers la trimitere. Mai încearcă o dată." };
  return { ok: true, prospectId: data?.id ?? null };
}

// ─── Diagnosticul de Arhitectură — valoarea instant care diagnostichează, nu vinde ──
// Prospectul primește, în vocea lui Claudiu, ce pilon e fracturat + bucla care îl ține
// blocat + pasul ratat. „Nu vindem, diagnosticăm" devine produs. AI pe Groq (gratis).

export interface Diagnostic {
  pilon: string;
  fractura: string;
  bucla: string;
  pas: string;
}

export async function generateDiagnostic(
  input: ApplicationInput,
): Promise<{ ok: true; data: Diagnostic } | { ok: false; error: string }> {
  if (!input.a1?.trim()) return { ok: false, error: "Răspunsuri insuficiente." };

  const task = `# TASK: Diagnostic de Arhitectură BUILT (instant, pentru un prospect care tocmai a aplicat)
Citește-i răspunsurile și dă-i un diagnostic SCURT, tăios, personalizat — în vocea lui Claudiu. NU vinzi. Diagnostichezi. Asta e exact filozofia BUILT: „nu vindem, diagnosticăm."

## Răspunsurile lui
1. Unde e acum (corp, energie, greutate): ${input.a1.trim()}
2. Ce a încercat și de ce crede că n-a ținut: ${(input.a2 || "—").trim()}
3. Cum vrea să fie în 90 de zile: ${(input.a3 || "—").trim()}

## Cei 5 piloni BUILT (alege-l pe cel FRACTURAT la el)
- B — Base Strength: forță compusă, progresie logaritmică.
- U — Unbreakable Capacity: rezistență, Zone 2, capacitate cardiovasculară.
- I — Intelligent Fueling: nutriție ca sistem, 80/20, anti-binge.
- L — Lifestyle Integration: integrare cu job, familie, viața reală.
- T — Tough Mindset: psihologie, identitate de om echilibrat (nu de om la dietă).

## Buclele psihologice (folosește-o pe cea care i se potrivește, dacă i se potrivește)
- Capcana Cortizolului: stres → cortizol → grăsime abdominală → mai mult stres. Buclă biologică, nu de caracter.
- Paradoxul Competenței: reușește la orice în afară de corp — tocmai de aceea eșecul fizic doare atât.
- Prețul Invizibilității: nu calculează costul inacțiunii — energie, relație, sănătate erodate zi după zi.

## REGULA DE ADEVĂR (obligatorie)
Citește DOAR ce a scris el. Nu inventa cifre, kilograme, diagnostice medicale sau detalii pe care nu le-a dat. Dacă a scris puțin, lucrează cu puținul — fii precis, nu generic.

## INTERZIS
Clișee („crede în tine", „totul e posibil", „hai că poți"), promisiuni de rezultat, ton de vânzător, complimente goale, majuscule de accentuare, semne de exclamare entuziaste. Ton: matur, structural, calm, direct. Arhitect, nu motivator.

## FORMAT — răspunde DOAR cu cele 4 linii de mai jos, FIX așa. FĂRĂ markdown, FĂRĂ asteriscuri (*), FĂRĂ titluri, fără text înainte sau după. Fiecare linie începe EXACT cu eticheta ei, cu două puncte:
PILON: <numele pilonului fracturat, ex: Capacitate (U)>
FRACTURA: <2-3 fraze: ce e rupt în arhitectura LUI, citindu-i răspunsurile. Specific la el, nu general.>
BUCLA: <2-3 fraze: bucla care îl ține blocat, aplicată pe situația lui concretă.>
PASUL: <1-2 fraze: singurul lucru pe care sistemul lui îl ratează acum. O observație structurală, nu „vino la mine".>

Exemplu de FORMĂ (nu copia conținutul, doar structura celor 4 linii):
PILON: Tough Mindset (T)
FRACTURA: Ai construit disciplină în carieră, dar pe corp îl tratezi ca pe un sprint. De fiecare dată ataci totul deodată și nu lași sistemul să se așeze.
BUCLA: Pornești în forță, ceri perfecțiune, iar la prima săptămână grea cedezi și citești asta ca pe un eșec de caracter — când e doar lipsa unui sistem.
PASUL: Nu-ți lipsește voința. Îți lipsește o arhitectură care nu depinde de ea.`;

  try {
    const creier = await readCreierFromSupabase();
    const ai = getAnthropicClient();
    const systemBlocks = buildSystemBlocks({ creierJson: JSON.stringify(creier, null, 2), taskContext: task });
    const msg = await ai.messages.create({
      model: MODELS.deep,
      max_tokens: 600,
      temperature: 0.5,
      system: systemBlocks,
      messages: [{ role: "user", content: "Scrie diagnosticul." }],
    });
    const tb = msg.content.find((b) => b.type === "text");
    if (!tb || tb.type !== "text") return { ok: false, error: "Răspuns gol." };

    // Parsare tolerantă: Llama scapă markdown („**Pasul:**") și ignoră formatul strict.
    // Curățăm markdown, apoi tăiem pe pozițiile etichetelor, oricum ar fi scrise.
    const clean = tb.text.replace(/[*#`]+/g, "").trim();
    const matches = [...clean.matchAll(/(PILON|FRACTUR[AĂ]|BUCLA|PAS(?:UL)?)\s*:/gi)];
    const data: Diagnostic = { pilon: "", fractura: "", bucla: "", pas: "" };
    for (let i = 0; i < matches.length; i++) {
      const start = (matches[i].index ?? 0) + matches[i][0].length;
      const end = i + 1 < matches.length ? (matches[i + 1].index ?? clean.length) : clean.length;
      const val = clean.slice(start, end).trim().replace(/^["„]+|["”]+$/g, "").trim();
      const key = matches[i][1].toUpperCase();
      if (key.startsWith("PILON")) data.pilon = val;
      else if (key.startsWith("FRACTUR")) data.fractura = val;
      else if (key.startsWith("BUCLA")) data.bucla = val;
      else if (key.startsWith("PAS")) data.pas = val;
    }
    if (!data.fractura && !data.bucla && !data.pas) data.fractura = clean; // fallback total
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Eroare." };
  }
}

// ─── Slot de diagnostic — aplicantul își alege singur ora ─────────────────────
// Rezervarea scrie direct în planul zilei (creier_metadata → appointments), deci
// apare automat în calendarul „Azi" + „Apeluri azi" cu reminder. ZERO tabel nou.

const SLOT_TIMES = ["10:00", "13:00", "17:00", "18:00", "19:00"];
const SLOT_LEAD_MIN = 120; // nu oferi sloturi în următoarele 2 ore

function dailyKey(d: string): string { return `daily_${d}`; }

function prettyRo(d: string): string {
  return new Date(d + "T12:00:00").toLocaleDateString("ro-RO", { weekday: "long", day: "numeric", month: "long" });
}

export interface DaySlots { date: string; label: string; times: string[]; }

export async function getAvailableSlots(): Promise<DaySlots[]> {
  const s = getSupabaseServer({ useServiceRole: true });
  const now = new Date();

  // Următoarele zile lucrătoare (sare duminica), max 5.
  const candidates: string[] = [];
  const cursor = new Date(now);
  for (let i = 0; i < 14 && candidates.length < 5; i++) {
    if (cursor.getDay() !== 0) candidates.push(cursor.toISOString().slice(0, 10));
    cursor.setDate(cursor.getDate() + 1);
  }

  // Orele deja ocupate, dintr-o singură citire.
  const { data } = await s.from("creier_metadata").select("key, value").in("key", candidates.map(dailyKey));
  const takenByDate = new Map<string, Set<string>>();
  for (const row of data ?? []) {
    const d = (row.key as string).replace("daily_", "");
    const appts = ((row.value as { appointments?: { time: string }[] })?.appointments) ?? [];
    takenByDate.set(d, new Set(appts.map((a) => a.time)));
  }

  const todayStr = now.toISOString().slice(0, 10);
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const out: DaySlots[] = [];
  for (const d of candidates) {
    const taken = takenByDate.get(d) ?? new Set<string>();
    const times = SLOT_TIMES.filter((t) => {
      if (taken.has(t)) return false;
      if (d === todayStr) {
        const [h, m] = t.split(":").map(Number);
        if (h * 60 + m < nowMin + SLOT_LEAD_MIN) return false;
      }
      return true;
    });
    if (times.length) out.push({ date: d, label: prettyRo(d), times });
  }
  return out;
}

export type BookResult = { ok: true; label: string } | { ok: false; error: string };

export async function bookDiagnostic(input: {
  prospectId: number | null; name: string; contact: string; date: string; time: string;
}): Promise<BookResult> {
  if (!input.date || !input.time) return { ok: false, error: "Alege o oră." };
  const s = getSupabaseServer({ useServiceRole: true });
  const key = dailyKey(input.date);

  const { data } = await s.from("creier_metadata").select("value").eq("key", key).single();
  const plan = (data?.value as Record<string, unknown>) ?? null;
  const appts = Array.isArray(plan?.appointments) ? (plan!.appointments as { time: string }[]) : [];

  if (appts.some((a) => a.time === input.time))
    return { ok: false, error: "Slotul tocmai a fost ocupat. Alege altul." };

  const appt = {
    id: `apl_${Date.now()}`, time: input.time, duration: 30,
    name: input.name, phone: input.contact, email: "",
    notes: "Apel de diagnostic — programat din aplicare web", done: false,
  };
  const newPlan = plan
    ? { ...plan, appointments: [...appts, appt] }
    : { date: input.date, top3: ["", "", ""], posts: [], tasks: [], clients: [], appointments: [appt], tomorrow: [], lesson: "", notes: "" };

  const { error } = await s.from("creier_metadata").upsert({ key, value: newPlan });
  if (error) return { ok: false, error: "N-a mers rezervarea. Mai încearcă o dată." };

  if (input.prospectId) {
    await s.from("prospects").update({
      status: "apel_programat",
      next_step: `Apel de diagnostic — ${input.time}`,
      next_step_date: input.date,
      updated_at: new Date().toISOString(),
    }).eq("id", input.prospectId);
  }

  return { ok: true, label: `${prettyRo(input.date)}, ora ${input.time}` };
}
