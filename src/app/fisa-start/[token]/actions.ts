"use server";

import { getSupabaseServer } from "@/lib/supabase/server";

export type IntakeAnswers = Record<string, string>;

export type SubmitIntakeResult = { ok: true } | { ok: false; error: string };

/** Caută clientul după token-ul de intake. null = link invalid. */
export async function getClientByToken(
  token: string
): Promise<{ id: number; name: string } | null> {
  if (!token) return null;
  const s = getSupabaseServer({ useServiceRole: true });
  const { data } = await s
    .from("clients")
    .select("id, name")
    .eq("intake_token", token)
    .single();
  return data ?? null;
}

/** Salvează (sau actualizează) răspunsurile Fișei de Start pentru clientul cu token-ul dat. */
export async function submitIntake(
  token: string,
  answers: IntakeAnswers
): Promise<SubmitIntakeResult> {
  const client = await getClientByToken(token);
  if (!client) return { ok: false, error: "Link invalid sau expirat." };

  const s = getSupabaseServer({ useServiceRole: true });
  const { error } = await s
    .from("client_intake")
    .upsert(
      { client_id: client.id, answers, submitted_at: new Date().toISOString() },
      { onConflict: "client_id" }
    );

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
