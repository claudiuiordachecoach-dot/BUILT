"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getWorkoutPlan } from "../actions";

const DAYS = ["Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă", "Duminică"];
type Exercise = { name: string; sets: number; reps: string; note?: string };
type WorkoutPlan = { days: Record<string, Exercise[]>; notes?: string; week_start?: string; quickref_url?: string };

export default function AntrenamantePage() {
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [activeDay, setActiveDay] = useState("Luni");

  useEffect(() => { getWorkoutPlan().then(p => setPlan(p as WorkoutPlan | null)); }, []);

  if (!plan) return (
    <div className="p-8">
      <h1 className="text-xl font-bold text-white mb-2">Plan Antrenament</h1>
      <p className="text-zinc-500 text-sm">Planul tău nu a fost creat încă. Claudiu îl va pregăti în curând.</p>
    </div>
  );

  if (plan.quickref_url) {
    return (
      <div className="w-full md:max-w-[520px] md:mx-auto flex flex-col" style={{ height: "calc(100vh - 60px)" }}>
        <div className="flex gap-2 px-4 py-2 bg-[#111111] border-b border-white/10 shrink-0">
          <span className="text-xs font-semibold text-built-red border-b-2 border-built-red pb-1 px-1">Sală</span>
          <Link
            href="/client/antrenamente/acasa"
            className="text-xs font-semibold text-zinc-500 hover:text-zinc-200 pb-1 px-1 transition-colors"
          >
            Acasă
          </Link>
        </div>
        <iframe
          src={plan.quickref_url}
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
        <h1 className="text-xl font-bold text-white">Plan Antrenament</h1>
        {plan.week_start && (
          <p className="text-xs text-zinc-500 mt-1">
            Săptămâna {new Date(plan.week_start).toLocaleDateString("ro-RO", { day: "numeric", month: "long" })}
          </p>
        )}
      </div>
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
