"use server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getSupabaseAuth, getUserRole } from "@/lib/supabase/auth-server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { sendMessageNotification } from "@/lib/email";

// Seteaza cookie-ul cand admin apasa "View as Client"
export async function setAdminViewClient(clientId: number) {
  const cookieStore = await cookies();
  cookieStore.set("admin_view_client_id", String(clientId), {
    path: "/",
    maxAge: 60 * 60 * 24, // 24 ore
    httpOnly: false,
    sameSite: "lax",
  });
}

async function getClientId(): Promise<number | null> {
  const supabase = await getSupabaseAuth();
  const { data: { user } } = await supabase.auth.getUser();

  const db = getSupabaseServer();

  if (user) {
    // Clientul logat — cauta dupa auth_user_id
    const { data: linkedClient } = await db
      .from("clients")
      .select("id")
      .eq("auth_user_id", user.id)
      .maybeSingle();
    if (linkedClient) return linkedClient.id;
  }

  // Admin sau fara auth — citeste cookie-ul setat de "View as Client"
  const cookieStore = await cookies();
  const cookieClientId = cookieStore.get("admin_view_client_id")?.value;
  if (cookieClientId) return Number(cookieClientId);

  return null;
}

export async function getClientDashboard(overrideClientId?: number) {
  const clientId = overrideClientId ?? await getClientId();
  if (!clientId) return null;
  const db = getSupabaseServer();

  const [
    { data: client },
    { data: latestCheckin },
    { data: workout },
    { data: nutrition },
    { data: unreadMessages },
  ] = await Promise.all([
    db.from("clients").select("name, start_date, status, objectives").eq("id", clientId).single(),
    db.from("client_checkins").select("*").eq("client_id", clientId).order("created_at", { ascending: false }).limit(1).single(),
    db.from("workout_plans").select("*").eq("client_id", clientId).order("week_start", { ascending: false }).limit(1).single(),
    db.from("nutrition_plans").select("*").eq("client_id", clientId).single(),
    db.from("client_messages").select("id").eq("client_id", clientId).eq("sender", "admin").is("read_at", null),
  ]);

  const daysInProgram = client?.start_date
    ? Math.floor((Date.now() - new Date(client.start_date).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return {
    client,
    weekNumber: latestCheckin?.week_number ?? 1,
    daysInProgram,
    latestCheckin,
    workout: workout ?? null,
    nutrition,
    unreadCount: unreadMessages?.length ?? 0,
  };
}

export async function getClientModules() {
  const clientId = await getClientId();
  if (!clientId) return [];
  const db = getSupabaseServer();
  const { data } = await db
    .from("client_modules")
    .select("id, module_number, title, is_published, created_at")
    .eq("client_id", clientId)
    .eq("is_published", true)
    .order("module_number", { ascending: true });
  return data ?? [];
}

export async function getModuleContent(moduleId: number) {
  const clientId = await getClientId();
  if (!clientId) return null;
  const db = getSupabaseServer();
  const { data } = await db
    .from("client_modules")
    .select("*")
    .eq("id", moduleId)
    .eq("client_id", clientId) // Siguranță: doar dacă aparține clientului
    .single();
  return data;
}

export async function getWorkoutPlan() {
  const clientId = await getClientId();
  if (!clientId) return null;
  if (QUICKREF_ANTRENAMENT[clientId]) {
    return {
      quickref_url: QUICKREF_ANTRENAMENT[clientId],
      quickref_acasa_url: QUICKREF_ACASA[clientId] ?? null,
    };
  }
  const db = getSupabaseServer();
  const { data } = await db
    .from("workout_plans")
    .select("*")
    .eq("client_id", clientId)
    .order("week_start", { ascending: false })
    .limit(1)
    .single();
  return data;
}

const QUICKREF_NUTRITIE: Record<number, string> = {
  1: "/quickref/alex-nutritie.html",
  2: "/quickref/letitia-nutritie.html",
  3: "/quickref/george-nutritie.html",
  4: "/quickref/ciprian-nutritie.html",
  5: "/quickref/andrei-nutritie.html",
};

const QUICKREF_ANTRENAMENT: Record<number, string> = {
  1: "/quickref/alex-antrenament.html",
  2: "/quickref/letitia-antrenament.html",
  3: "/quickref/george-antrenament.html",
  4: "/quickref/ciprian-antrenament.html",
  5: "/quickref/andrei-antrenament.html",
};

const QUICKREF_ACASA: Record<number, string> = {
  1: "/quickref/general-acasa.html",
  2: "/quickref/general-acasa.html",
  3: "/quickref/general-acasa.html",
  4: "/quickref/general-acasa.html",
  5: "/quickref/general-acasa.html",
};

export async function getNutritionPlan() {
  const clientId = await getClientId();
  if (!clientId) return null;
  if (QUICKREF_NUTRITIE[clientId]) return { quickref_url: QUICKREF_NUTRITIE[clientId] };
  const db = getSupabaseServer();
  const { data } = await db
    .from("nutrition_plans")
    .select("*")
    .eq("client_id", clientId)
    .single();
  return data;
}

export async function submitCheckin(formData: {
  training_adherence: number;
  nutrition_adherence: number;
  energy_level: number;
  sleep_hours: number;
  hydration_l: number;
  stress_level: number;
  notes: string;
}) {
  const clientId = await getClientId();
  if (!clientId) throw new Error("Client not found");
  const db = getSupabaseServer();

  const { data: lastCheckin } = await db
    .from("client_checkins")
    .select("week_number")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const weekNumber = (lastCheckin?.week_number ?? 0) + 1;
  const { error } = await db.from("client_checkins").insert({
    client_id: clientId,
    week_number: weekNumber,
    ...formData,
  });
  return { error: error?.message, weekNumber };
}

export async function getMessages() {
  const clientId = await getClientId();
  if (!clientId) return [];
  const db = getSupabaseServer();
  const { data } = await db
    .from("client_messages")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: true })
    .limit(50);

  await db.from("client_messages")
    .update({ read_at: new Date().toISOString() })
    .eq("client_id", clientId)
    .eq("sender", "admin")
    .is("read_at", null);

  return data ?? [];
}

