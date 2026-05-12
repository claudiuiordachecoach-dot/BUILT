# BUILT v2 — Plan 3: Portal Clienți

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans. **Requires Plan 1 completed first.**

**Goal:** Portal complet pentru clienți — login separat, dashboard săptămânal, plan antrenament, plan nutrițional, check-in, mesaje cu Claudiu.

**Architecture:** Toate rutele `/client/*` sunt protejate de middleware (doar rolul `client`). Claudiu editează planurile din `/clienti/[id]`. Datele per client sunt izolate prin `client_id`.

**Tech Stack:** Next.js 16 App Router, Supabase, TypeScript, Tailwind

---

## File Map

- **Create:** `src/app/client/layout.tsx` — layout minimal fără sidebar admin
- **Create:** `src/app/client/dashboard/page.tsx` — overview săptămânal
- **Create:** `src/app/client/antrenamente/page.tsx` — plan antrenament
- **Create:** `src/app/client/nutritie/page.tsx` — plan nutrițional
- **Create:** `src/app/client/checkin/page.tsx` — formular check-in
- **Create:** `src/app/client/mesaje/page.tsx` — chat cu Claudiu
- **Create:** `src/app/client/actions.ts` — toate server actions pentru client portal
- **Modify:** `src/app/clienti/[id]/ClientDetail.tsx` — tabs noi: Plan Antrenament, Plan Nutrițional, Mesaje

---

### Task 1: Client layout + navigation

**Files:**
- Create: `src/app/client/layout.tsx`
- Create: `src/components/ClientNav.tsx`

- [ ] **Step 1: Creează ClientNav.tsx**

```typescript
// src/components/ClientNav.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "./BrandLogo";
import { SignOutButton } from "./SignOutButton";
import { UserDisplay } from "./UserDisplay";

const NAV = [
  { label: "Dashboard", href: "/client/dashboard", icon: "◈" },
  { label: "Antrenamente", href: "/client/antrenamente", icon: "⚡" },
  { label: "Nutriție", href: "/client/nutritie", icon: "◉" },
  { label: "Check-in", href: "/client/checkin", icon: "✓" },
  { label: "Mesaje", href: "/client/mesaje", icon: "◎" },
];

export function ClientNav() {
  const pathname = usePathname();
  return (
    <aside className="w-56 shrink-0 bg-[#111111] border-r border-white/10 flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-white/10">
        <BrandLogo variant="full" showTagline={false} />
        <div className="mt-4"><UserDisplay /></div>
      </div>
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        {NAV.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all ${
                isActive ? 'bg-built-red/15 text-built-red font-medium' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
              }`}>
              <span className="text-[10px]">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-white/10">
        <SignOutButton />
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Creează client/layout.tsx**

```typescript
// src/app/client/layout.tsx
import { ClientNav } from "@/components/ClientNav";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <ClientNav />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
```

---

### Task 2: Client server actions

**Files:**
- Create: `src/app/client/actions.ts`

- [ ] **Step 1: Creează client/actions.ts**

```typescript
// src/app/client/actions.ts
"use server";
import { getSupabaseAuth } from "@/lib/supabase/auth-server";
import { getSupabaseServer } from "@/lib/supabase/server";

async function getClientId(): Promise<number | null> {
  const supabase = await getSupabaseAuth();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const db = getSupabaseServer();
  const { data } = await db
    .from("clients")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();
  return data?.id ?? null;
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

  const weekNumber = latestCheckin?.week_number ?? 1;
  const daysInProgram = client?.start_date
    ? Math.floor((Date.now() - new Date(client.start_date).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return {
    client,
    weekNumber,
    daysInProgram,
    latestCheckin,
    workout: workout?.data ?? null,
    nutrition,
    unreadCount: unreadMessages?.length ?? 0,
  };
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

  // Marchează mesajele admin ca citite
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

// ── ADMIN actions (Claudiu editează planurile) ──

export async function saveWorkoutPlan(clientId: number, days: Record<string, unknown[]>, notes?: string) {
  const db = getSupabaseServer();
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  await db.from("workout_plans").upsert({
    client_id: clientId,
    week_start: weekStart.toISOString().split("T")[0],
    days,
    notes: notes ?? null,
    updated_at: new Date().toISOString(),
  }, { onConflict: "client_id,week_start" } as object);
}

export async function saveNutritionPlan(clientId: number, plan: {
  calories: number; protein_g: number; carbs_g: number; fat_g: number;
  meals: unknown[]; notes?: string;
}) {
  const db = getSupabaseServer();
  await db.from("nutrition_plans").upsert({
    client_id: clientId,
    ...plan,
    updated_at: new Date().toISOString(),
  }, { onConflict: "client_id" } as object);
}

export async function sendAdminMessage(clientId: number, content: string) {
  const db = getSupabaseServer();
  await db.from("client_messages").insert({
    client_id: clientId,
    sender: "admin",
    content,
  });
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
```

