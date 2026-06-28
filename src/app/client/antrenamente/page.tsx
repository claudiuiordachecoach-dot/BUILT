"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getWorkoutPlan } from "../actions";
import WeeklyTraining from "./WeeklyTraining";
import TodayTrainingLog from "./TodayTrainingLog";
import NativeWorkout from "./NativeWorkout";
import { EmptyState } from "../components/EmptyState";
import { PageSkeleton } from "../components/Skeleton";

const RO_DAYS: Record<number, string> = { 0: "Duminică", 1: "Luni", 2: "Marți", 3: "Miercuri", 4: "Joi", 5: "Vineri", 6: "Sâmbătă" };
type WorkoutPlan = { notes?: string; week_start?: string; quickref_url?: string; quickref_acasa_url?: string };

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
  program: "Program", reguli: "Reguli", ciclu: "Ciclu", saptamana: "Săptămâna", mve: "MVE",
  progresie: "Progresie", cardio: "Cardio", info: "Info", macros: "Macro", "ziua-5": "Brațe", calendar: "Calendar",
};
const labelFor = (k: string) => DAY_LABELS[k.toLowerCase()] ?? k.toUpperCase();

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

  if (plan.quickref_url) {
    const slug = plan.quickref_url.match(/\/quickref\/([a-z]+)-antrenament/)?.[1] ?? "";
    const tt = slug ? TODAY_TAB[slug]?.[new Date().getDay()] : undefined;
    const todayKey = tt ?? null;
    return (
      <div className="p-5 md:p-8 max-w-5xl mx-auto">
        <WeeklyTraining />
        <TodayTrainingLog daySummary={`Azi · ${RO_DAYS[new Date().getDay()]} — loghează-ți antrenamentul mai jos`} />
        {plan.quickref_acasa_url && (
          <Link href="/client/antrenamente/acasa" className="flex items-center justify-between bg-[#111111] border border-white/10 rounded-xl px-4 py-3 mb-5 press hover:border-built-red/40 transition-colors">
            <span className="text-sm text-zinc-200">🏠 Antrenament de acasă (fără sală)</span>
            <span className="text-built-red">→</span>
          </Link>
        )}
        <NativeWorkout quickrefUrl={plan.quickref_url} todayKey={todayKey} labelFor={labelFor} />
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
