import Link from "next/link";
import { getClientDashboard, getTodayLog, getTodayMetrics, getTodayNote, getStreak, getClientBadges } from "../actions";
import { NAV_ICONS } from "@/components/nav-icons";
import DailyChecklist from "./DailyChecklist";
import DailyMetrics from "./DailyMetrics";
import ProgressTrend from "./ProgressTrend";
import DailyReflection from "./DailyReflection";
import OnboardingJourney from "./OnboardingJourney";
import Badges from "./Badges";
import { type PillarScores } from "./PillarRadar";
import WeekProgress from "./WeekProgress";
import PillarBars from "./PillarBars";

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
  const qs = overrideId ? `?clientId=${overrideId}` : "";
  const [todayLog, todayMetrics, todayNote, streak, badges] = clientId
    ? await Promise.all([getTodayLog(clientId), getTodayMetrics(clientId), getTodayNote(clientId), getStreak(clientId), getClientBadges(clientId)])
    : [{}, {}, "", 0, []];

  return (
    <div className="p-5 md:p-8 max-w-4xl">
      <div className="bg-gradient-to-br from-built-red/[0.15] via-[#141414] to-[#111111] border border-built-red/20 rounded-2xl p-5 md:p-6 mb-5 anim-fade-up">
        <div className="flex items-start justify-between gap-4">
          <h1 className="font-display text-4xl md:text-5xl tracking-wide text-built-white leading-none">
            SALUT, {(client?.name?.split(" ")[0] ?? "").toUpperCase()}
          </h1>
          {streak > 0 && (
            <span className="shrink-0 flex items-center gap-1.5 bg-built-red/15 border border-built-red/30 text-built-red rounded-full px-3 py-1.5 text-sm font-bold">
              🔥 {streak} {streak === 1 ? "zi" : "zile"}
            </span>
          )}
        </div>
        <WeekProgress day={daysInProgram} week={weekNumber} />
      </div>

      {unreadCount > 0 && (
        <Link href={`/client/mesaje${overrideId ? `?clientId=${overrideId}` : ""}`}
          className="flex items-center gap-3 bg-built-red/[0.06] border border-built-red/30 rounded-2xl p-4 mb-5 press transition-colors">
          <span className="text-[20px] leading-none text-built-red">{NAV_ICONS.mesaje}</span>
          <span className="flex-1 text-sm text-zinc-100"><span className="font-semibold">{unreadCount} {unreadCount === 1 ? "mesaj nou" : "mesaje noi"}</span> de la Claudiu</span>
          <span className="text-built-red text-lg">→</span>
        </Link>
      )}

      {clientId && daysInProgram >= 1 && daysInProgram <= 7 && (
        <OnboardingJourney day={daysInProgram} qs={overrideId ? `?clientId=${overrideId}` : ""} />
      )}

      {/* Directiva de azi — intră direct în execuție */}
      <Link href={`/client/antrenamente${qs}`}
        className="flex items-center gap-3 bg-gradient-to-r from-built-red to-built-red-dark rounded-2xl p-4 mb-5 press transition-transform hover:scale-[0.99]">
        <span className="text-[20px] leading-none text-white">{NAV_ICONS.antrenamente}</span>
        <span className="flex-1 text-sm text-white"><span className="font-semibold">Antrenamentul de azi</span> — intră în execuție</span>
        <span className="text-white text-lg">→</span>
      </Link>

      <Link href={`/client/raport${overrideId ? `?clientId=${overrideId}` : ""}`}
        className="flex items-center gap-3 bg-[#111111] border border-white/10 rounded-2xl p-4 mb-5 press transition-colors hover:border-built-red/40">
        <span className="text-[20px] leading-none text-built-red">{NAV_ICONS.raport}</span>
        <span className="flex-1 text-sm text-zinc-100"><span className="font-semibold">Raportul tău săptămânal</span> — săptămâna ta + pasul următor</span>
        <span className="text-built-red text-lg">→</span>
      </Link>

      <PillarBars scores={pillarScores(latestCheckin) ?? { B: 0, U: 0, I: 0, L: 0, T: 0 }} qs={qs} />

      {badges.length > 0 && <Badges badges={badges} />}

      {clientId && <ProgressTrend clientId={clientId} />}

      {clientId && <DailyReflection clientId={clientId} initial={todayNote} />}

      {/* ── Operațional zilnic ── */}
      {clientId && <DailyChecklist clientId={clientId} initial={todayLog} />}

      {clientId && <DailyMetrics clientId={clientId} initial={todayMetrics} />}

      {latestCheckin ? (
        <div className="stagger grid grid-cols-2 md:grid-cols-3 gap-4 mb-5">
          {[
            { label: "Antrenament", value: latestCheckin.training_adherence, suffix: "%", sub: "Săptămâna trecută" },
            { label: "Nutriție", value: latestCheckin.nutrition_adherence, suffix: "%", sub: "Săptămâna trecută" },
            { label: "Energie", value: latestCheckin.energy_level, suffix: "/10", sub: "Nivel zilnic" },
            { label: "Somn", value: latestCheckin.sleep_hours, suffix: "h", sub: "Ore pe noapte" },
            { label: "Hidratare", value: latestCheckin.hydration_l, suffix: "L", sub: "Litri pe zi" },
            { label: "Stres", value: latestCheckin.stress_level, suffix: "/10", sub: "Nivel general" },
          ].map((s) => (
            <div key={s.label} className="bg-[#111111] border border-white/10 rounded-2xl p-4">
              <p className="text-xs text-zinc-500 mb-1">{s.label}</p>
              {s.value == null ? (
                <p className="font-display text-2xl text-zinc-700 leading-none">—</p>
              ) : (
                <p className="font-mono-stats text-2xl font-bold text-white leading-none">{s.value}<span className="text-base text-zinc-500">{s.suffix}</span></p>
              )}
              {s.sub && <p className="text-xs text-zinc-600 mt-1">{s.sub}</p>}
            </div>
          ))}
        </div>
      ) : (
        <Link href={`/client/checkin${qs}`}
          className="block bg-built-red/[0.06] border border-dashed border-built-red/40 rounded-2xl p-5 mb-5 press transition-colors hover:bg-built-red/[0.1]">
          <p className="font-condensed text-[11px] text-built-red uppercase tracking-[0.2em] mb-1">Numerele tale</p>
          <p className="text-sm text-zinc-200 font-semibold">Încă niciun check-in trimis.</p>
          <p className="text-xs text-zinc-500 mt-1">Trimite primul check-in → aici îți apar antrenament, energie, somn și restul. <span className="text-built-red">Începe →</span></p>
        </Link>
      )}
    </div>
  );
}