---

### Task 3: Client Dashboard

**Files:**
- Create: `src/app/client/dashboard/page.tsx`

- [ ] **Step 1: Creează client/dashboard/page.tsx**

```typescript
// src/app/client/dashboard/page.tsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getClientDashboard } from "../actions";

type DashData = Awaited<ReturnType<typeof getClientDashboard>>;

export default function ClientDashboardPage() {
  const [data, setData] = useState<DashData>(null);
  useEffect(() => { getClientDashboard().then(setData); }, []);

  if (!data) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-built-red border-t-transparent rounded-full animate-spin" /></div>;

  const { client, weekNumber, daysInProgram, latestCheckin, unreadCount } = data;

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Bună, {client?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-zinc-500 mt-1">
          Ziua {daysInProgram} din program · Săptămâna {weekNumber}
        </p>
      </div>

      {/* Progress bar 90 zile */}
      <div className="bg-[#111111] border border-white/10 rounded-xl p-5 mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-zinc-200">Progres program 90 zile</span>
          <span className="text-sm font-bold text-built-red">{Math.min(daysInProgram, 90)}/90 zile</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-built-red rounded-full transition-all"
            style={{ width: `${Math.min((daysInProgram / 90) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-[#111111] border border-white/10 rounded-xl p-4">
          <p className="text-xs text-zinc-500 mb-1">Aderență antrenament</p>
          <p className="text-2xl font-bold text-white">{latestCheckin?.training_adherence ?? "--"}%</p>
          <p className="text-xs text-zinc-600 mt-0.5">Săptămâna trecută</p>
        </div>
        <div className="bg-[#111111] border border-white/10 rounded-xl p-4">
          <p className="text-xs text-zinc-500 mb-1">Aderență nutriție</p>
          <p className="text-2xl font-bold text-white">{latestCheckin?.nutrition_adherence ?? "--"}%</p>
          <p className="text-xs text-zinc-600 mt-0.5">Săptămâna trecută</p>
        </div>
        <div className="bg-[#111111] border border-white/10 rounded-xl p-4">
          <p className="text-xs text-zinc-500 mb-1">Energie</p>
          <p className="text-2xl font-bold text-white">{latestCheckin?.energy_level ?? "--"}<span className="text-sm text-zinc-500">/10</span></p>
        </div>
        <div className="bg-[#111111] border border-white/10 rounded-xl p-4">
          <p className="text-xs text-zinc-500 mb-1">Dispoziție</p>
          <p className="text-2xl font-bold text-white">{latestCheckin?.mood ?? "--"}<span className="text-sm text-zinc-500">/10</span></p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/client/antrenamente"
          className="bg-[#111111] border border-white/10 hover:border-built-red/30 rounded-xl p-4 transition-all group">
          <span className="text-lg mb-2 block">⚡</span>
          <p className="text-sm font-semibold text-zinc-200 group-hover:text-white">Antrenamentul de azi</p>
          <p className="text-xs text-zinc-500 mt-0.5">Vezi planul săptămânii</p>
        </Link>
        <Link href="/client/checkin"
          className="bg-[#111111] border border-white/10 hover:border-built-red/30 rounded-xl p-4 transition-all group">
          <span className="text-lg mb-2 block">✓</span>
          <p className="text-sm font-semibold text-zinc-200 group-hover:text-white">Check-in săptămânal</p>
          <p className="text-xs text-zinc-500 mt-0.5">Trimite raportul săptămânii</p>
        </Link>
        <Link href="/client/nutritie"
          className="bg-[#111111] border border-white/10 hover:border-built-red/30 rounded-xl p-4 transition-all group">
          <span className="text-lg mb-2 block">◉</span>
          <p className="text-sm font-semibold text-zinc-200 group-hover:text-white">Plan nutrițional</p>
          <p className="text-xs text-zinc-500 mt-0.5">Macros + mese zilnice</p>
        </Link>
        <Link href="/client/mesaje"
          className="bg-[#111111] border border-white/10 hover:border-built-red/30 rounded-xl p-4 transition-all group relative">
          <span className="text-lg mb-2 block">◎</span>
          <p className="text-sm font-semibold text-zinc-200 group-hover:text-white">Mesaje</p>
          <p className="text-xs text-zinc-500 mt-0.5">Chat cu Claudiu</p>
          {unreadCount > 0 && (
            <span className="absolute top-3 right-3 w-5 h-5 bg-built-red rounded-full text-[10px] text-white font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Link>
      </div>
    </div>
  );
}
```

---

### Task 4: Client Antrenamente

**Files:**
- Create: `src/app/client/antrenamente/page.tsx`

- [ ] **Step 1: Creează client/antrenamente/page.tsx**

```typescript
// src/app/client/antrenamente/page.tsx
"use client";
import { useState, useEffect } from "react";
import { getWorkoutPlan } from "../actions";

const DAYS = ["Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă", "Duminică"];

type Exercise = { name: string; sets: number; reps: string; note?: string };
type WorkoutPlan = { days: Record<string, Exercise[]>; notes?: string; week_start?: string };

export default function AntrenamantePage() {
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [activeDay, setActiveDay] = useState("Luni");

  useEffect(() => { getWorkoutPlan().then(p => setPlan(p as WorkoutPlan)); }, []);

  if (!plan) return (
    <div className="p-8">
      <h1 className="text-xl font-bold text-white mb-2">Plan Antrenament</h1>
      <p className="text-zinc-500 text-sm">Planul tău nu a fost creat încă. Claudiu îl va pregăti în curând.</p>
    </div>
  );

  const todayExercises: Exercise[] = plan.days?.[activeDay] ?? [];

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">Plan Antrenament</h1>
        {plan.week_start && (
          <p className="text-xs text-zinc-500 mt-1">
            Săptămâna {new Date(plan.week_start).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long' })}
          </p>
        )}
      </div>

      {/* Day selector */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {DAYS.map(day => {
          const hasWorkout = (plan.days?.[day]?.length ?? 0) > 0;
          return (
            <button key={day} onClick={() => setActiveDay(day)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeDay === day
                  ? 'bg-built-red text-white'
                  : hasWorkout
                  ? 'bg-white/10 text-zinc-200 hover:bg-white/15'
                  : 'bg-white/5 text-zinc-600 cursor-default'
              }`}>
              {day}
              {!hasWorkout && <span className="ml-1 text-zinc-700">·</span>}
            </button>
          );
        })}
      </div>

      {/* Exercises */}
      {todayExercises.length === 0 ? (
        <div className="bg-[#111111] border border-white/10 rounded-xl p-6 text-center">
          <p className="text-zinc-500 text-sm">Zi de recuperare 🧘</p>
        </div>
      ) : (
        <div className="space-y-3">
          {todayExercises.map((ex, i) => (
            <div key={i} className="bg-[#111111] border border-white/10 rounded-xl p-4 flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-built-red/10 border border-built-red/20 flex items-center justify-center text-xs font-bold text-built-red shrink-0">
                {i + 1}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-zinc-200">{ex.name}</p>
                <p className="text-xs text-zinc-400 mt-0.5">{ex.sets} seturi × {ex.reps}</p>
                {ex.note && <p className="text-xs text-zinc-600 mt-1 italic">{ex.note}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {plan.notes && (
        <div className="mt-5 bg-[#111111] border border-white/5 rounded-xl p-4">
          <p className="text-xs text-zinc-500 mb-1">Note de la Claudiu</p>
          <p className="text-sm text-zinc-300">{plan.notes}</p>
        </div>
      )}
    </div>
  );
}
```

---

### Task 5: Client Nutriție

**Files:**
- Create: `src/app/client/nutritie/page.tsx`

- [ ] **Step 1: Creează client/nutritie/page.tsx**

```typescript
// src/app/client/nutritie/page.tsx
"use client";
import { useState, useEffect } from "react";
import { getNutritionPlan } from "../actions";

type Meal = { name: string; foods: string[]; calories?: number; protein_g?: number };
type NutritionPlan = {
  calories: number; protein_g: number; carbs_g: number; fat_g: number;
  meals: Meal[]; notes?: string;
};

export default function NutritiePage() {
  const [plan, setPlan] = useState<NutritionPlan | null>(null);

  useEffect(() => { getNutritionPlan().then(p => setPlan(p as NutritionPlan)); }, []);

  if (!plan) return (
    <div className="p-8">
      <h1 className="text-xl font-bold text-white mb-2">Plan Nutrițional</h1>
      <p className="text-zinc-500 text-sm">Planul tău nutrițional va fi pregătit de Claudiu în curând.</p>
    </div>
  );

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-xl font-bold text-white mb-6">Plan Nutrițional</h1>

      {/* Macros overview */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Calorii", value: plan.calories, unit: "kcal", color: "text-built-red" },
          { label: "Proteine", value: plan.protein_g, unit: "g", color: "text-blue-400" },
          { label: "Carbohidrați", value: plan.carbs_g, unit: "g", color: "text-yellow-400" },
          { label: "Grăsimi", value: plan.fat_g, unit: "g", color: "text-green-400" },
        ].map(m => (
          <div key={m.label} className="bg-[#111111] border border-white/10 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{m.unit}</p>
            <p className="text-[11px] text-zinc-600 mt-1">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Meals */}
      <div className="space-y-3">
        {plan.meals?.map((meal, i) => (
          <div key={i} className="bg-[#111111] border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-zinc-200">{meal.name}</p>
              {meal.calories && (
                <span className="text-xs text-zinc-500">{meal.calories} kcal · {meal.protein_g}g proteină</span>
              )}
            </div>
            <ul className="space-y-0.5">
              {meal.foods?.map((food, j) => (
                <li key={j} className="text-xs text-zinc-400 flex gap-2">
                  <span className="text-zinc-700">·</span>{food}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {plan.notes && (
        <div className="mt-5 bg-[#111111] border border-white/5 rounded-xl p-4">
          <p className="text-xs text-zinc-500 mb-1">Note de la Claudiu</p>
          <p className="text-sm text-zinc-300">{plan.notes}</p>
        </div>
      )}
    </div>
  );
}
```

---

### Task 6: Client Check-in

**Files:**
- Create: `src/app/client/checkin/page.tsx`

- [ ] **Step 1: Creează client/checkin/page.tsx**

```typescript
// src/app/client/checkin/page.tsx
"use client";
import { useState } from "react";
import { submitCheckin } from "../actions";

function RangeInput({ label, name, value, onChange, min, max, unit }: {
  label: string; name: string; value: number;
  onChange: (v: number) => void; min: number; max: number; unit: string;
}) {
  return (
    <div className="bg-[#111111] border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-semibold text-zinc-200">{label}</label>
        <span className="text-lg font-bold text-built-red">{value}<span className="text-xs text-zinc-500 ml-0.5">{unit}</span></span>
      </div>
      <input type="range" name={name} min={min} max={max} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full accent-built-red" />
      <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
        <span>{min}{unit}</span><span>{max}{unit}</span>
      </div>
    </div>
  );
}

export default function CheckinPage() {
  const [form, setForm] = useState({
    training_adherence: 70,
    nutrition_adherence: 70,
    energy_level: 6,
    mood: 6,
    notes: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await submitCheckin(form);
    setSubmitted(true);
    setLoading(false);
  }

  if (submitted) return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-2xl mb-4">✓</div>
      <h2 className="text-lg font-bold text-white mb-1">Check-in trimis!</h2>
      <p className="text-sm text-zinc-500">Claudiu va revizui raportul tău în curând.</p>
    </div>
  );

  return (
    <div className="p-8 max-w-xl">
      <h1 className="text-xl font-bold text-white mb-2">Check-in Săptămânal</h1>
      <p className="text-sm text-zinc-500 mb-6">Evaluează săptămâna ta sincer. Datele te ajută pe tine, nu pe altcineva.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <RangeInput label="Aderență antrenament" name="training_adherence"
          value={form.training_adherence} onChange={v => setForm(f => ({...f, training_adherence: v}))}
          min={0} max={100} unit="%" />
        <RangeInput label="Aderență nutriție" name="nutrition_adherence"
          value={form.nutrition_adherence} onChange={v => setForm(f => ({...f, nutrition_adherence: v}))}
          min={0} max={100} unit="%" />
        <RangeInput label="Nivel de energie" name="energy_level"
          value={form.energy_level} onChange={v => setForm(f => ({...f, energy_level: v}))}
          min={1} max={10} unit="/10" />
        <RangeInput label="Dispoziție" name="mood"
          value={form.mood} onChange={v => setForm(f => ({...f, mood: v}))}
          min={1} max={10} unit="/10" />

        <div className="bg-[#111111] border border-white/10 rounded-xl p-4">
          <label className="block text-sm font-semibold text-zinc-200 mb-2">Note (opțional)</label>
          <textarea value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))}
            rows={4} placeholder="Ce a mers bine? Unde ai întâmpinat dificultăți? Orice vrei să știe Claudiu..."
            className="w-full bg-[#1a1a1a] border border-white/5 rounded-lg px-3 py-2.5 text-sm text-zinc-300 placeholder-zinc-700 resize-none focus:outline-none" />
        </div>

        <button type="submit" disabled={loading}
          className="w-full bg-built-red hover:bg-built-red/90 disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm transition-all">
          {loading ? "Se trimite..." : "Trimite Check-in"}
        </button>
      </form>
    </div>
  );
}
```

---

### Task 7: Client Mesaje

**Files:**
- Create: `src/app/client/mesaje/page.tsx`

- [ ] **Step 1: Creează client/mesaje/page.tsx**

```typescript
// src/app/client/mesaje/page.tsx
"use client";
import { useState, useEffect, useRef } from "react";
import { getMessages, sendClientMessage } from "../actions";

type Msg = { id: number; sender: string; content: string; created_at: string; read_at?: string | null };

export default function MesajePage() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getMessages().then(msgs => setMessages(msgs as Msg[]));
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function handleSend() {
    if (!input.trim() || sending) return;
    const content = input.trim();
    setInput("");
    setSending(true);
    await sendClientMessage(content);
    const updated = await getMessages();
    setMessages(updated as Msg[]);
    setSending(false);
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-built-red flex items-center justify-center text-sm font-bold text-white">IC</div>
          <div>
            <p className="text-sm font-semibold text-zinc-200">Iordache Claudiu</p>
            <p className="text-xs text-zinc-500">Coach BUILT</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-zinc-500">Nicio conversație încă.</p>
            <p className="text-xs text-zinc-600 mt-1">Scrie primul mesaj!</p>
          </div>
        )}
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.sender === 'client' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
              msg.sender === 'client'
                ? 'bg-built-red text-white rounded-br-sm'
                : 'bg-[#1a1a1a] border border-white/10 text-zinc-200 rounded-bl-sm'
            }`}>
              <p>{msg.content}</p>
              <p className={`text-[10px] mt-1 ${msg.sender === 'client' ? 'text-red-200/70' : 'text-zinc-600'}`}>
                {new Date(msg.created_at).toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-white/10">
        <div className="flex gap-3">
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }}}
            placeholder="Scrie un mesaj..."
            className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-built-red/50" />
          <button onClick={handleSend} disabled={!input.trim() || sending}
            className="bg-built-red hover:bg-built-red/90 disabled:opacity-40 text-white px-5 py-3 rounded-xl text-sm font-semibold transition-all">
            →
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

### Task 8: Admin — upgrade ClientDetail cu tabs noi

**Files:**
- Modify: `src/app/clienti/[id]/ClientDetail.tsx`

- [ ] **Step 1: Adaugă tabs Plan Antrenament, Plan Nutrițional, Mesaje**

Importă acțiunile admin la începutul fișierului:
```typescript
import { saveWorkoutPlan, saveNutritionPlan, sendAdminMessage, getClientMessages } from "@/app/client/actions";
```

Adaugă tab-urile noi în lista de tabs existentă:
```typescript
// Adaugă în array-ul de tabs (după check-in-uri existente):
{ id: "workout", label: "Plan Antrenament" },
{ id: "nutrition", label: "Plan Nutrițional" },
{ id: "messages", label: "Mesaje" },
```

**Tab Plan Antrenament** — editor simplu per zi:

```typescript
{activeTab === "workout" && (
  <WorkoutPlanEditor clientId={clientId} />
)}
```

Componenta `WorkoutPlanEditor` (în același fișier):
```typescript
function WorkoutPlanEditor({ clientId }: { clientId: number }) {
  const DAYS = ["Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă", "Duminică"];
  const [activeDay, setActiveDay] = useState("Luni");
  const [days, setDays] = useState<Record<string, {name:string;sets:number;reps:string;note?:string}[]>>({});
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  function addExercise() {
    setDays(d => ({...d, [activeDay]: [...(d[activeDay]??[]), {name:"",sets:3,reps:"8-12"}]}));
  }
  function updateExercise(i: number, field: string, value: string | number) {
    setDays(d => ({...d, [activeDay]: d[activeDay].map((ex,idx) => idx===i ? {...ex,[field]:value} : ex)}));
  }
  function removeExercise(i: number) {
    setDays(d => ({...d, [activeDay]: d[activeDay].filter((_,idx) => idx!==i)}));
  }
  async function handleSave() {
    setSaving(true);
    await saveWorkoutPlan(clientId, days, notes);
    setSaving(false);
    alert("Plan salvat!");
  }

  const exs = days[activeDay] ?? [];
  return (
    <div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {DAYS.map(d => (
          <button key={d} onClick={() => setActiveDay(d)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${activeDay===d ? 'bg-built-red text-white' : 'bg-white/5 text-zinc-400 hover:bg-white/10'}`}>
            {d} {days[d]?.length ? `(${days[d].length})` : ""}
          </button>
        ))}
      </div>
      <div className="space-y-2 mb-3">
        {exs.map((ex,i) => (
          <div key={i} className="flex gap-2 items-center">
            <input value={ex.name} onChange={e => updateExercise(i,'name',e.target.value)}
              placeholder="Exercițiu" className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-300" />
            <input type="number" value={ex.sets} onChange={e => updateExercise(i,'sets',Number(e.target.value))}
              className="w-16 bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-300" />
            <input value={ex.reps} onChange={e => updateExercise(i,'reps',e.target.value)}
              placeholder="8-12" className="w-20 bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-300" />
            <button onClick={() => removeExercise(i)} className="text-zinc-600 hover:text-red-400 text-lg">×</button>
          </div>
        ))}
        <button onClick={addExercise} className="text-xs text-built-red hover:text-built-red/80 transition-colors">+ Adaugă exercițiu</button>
      </div>
      <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
        placeholder="Note generale..." className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-300 resize-none mb-3" />
      <button onClick={handleSave} disabled={saving}
        className="bg-built-red text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-built-red/90 disabled:opacity-50">
        {saving ? "Salvează..." : "Salvează Plan"}
      </button>
    </div>
  );
}
```

**Tab Plan Nutrițional** — editor macros + mese:

```typescript
{activeTab === "nutrition" && (
  <NutritionPlanEditor clientId={clientId} />
)}
```

```typescript
function NutritionPlanEditor({ clientId }: { clientId: number }) {
  const [macros, setMacros] = useState({ calories: 2200, protein_g: 160, carbs_g: 220, fat_g: 70 });
  const [meals, setMeals] = useState<{name:string;foods:string[]}[]>([
    {name:"Mic dejun",foods:[""]},
    {name:"Prânz",foods:[""]},
    {name:"Cină",foods:[""]},
  ]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await saveNutritionPlan(clientId, {...macros, meals, notes});
    setSaving(false);
    alert("Plan nutrițional salvat!");
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-3">
        {(["calories","protein_g","carbs_g","fat_g"] as const).map(k => (
          <div key={k}>
            <label className="block text-xs text-zinc-500 mb-1">{k === 'calories' ? 'Calorii (kcal)' : k === 'protein_g' ? 'Proteine (g)' : k === 'carbs_g' ? 'Carbohidrați (g)' : 'Grăsimi (g)'}</label>
            <input type="number" value={macros[k]} onChange={e => setMacros(m => ({...m,[k]:Number(e.target.value)}))}
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-300" />
          </div>
        ))}
      </div>
      {meals.map((meal,i) => (
        <div key={i} className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4">
          <input value={meal.name} onChange={e => setMeals(m => m.map((x,j) => j===i ? {...x,name:e.target.value} : x))}
            className="w-full bg-transparent text-sm font-semibold text-zinc-200 mb-2 focus:outline-none border-b border-white/10 pb-1" />
          {meal.foods.map((food,fi) => (
            <div key={fi} className="flex gap-2 mb-1">
              <input value={food} onChange={e => {
                const newFoods = [...meal.foods]; newFoods[fi] = e.target.value;
                setMeals(m => m.map((x,j) => j===i ? {...x,foods:newFoods} : x));
              }} placeholder="Aliment + cantitate" className="flex-1 bg-[#111111] border border-white/5 rounded-lg px-3 py-1.5 text-xs text-zinc-300 placeholder-zinc-700" />
            </div>
          ))}
          <button onClick={() => setMeals(m => m.map((x,j) => j===i ? {...x,foods:[...x.foods,""]} : x))}
            className="text-xs text-built-red mt-1">+ Adaugă aliment</button>
        </div>
      ))}
      <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
        placeholder="Note nutriționale..." className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-300 resize-none" />
      <button onClick={handleSave} disabled={saving}
        className="bg-built-red text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-built-red/90 disabled:opacity-50">
        {saving ? "Salvează..." : "Salvează Plan"}
      </button>
    </div>
  );
}
```

**Tab Mesaje admin:**
```typescript
{activeTab === "messages" && (
  <AdminMessagesTab clientId={clientId} />
)}
```

```typescript
function AdminMessagesTab({ clientId }: { clientId: number }) {
  const [messages, setMessages] = useState<{id:number;sender:string;content:string;created_at:string}[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { getClientMessages(clientId).then(msgs => setMessages(msgs as typeof messages)); }, [clientId]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function handleSend() {
    if (!input.trim()) return;
    await sendAdminMessage(clientId, input.trim());
    setInput("");
    getClientMessages(clientId).then(msgs => setMessages(msgs as typeof messages));
  }

  return (
    <div className="flex flex-col h-80">
      <div className="flex-1 overflow-y-auto space-y-2 mb-3">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.sender==='admin' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] px-3 py-2 rounded-xl text-sm ${m.sender==='admin' ? 'bg-built-red text-white' : 'bg-[#1a1a1a] border border-white/10 text-zinc-200'}`}>
              {m.content}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if(e.key==='Enter') handleSend(); }}
          placeholder="Scrie clientului..." className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-300 focus:outline-none" />
        <button onClick={handleSend} className="bg-built-red text-white px-4 py-2 rounded-lg text-sm">→</button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit final**

```bash
cd "built-ai-command-center" && git add -A && git commit -m "feat: portal clienti complet — dashboard, antrenamente, nutritie, checkin, mesaje, admin editors"
```

---

### Task 9: Verificare end-to-end

- [ ] **Step 1: Pornește dev server**

```bash
cd "built-ai-command-center" && npm run dev
```

- [ ] **Step 2: Testează ca admin**

1. Login ca admin → `/dashboard/analytics`
2. Mergi la `/clienti` → adaugă client test
3. Deschide clientul → adaugă plan antrenament + nutriție + trimite mesaj
4. Testează AI Reply Generator în `/dashboard/outreach`
5. Testează Ask BUILT AI în `/knowledge` — scrie un mesaj, verifică că se salvează, importă o conversație

- [ ] **Step 3: Testează ca client**

1. Loghează-te cu user-ul de client creat în Plan 1
2. Verifică redirect la `/client/dashboard`
3. Verifică că planul de antrenament și nutriție sunt vizibile
4. Trimite un check-in
5. Trimite un mesaj și verifică că apare și în admin

- [ ] **Step 4: Build check**

```bash
cd "built-ai-command-center" && npm run build 2>&1 | tail -30
```

Expected: build fără erori.

- [ ] **Step 5: Commit final**

```bash
cd "built-ai-command-center" && git add -A && git commit -m "feat: BUILT v2 complete — auth, features, client portal"
```
