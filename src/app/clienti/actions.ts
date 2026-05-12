"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServer } from "@/lib/supabase/server";
import { buildSystemBlocks, getAnthropicClient, MODELS } from "@/lib/anthropic";
import { readCreierFromSupabase } from "@/lib/creier";

export type ClientStatus = "active" | "at_risk" | "completed" | "paused";

export interface Client {
  id: number; name: string; email: string | null;
  start_date: string; objectives: string | null;
  status: ClientStatus; notes: string | null; created_at: string;
}

export interface CheckIn {
  id: number; client_id: number; week_number: number;
  training_adherence: number; nutrition_adherence: number;
  energy_level: number; mood: number;
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

export type CheckInResult = { ok: true; feedback: string } | { ok: false; error: string };

export async function submitCheckin(clientId: number, data: { week: number; training: number; nutrition: number; energy: number; mood: number; notes: string }): Promise<CheckInResult> {
  const s = getSupabaseServer();
  const client = await getClient(clientId);
  if (!client) return { ok: false, error: "Client negăsit." };

  const avg = (data.training + data.nutrition + data.energy * 10 + data.mood * 10) / 4;
  const newStatus: ClientStatus = avg < 40 ? "at_risk" : client.status === "at_risk" ? "active" : client.status;

  const task = `# TASK: Generează feedback check-in client BUILT

## Client: ${client.name}
## Săptămâna: ${data.week}
## Date check-in:
- Antrenament: ${data.training}% aderență
- Nutriție: ${data.nutrition}% aderență
- Energie: ${data.energy}/10
- Dispoziție: ${data.mood}/10
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

    await s.from("client_checkins").insert({ client_id: clientId, week_number: data.week, training_adherence: data.training, nutrition_adherence: data.nutrition, energy_level: data.energy, mood: data.mood, notes: data.notes || null, ai_feedback: feedback });
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
