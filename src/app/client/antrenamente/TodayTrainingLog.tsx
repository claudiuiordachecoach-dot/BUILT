"use client";

import { useEffect, useState } from "react";
import { setMyTodayTraining, getMyTodayTraining, type TrainingStatus } from "../actions";

const RO_DAYS: Record<number, string> = { 0: "Duminică", 1: "Luni", 2: "Marți", 3: "Miercuri", 4: "Joi", 5: "Vineri", 6: "Sâmbătă" };

const OPTS: { key: TrainingStatus; label: string; icon: string }[] = [
  { key: "done", label: "Făcut", icon: "✓" },
  { key: "skipped", label: "Sărit", icon: "—" },
  { key: "other", label: "Altceva", icon: "↻" },
];

export default function TodayTrainingLog({ daySummary }: { daySummary?: string }) {
  const [status, setStatus] = useState<TrainingStatus | undefined>();
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);
  const today = RO_DAYS[new Date().getDay()];

  useEffect(() => {
    getMyTodayTraining().then((t) => {
      setStatus(t.status);
      if (t.note) setNote(t.note);
      if (t.status === "other") setShowNote(true);
    });
  }, []);

  async function pick(s: TrainingStatus) {
    setStatus(s);
    setShowNote(s === "other");
    if (s !== "other") await setMyTodayTraining(s);
    else if (note.trim()) await setMyTodayTraining("other", note);
  }

  return (
    <div className="bg-[#111111] border border-white/10 rounded-xl p-4 mb-4">
      <div className="mb-3">
        <p className="text-[10px] font-condensed uppercase tracking-wider text-built-red">Azi · {today}</p>
        <p className="text-sm font-semibold text-zinc-200">{daySummary ?? "Antrenamentul tău"}</p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {OPTS.map((o) => {
          const active = status === o.key;
          return (
            <button key={o.key} onClick={() => pick(o.key)}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-lg border text-sm transition-all active:scale-[0.97] ${
                active ? "bg-built-red/15 border-built-red/50 text-white" : "bg-black/30 border-white/10 text-zinc-400 hover:border-white/20"
              }`}>
              <span className={active ? "text-built-red" : "text-zinc-600"}>{o.icon}</span> {o.label}
            </button>
          );
        })}
      </div>
      {showNote && (
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          onBlur={() => setMyTodayTraining("other", note)}
          rows={2}
          placeholder="Ce ai făcut în loc? (ex: am mutat ziua de forță pe mâine, am alergat 30 min)"
          className="w-full mt-3 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder-zinc-700 resize-none focus:outline-none focus:border-built-red/50"
        />
      )}
      {status === "done" && <p className="text-[11px] text-green-400 mt-2">Bravo. Sistemul rulează. 🔥</p>}
      {status === "skipped" && <p className="text-[11px] text-zinc-500 mt-2">Notat. O zi ratată nu rupe sistemul — revii mâine.</p>}
    </div>
  );
}
