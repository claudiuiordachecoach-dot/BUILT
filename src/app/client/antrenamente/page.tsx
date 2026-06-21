"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getWorkoutPlan } from "../actions";
import WeeklyTraining from "./WeeklyTraining";
import { EmptyState } from "../components/EmptyState";
import { PageSkeleton } from "../components/Skeleton";

const DAYS = ["Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă", "Duminică"];
type Exercise = { name: string; sets: number; reps: string; note?: string };
type WorkoutPlan = { days: Record<string, Exercise[]>; notes?: string; week_start?: string; quickref_url?: string; quickref_acasa_url?: string };

// Program săptămânal per client (cheia = ziua JS: 0=Dum .. 6=Sâm) → tabul din quickref.
// Folosit ca să deschidem direct "Antrenamentul de azi" în sesiunea zilei.
// Zilele nemapate deschid tabul implicit al fișierului (overview), fără regresie.
const TODAY_TAB: Record<string, Record<number, string>> = {
  // 3 zile forță: Luni / Miercuri / Vineri (pauză între), restul → overview
  claudia: { 1: "lowera", 3: "upper", 5: "lowerb", 2: "program", 4: "program", 6: "program", 0: "program" },
  alex: { 1: "upperA", 3: "lower", 5: "upperB" },
  letitia: { 1: "a", 3: "b", 5: "c" },
  ciprian: { 1: "ziuaA", 3: "ziuaB", 5: "ziuaC", 6: "ziuaC" },
  // 4 zile Upper/Lower: Luni / Marți / Joi / Vineri, Miercuri cardio
  george: { 1: "upper-a", 2: "lower-a", 4: "upper-b", 5: "lower-b", 3: "cardio" },
  // plan pe calendar cu date — deschide mereu calendarul cu ziua de azi marcată
  andrei: { 0: "calendar", 1: "calendar", 2: "calendar", 3: "calendar", 4: "calendar", 5: "calendar", 6: "calendar" },
};

function todayHashFor(quickrefUrl?: string): string {
  if (!quickrefUrl) return "";
  const slug = quickrefUrl.match(/\/quickref\/([a-z]+)-antrenament/)?.[1];
  if (!slug) return "";
  const tab = TODAY_TAB[slug]?.[new Date().getDay()];
  return tab ? `#${tab}` : "";
}

export default function AntrenamantePage() {
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState("Luni");
  const [todayHash, setTodayHash] = useState("");

  useEffect(() => { getWorkoutPlan().then(p => { setPlan(p as WorkoutPlan | null); setTodayHash(todayHashFor((p as WorkoutPlan | null)?.quickref_url)); }).finally(() => setLoading(false)); }, []);

  if (loading) return <PageSkeleton cards={4} />;

  if (!plan) return (
    <div className="p-5 md:p-8 max-w-3xl">
      <h1 className="font-display text-4xl tracking-wider text-built-white mb-4">Plan Antrenament</h1>
      <WeeklyTraining />
      <EmptyState icon="⚡" title="Planul tău se construiește" subtitle="Claudiu îți pregătește antrenamentele. Apar aici în curând." />
    </div>
  );

  if (plan.quickref_url) {
    return (
      <div className="flex flex-col w-full h-[calc(100dvh-8rem)] md:h-[calc(100vh-1rem)]">
        <div className="px-4 pt-4 shrink-0">
          <WeeklyTraining />
        </div>
        <div className="flex gap-2 px-4 py-2 bg-[#111111] border-b border-white/10 shrink-0">
          <span className="text-xs font-semibold text-built-red border-b-2 border-built-red pb-1 px-1">Sală</span>
          {plan.quickref_acasa_url && (
            <Link
              href="/client/antrenamente/acasa"
              className="text-xs font-semibold text-zinc-500 hover:text-zinc-200 pb-1 px-1 transition-colors"
            >
              Acasă
            </Link>
          )}
        </div>
        <iframe
          key={todayHash}
          src={`${plan.quickref_url}${todayHash}`}
          className="w-full border-0 flex-1"
          title="Plan Antrenament"
        />
      </div>
    );
  }

  const todayExercises: Exercise[] = plan.days?.[activeDay] ?? [];

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-6">
        <h1 className="font-display text-3xl tracking-wider text-built-white">Plan Antrenament</h1>
        {plan.week_start && (
          <p className="text-xs text-zinc-500 mt-1">
            Săptămâna {new Date(plan.week_start).toLocaleDateString("ro-RO", { day: "numeric", month: "long" })}
          </p>
        )}
      </div>
      <WeeklyTraining />
      <div className="flex gap-2 mb-6 flex-wrap">
        {DAYS.map(day => {
          const hasWorkout = (plan.days?.[day]?.length ?? 0) > 0;
          return (
            <button key={day} onClick={() => setActiveDay(day)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeDay === day ? "bg-built-red text-white"
                  : hasWorkout ? "bg-white/10 text-zinc-200 hover:bg-white/15"
                  : "bg-white/5 text-zinc-600"
              }`}>
              {day}
            </button>
          );
        })}
      </div>
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
