import Link from "next/link";
import { getClientDashboard, getTodayLog, getTodayMetrics, getTodayNote, getStreak, getClientBadges } from "../actions";
import { NAV_ICONS } from "@/components/nav-icons";
import DailyChecklist from "./DailyChecklist";
import DailyMetrics from "./DailyMetrics";
import ProgressTrend from "./ProgressTrend";
import DailyReflection from "./DailyReflection";
import OnboardingJourney from "./OnboardingJourney";
import Badges from "./Badges";
import PillarRadar, { type PillarScores } from "./PillarRadar";

const clamp = (n: number) => Math.max(0, Math.min(100, n));

function pillarScores(c: {
  training_adherence?: number | null; nutrition_adherence?: number | null;
  energy_level?: number | null; sleep_hours?: number | null;
  hydration_l?: number | null; stress_level?: number | null;
} | null): PillarScores | null {
  if (!c) return null;
  return {
    B: clamp(c.training_adherence ?? 0),
    U: clamp((c.energy_level ?? 0) * 10),
    I: clamp(c.nutrition_adherence ?? 0),
    L: clamp((((c.sleep_hours ?? 0) / 8) * 100 + ((c.hydration_l ?? 0) / 3) * 100) / 2),
    T: clamp(100 - (c.stress_level ?? 5) * 10),
  };
}

export const dynamic = "force-dynamic";

export default async function ClientDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const { clientId: clientIdStr } = await searchParams;
  const overrideId = clientIdStr ? Number(clientIdStr) : undefined;

  const data = await getClientDashboard(overrideId);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-zinc-500 text-sm">Niciun client găsit.</p>
      </div>
    );
  }

  const { client, weekNumber, daysInProgram, latestCheckin, unreadCount } = data;
  const clientId = client?.id;
  const [todayLog, todayMetrics, todayNote, streak, badges] = clientId
    ? await Promise.all([getTodayLog(clientId), getTodayMetrics(clientId), getTodayNote(clientId), getStreak(clientId), getClientBadges(clientId)])
    : [{}, {}, "", 0, []];

  return (
    <div className="p-5 md:p-8 max-w-4xl">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="font-condensed text-[11px] text-built-red uppercase tracking-[0.25em] mb-1">
            Ziua {daysInProgram} / 90 · Săptămâna {weekNumber}
          </p>
          <h1 className="font-display text-4xl md:text-5xl tracking-wide text-built-white leading-none">
            SALUT, {(client?.name?.split(" ")[0] ?? "").toUpperCase()}
          </h1>
        </div>
        {streak > 0 && (
          <div className="text-right shrink-0">
            <p className="font-display text-4xl text-built-red leading-none">🔥{streak}</p>
            <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-600 mt-1">zile la rând</p>
          </div>
        )}
      </div>

      {unreadCount > 0 && (
        <Link href={`/client/mesaje${overrideId ? `?clientId=${overrideId}` : ""}`}
          className="flex items-center gap-3 bg-built-red/[0.06] border border-built-red/30 rounded-xl p-4 mb-5 press transition-colors">
          <span className="text-[20px] leading-none text-built-red">{NAV_ICONS.mesaje}</span>
          <span className="flex-1 text-sm text-zinc-100"><span className="font-semibold">{unreadCount} {unreadCount === 1 ? "mesaj nou" : "mesaje noi"}</span> de la Claudiu</span>
          <span className="text-built-red text-lg">→</span>
        </Link>
      )}

      {clientId && daysInProgram >= 1 && daysInProgram <= 7 && (
        <OnboardingJourney day={daysInProgram} qs={overrideId ? `?clientId=${overrideId}` : ""} />
      )}

      {/* ── Esențialul: privirea de ansamblu ── */}
      <div className="bg-[#111111] border border-white/10 rounded-xl p-5 mb-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-zinc-200">Progres program 90 zile</span>
          <span className="text-sm font-bold text-built-red">{Math.min(daysInProgram, 90)}/90 zile</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-built-red-dark to-built-red rounded-full transition-[width] duration-700 ease-out"
            style={{ width: `${Math.min((daysInProgram / 90) * 100, 100)}%` }}
          />
        </div>
      </div>

      {(() => {
        const scores = pillarScores(latestCheckin);
        return scores ? <PillarRadar scores={scores} /> : null;
      })()}

      {badges.length > 0 && <Badges badges={badges} />}

      {clientId && <ProgressTrend clientId={clientId} />}

      {clientId && <DailyReflection clientId={clientId} initial={todayNote} />}

      {/* ── Operațional zilnic ── */}
      {clientId && <DailyChecklist clientId={clientId} initial={todayLog} />}

      {clientId && <DailyMetrics clientId={clientId} initial={todayMetrics} />}

      <div className="stagger grid grid-cols-2 md:grid-cols-3 gap-4 mb-5">
        {[
          { label: "Antrenament", value: `${latestCheckin?.training_adherence ?? "--"}%`, sub: "Săptămâna trecută" },
          { label: "Nutriție", value: `${latestCheckin?.nutrition_adherence ?? "--"}%`, sub: "Săptămâna trecută" },
          { label: "Energie", value: `${latestCheckin?.energy_level ?? "--"}/10`, sub: "Nivel zilnic" },
          { label: "Somn", value: `${latestCheckin?.sleep_hours ?? "--"}h`, sub: "Ore pe noapte" },
          { label: "Hidratare", value: `${latestCheckin?.hydration_l ?? "--"}L`, sub: "Litri pe zi" },
          { label: "Stres", value: `${latestCheckin?.stress_level ?? "--"}/10`, sub: "Nivel general" },
        ].map((s) => (
          <div key={s.label} className="bg-[#111111] border border-white/10 rounded-xl p-4">
            <p className="text-xs text-zinc-500 mb-1">{s.label}</p>
            <p className="text-2xl font-bold text-white">{s.value}</p>
            {s.sub && <p className="text-xs text-zinc-600 mt-0.5">{s.sub}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
