"use server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getSupabaseAuth, getUserRole } from "@/lib/supabase/auth-server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { sendMessageNotification } from "@/lib/email";
import { sendPushToClient } from "@/lib/push";
import { getSettings, getSetting } from "@/lib/settings";
import { shapeExercises, shapeRecent, type StrengthExercise, type StrengthLogEntry } from "@/lib/strength";

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

export async function getClientId(): Promise<number | null> {
  const supabase = await getSupabaseAuth();
  const { data: { user } } = await supabase.auth.getUser();

  const db = getSupabaseServer();

  if (user) {
    // Clientul logat — cauta dupa auth_user_id
    const { data: linkedClient } = await db
      .from("clients")
      .select("id, status")
      .eq("auth_user_id", user.id)
      .maybeSingle();
    if (linkedClient) {
      if (linkedClient.status && linkedClient.status !== "active") return null;
      return linkedClient.id;
    }
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
    db.from("clients").select("*").eq("id", clientId).single(),
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
  6: "/quickref/claudia-nutritie.html",
  9: "/quickref/andy-nutritie.html",
  12: "/quickref/nelu-nutritie.html",
};

const QUICKREF_ANTRENAMENT: Record<number, string> = {
  1: "/quickref/alex-antrenament.html",
  2: "/quickref/letitia-antrenament.html",
  3: "/quickref/george-antrenament.html",
  4: "/quickref/ciprian-antrenament-v2.html",
  5: "/quickref/andrei-antrenament.html",
  6: "/quickref/claudia-antrenament.html",
  9: "/quickref/andy-antrenament.html",
  11: "/quickref/otilia-antrenament.html",
  12: "/quickref/nelu-antrenament-v2.html",
};

const QUICKREF_ACASA: Record<number, string> = {
  1: "/quickref/general-acasa.html",
  2: "/quickref/general-acasa.html",
  3: "/quickref/general-acasa.html",
  4: "/quickref/general-acasa.html",
  5: "/quickref/general-acasa.html",
  6: "/quickref/general-acasa.html",
  9: "/quickref/general-acasa.html",
  11: "/quickref/general-acasa.html",
  12: "/quickref/nelu-acasa-v2.html",
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

  // Anunță coach-ul — altfel nu știe că a venit un check-in și clientul rămâne fără feedback.
  if (!error) {
    const { data: client } = await db.from("clients").select("name").eq("id", clientId).single();
    const f = formData;
    const summary =
      `Check-in săptămâna ${weekNumber}: antrenament ${f.training_adherence}%, nutriție ${f.nutrition_adherence}%, ` +
      `energie ${f.energy_level}/10, somn ${f.sleep_hours}h, stres ${f.stress_level}/10.` +
      (f.notes ? ` Notă: „${f.notes}”` : "") +
      ` — răspunde-i din fișa clientului.`;
    sendMessageNotification(client?.name ?? "Client", summary).catch(() => {});
  }

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

  // Notificare push către client (silentios, nu blochează)
  (async () => {
    const title = (await getSetting("push_message_title").catch(() => null)) || "Mesaj nou de la Coach";
    await sendPushToClient(
      clientId,
      title,
      content.length > 120 ? content.slice(0, 117) + "..." : content,
      "/client/mesaje"
    );
  })().catch(() => {});
}

// Date publice despre coach (pentru clienți): avatar, nume, bio.
export async function getCoachPublic(): Promise<{ avatar_url: string | null; name: string | null; bio: string | null }> {
  const s = await getSettings(["coach_avatar_url", "coach_name", "coach_bio"]).catch(() => ({} as Record<string, string>));
  return {
    avatar_url: s.coach_avatar_url ?? null,
    name: s.coach_name ?? null,
    bio: s.coach_bio ?? null,
  };
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
  if (!user || !user.email) return;

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  let clientId = user.user_metadata?.client_id as number | undefined;
  
  if (!clientId) {
    // Fallback: caută clientul după email
    const { data: clientByEmail } = await adminClient
      .from("clients")
      .select("id")
      .eq("email", user.email)
      .single();
      
    if (clientByEmail) {
      clientId = clientByEmail.id;
    }
  }

  if (!clientId) return;

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

// ── Progress Gallery Actions ──
export async function saveProgressEntry(clientId: number, entry: { id: string; label: string; weight_kg: number; photo_url: string; date: string }) {
  const db = getSupabaseServer();
  
  // 1. Fetch current gallery
  const { data: client } = await db.from("clients").select("progress_gallery").eq("id", clientId).single();
  const currentGallery = client?.progress_gallery || [];
  
  // 2. Append new entry
  const newGallery = [...currentGallery, entry];
  
  // 3. Update DB
  await db.from("clients").update({ progress_gallery: newGallery }).eq("id", clientId);
}

export async function deleteProgressEntry(clientId: number, entryId: string) {
  const db = getSupabaseServer();

  const { data: client } = await db.from("clients").select("progress_gallery").eq("id", clientId).single();
  const currentGallery = client?.progress_gallery || [];

  const newGallery = currentGallery.filter((entry: { id: string }) => entry.id !== entryId);

  await db.from("clients").update({ progress_gallery: newGallery }).eq("id", clientId);
}

// ── Avatar client ──
export async function saveClientAvatar(clientId: number, url: string) {
  const db = getSupabaseServer();
  await db.from("clients").update({ avatar_url: url }).eq("id", clientId);
}

// ── Avatar coach (app_settings) ──
export async function getCoachAvatar(): Promise<string | null> {
  try {
    const db = getSupabaseServer();
    const { data } = await db
      .from("app_settings")
      .select("value")
      .eq("key", "coach_avatar_url")
      .single();
    return data?.value ?? null;
  } catch {
    return null; // tabelul poate lipsi până rulează DDL-ul
  }
}

export async function saveCoachAvatar(url: string) {
  const db = getSupabaseServer();
  await db
    .from("app_settings")
    .upsert({ key: "coach_avatar_url", value: url, updated_at: new Date().toISOString() });
}

// ── Jaloane (badge-uri) ──
export type Badge = { id: string; label: string; icon: string; earned: boolean; hint?: string };

export async function getClientBadges(clientId: number): Promise<Badge[]> {
  const db = getSupabaseServer();
  const [{ data: client }, { count: checkinCount }, streak] = await Promise.all([
    db.from("clients").select("start_date, progress_gallery").eq("id", clientId).single(),
    db.from("client_checkins").select("id", { count: "exact", head: true }).eq("client_id", clientId),
    getStreak(clientId),
  ]);

  const days = client?.start_date
    ? Math.floor((Date.now() - new Date(client.start_date).getTime()) / 86400000)
    : 0;

  const gallery = (client?.progress_gallery as { weight_kg: number; date: string }[] | undefined) ?? [];
  const sorted = [...gallery].filter((g) => typeof g.weight_kg === "number")
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const lost = sorted.length >= 2 ? sorted[0].weight_kg - sorted[sorted.length - 1].weight_kg : 0;

  const checkins = checkinCount ?? 0;

  return [
    { id: "start", label: "Primul pas", icon: "🚀", earned: true },
    { id: "checkin1", label: "Primul check-in", icon: "✓", earned: checkins >= 1, hint: "Trimite primul check-in" },
    { id: "day7", label: "7 zile", icon: "📅", earned: days >= 7 },
    { id: "day30", label: "30 zile", icon: "🗓️", earned: days >= 30 },
    { id: "day90", label: "90 zile", icon: "🏆", earned: days >= 90 },
    { id: "streak7", label: "Streak 7", icon: "🔥", earned: streak >= 7, hint: "7 zile de execuție la rând" },
    { id: "streak30", label: "Streak 30", icon: "⚡", earned: streak >= 30 },
    { id: "lose5", label: "−5 kg", icon: "💪", earned: lost >= 5, hint: "Adaugă greutatea în Galeria de Progres" },
    { id: "lose10", label: "−10 kg", icon: "🦾", earned: lost >= 10 },
  ];
}

// ── Checklist zilnic ("Azi") ──
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export async function getTodayLog(clientId: number): Promise<Record<string, boolean>> {
  try {
    const db = getSupabaseServer();
    const { data } = await db
      .from("daily_logs")
      .select("items")
      .eq("client_id", clientId)
      .eq("log_date", todayStr())
      .single();
    return (data?.items as Record<string, boolean>) ?? {};
  } catch {
    return {};
  }
}

export async function toggleTodayItem(clientId: number, key: string, value: boolean) {
  const db = getSupabaseServer();
  const date = todayStr();
  const { data: existing } = await db
    .from("daily_logs")
    .select("items")
    .eq("client_id", clientId)
    .eq("log_date", date)
    .single();
  const items = { ...((existing?.items as Record<string, boolean>) ?? {}), [key]: value };
  await db
    .from("daily_logs")
    .upsert({ client_id: clientId, log_date: date, items, updated_at: new Date().toISOString() }, { onConflict: "client_id,log_date" });
}

/** Salvează o valoare numerică zilnică (pași, ore somn, greutate) în items. value null → șterge. */
export async function saveTodayMetric(clientId: number, key: string, value: number | null) {
  const db = getSupabaseServer();
  const date = todayStr();
  const { data: existing } = await db
    .from("daily_logs")
    .select("items")
    .eq("client_id", clientId)
    .eq("log_date", date)
    .single();
  const items: Record<string, unknown> = { ...((existing?.items as Record<string, unknown>) ?? {}) };
  if (value === null || Number.isNaN(value)) delete items[key];
  else items[key] = value;
  await db
    .from("daily_logs")
    .upsert({ client_id: clientId, log_date: date, items, updated_at: new Date().toISOString() }, { onConflict: "client_id,log_date" });
}

/** Valorile numerice de azi (pași/somn/greutate) pentru pre-completarea formularului. */
export async function getTodayMetrics(clientId: number): Promise<Record<string, number | undefined>> {
  try {
    const db = getSupabaseServer();
    const { data } = await db
      .from("daily_logs")
      .select("items")
      .eq("client_id", clientId)
      .eq("log_date", todayStr())
      .single();
    const items = (data?.items as Record<string, unknown>) ?? {};
    const num = (v: unknown) => (typeof v === "number" ? v : undefined);
    return { steps: num(items.steps), sleep_h: num(items.sleep_h), weight: num(items.weight), waist: num(items.waist) };
  } catch {
    return {};
  }
}

export type TrainingStatus = "done" | "skipped" | "other";

/** Marchează antrenamentul de azi: făcut / sărit / altceva (+ notă). Sincronizează și flag-ul `antrenament` (streak/checklist). */
export async function setMyTodayTraining(status: TrainingStatus, note?: string) {
  const clientId = await getClientId();
  if (!clientId) return;
  const db = getSupabaseServer();
  const date = todayStr();
  const { data: existing } = await db.from("daily_logs").select("items").eq("client_id", clientId).eq("log_date", date).single();
  const items: Record<string, unknown> = { ...((existing?.items as Record<string, unknown>) ?? {}) };
  items.training_status = status;
  if (note && note.trim()) items.training_note = note.trim(); else delete items.training_note;
  items.antrenament = status === "done"; // ține checklist-ul/streak-ul în sincron
  await db.from("daily_logs").upsert({ client_id: clientId, log_date: date, items, updated_at: new Date().toISOString() }, { onConflict: "client_id,log_date" });
}

export async function getMyTodayTraining(): Promise<{ status?: TrainingStatus; note?: string }> {
  try {
    const clientId = await getClientId();
    if (!clientId) return {};
    const db = getSupabaseServer();
    const { data } = await db.from("daily_logs").select("items").eq("client_id", clientId).eq("log_date", todayStr()).single();
    const items = (data?.items as Record<string, unknown>) ?? {};
    const s = items.training_status;
    return {
      status: s === "done" || s === "skipped" || s === "other" ? s : undefined,
      note: typeof items.training_note === "string" ? items.training_note : undefined,
    };
  } catch {
    return {};
  }
}

export interface MetricPoint { date: string; weight?: number; waist?: number }

/** Istoricul greutății + taliei din daily_logs — pentru graficul „Evoluția ta". */
export async function getMetricHistory(clientId: number): Promise<{ points: MetricPoint[]; targetWeight: number | null }> {
  try {
    const db = getSupabaseServer();
    const [logsRes, clientRes] = await Promise.all([
      db.from("daily_logs").select("log_date, items").eq("client_id", clientId).order("log_date", { ascending: true }),
      db.from("clients").select("target_weight_kg").eq("id", clientId).single(),
    ]);
    const points: MetricPoint[] = [];
    for (const row of logsRes.data ?? []) {
      const items = (row.items as Record<string, unknown>) ?? {};
      const w = typeof items.weight === "number" ? items.weight : undefined;
      const wa = typeof items.waist === "number" ? items.waist : undefined;
      if (w != null || wa != null) points.push({ date: row.log_date as string, weight: w, waist: wa });
    }
    return { points, targetWeight: (clientRes.data?.target_weight_kg as number | null) ?? null };
  } catch {
    return { points: [], targetWeight: null };
  }
}

/* ─── Raportul săptămânal (client) ──────────────────────────────────────────
   Recompensa care aduce clientul înapoi în app: recap pe 7 zile din datele pe
   care le-a produs deja + UN singur micro-obiectiv pe cel mai slab semnal. */

export interface WeeklyRecapData {
  firstName: string;
  weekNumber: number;
  daysInProgram: number;
  daysLogged: number;
  trainingsDone: number;
  trainingsSkipped: number;
  avgSteps: number | null;
  avgSleep: number | null;
  weightNow: number | null;
  weightDelta: number | null;
  waistNow: number | null;
  waistDelta: number | null;
  targetWeight: number | null;
  streak: number;
  checkinThisWeek: boolean;
  pillars: { B: number; U: number; I: number; L: number; T: number } | null;
  strengthPRs: { exercise: string; weight: number; reps: number; isPR: boolean }[];
  microTarget: { title: string; why: string };
  hasData: boolean;
}

export async function getWeeklyRecap(overrideClientId?: number): Promise<WeeklyRecapData | null> {
  const clientId = overrideClientId ?? (await getClientId());
  if (!clientId) return null;
  const db = getSupabaseServer();

  const since = new Date();
  since.setDate(since.getDate() - 6);
  const sinceStr = since.toISOString().slice(0, 10);

  const [clientRes, weekLogsRes, allLogsRes, checkinRes, strengthRes, streak] = await Promise.all([
    db.from("clients").select("name, start_date, target_weight_kg").eq("id", clientId).single(),
    db.from("daily_logs").select("log_date, items").eq("client_id", clientId).gte("log_date", sinceStr).order("log_date", { ascending: true }),
    db.from("daily_logs").select("log_date, items").eq("client_id", clientId).order("log_date", { ascending: true }),
    db.from("client_checkins").select("created_at, training_adherence, nutrition_adherence, energy_level, sleep_hours, hydration_l, stress_level").eq("client_id", clientId).order("created_at", { ascending: false }).limit(1),
    db.from("strength_logs").select("exercise, weight, reps, logged_on").eq("client_id", clientId).order("logged_on", { ascending: true }),
    getStreak(clientId),
  ]);

  const client = clientRes.data;
  const num = (v: unknown) => (typeof v === "number" ? v : undefined);

  let daysLogged = 0, trainingsDone = 0, trainingsSkipped = 0;
  const steps: number[] = [], sleeps: number[] = [];
  for (const row of weekLogsRes.data ?? []) {
    const it = (row.items as Record<string, unknown>) ?? {};
    if (Object.values(it).some(Boolean)) daysLogged++;
    if (it.training_status === "done" || it.antrenament === true) trainingsDone++;
    else if (it.training_status === "skipped") trainingsSkipped++;
    const s = num(it.steps); if (s != null) steps.push(s);
    const sl = num(it.sleep_h); if (sl != null) sleeps.push(sl);
  }
  const avg = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
  const avgSteps = steps.length ? Math.round(avg(steps)!) : null;
  const avgSleepRaw = avg(sleeps);
  const avgSleep = avgSleepRaw != null ? Math.round(avgSleepRaw * 10) / 10 : null;

  const weights: number[] = [], waists: number[] = [];
  for (const row of allLogsRes.data ?? []) {
    const it = (row.items as Record<string, unknown>) ?? {};
    const w = num(it.weight), wa = num(it.waist);
    if (w != null) weights.push(w);
    if (wa != null) waists.push(wa);
  }
  const round1 = (n: number) => Math.round(n * 10) / 10;
  const weightNow = weights.length ? weights[weights.length - 1] : null;
  const weightDelta = weights.length >= 2 ? round1(weights[weights.length - 1] - weights[0]) : null;
  const waistNow = waists.length ? waists[waists.length - 1] : null;
  const waistDelta = waists.length >= 2 ? round1(waists[waists.length - 1] - waists[0]) : null;

  const lastCheckin = checkinRes.data?.[0];
  const checkinThisWeek = !!lastCheckin && Date.parse(lastCheckin.created_at as string) >= since.getTime();

  const clamp = (n: number) => Math.max(0, Math.min(100, n));
  const pillars = lastCheckin ? {
    B: clamp((lastCheckin.training_adherence as number) ?? 0),
    U: clamp(((lastCheckin.energy_level as number) ?? 0) * 10),
    I: clamp((lastCheckin.nutrition_adherence as number) ?? 0),
    L: clamp(((((lastCheckin.sleep_hours as number) ?? 0) / 8) * 100 + (((lastCheckin.hydration_l as number) ?? 0) / 3) * 100) / 2),
    T: clamp(100 - ((lastCheckin.stress_level as number) ?? 5) * 10),
  } : null;

  const priorMax = new Map<string, number>();
  const weekBest = new Map<string, { weight: number; reps: number }>();
  for (const r of strengthRes.data ?? []) {
    const ex = String(r.exercise), w = Number(r.weight) || 0, reps = Number(r.reps) || 0;
    if (String(r.logged_on) >= sinceStr) {
      const cur = weekBest.get(ex);
      if (!cur || w > cur.weight) weekBest.set(ex, { weight: w, reps });
    } else {
      priorMax.set(ex, Math.max(priorMax.get(ex) ?? 0, w));
    }
  }
  const strengthPRs = [...weekBest.entries()]
    .map(([exercise, b]) => ({ exercise, weight: b.weight, reps: b.reps, isPR: b.weight > (priorMax.get(exercise) ?? 0) }))
    .sort((a, b) => Number(b.isPR) - Number(a.isPR))
    .slice(0, 3);

  const startMs = client?.start_date ? Date.parse((client.start_date as string) + "T12:00:00") : Date.now();
  const daysInProgram = Math.max(1, Math.floor((Date.now() - startMs) / 86400000) + 1);
  const weekNumber = Math.max(1, Math.ceil(daysInProgram / 7));
  const hasData = daysLogged > 0 || !!lastCheckin || weights.length > 0 || strengthPRs.length > 0;

  let microTarget = { title: "Ține ritmul. Un singur lucru, repetat.", why: "Sistemul lucrează când apari constant — nu spectaculos." };
  if (daysLogged < 3) microTarget = { title: "Bifează măcar 3 zile săptămâna viitoare.", why: "Nu cer perfecțiune. Cer prezență. De la 3 zile, sistemul începe să vadă." };
  else if (trainingsDone < 3) microTarget = { title: "Adaugă un antrenament. Unul.", why: "Nu recuperăm tot dintr-o dată. Adăugăm unul peste ce ai. Forța se face în straturi." };
  else if (avgSteps != null && avgSteps < 7000) microTarget = { title: "7.000 de pași pe zi. O plimbare după cină.", why: "Capacitatea (pilonul U) se câștigă în Zona 1 — mers, nu epuizare." };
  else if (avgSleep != null && avgSleep < 7) microTarget = { title: "Culcă-te cu 30 de minute mai devreme.", why: "Sub 7h de somn, stresul urcă și recuperarea se sabotează. E pârghia ascunsă." };
  else if (!checkinThisWeek) microTarget = { title: "Trimite check-in-ul. 2 minute.", why: "Check-in-ul nu e raport pentru mine — e cum recalibrez sistemul pentru tine." };

  return {
    firstName: (client?.name as string | null)?.split(" ")[0] ?? "",
    weekNumber, daysInProgram, daysLogged, trainingsDone, trainingsSkipped,
    avgSteps, avgSleep, weightNow, weightDelta, waistNow, waistDelta,
    targetWeight: (client?.target_weight_kg as number | null) ?? null,
    streak, checkinThisWeek, pillars, strengthPRs, microTarget, hasData,
  };
}

/** Salvează reflecția zilnică (text liber) în items.note. Gol → șterge. */
export async function saveTodayNote(clientId: number, text: string) {
  const db = getSupabaseServer();
  const date = todayStr();
  const { data: existing } = await db
    .from("daily_logs")
    .select("items")
    .eq("client_id", clientId)
    .eq("log_date", date)
    .single();
  const items: Record<string, unknown> = { ...((existing?.items as Record<string, unknown>) ?? {}) };
  const clean = text.trim();
  if (clean === "") delete items.note;
  else items.note = clean.slice(0, 2000);
  await db
    .from("daily_logs")
    .upsert({ client_id: clientId, log_date: date, items, updated_at: new Date().toISOString() }, { onConflict: "client_id,log_date" });
}

/** Reflecția de azi a clientului (pentru pre-completare). */
export async function getTodayNote(clientId: number): Promise<string> {
  try {
    const db = getSupabaseServer();
    const { data } = await db
      .from("daily_logs")
      .select("items")
      .eq("client_id", clientId)
      .eq("log_date", todayStr())
      .single();
    const note = (data?.items as Record<string, unknown>)?.note;
    return typeof note === "string" ? note : "";
  } catch {
    return "";
  }
}

export type TrainingDay = { label: string; date: string; trained: boolean; isToday: boolean; isFuture: boolean };

/** Starea antrenamentelor pe săptămâna curentă (Luni–Duminică) din daily_logs. */
export async function getMyWeekTraining(): Promise<TrainingDay[]> {
  const clientId = await getClientId();
  if (!clientId) return [];
  const today = new Date();
  const dow = (today.getDay() + 6) % 7; // 0 = luni
  const monday = new Date(today);
  monday.setDate(today.getDate() - dow);

  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    dates.push(d.toISOString().slice(0, 10));
  }

  let logged = new Set<string>();
  try {
    const db = getSupabaseServer();
    const { data } = await db
      .from("daily_logs")
      .select("log_date, items")
      .eq("client_id", clientId)
      .gte("log_date", dates[0])
      .lte("log_date", dates[6]);
    logged = new Set(
      (data ?? [])
        .filter((d) => (d.items as Record<string, boolean>)?.antrenament)
        .map((d) => d.log_date as string)
    );
  } catch { /* tabel lipsă până la DDL */ }

  const labels = ["Lun", "Mar", "Mie", "Joi", "Vin", "Sâm", "Dum"];
  const todayStr = today.toISOString().slice(0, 10);
  return dates.map((date, i) => ({
    label: labels[i],
    date,
    trained: logged.has(date),
    isToday: date === todayStr,
    isFuture: date > todayStr,
  }));
}

/** Bifează un item pentru clientul logat (azi). */
export async function toggleMyTodayItem(key: string, value: boolean) {
  const clientId = await getClientId();
  if (!clientId) return;
  await toggleTodayItem(clientId, key, value);
}

/** Numărul de zile consecutive (până azi) cu cel puțin un item bifat. */
export async function getStreak(clientId: number): Promise<number> {
  try {
    const db = getSupabaseServer();
    const { data } = await db
      .from("daily_logs")
      .select("log_date, items")
      .eq("client_id", clientId)
      .order("log_date", { ascending: false })
      .limit(60);
    if (!data || data.length === 0) return 0;

    const hasAny = (it: unknown) =>
      it && typeof it === "object" && Object.values(it as Record<string, boolean>).some(Boolean);

    const logged = new Set(
      data.filter((d) => hasAny(d.items)).map((d) => d.log_date as string)
    );

    let streak = 0;
    const cursor = new Date();
    // permite să nu fi bifat încă azi: pornește de azi, dar dacă azi gol, începe de ieri
    if (!logged.has(cursor.toISOString().slice(0, 10))) {
      cursor.setDate(cursor.getDate() - 1);
    }
    while (logged.has(cursor.toISOString().slice(0, 10))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  } catch {
    return 0;
  }
}

/* ─── Jurnal de Forță (client) ──────────────────────────────────────────────
   Pilonul Base Strength. Clientul notează ce ridică; vede progresia per exercițiu. */

export interface StrengthJournal {
  exercises: StrengthExercise[];
  recent: StrengthLogEntry[];
}

export async function getStrengthJournal(): Promise<StrengthJournal> {
  const clientId = await getClientId();
  if (!clientId) return { exercises: [], recent: [] };
  const db = getSupabaseServer();
  const { data } = await db
    .from("strength_logs")
    .select("*")
    .eq("client_id", clientId)
    .order("logged_on", { ascending: true })
    .order("created_at", { ascending: true });
  const rows = data ?? [];
  return { exercises: shapeExercises(rows), recent: shapeRecent(rows) };
}

export async function logStrengthSet(input: {
  exercise: string;
  weight: number;
  reps?: number;
  sets?: number;
  note?: string;
  date?: string;
}): Promise<{ ok: true; isPR: boolean; best: number } | { ok: false; error: string }> {
  const clientId = await getClientId();
  if (!clientId) return { ok: false, error: "Nu te-am putut identifica." };
  const exercise = (input.exercise || "").trim();
  if (!exercise) return { ok: false, error: "Alege un exercițiu." };
  const weight = Number(input.weight);
  if (!(weight > 0)) return { ok: false, error: "Pune greutatea în kg." };

  const db = getSupabaseServer();
  const { data: prev } = await db
    .from("strength_logs")
    .select("weight")
    .eq("client_id", clientId)
    .eq("exercise", exercise);
  const prevBest = (prev ?? []).reduce((m: number, r: { weight: number | string }) => Math.max(m, Number(r.weight) || 0), 0);

  const { error } = await db.from("strength_logs").insert({
    client_id: clientId,
    exercise,
    weight,
    reps: input.reps != null && input.reps > 0 ? Math.round(input.reps) : null,
    sets: input.sets != null && input.sets > 0 ? Math.round(input.sets) : null,
    logged_on: input.date || new Date().toISOString().slice(0, 10),
    note: input.note?.trim() || null,
  });
  if (error) return { ok: false, error: error.message };
  // PR doar dacă bate un maxim ANTERIOR (nu la primul set logat pe exercițiu)
  const isPR = prevBest > 0 && weight > prevBest;
  return { ok: true, isPR, best: Math.max(prevBest, weight) };
}

export async function deleteStrengthSet(id: string): Promise<{ ok: boolean }> {
  const clientId = await getClientId();
  if (!clientId) return { ok: false };
  const db = getSupabaseServer();
  const { error } = await db.from("strength_logs").delete().eq("id", id).eq("client_id", clientId);
  return { ok: !error };
}

/* ─── Antrenamentul live (sesiune pe zi) ─────────────────────────────────────
   Clientul alege ziua de antrenament, loghează seturi (kg×reps)+pauză per exercițiu,
   salvează sesiunea. Data viitoare la aceeași zi: exercițiile + numerele trecute se
   reportează automat, iar dacă face mai puțin → atenționare de regresie. */

export interface WSet { kg: number; reps: number }
export interface WExercise { name: string; rest?: number; sets: WSet[] }
export interface WorkoutDay { label: string; lastDate: string | null; count: number }
export interface LastSession { logged_on: string; exercises: WExercise[] }

export async function getWorkoutDays(): Promise<WorkoutDay[]> {
  const clientId = await getClientId();
  if (!clientId) return [];
  const db = getSupabaseServer();
  const { data } = await db
    .from("workout_sessions")
    .select("day_label, logged_on")
    .eq("client_id", clientId)
    .order("logged_on", { ascending: false });
  const map = new Map<string, { lastDate: string; count: number }>();
  for (const r of (data ?? []) as { day_label: string; logged_on: string }[]) {
    const cur = map.get(r.day_label);
    if (!cur) map.set(r.day_label, { lastDate: r.logged_on, count: 1 });
    else cur.count++;
  }
  return [...map.entries()].map(([label, v]) => ({ label, lastDate: v.lastDate, count: v.count }));
}

export async function getLastSession(dayLabel: string): Promise<LastSession | null> {
  const clientId = await getClientId();
  if (!clientId) return null;
  const db = getSupabaseServer();
  const { data } = await db
    .from("workout_sessions")
    .select("logged_on, exercises")
    .eq("client_id", clientId)
    .eq("day_label", dayLabel)
    .order("logged_on", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data) return null;
  return { logged_on: data.logged_on as string, exercises: (data.exercises as WExercise[]) ?? [] };
}

export async function saveWorkoutSession(
  dayLabel: string,
  exercises: WExercise[],
  note?: string,
): Promise<{ ok: boolean }> {
  const clientId = await getClientId();
  if (!clientId) return { ok: false };
  const db = getSupabaseServer();
  const clean = exercises
    .map((e) => ({
      name: (e.name || "").trim(),
      rest: typeof e.rest === "number" && e.rest > 0 ? e.rest : undefined,
      sets: (e.sets || [])
        .map((s) => ({ kg: Number(s.kg) || 0, reps: Number(s.reps) || 0 }))
        .filter((s) => s.kg > 0 || s.reps > 0),
    }))
    .filter((e) => e.name && e.sets.length > 0);
  if (clean.length === 0) return { ok: false };
  const { error } = await db.from("workout_sessions").insert({
    client_id: clientId,
    day_label: (dayLabel || "Antrenament").trim(),
    exercises: clean,
    note: note?.trim() || null,
  });
  return { ok: !error };
}

// ── Client Journal Actions ──
export type JournalEntry = {
  id: string;
  type: string;
  label: string | null;
  photo_url: string;
  note: string | null;
  created_at: string;
};

export async function getJournalEntries(overrideClientId?: number): Promise<JournalEntry[]> {
  const clientId = overrideClientId ?? await getClientId();
  if (!clientId) return [];
  const db = getSupabaseServer();
  const { data } = await db.from("client_journal")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function addJournalEntry(entry: { type: string; label?: string; photo_url: string; note?: string }) {
  const clientId = await getClientId();
  if (!clientId) throw new Error("Not auth");
  const db = getSupabaseServer();
  const { error } = await db.from("client_journal").insert({
    client_id: clientId,
    type: entry.type,
    label: entry.label ?? null,
    photo_url: entry.photo_url,
    note: entry.note ?? null
  });
  if (error) console.error("Error adding journal entry:", error);
}

export async function deleteJournalEntry(id: string) {
  const clientId = await getClientId();
  if (!clientId) return;
  const db = getSupabaseServer();
  await db.from("client_journal").delete().eq("id", id).eq("client_id", clientId);
}
