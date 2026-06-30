// Cei 5 piloni ca bare orizontale (stil curat) — înlocuiește radarul.
// Mereu vizibil: dacă nu există check-in, afișează empty-state invitant.
import Link from "next/link";
import { type PillarScores } from "./PillarRadar";

const clamp = (n: number) => Math.max(0, Math.min(100, n));

const ROWS: [keyof PillarScores, string][] = [
  ["B", "Base Strength"],
  ["U", "Unbreakable Cap."],
  ["I", "Intelligent Fueling"],
  ["L", "Lifestyle Integr."],
  ["T", "Tough Mindset"],
];

export default function PillarBars({ scores, qs = "" }: { scores: PillarScores; qs?: string }) {
  const active = ROWS.filter(([k]) => clamp(scores[k]) > 0).length;
  const empty = active === 0;

  return (
    <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 mb-5">
      <div className="flex items-baseline justify-between mb-4">
        <span className="font-condensed text-[11px] text-zinc-400 uppercase tracking-[0.2em]">Cei 5 piloni</span>
        <span className="text-[11px] text-zinc-500 font-light">{active} din 5 activi</span>
      </div>
      <div className="flex flex-col gap-3">
        {ROWS.map(([k, label]) => {
          const v = clamp(scores[k]);
          const on = v > 0;
          return (
            <div key={k} className="flex items-center gap-3">
              <span className={`font-display text-lg w-4 leading-none ${on ? "text-built-red" : "text-zinc-600"}`}>{k}</span>
              <div className="flex-1 h-[3px] bg-white/10 rounded-full overflow-hidden">
                {on && (
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-built-red-dark to-built-red transition-[width] duration-700 ease-out"
                    style={{ width: `${v}%` }}
                  />
                )}
              </div>
              <span className="text-[11px] text-zinc-500 w-28 text-right truncate font-light">{label}</span>
            </div>
          );
        })}
      </div>
      {empty && (
        <Link href={`/client/checkin${qs}`} className="block mt-4 pt-3 border-t border-white/5 text-xs text-zinc-500 hover:text-zinc-300 press transition-colors">
          Pilonii se aprind din check-in-ul tău săptămânal. <span className="text-built-red">Trimite primul →</span>
        </Link>
      )}
    </div>
  );
}
