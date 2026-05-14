"use server";
import { getSupabaseAuth, getUserRole } from "@/lib/supabase/auth-server";
import { getSupabaseServer } from "@/lib/supabase/server";

async function getClientId(): Promise<number | null> {
  const supabase = await getSupabaseAuth();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  
  const db = getSupabaseServer();
  
  // Încercăm să găsim clientul legat de acest user
  const { data: linkedClient } = await db
    .from("clients")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();
    
  if (linkedClient) return linkedClient.id;

  // Dacă nu e client, dar e admin, îi arătăm primul client ca "Demo"
  const role = await getUserRole();
  if (role === 'admin') {
    const { data: firstClient } = await db
      .from("clients")
      .select("id")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    return firstClient?.id ?? null;
  }

  return null;
}

export async function getClientDashboard() {
  const clientId = await getClientId();
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

export async function getNutritionPlan() {
  const clientId = await getClientId();
  if (!clientId) return null;
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
  mood: number;
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
}

// ── ADMIN actions ──

export async function saveWorkoutPlan(clientId: number, days: Record<string, { name: string; sets: number; reps: string; note?: string }[]>, notes?: string) {
  const role = await getUserRole();
  if (role !== 'admin') throw new Error('Unauthorized');
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
  const role = await getUserRole();
  if (role !== 'admin') throw new Error('Unauthorized');
  const db = getSupabaseServer();
  const { data: existing } = await db.from("nutrition_plans").select("id").eq("client_id", clientId).single();
  if (existing?.id) {
    await db.from("nutrition_plans").update({ ...plan, updated_at: new Date().toISOString() }).eq("id", existing.id);
  } else {
    await db.from("nutrition_plans").insert({ client_id: clientId, ...plan });
  }
}

export async function sendAdminMessage(clientId: number, content: string) {
  const role = await getUserRole();
  if (role !== 'admin') throw new Error('Unauthorized');
  const db = getSupabaseServer();
  await db.from("client_messages").insert({ client_id: clientId, sender: "admin", content });
}

export async function getClientMessages(clientId: number) {
  const role = await getUserRole();
  if (role !== 'admin') throw new Error('Unauthorized');
  const db = getSupabaseServer();
  const { data } = await db
    .from("client_messages")
    .select("*")
    .eq("client_id", clientId)
    .order("created_at", { ascending: true })
    .limit(50);
  return data ?? [];
}
