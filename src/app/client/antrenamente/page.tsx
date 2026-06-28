"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { getWorkoutPlan } from "../actions";
import WeeklyTraining from "./WeeklyTraining";
import TodayTrainingLog from "./TodayTrainingLog";
import TodayWorkoutLogger from "./TodayWorkoutLogger";
import plansJson from "@/lib/workout-plans.json";
import { EmptyState } from "../components/EmptyState";
import { PageSkeleton } from "../components/Skeleton";

const PLANS = plansJson as Record<string, Record<string, string[]>>;

const DAYS = ["Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă", "Duminică"];
const RO_DAYS: Record<number, string> = { 0: "Duminică", 1: "Luni", 2: "Marți", 3: "Miercuri", 4: "Joi", 5: "Vineri", 6: "Sâmbătă" };
function todayDayName() { return RO_DAYS[new Date().getDay()]; }
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

// Eticheta zilei de antrenament de azi (pentru loggerul de seturi). Stabilă per tip de zi
// → comparația „data trecută" se face pe același split, nu pe ziua calendaristică.
const DAY_LABELS: Record<string, string> = {
  lowera: "Lower A", upper: "Upper", lowerb: "Lower B",
  uppera: "Upper A", lower: "Lower", upperb: "Upper B",
  "upper-a": "Upper A", "lower-a": "Lower A", "upper-b": "Upper B", "lower-b": "Lower B", cardio: "Cardio",
  a: "Ziua A", b: "Ziua B", c: "Ziua C", ziuaa: "Ziua A", ziuab: "Ziua B", ziuac: "Ziua C",
};

