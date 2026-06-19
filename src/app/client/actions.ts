"use server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getSupabaseAuth, getUserRole } from "@/lib/supabase/auth-server";
import { getSupabaseServer } from "@/lib/supabase/server";
import { sendMessageNotification } from "@/lib/email";
import { sendPushToClient } from "@/lib/push";
import { getSettings, getSetting } from "@/lib/settings";

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
};

const QUICKREF_ANTRENAMENT: Record<number, string> = {
  1: "/quickref/alex-antrenament.html",
  2: "/quickref/letitia-antrenament.html",
  3: "/quickref/george-antrenament.html",
  4: "/quickref/ciprian-antrenament.html",
  5: "/quickref/andrei-antrenament.html",
  6: "/quickref/claudia-antrenament.html",
};

const QUICKREF_ACASA: Record<number, string> = {
  1: "/quickref/general-acasa.html",
  2: "/quickref/general-acasa.html",
  3: "/quickref/general-acasa.html",
  4: "/quickref/general-acasa.html",
  5: "/quickref/general-acasa.html",
  6: "/quickref/general-acasa.html",
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

  const newGallery = currentGallery.filter((entry: any) => entry.id !== entryId);

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
