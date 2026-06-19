"use client";

import { useEffect, useState } from "react";
import { getMyWeekTraining, toggleMyTodayItem, type TrainingDay } from "../actions";

export default function WeeklyTraining() {
  const [days, setDays] = useState<TrainingDay[]>([]);

  useEffect(() => { getMyWeekTraining().then(setDays); }, []);

  const toggleToday = async () => {
    const today = days.find((d) => d.isToday);
    if (!today) return;
    const next = !today.trained;
    setDays((ds) => ds.map((d) => (d.isToday ? { ...d, trained: next } : d)));
    try {
      await toggleMyTodayItem("antrenament", next);
    } catch {
      setDays((ds) => ds.map((d) => (d.isToday ? { ...d, trained: !next } : d)));
    }
  };

  if (days.length === 0) return null;

  const count = days.filter((d) => d.trained).length;
  const todayTrained = days.find((d) => d.isToday)?.trained;

  return (
    <div className="bg-[#111111] border border-white/10 rounded-xl p-4 mb-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-zinc-200">Săptămâna ta · {count}/7 antrenamente</span>
        <button
          onClick={toggleToday}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
            todayTrained ? "bg-green-600/20 text-green-400 border border-green-600/40" : "bg-built-red text-white hover:bg-red-700"
          }`}
        >
          {todayTrained ? "✓ Antrenat azi" : "Marchează azi"}
        </button>
      </div>
      <div className="flex gap-1.5">
        {days.map((d) => (
          <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[10px] text-zinc-600 uppercase">{d.label}</span>
            <div
              className={`w-full h-9 rounded-md flex items-center justify-center text-xs border ${
                d.trained
                  ? "bg-built-red/20 border-built-red/50 text-built-red"
                  : d.isToday
                  ? "border-white/30 text-zinc-500"
                  : d.isFuture
                  ? "border-white/5 text-zinc-700"
                  : "border-white/10 text-zinc-700"
              }`}
            >
              {d.trained ? "✓" : d.isFuture ? "" : "–"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