export default function AntrenamantePage() {
  const [plan, setPlan] = useState<WorkoutPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(todayDayName());
  const [todayHash, setTodayHash] = useState("");
  const [logMode, setLogMode] = useState(false);
  const [savedToast, setSavedToast] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const topH = useRef(0);

  // Antetul (săptămâna + azi) se topește PROPORȚIONAL cu scroll-ul din antrenament:
  // pe măsură ce derulezi în jos dispare treptat, iar la scroll înapoi reapare lin.
  // Stil aplicat direct pe DOM (fără re-render) = 1:1 cu degetul, fluid. iframe same-origin.
  function attachScrollCollapse() {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    const apply = () => {
      const top = topRef.current;
      if (!top) return;
      if (!topH.current) topH.current = top.scrollHeight;
      const y = win.scrollY || win.document?.documentElement?.scrollTop || 0;
      const p = Math.min(Math.max(y / 220, 0), 1); // 0..1 pe primii ~220px de scroll
      top.style.maxHeight = `${(1 - p) * topH.current}px`;
      top.style.opacity = `${1 - p}`;
      top.style.transform = `translateY(${-p * 14}px)`;
      top.style.pointerEvents = p > 0.9 ? "none" : "auto";
    };
    win.addEventListener("scroll", () => requestAnimationFrame(apply), { passive: true });
    apply();
  }

  useEffect(() => { getWorkoutPlan().then(p => { setPlan(p as WorkoutPlan | null); setTodayHash(todayHashFor((p as WorkoutPlan | null)?.quickref_url)); }).finally(() => setLoading(false)); }, []);

  if (loading) return <PageSkeleton cards={4} />;

  // Planul clientului → toate zilele de antrenament (pentru loggerul inline).
  const slug = plan?.quickref_url?.match(/\/quickref\/([a-z]+)-antrenament/)?.[1] ?? "";
  const todayTab = slug ? TODAY_TAB[slug]?.[new Date().getDay()] : undefined;
  const isTrainingDay = !!todayTab && !["program", "overview", "calendar"].includes(todayTab);
  const SKIP_DAY = ["cardio", "ciclu", "reguli", "mve", "progresie", "program", "overview", "calendar", "saptamana", "warmup", "stretch"];
  const planDays = Object.entries(PLANS[slug] || {})
    .filter(([k]) => !SKIP_DAY.includes(k.toLowerCase()))
    .map(([k, ex]) => ({ key: k, label: DAY_LABELS[k.toLowerCase()] ?? k, exercises: ex }));
  const todayKey = isTrainingDay ? todayTab! : null;
  const todayLabel = todayKey ? (DAY_LABELS[todayKey.toLowerCase()] ?? "") : "";

  // Prim-plan: alegi antrenamentul (plan / liber / repetă trecut) → logging focusat. Salvează → revine.
  if (logMode) {
    return (
      <div className="w-full h-[calc(100dvh-8rem)] md:h-[calc(100vh-1rem)] overflow-y-auto">
        <TodayWorkoutLogger
          planDays={planDays}
          todayKey={todayKey}
          onClose={() => setLogMode(false)}
          onSaved={() => { setLogMode(false); setSavedToast(true); setTimeout(() => setSavedToast(false), 4000); }}
        />
      </div>
    );
  }

  if (!plan) return (
    <div className="p-5 md:p-8 max-w-3xl">
      <h1 className="font-display text-4xl tracking-wider text-built-white mb-4">Plan Antrenament</h1>
      <WeeklyTraining />
      <TodayTrainingLog />
      <EmptyState icon="⚡" title="Planul tău se construiește" subtitle="Claudiu îți pregătește antrenamentele. Apar aici în curând." />
    </div>
  );

  if (plan.quickref_url) {
    return (
      <div className="flex flex-col w-full h-[calc(100dvh-8rem)] md:h-[calc(100vh-1rem)]">
        <div ref={topRef} className="px-4 pt-4 shrink-0 overflow-hidden">
          <WeeklyTraining />
          <TodayTrainingLog daySummary={todayHash ? "Antrenamentul de azi e deschis mai jos ↓" : "Azi e zi de recuperare 🧘 — planul complet mai jos"} />
          {savedToast && <p className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-2.5 mb-3">Antrenament salvat ✓ Data viitoare îți arăt cât ai ridicat azi.</p>}
          <button
            onClick={() => setLogMode(true)}
            className="w-full flex items-center justify-between gap-3 bg-built-red/[0.08] border border-built-red/40 rounded-xl px-4 py-3 mb-3 press transition-colors hover:bg-built-red/[0.12]"
          >
            <span className="text-sm text-built-white font-semibold text-left">
              ⚡ Loghează antrenamentul de azi{todayLabel ? ` · ${todayLabel}` : ""}{" "}
              <span className="text-zinc-400 font-normal">— kg × reps, cu progresia</span>
            </span>
            <span className="text-built-red text-lg shrink-0">→</span>
          </button>
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
          ref={iframeRef}
          onLoad={attachScrollCollapse}
          src={`${plan.quickref_url}${todayHash}`}
          className="w-full border-0 flex-1"
          title="Plan Antrenament"
        />
      </div>
    );
  }

  const todayExercises: Exercise[] = plan.days?.[activeDay] ?? [];
  const todayName = todayDayName();
  const todayCount = plan.days?.[todayName]?.length ?? 0;
  const todaySummary = todayCount > 0 ? `${todayCount} ${todayCount === 1 ? "exercițiu" : "exerciții"} azi` : "Zi de recuperare azi";

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
      <TodayTrainingLog daySummary={todaySummary} />
      {savedToast && <p className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-2.5 mb-4">Antrenament salvat ✓</p>}
      <button
        onClick={() => setLogMode(true)}
        className="w-full flex items-center justify-between gap-3 bg-built-red/[0.08] border border-built-red/40 rounded-xl px-4 py-3 mb-6 press transition-colors hover:bg-built-red/[0.12]"
      >
        <span className="text-sm text-built-white font-semibold text-left">⚡ Loghează antrenamentul de azi{todayLabel ? ` · ${todayLabel}` : ""} <span className="text-zinc-400 font-normal">— kg × reps, cu progresia</span></span>
        <span className="text-built-red text-lg shrink-0">→</span>
      </button>
      <div className="flex gap-2 mb-6 flex-wrap">
        {DAYS.map(day => {
          const hasWorkout = (plan.days?.[day]?.length ?? 0) > 0;
          const isToday = day === todayName;
          return (
            <button key={day} onClick={() => setActiveDay(day)}
              className={`press px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeDay === day ? "bg-built-red text-white"
                  : hasWorkout ? "bg-white/10 text-zinc-200 hover:bg-white/15"
                  : "bg-white/5 text-zinc-600"
              }`}>
              {day}{isToday && <span className="ml-1 opacity-70">· azi</span>}
            </button>
          );
        })}
      </div>
      {todayExercises.length === 0 ? (
        <div className="bg-[#111111] border border-white/10 rounded-xl p-6 text-center">
          <p className="text-zinc-500 text-sm">Zi de recuperare 🧘</p>
        </div>
      ) : (
        <div className="stagger space-y-3">
          {todayExercises.map((ex, i) => (
            <div key={i} className="hover-lift bg-[#111111] border border-white/10 rounded-xl p-4 flex items-start gap-4">
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