export async function sendClientMessage(content: string) {
  const clientId = await getClientId();
  if (!clientId) throw new Error("Client not found");
  const db = getSupabaseServer();

  await db.from("client_messages").insert({
    client_id: clientId,
    sender: "client",
    content,
  });

  // Notificare email către admin (silențios, nu blochează)
  const { data: client } = await db
    .from("clients")
    .select("name")
    .eq("id", clientId)
    .single();
  sendMessageNotification(client?.name ?? "Client", content).catch(() => {});
}

// ── ADMIN actions ──

export async function saveWorkoutPlan(clientId: number, days: Record<string, { name: string; sets: number; reps: string; note?: string }[]>, notes?: string) {
  const db = getSupabaseServer();
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  const weekStartStr = weekStart.toISOString().split("T")[0];

  const { data: existing } = await db
    .from("workout_plans")
    .select("id")
    .eq("client_id", clientId)
    .eq("week_start", weekStartStr)
    .single();

  if (existing?.id) {
    await db.from("workout_plans").update({ days, notes: notes ?? null, updated_at: new Date().toISOString() }).eq("id", existing.id);
  } else {
    await db.from("workout_plans").insert({ client_id: clientId, week_start: weekStartStr, days, notes: notes ?? null });
  }
}

export async function saveNutritionPlan(clientId: number, plan: {
  calories: number; protein_g: number; carbs_g: number; fat_g: number;
  meals: { name: string; foods: string[]; calories?: number; protein_g?: number }[];
  notes?: string;
}) {
  const db = getSupabaseServer();
  const { data: existing } = await db.from("nutrition_plans").select("id").eq("client_id", clientId).single();
  if (existing?.id) {
    await db.from("nutrition_plans").update({ ...plan, updated_at: new Date().toISOString() }).eq("id", existing.id);
  } else {
    await db.from("nutrition_plans").insert({ client_id: clientId, ...plan });
  }
}

export async function sendAdminMessage(clientId: number, content: string) {
  const db = getSupabaseServer();
  await db.from("client_messages").insert({ client_id: clientId, sender: "admin", content });
}

export async function getAdminUnreadCount(): Promise<number> {
  const db = getSupabaseServer();
  const { count } = await db
    .from("client_messages")
    .select("*", { count: "exact", head: true })
    .eq("sender", "client")
    .is("read_at", null);
  return count ?? 0;
}

export async function getUnreadCountPerClient(): Promise<Record<number, number>> {
  const db = getSupabaseServer();
  const { data } = await db
    .from("client_messages")
    .select("client_id")
    .eq("sender", "client")
    .is("read_at", null);
  const counts: Record<number, number> = {};
  for (const row of data ?? []) {
    counts[row.client_id] = (counts[row.client_id] ?? 0) + 1;
  }
  return counts;
}

export async function markClientMessagesRead(clientId: number) {
  const db = getSupabaseServer();
  await db
    .from("client_messages")
    .update({ read_at: new Date().toISOString() })
    .eq("client_id", clientId)
    .eq("sender", "client")
    .is("read_at", null);
}

export async function getClientMessages(clientId: number) {
  const db = getSupabaseServer();
  const { data } = await db
    .from("client_messages")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: true })
    .limit(50);
  return data ?? [];
}

// Leagă auth_user_id la primul login al clientului (invitat via email)
export async function linkAuthToClient(): Promise<void> {
  const supabase = await getSupabaseAuth();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const clientId = user.user_metadata?.client_id as number | undefined;
  if (!clientId) return;

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: existing } = await adminClient
    .from("clients")
    .select("auth_user_id")
    .eq("id", clientId)
    .single();

  if (!existing?.auth_user_id) {
    await adminClient
      .from("clients")
      .update({ auth_user_id: user.id })
      .eq("id", clientId);
  }
}

export type ClientCheckin = {
  id: number;
  week_number: number;
  training_adherence: number;
  nutrition_adherence: number;
  energy_level: number;
  sleep_hours: number | null;
  hydration_l: number | null;
  stress_level: number | null;
  notes: string | null;
  ai_feedback: string | null;
  created_at: string;
};

export async function getClientCheckinsForClient(): Promise<ClientCheckin[]> {
  const clientId = await getClientId();
  if (!clientId) return [];
  const db = getSupabaseServer();
  const { data } = await db
    .from("client_checkins")
    .select("id, week_number, training_adherence, nutrition_adherence, energy_level, sleep_hours, hydration_l, stress_level, notes, ai_feedback, created_at")
    .eq("client_id", clientId)
    .order("week_number", { ascending: true });
  return (data ?? []) as ClientCheckin[];
}
