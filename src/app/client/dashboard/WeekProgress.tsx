// Progresul celor 90 de zile ca 13 săptămâni — densitate corectă (nici 90 celule, nici un singur cerc).
// Cele 3 faze ale programului marcate prin tentă. Săptămâna curentă aprinsă.
const PHASE_TINT = ["bg-[#2a1a1c]", "bg-[#231a1d]", "bg-[#1d191c]"]; // index = faza (0..2)
const PHASE_LABEL = ["FAZA 1 · RESETARE", "FAZA 2 · CONSTRUCȚIE", "FAZA 3 · CONSOLIDARE"];
const TOTAL_WEEKS = 13;

function phaseOfWeek(w: number) {
  return w <= 4 ? 0 : w <= 9 ? 1 : 2;
}

export default function WeekProgress({ day, week }: { day: number; week: number }) {
  const curWeek = Math.max(1, Math.min(week, TOTAL_WEEKS));
  const phase = phaseOfWeek(curWeek);

  return (
    <div className="mt-6">
      <div className="flex items-end justify-between mb-3">
        <p className="font-display text-3xl md:text-4xl text-built-white leading-none">
          ZIUA {Math.min(day, 90)} <span className="text-zinc-600 text-xl">/ 90</span>
        </p>
        <span className="font-mono-stats text-[10px] text-built-red tracking-wider pb-1">
          SĂPT. {curWeek} · {PHASE_LABEL[phase]}
        </span>
      </div>

      <div className="flex gap-1 items-stretch h-9">
        {Array.from({ length: TOTAL_WEEKS }, (_, i) => {
          const w = i + 1;
          const done = w < curWeek;
          const current = w === curWeek;
          const ph = phaseOfWeek(w);
          const fill =
            done
              ? "bg-gradient-to-t from-built-red-dark to-built-red"
              : current
                ? "bg-gradient-to-t from-built-red-dark to-built-red shadow-[0_0_8px_rgba(192,57,43,0.65)]"
                : PHASE_TINT[ph];
          return <div key={w} className={`flex-1 rounded ${fill}`} />;
        })}
      </div>

      <div className="flex justify-between mt-2 font-mono-stats text-[9px] tracking-wide">
        <span className={phase === 0 ? "text-built-red" : "text-zinc-600"}>RESETARE</span>
        <span className={phase === 1 ? "text-built-red" : "text-zinc-600"}>CONSTRUCȚIE</span>
        <span className={phase === 2 ? "text-built-red" : "text-zinc-600"}>CONSOLIDARE</span>
      </div>
    </div>
  );
}
