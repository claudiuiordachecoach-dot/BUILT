"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getWorkoutPlan } from "../actions";
import WeeklyTraining from "./WeeklyTraining";
import TodayTrainingLog from "./TodayTrainingLog";
import NativeWorkout, { type FullEx, type WDay } from "./NativeWorkout";
import workoutFull from "@/lib/workout-full.json";
import { EmptyState } from "../components/EmptyState";
import { PageSkeleton } from "../components/Skeleton";

const FULL = workoutFull as Record<string, Record<string, FullEx[]>>;

const RO_DAYS: Record<number, string> = { 0: "Duminică", 1: "Luni", 2: "Marți", 3: "Miercuri", 4: "Joi", 5: "Vineri", 6: "Sâmbătă" };
type WorkoutPlan = { notes?: string; week_start?: string; quickref_url?: string; quickref_acasa_url?: string };

// Ziua de azi (cheia JS 0=Dum..6=Sâm) → tabul/split-ul clientului.
const TODAY_TAB: Record<string, Record<number, string>> = {
  claudia: { 1: "lowera", 3: "upper", 5: "lowerb" },
  alex: { 1: "upperA", 3: "lower", 5: "upperB" },
  letitia: { 1: "a", 3: "b", 5: "c" },
  ciprian: { 1: "ziuaA", 3: "ziuaB", 5: "ziuaC", 6: "ziuaC" },
  george: { 1: "upper-a", 2: "lower-a", 4: "upper-b", 5: "lower-b" },
};

const DAY_LABELS: Record<string, string> = {
  lowera: "Lower A", upper: "Upper", lowerb: "Lower B",
  uppera: "Upper A", lower: "Lower", upperb: "Upper B",
  "upper-a": "Upper A", "lower-a": "Lower A", "upper-b": "Upper B", "lower-b": "Lower B",
  a: "Ziua A", b: "Ziua B", c: "Ziua C", ziuaa: "Ziua A", ziuab: "Ziua B", ziuac: "Ziua C", combo: "Combo",
};
const SKIP_DAY = ["cardio", "ciclu", "reguli", "mve", "progresie", "program", "overview", "calendar", "saptamana", "warmup", "stretch", "ziua-5"];

export default function AntrenamantePage() {
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { getWorkoutPlan().then((p) => setPlan(p as WorkoutPlan | null)).finally(() => setLoading(false)); }, []);

  if (loading) return <PageSkeleton cards={4} />;

  if (!plan) return (
    <div className="p-5 md:p-8 max-w-3xl">
      <h1 className="font-display text-4xl tracking-wider text-built-white mb-4">Plan Antrenament</h1>
      <WeeklyTraining />
      <TodayTrainingLog />
      <EmptyState icon="⚡" title="Planul tău se construiește" subtitle="Claudiu îți pregătește antrenamentele. Apar aici în curând." />
    </div>
  );

  const slug = plan.quickref_url?.match(/\/quickref\/([a-z]+)-antrenament/)?.[1] ?? "";
  const todayTab = slug ? TODAY_TAB[slug]?.[new Date().getDay()] : undefined;
  const todayKey = todayTab && !SKIP_DAY.includes(todayTab.toLowerCase()) ? todayTab : null;
  const days: WDay[] = Object.entries(FULL[slug] || {})
    .filter(([k]) => !SKIP_DAY.includes(k.toLowerCase()))
    .map(([k, ex]) => ({ key: k, label: DAY_LABELS[k.toLowerCase()] ?? k, exercises: ex }));

  // Rebuild nativ: carduri de exerciții cu video + execuție + logging inline. Pagina scrollează natural.
  if (days.length > 0) {
    return (
      <div className="p-5 md:p-8 max-w-3xl mx-auto">
        <WeeklyTraining />
        <TodayTrainingLog daySummary="Loghează-ți antrenamentul mai jos ↓" />
        {plan.quickref_acasa_url && (
          <Link href="/client/antrenamente/acasa" className="flex items-center justify-between bg-[#111111] border border-white/10 rounded-xl px-4 py-3 mb-5 press hover:border-built-red/40 transition-colors">
            <span className="text-sm text-zinc-200">🏠 Antrenament de acasă (fără sală)</span>
            <span className="text-built-red">→</span>
          </Link>
        )}
        <NativeWorkout days={days} todayKey={todayKey} />
      </div>
    );
  }

  // Fallback (client fără date structurate): foaia QuickRef în iframe.
  if (plan.quickref_url) {
    return (
      <div className="flex flex-col w-full h-[calc(100dvh-8rem)] md:h-[calc(100vh-1rem)]">
        <div className="px-4 pt-4 shrink-0">
          <WeeklyTraining />
          <TodayTrainingLog daySummary={`Azi · ${RO_DAYS[new Date().getDay()]}`} />
        </div>
        <iframe src={plan.quickref_url} className="w-full border-0 flex-1" title="Plan Antrenament" />
      </div>
    );
  }

  return (
    <div className="p-5 md:p-8 max-w-3xl">
      <h1 className="font-display text-3xl tracking-wider text-built-white mb-4">Plan Antrenament</h1>
      <WeeklyTraining />
      <TodayTrainingLog />
      <EmptyState icon="⚡" title="Planul tău se construiește" subtitle="Apare aici în curând." />
    </div>
  );
}
