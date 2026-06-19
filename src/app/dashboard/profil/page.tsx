import { getCoachProfile, getCoachStats } from "./actions";
import CoachProfileForm from "./CoachProfileForm";

export const dynamic = "force-dynamic";

export default async function CoachProfilePage() {
  const [profile, stats] = await Promise.all([getCoachProfile(), getCoachStats()]);

  const statCards = [
    { label: "Clienți", value: stats.total },
    { label: "Activi", value: stats.active },
    { label: "La risc", value: stats.atRisk, warn: stats.atRisk > 0 },
    { label: "Mesaje necitite", value: stats.unreadMessages, warn: stats.unreadMessages > 0 },
  ];

  return (
    <div className="p-5 md:p-8 max-w-3xl">
      <p className="font-condensed text-xs text-built-red uppercase tracking-wider mb-1">Profilul Meu</p>
      <h1 className="font-display text-4xl md:text-5xl tracking-[0.06em] text-built-white mb-8">COACH</h1>

      {/* Statistici business */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className="p-4 bg-built-gray-1 border border-built-gray-2 rounded-lg">
            <p className="font-condensed text-[10px] text-built-gray-text uppercase">{s.label}</p>
            <p className={`font-display text-3xl mt-1 ${s.warn ? "text-orange-400" : "text-built-red"}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <CoachProfileForm initial={profile} />
    </div>
  );
}
