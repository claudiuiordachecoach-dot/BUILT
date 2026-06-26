"use server";

import { revalidatePath } from "next/cache";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getSupabaseServer } from "@/lib/supabase/server";
import { getUserRole } from "@/lib/supabase/auth-server";
import { sendCheckinReminderToAll, sendPushToClient } from "@/lib/push";
import { buildSystemBlocks, getAnthropicClient, MODELS } from "@/lib/anthropic";
import { readCreierFromSupabase } from "@/lib/creier";
import { shapeExercises, type StrengthExercise } from "@/lib/strength";

export type ClientStatus = "active" | "at_risk" | "completed" | "paused";

export interface Client {
  id: number; name: string; email: string | null;
  start_date: string; objectives: string | null;
  status: ClientStatus; notes: string | null; created_at: string;
  target_weight_kg?: number | null;
  avatar_url?: string | null;
  progress_gallery?: { id: string; label: string; weight_kg: number; photo_url: string; date: string }[];
}

export interface ClientModule {
  id: number;
  client_id: number;
  module_number: number;
  title: string;
  content_html: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CheckIn {
  id: number; client_id: number; week_number: number;
  training_adherence: number; nutrition_adherence: number;
  energy_level: number; mood: number;
  sleep_hours: number | null; hydration_l: number | null; stress_level: number | null;
  notes: string | null; ai_feedback: string | null; created_at: string;
}

export async function listClients(): Promise<Client[]> {
  const s = getSupabaseServer();
  const { data, error } = await s.from("clients").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Client[];
}

export async function getClient(id: number): Promise<Client | null> {
  const s = getSupabaseServer();
  const { data } = await s.from("clients").select("*").eq("id", id).maybeSingle();
  return data as Client | null;
}

export async function saveTargetWeight(clientId: number, targetKg: number | null) {
  const s = getSupabaseServer();
  const { error } = await s.from("clients").update({ target_weight_kg: targetKg }).eq("id", clientId);
  if (error) throw new Error(error.message);
}

export async function getClientCheckins(clientId: number): Promise<CheckIn[]> {
  const s = getSupabaseServer();
  const { data, error } = await s.from("client_checkins").select("*").eq("client_id", clientId).order("week_number", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as CheckIn[];
}

// ════════════════════════════════════════════════════════════════════
// RETENȚIE — detecție risc (2 niveluri) + intervenție Skill 3
// ════════════════════════════════════════════════════════════════════

export type RiskLevel = "disparut" | "aluneca" | "epuizat" | "atentie" | "ok";

export interface ClientRisk {
  client: Client;
  level: RiskLevel;
  reason: string;
  days_since_checkin: number | null;
}

function daysBetween(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400_000);
}

function computeRisk(client: Client, checkins: CheckIn[]): ClientRisk {
  if (client.status === "completed" || client.status === "paused") {
    return {
      client,
      level: "ok",
      reason: client.status === "completed" ? "Program finalizat" : "În pauză",
      days_since_checkin: null,
    };
  }
  if (checkins.length === 0) {
    return {
      client,
      level: "disparut",
      reason: "Niciun check-in încă — pornește ritualul / re-engage",
      days_since_checkin: null,
    };
  }
  const latest = checkins[0]; // ordonat week desc → cel mai recent
  const days = daysBetween(latest.created_at);

  if (days >= 9) {
    return { client, level: "disparut", reason: `${days} zile fără check-in — a sărit ciclul`, days_since_checkin: days };
  }

  const minAdh = Math.min(latest.training_adherence ?? 100, latest.nutrition_adherence ?? 100);
  let avgPrev: number | null = null;
  if (checkins.length >= 2) {
    const prev = checkins.slice(1);
    avgPrev =
      prev.reduce((s, c) => s + Math.min(c.training_adherence ?? 100, c.nutrition_adherence ?? 100), 0) / prev.length;
  }
  if (minAdh < 60 || (avgPrev != null && minAdh < avgPrev * 0.75)) {
    return {
      client,
      level: "aluneca",
      reason: `Aderență scăzută: ${latest.training_adherence}% antrenament / ${latest.nutrition_adherence}% nutriție`,
      days_since_checkin: days,
    };
  }

  if ((latest.energy_level ?? 10) <= 4 || (latest.mood ?? 10) <= 4) {
    return {
      client,
      level: "epuizat",
      reason: `Energie ${latest.energy_level}/10 · dispoziție ${latest.mood}/10 — semnal de suprasolicitare`,
      days_since_checkin: days,
    };
  }

  if (days >= 7) {
    return { client, level: "atentie", reason: `${days} zile de la ultimul check-in — a ratat fereastra săptămânală`, days_since_checkin: days };
  }

  return { client, level: "ok", reason: "Pe traseu", days_since_checkin: days };
}

const RISK_ORDER: Record<RiskLevel, number> = { disparut: 0, aluneca: 1, epuizat: 1, atentie: 2, ok: 3 };

export async function listClientsWithRisk(): Promise<ClientRisk[]> {
  const clients = await listClients();
  const risks = await Promise.all(clients.map(async (c) => computeRisk(c, await getClientCheckins(c.id))));
  return risks.sort((a, b) => RISK_ORDER[a.level] - RISK_ORDER[b.level]);
}

export async function generateIntervention(
  clientId: number,
): Promise<{ ok: true; data: string } | { ok: false; error: string }> {
  const client = await getClient(clientId);
  if (!client) return { ok: false, error: "Client inexistent." };
  const checkins = await getClientCheckins(clientId);
  const risk = computeRisk(client, checkins);

  const recent =
    checkins
      .slice(0, 3)
      .map(
        (c) =>
          `S${c.week_number}: antrenament ${c.training_adherence}%, nutriție ${c.nutrition_adherence}%, energie ${c.energy_level}/10, dispoziție ${c.mood}/10${c.notes ? `, notă: "${c.notes}"` : ""}`,
      )
      .join("\n") || "fără check-in-uri trimise";

  const task = `# TASK: Mesaj de intervenție de retenție (Skill 3 — Manager de Succes Client)

## Clientul
- Nume: ${client.name}
- Obiective: ${client.objectives ?? "—"}
- Stare detectată: ${risk.level.toUpperCase()} — ${risk.reason}
- Ultimele check-in-uri:
${recent}

## Skill 3 — structura intervenției (urmează EXACT, în ordine)
1. ELIMINĂ VINOVĂȚIA (primul lucru). Niciodată "de ce n-ai trimis check-in?". Reîncadrează: "ce s-a întâmplat nu e un eșec, e un capitol din program pe care îl știam că va veni."
2. DIAGNOSTIC scurt al cauzei (suprasolicitare / demotivare / dorință de renunțare / dispariție), adaptat la starea de mai sus.
3. MVR — Minimum Viable Return: UN singur pas executabil imediat (20 min antrenament / o masă bună / două rânduri de check-in). NU doi pași — unul.
4. Recalibrare scurtă (oferi ajustarea, nu presiunea).
INTERZIS: compensare extremă ("faci 3 ore mâine"), comparații cu alte perioade, așteptarea motivației înainte de primul pas, clișee.

## Scrie
Un singur mesaj (WhatsApp/DM), în vocea lui Claudiu, în română, scurt (max 5-6 rânduri), cald cu situația dar ferm cu sistemul, personalizat la ${client.name} și starea lui reală. Doar mesajul, fără explicații înainte/după.`;

  try {
    const creier = await readCreierFromSupabase();
    const ai = getAnthropicClient();
    const systemBlocks = buildSystemBlocks({ creierJson: JSON.stringify(creier, null, 2), taskContext: task });
    const message = await ai.messages.create({
      model: MODELS.deep,
      max_tokens: 600,
      system: systemBlocks,
      messages: [{ role: "user", content: "Scrie mesajul de intervenție." }],
    });
    const tb = message.content.find((b) => b.type === "text");
    if (!tb || tb.type !== "text") return { ok: false, error: "Răspuns gol." };
    return { ok: true, data: tb.text.trim() };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Eroare." };
  }
}

export type CreateClientResult = { ok: true; id: number } | { ok: false; error: string };

export async function createClient(name: string, startDate: string, objectives: string, email: string): Promise<CreateClientResult> {
  if (!name.trim()) return { ok: false, error: "Numele e obligatoriu." };
  const s = getSupabaseServer();
  const { data, error } = await s.from("clients").insert({ name: name.trim(), email: email || null, start_date: startDate || new Date().toISOString().slice(0,10), objectives: objectives || null, status: "active" }).select("id").single();
  if (error) return { ok: false, error: error.message };
  revalidatePath("/clienti");
  return { ok: true, id: data.id };
}

export interface IntakeRecord {
  answers: Record<string, string>;
  submitted_at: string;
}

/** Răspunsurile Fișei de Start ale clientului (null dacă nu a completat). */
export async function getIntake(clientId: number): Promise<IntakeRecord | null> {
  const s = getSupabaseServer({ useServiceRole: true });
  const { data } = await s
    .from("client_intake")
    .select("answers, submitted_at")
    .eq("client_id", clientId)
    .single();
  return (data as IntakeRecord) ?? null;
}

/** Token-ul de intake al clientului, pentru a construi linkul Fișei de Start. */
export async function getIntakeToken(clientId: number): Promise<string | null> {
  const s = getSupabaseServer({ useServiceRole: true });
  const { data } = await s
    .from("clients")
    .select("intake_token")
    .eq("id", clientId)
    .single();
  return (data?.intake_token as string) ?? null;
}

export type CheckInResult = { ok: true; feedback: string } | { ok: false; error: string };

export async function submitCheckin(clientId: number, data: { week: number; training: number; nutrition: number; energy: number; sleep: number; hydration: number; stress: number; notes: string }): Promise<CheckInResult> {
  const s = getSupabaseServer();
  const client = await getClient(clientId);
  if (!client) return { ok: false, error: "Client negăsit." };

  const avg = (data.training + data.nutrition + data.energy * 10) / 3;
  const newStatus: ClientStatus = avg < 40 ? "at_risk" : client.status === "at_risk" ? "active" : client.status;

  const task = `# TASK: Generează feedback check-in client BUILT

## Client: ${client.name}
## Săptămâna: ${data.week}
## Date check-in:
- Antrenament: ${data.training}% aderență
- Nutriție: ${data.nutrition}% aderență
- Energie: ${data.energy}/10
- Somn: ${data.sleep} ore
- Hidratare: ${data.hydration}L
- Stres: ${data.stress}/10
- Note: "${data.notes || "—"}"

## Obiective client: ${client.objectives || "—"}

## Misiunea ta (Skill 3 — Manager de Succes Client)
${avg < 40
  ? "Client la risc de abandon. Aplică MVR (Minimum Viable Return). Elimini vinovăția, dai UN singur pas mic."
  : avg < 60
  ? "Săptămână sub medie. Validezi progresul, identifici blocajul, recalibrezi."
  : "Săptămână bună. Celebrezi specific, ancorezi comportamentul, anticipezi săptămâna viitoare."
}

Răspunde cu un mesaj scurt (3-5 propoziții) în vocea BUILT. Direct, uman, fără clișee. Fără "felicitări" dacă merge rău.`;

  try {
    const creier = await readCreierFromSupabase();
    const ai = getAnthropicClient();
    const systemBlocks = buildSystemBlocks({ creierJson: JSON.stringify(creier, null, 2), taskContext: task });
    const message = await ai.messages.create({
      model: MODELS.routine, max_tokens: 400, system: systemBlocks,
      messages: [{ role: "user", content: "Generează feedback-ul de check-in. Răspunde direct cu mesajul, fără introducere." }],
    });
    const textBlock = message.content.find((b) => b.type === "text");
    const feedback = textBlock?.type === "text" ? textBlock.text : "Check-in înregistrat.";

    await s.from("client_checkins").insert({ client_id: clientId, week_number: data.week, training_adherence: data.training, nutrition_adherence: data.nutrition, energy_level: data.energy, sleep_hours: data.sleep, hydration_l: data.hydration, stress_level: data.stress, notes: data.notes || null, ai_feedback: feedback });
    await s.from("clients").update({ status: newStatus }).eq("id", clientId);

    revalidatePath(`/clienti/${clientId}`);
    revalidatePath("/clienti");
    return { ok: true, feedback };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Eroare." };
  }
}

export async function updateClientStatus(id: number, status: ClientStatus) {
  const s = getSupabaseServer();
  await s.from("clients").update({ status }).eq("id", id);
  revalidatePath("/clienti");
  revalidatePath(`/clienti/${id}`);
}

export async function deleteCheckin(checkinId: number, clientId: number) {
  const s = getSupabaseServer();
  const { error } = await s.from("client_checkins").delete().eq("id", checkinId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/clienti/${clientId}`);
  return { ok: true };
}

// ── MODULE actions ──

export async function getClientModules(clientId: number): Promise<ClientModule[]> {
  const s = getSupabaseServer();
  const { data, error } = await s.from("client_modules")
    .select("*")
    .eq("client_id", clientId)
    .order("module_number", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as ClientModule[];
}

export async function saveClientModule(clientId: number, moduleData: any) {
  try {
    // Folosim clientul standard (anon) deoarece am dezactivat RLS pe tabelă
    const s = getSupabaseServer();
    
    const payload = {
      title: moduleData.title,
      module_number: Number(moduleData.module_number),
      content_html: moduleData.content_html,
      is_published: !!moduleData.is_published,
      client_id: Number(clientId)
    };

    let result;
    if (moduleData.id) {
      result = await s.from("client_modules")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", moduleData.id);
    } else {
      result = await s.from("client_modules").insert(payload);
    }

    if (result.error) {
      return { ok: false, error: result.error.message };
    }

    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Eroare necunoscută la nivel de server" };
  }
}

export async function deleteClientModule(clientId: number, moduleId: number) {
  const s = getSupabaseServer();
  const { error } = await s.from("client_modules").delete().eq("id", moduleId);
  if (error) throw new Error(error.message);
  revalidatePath(`/clienti/${clientId}`);
}

export type InviteResult = { ok: true } | { ok: false; error: string };

export async function inviteClient(clientId: number): Promise<InviteResult> {
  const client = await getClient(clientId);
  if (!client) return { ok: false, error: "Client negăsit." };
  if (!client.email) return { ok: false, error: "Adaugă mai întâi email-ul clientului." };

  const adminClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://built-ai-command-center.vercel.app";

  const { error } = await adminClient.auth.admin.inviteUserByEmail(client.email, {
    redirectTo: `${appUrl}/client/dashboard`,
    data: { client_id: clientId, name: client.name },
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function generateCheckinFeedbackDraft(
  clientId: number,
  checkin: CheckIn
): Promise<{ ok: boolean; draft?: string; error?: string }> {
  const client = await getClient(clientId);
  if (!client) return { ok: false, error: "Client negăsit." };

  // Istoricul recent — ca feedback-ul să sune ca un coach care-și amintește clientul, nu ca un robot per săptămână.
  const sDb = getSupabaseServer();
  const { data: prior } = await sDb
    .from("client_checkins")
    .select("week_number, training_adherence, nutrition_adherence, energy_level, sleep_hours, stress_level, ai_feedback")
    .eq("client_id", clientId)
    .lt("week_number", checkin.week_number)
    .order("week_number", { ascending: false })
    .limit(3);
  const trend = prior && prior.length
    ? prior.slice().reverse().map((p) => `S${p.week_number}: antren ${p.training_adherence}%, nutr ${p.nutrition_adherence}%, energie ${p.energy_level}/10, stres ${p.stress_level ?? "—"}/10`).join("\n")
    : "Prima săptămână raportată — fără istoric.";
  const lastFb = prior?.[0]?.ai_feedback ? `\n## Ce i-ai spus data trecută (continuă firul, nu repeta):\n"${prior[0].ai_feedback}"` : "";

  const avg = (checkin.training_adherence + checkin.nutrition_adherence + checkin.energy_level * 10) / 3;

  const task = `# TASK: Generează feedback check-in client BUILT

## Client: ${client.name}
## Săptămâna: ${checkin.week_number}
## Date check-in:
- Antrenament: ${checkin.training_adherence}% aderență
- Nutriție: ${checkin.nutrition_adherence}% aderență
- Energie: ${checkin.energy_level}/10
- Somn: ${checkin.sleep_hours ?? "—"} ore
- Hidratare: ${checkin.hydration_l ?? "—"}L
- Stres: ${checkin.stress_level ?? "—"}/10
- Note: "${checkin.notes || "—"}"

## Obiective client: ${client.objectives || "—"}

## Istoric recent (cea mai veche → cea mai nouă):
${trend}${lastFb}

## Misiunea ta (Skill 3 — Manager de Succes Client)
${avg < 40
  ? "Client la risc de abandon. Aplică MVR. Elimini vinovăția, dai UN singur pas mic."
  : avg < 60
  ? "Săptămână sub medie. Validezi progresul, identifici blocajul, recalibrezi."
  : "Săptămână bună. Celebrezi specific, ancorezi comportamentul, anticipezi săptămâna viitoare."
}

Răspunde cu un mesaj scurt (3-5 propoziții) în vocea BUILT. Direct, uman, fără clișee. Dacă există istoric, leagă feedback-ul de evoluție (ce a crescut, ce a scăzut, ce tipar se repetă) — nu trata săptămâna izolat. Numește clientul pe nume o dată.`;

  try {
    const creier = await readCreierFromSupabase();
    const ai = getAnthropicClient();
    const systemBlocks = buildSystemBlocks({ creierJson: JSON.stringify(creier, null, 2), taskContext: task });
    const message = await ai.messages.create({
      model: MODELS.routine,
      max_tokens: 400,
      system: systemBlocks,
      messages: [{ role: "user", content: "Generează feedback-ul de check-in. Răspunde direct cu mesajul, fără introducere." }],
    });
    const textBlock = message.content.find((b) => b.type === "text");
    const draft = textBlock?.type === "text" ? textBlock.text : "Check-in înregistrat.";
    return { ok: true, draft };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Eroare." };
  }
}

export async function saveCheckinFeedback(
  checkinId: number,
  clientId: number,
  feedback: string
): Promise<{ ok: boolean; error?: string }> {
  const s = getSupabaseServer();
  const { error } = await s
    .from("client_checkins")
    .update({ ai_feedback: feedback })
    .eq("id", checkinId);
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/clienti/${clientId}`);
  // Anunță clientul că i-a venit feedback — altfel nu revine să-l citească (bucla moartă).
  sendPushToClient(
    clientId,
    "Feedback nou la check-in",
    "Claudiu ți-a analizat săptămâna. Intră să vezi ce ai de ajustat.",
    "/client/checkin"
  ).catch(() => {});
  revalidatePath("/dashboard/checkins");
  return { ok: true };
}

export interface PendingCheckin {
  id: number;
  clientId: number;
  clientName: string;
  objectives: string | null;
  week: number;
  created_at: string;
  training_adherence: number;
  nutrition_adherence: number;
  energy_level: number;
  sleep_hours: number | null;
  hydration_l: number | null;
  stress_level: number | null;
  notes: string | null;
}

/** Numărul de check-in-uri fără feedback — pentru badge-ul din sidebar. */
export async function getPendingCheckinCount(): Promise<number> {
  const role = await getUserRole().catch(() => null);
  if (role !== "admin") return 0;
  const s = getSupabaseServer({ useServiceRole: true });
  const { count } = await s.from("client_checkins").select("*", { count: "exact", head: true }).is("ai_feedback", null);
  return count ?? 0;
}

/** Toate check-in-urile fără feedback, din toți clienții — coada de răspuns a coach-ului. Cel mai vechi întâi. */
export async function listPendingCheckins(): Promise<PendingCheckin[]> {
  const role = await getUserRole().catch(() => null);
  if (role !== "admin") return [];
  const s = getSupabaseServer({ useServiceRole: true });
  const { data: rows } = await s
    .from("client_checkins")
    .select("id, client_id, week_number, created_at, training_adherence, nutrition_adherence, energy_level, sleep_hours, hydration_l, stress_level, notes")
    .is("ai_feedback", null)
    .order("created_at", { ascending: true });
  if (!rows?.length) return [];
  const ids = [...new Set(rows.map((r) => r.client_id as number))];
  const { data: cls } = await s.from("clients").select("id, name, objectives").in("id", ids);
  const byId = new Map((cls ?? []).map((c) => [c.id as number, c]));
  return rows.map((r) => ({
    id: r.id as number,
    clientId: r.client_id as number,
    clientName: (byId.get(r.client_id as number)?.name as string) ?? String(r.client_id),
    objectives: (byId.get(r.client_id as number)?.objectives as string | null) ?? null,
    week: (r.week_number as number) ?? 0,
    created_at: r.created_at as string,
    training_adherence: r.training_adherence as number,
    nutrition_adherence: r.nutrition_adherence as number,
    energy_level: r.energy_level as number,
    sleep_hours: r.sleep_hours as number | null,
    hydration_l: r.hydration_l as number | null,
    stress_level: r.stress_level as number | null,
    notes: r.notes as string | null,
  }));
}

// ─── Remindere push (check-in) ───────────────────────────────────────────────

export type PushStatus = {
  total: number;
  reachable: number;
  clients: { id: number; name: string; hasPush: boolean }[];
};

/** Cine poate primi push (are cel puțin un abonament). Pentru indicatorul din dashboard. */
export async function getPushStatus(): Promise<PushStatus> {
  const s = getSupabaseServer({ useServiceRole: true });
  const { data: clients } = await s
    .from("clients")
    .select("id, name, status")
    .eq("status", "active")
    .order("id");
  const { data: subs } = await s.from("push_subscriptions").select("client_id");
  const withPush = new Set((subs ?? []).map((x) => x.client_id as number));
  const list = (clients ?? []).map((c) => ({
    id: c.id as number,
    name: (c.name as string) ?? "?",
    hasPush: withPush.has(c.id as number),
  }));
  return { total: list.length, reachable: list.filter((c) => c.hasPush).length, clients: list };
}

/** Trimite acum nudge-ul de check-in către clienții cu notificări active. Doar admin. */
export async function sendCheckinReminderNow(): Promise<
  { ok: true; sent: number; reached: string[]; cleaned: number } | { ok: false; error: string }
> {
  const role = await getUserRole().catch(() => null);
  if (role !== "admin") return { ok: false, error: "Doar adminul poate trimite remindere." };
  try {
    const res = await sendCheckinReminderToAll();
    const s = getSupabaseServer({ useServiceRole: true });
    const { data: clients } = await s.from("clients").select("id, name");
    const nameOf = new Map((clients ?? []).map((c) => [c.id as number, (c.name as string) ?? "?"]));
    const reached = res.reachedClientIds.map((id) => nameOf.get(id) ?? String(id));
    revalidatePath("/dashboard/clients");
    return { ok: true, sent: res.sent, reached, cleaned: res.cleaned };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Eroare la trimitere." };
  }
}

// ─── Numere zilnice (pași/somn/greutate) introduse de client ──────────────────

export type DailyMetricRow = { date: string; steps?: number; sleep_h?: number; weight?: number; waist?: number; note?: string; training_status?: string; training_note?: string };

/** Istoricul numerelor + reflecțiilor zilnice ale unui client (ultimele `days` zile cu conținut). */
export async function getClientDailyMetrics(clientId: number, days = 21): Promise<DailyMetricRow[]> {
  const s = getSupabaseServer({ useServiceRole: true });
  const since = new Date();
  since.setDate(since.getDate() - days);
  const { data } = await s
    .from("daily_logs")
    .select("log_date, items")
    .eq("client_id", clientId)
    .gte("log_date", since.toISOString().slice(0, 10))
    .order("log_date", { ascending: false });
  const num = (v: unknown) => (typeof v === "number" ? v : undefined);
  return (data ?? [])
    .map((d) => {
      const it = (d.items as Record<string, unknown>) ?? {};
      return {
        date: d.log_date as string,
        steps: num(it.steps),
        sleep_h: num(it.sleep_h),
        weight: num(it.weight),
        waist: num(it.waist),
        note: typeof it.note === "string" ? it.note : undefined,
        training_status: typeof it.training_status === "string" ? it.training_status : undefined,
        training_note: typeof it.training_note === "string" ? it.training_note : undefined,
      };
    })
    .filter((r) => r.steps != null || r.sleep_h != null || r.weight != null || r.waist != null || r.note || r.training_status);
}

/* ─── Registru Încasări (doar coach, invizibil pentru clienți) ──────────────
   O singură tabelă client_finance: deal-ul agreat (total + monedă) + plățile
   ca jsonb. Rest = total − suma plăților. */

export interface PaymentEntry {
  id: string;
  amount: number;
  date: string;        // YYYY-MM-DD
  method?: string;     // revolut / cash / transfer
  note?: string;
}

export interface ClientFinance {
  clientId: number;
  total: number;
  currency: string;
  payments: PaymentEntry[];
  note: string | null;
  paid: number;
  rest: number;
}

export interface FinanceRow {
  clientId: number;
  name: string;
  status: ClientStatus;
  total: number;
  currency: string;
  paid: number;
  rest: number;
  lastPaymentDate: string | null;
  paymentsCount: number;
  note: string | null;
}

export interface FinanceOverview {
  rows: FinanceRow[];
  byCurrency: { currency: string; total: number; paid: number; rest: number }[];
  clientsWithRest: number;
  collectedThisMonth: number;
  tableReady: boolean;
}

function parsePayments(v: unknown): PaymentEntry[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => {
    const o = (x ?? {}) as Record<string, unknown>;
    return {
      id: typeof o.id === "string" ? o.id : Math.random().toString(36).slice(2),
      amount: Number(o.amount) || 0,
      date: typeof o.date === "string" ? o.date : "",
      method: typeof o.method === "string" && o.method ? o.method : undefined,
      note: typeof o.note === "string" && o.note ? o.note : undefined,
    };
  });
}

function newPaymentId(): string {
  try {
    return globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
  } catch {
    return Math.random().toString(36).slice(2);
  }
}

function revalidateFinance(clientId?: number) {
  revalidatePath("/dashboard/incasari");
  if (clientId != null) {
    revalidatePath(`/dashboard/clients/${clientId}`);
    revalidatePath(`/clienti/${clientId}`);
  }
}

export async function getClientFinance(clientId: number): Promise<ClientFinance> {
  const s = getSupabaseServer({ useServiceRole: true });
  const { data } = await s.from("client_finance").select("*").eq("client_id", clientId).maybeSingle();
  const row = (data ?? {}) as Record<string, unknown>;
  const payments = parsePayments(row.payments).sort((a, b) => (a.date < b.date ? 1 : -1));
  const total = Number(row.total) || 0;
  const paid = payments.reduce((sum, p) => sum + p.amount, 0);
  return {
    clientId,
    total,
    currency: typeof row.currency === "string" && row.currency ? row.currency : "EUR",
    payments,
    note: typeof row.note === "string" ? row.note : null,
    paid,
    rest: total - paid,
  };
}

export async function setClientDeal(
  clientId: number,
  total: number,
  currency: string,
  note: string | null
): Promise<{ ok: true } | { ok: false; error: string }> {
  const s = getSupabaseServer({ useServiceRole: true });
  const { data: existing } = await s.from("client_finance").select("payments").eq("client_id", clientId).maybeSingle();
  const payments = parsePayments((existing as Record<string, unknown> | null)?.payments);
  const { error } = await s.from("client_finance").upsert(
    {
      client_id: clientId,
      total: Number(total) || 0,
      currency: (currency || "EUR").trim(),
      note: note?.trim() || null,
      payments,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "client_id" }
  );
  if (error) return { ok: false, error: error.message };
  revalidateFinance(clientId);
  return { ok: true };
}

export async function addPayment(
  clientId: number,
  p: { amount: number; date?: string; method?: string; note?: string }
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(Number(p.amount) > 0)) return { ok: false, error: "Suma trebuie să fie mai mare ca 0." };
  const s = getSupabaseServer({ useServiceRole: true });
  const { data: row } = await s.from("client_finance").select("*").eq("client_id", clientId).maybeSingle();
  const r = (row ?? {}) as Record<string, unknown>;
  const payments = parsePayments(r.payments);
  const entry: PaymentEntry = {
    id: newPaymentId(),
    amount: Number(p.amount) || 0,
    date: p.date || new Date().toISOString().slice(0, 10),
    method: p.method?.trim() || undefined,
    note: p.note?.trim() || undefined,
  };
  const { error } = await s.from("client_finance").upsert(
    {
      client_id: clientId,
      total: Number(r.total) || 0,
      currency: typeof r.currency === "string" && r.currency ? r.currency : "EUR",
      note: typeof r.note === "string" ? r.note : null,
      payments: [...payments, entry],
      updated_at: new Date().toISOString(),
    },
    { onConflict: "client_id" }
  );
  if (error) return { ok: false, error: error.message };
  revalidateFinance(clientId);
  return { ok: true };
}

export async function deletePayment(
  clientId: number,
  paymentId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const s = getSupabaseServer({ useServiceRole: true });
  const { data: row } = await s.from("client_finance").select("payments").eq("client_id", clientId).maybeSingle();
  if (!row) return { ok: true };
  const payments = parsePayments((row as Record<string, unknown>).payments).filter((p) => p.id !== paymentId);
  const { error } = await s
    .from("client_finance")
    .update({ payments, updated_at: new Date().toISOString() })
    .eq("client_id", clientId);
  if (error) return { ok: false, error: error.message };
  revalidateFinance(clientId);
  return { ok: true };
}

export async function getFinanceOverview(): Promise<FinanceOverview> {
  const s = getSupabaseServer({ useServiceRole: true });
  const [{ data: clients }, { data: finances, error: finErr }] = await Promise.all([
    s.from("clients").select("id, name, status").order("created_at", { ascending: false }),
    s.from("client_finance").select("*"),
  ]);
  // tabela lipsește (migrația nerulată) → semnal clar în UI, nu pagină goală
  const tableReady = !(finErr && /client_finance|does not exist|relation|42P01/i.test(finErr.message + (finErr.code ?? "")));
  const fmap = new Map<number, Record<string, unknown>>();
  (finances ?? []).forEach((f) => fmap.set(Number((f as Record<string, unknown>).client_id), f as Record<string, unknown>));

  const monthStart = new Date();
  monthStart.setDate(1);
  const monthStartStr = monthStart.toISOString().slice(0, 10);
  let collectedThisMonth = 0;

  const rows: FinanceRow[] = (clients ?? []).map((c) => {
    const cr = c as Record<string, unknown>;
    const f = fmap.get(Number(cr.id));
    const payments = parsePayments(f?.payments);
    const total = Number(f?.total) || 0;
    const paid = payments.reduce((sum, p) => sum + p.amount, 0);
    payments.forEach((p) => {
      if (p.date >= monthStartStr) collectedThisMonth += p.amount;
    });
    const dates = payments.map((p) => p.date).filter(Boolean).sort();
    return {
      clientId: Number(cr.id),
      name: String(cr.name ?? ""),
      status: (cr.status as ClientStatus) ?? "active",
      total,
      currency: typeof f?.currency === "string" && f.currency ? (f.currency as string) : "EUR",
      paid,
      rest: total - paid,
      lastPaymentDate: dates.length ? dates[dates.length - 1] : null,
      paymentsCount: payments.length,
      note: typeof f?.note === "string" ? (f.note as string) : null,
    };
  });

  const cur = new Map<string, { total: number; paid: number; rest: number }>();
  rows.forEach((r) => {
    const g = cur.get(r.currency) ?? { total: 0, paid: 0, rest: 0 };
    g.total += r.total;
    g.paid += r.paid;
    g.rest += r.total - r.paid;
    cur.set(r.currency, g);
  });
  const byCurrency = [...cur.entries()]
    .filter(([, v]) => v.total > 0 || v.paid > 0)
    .map(([currency, v]) => ({ currency, ...v }));

  const clientsWithRest = rows.filter((r) => r.total > 0 && r.rest > 0.001).length;
  return { rows, byCurrency, clientsWithRest, collectedThisMonth, tableReady };
}

/* ─── Jurnal de Forță (coach) ───────────────────────────────────────────────
   Vezi cine crește la forță (dovada Base Strength) și cine stă pe loc. */
export async function getClientStrengthProgress(clientId: number): Promise<StrengthExercise[]> {
  const s = getSupabaseServer({ useServiceRole: true });
  const { data } = await s
    .from("strength_logs")
    .select("*")
    .eq("client_id", clientId)
    .order("logged_on", { ascending: true })
    .order("created_at", { ascending: true });
  return shapeExercises(data ?? []);
}
