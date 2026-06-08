"use server";

import { revalidatePath } from "next/cache";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getSupabaseServer } from "@/lib/supabase/server";
import { buildSystemBlocks, getAnthropicClient, MODELS } from "@/lib/anthropic";
import { readCreierFromSupabase } from "@/lib/creier";

export type ClientStatus = "active" | "at_risk" | "completed" | "paused";

export interface Client {
  id: number; name: string; email: string | null;
  start_date: string; objectives: string | null;
  status: ClientStatus; notes: string | null; created_at: string;
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

export async function getClientCheckins(clientId: number): Promise<CheckIn[]> {
  const s = getSupabaseServer();
  const { data, error } = await s.from("client_checkins").select("*").eq("client_id", clientId).order("week_number", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as CheckIn[];
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

## Misiunea ta (Skill 3 — Manager de Succes Client)
${avg < 40
  ? "Client la risc de abandon. Aplică MVR. Elimini vinovăția, dai UN singur pas mic."
  : avg < 60
  ? "Săptămână sub medie. Validezi progresul, identifici blocajul, recalibrezi."
  : "Săptămână bună. Celebrezi specific, ancorezi comportamentul, anticipezi săptămâna viitoare."
}

Răspunde cu un mesaj scurt (3-5 propoziții) în vocea BUILT. Direct, uman, fără clișee.`;

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
  return { ok: true };
}
