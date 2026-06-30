import type { Badge } from "../actions";

export default function Badges({ badges }: { badges: Badge[] }) {
  const earned = badges.filter((b) => b.earned).length;

  return (
    <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 mb-5">
      <div className="flex items-center justify-between mb-4">
        <span className="font-condensed text-[11px] text-zinc-400 uppercase tracking-[0.2em]">Jaloane</span>
        <span className="font-display text-xl text-built-red leading-none">{earned}/{badges.length}</span>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {badges.map((b) => (
          <div
            key={b.id}
            title={b.earned ? b.label : b.hint || `Blocat: ${b.label}`}
            className={`flex flex-col items-center gap-1 p-3 rounded-lg border text-center transition-all ${
              b.earned
                ? "bg-built-red/10 border-built-red/40"
                : "bg-black/20 border-white/5 opacity-40"
            }`}
          >
            <span className={`text-2xl ${b.earned ? "" : "grayscale"}`}>{b.earned ? b.icon : "🔒"}</span>
            <span className={`text-[10px] leading-tight ${b.earned ? "text-zinc-200" : "text-zinc-600"}`}>
              {b.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
