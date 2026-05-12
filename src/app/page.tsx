import Link from "next/link";
import { MODULES } from "@/lib/modules";
import {
  buildWeek,
  formatTodayLong,
  formatWeekRange,
  getWeekStart,
  todayUtc,
  toIsoDate,
} from "@/lib/week";
import {
  getTodayReel,
  listUnscheduledReels,
  listWeekReels,
} from "@/app/actions";
import { DailyFocusCard } from "@/components/DailyFocusCard";
import { WeekNavigator } from "@/components/WeekNavigator";
import { CalendarClientWrapper } from "@/components/CalendarClientWrapper";

export const dynamic = "force-dynamic";

interface HomeProps {
  searchParams: Promise<{ week?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const sp = await searchParams;
  const today = todayUtc();
  const todayIso = toIsoDate(today);
  const todayWeekStart = getWeekStart(today);
  const todayWeekStartIso = toIsoDate(todayWeekStart);

  const requestedWeekIso =
    sp.week && /^\d{4}-\d{2}-\d{2}$/.test(sp.week) ? sp.week : null;
  const weekStartIso = requestedWeekIso ?? todayWeekStartIso;
  const weekStart = new Date(weekStartIso + "T00:00:00.000Z");
  const week = buildWeek(weekStart, todayIso);

  const [weekReelsResult, unscheduledResult, todayReelResult] =
    await Promise.allSettled([
      listWeekReels(weekStartIso),
      listUnscheduledReels(),
      getTodayReel(),
    ]);

  const weekReels =
    weekReelsResult.status === "fulfilled" ? weekReelsResult.value : [];
  const unscheduled =
    unscheduledResult.status === "fulfilled" ? unscheduledResult.value : [];
  const todayReel =
    todayReelResult.status === "fulfilled" ? todayReelResult.value : null;

  const dataError =
    weekReelsResult.status === "rejected"
      ? weekReelsResult.reason
      : unscheduledResult.status === "rejected"
      ? unscheduledResult.reason
      : todayReelResult.status === "rejected"
      ? todayReelResult.reason
      : null;

  const todayLong = formatTodayLong(today);
  const weekRange = formatWeekRange(week);

  const postedThisWeek = weekReels.filter((r) => r.status === "posted").length;
  const scheduledThisWeek = weekReels.length;

  return (
    <div className="p-8 max-w-[1400px] mx-auto">
      {/* Header — Astăzi + WeekNavigator */}
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="font-condensed text-xs text-built-red uppercase tracking-wider mb-1">
            Daily Brief · M5
          </p>
          <h1 className="font-display text-5xl tracking-[0.06em] text-built-white leading-none">
            {todayLong}
          </h1>
          <p className="text-built-gray-text mt-2 text-sm">
            {scheduledThisWeek}/7 reels programate săptămâna asta ·{" "}
            {postedThisWeek} postate
          </p>
        </div>
        <WeekNavigator
          weekStartIso={weekStartIso}
          rangeLabel={weekRange}
          todayWeekStartIso={todayWeekStartIso}
        />
      </div>

      {dataError && (
        <div className="mb-6 p-4 bg-built-red/10 border border-built-red text-built-red font-condensed text-xs">
          Eroare la încărcarea datelor:{" "}
          {dataError instanceof Error ? dataError.message : String(dataError)}
        </div>
      )}

      {/* Focus card — reel-ul de azi */}
      <div className="mb-8">
        <DailyFocusCard todayLong={todayLong} reel={todayReel} />
      </div>

      {/* Calendar săptămânal cu DnD */}
      <div className="mb-8">
        <h3 className="font-condensed text-[11px] text-built-gray-text uppercase tracking-wider mb-3">
          Săptămâna · trage reels între zile sau în pool
        </h3>
        <CalendarClientWrapper
          week={week}
          scheduledReels={weekReels}
          unscheduledReels={unscheduled}
        />
      </div>

      {/* M11 placeholder — Recap performanță */}
      <div className="mb-8 p-6 bg-built-gray-1 border border-built-gray-2 border-dashed rounded-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-condensed text-[10px] text-built-gray-text uppercase tracking-wider mb-1">
              Recap performanță · M11
            </p>
            <p className="font-display text-lg tracking-wider text-built-gray-text">
              Disponibil când livrează M11 (Analytics & Performance Loop).
            </p>
            <p className="text-xs text-built-gray-text/70 mt-2">
              Aici va apărea: views/likes/saves pe reel-ul de ieri, pillar
              performance B/U/I/L/T pe ultima săptămână.
            </p>
          </div>
          <span className="font-condensed text-[10px] text-built-gray-text/60 px-3 py-1 border border-built-gray-2/60">
            Planificat
          </span>
        </div>
      </div>

      {/* Module overview — colapsabil */}
      <details className="group">
        <summary className="cursor-pointer font-condensed text-xs text-built-gray-text hover:text-built-white transition-colors mb-3 list-none">
          <span className="inline-block transition-transform group-open:rotate-90 mr-2">
            ›
          </span>
          Toate cele 12 module
        </summary>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
          {MODULES.map((mod) => {
            const isClickable = mod.status !== "planned";
            const card = (
              <div
                className={`p-4 bg-built-gray-1 border rounded-sm h-full transition-colors ${
                  isClickable
                    ? "border-built-gray-2 hover:border-built-red cursor-pointer"
                    : "border-built-gray-2 opacity-50"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-condensed text-[10px] text-built-red">
                    {mod.id}
                  </span>
                  <span className="font-condensed text-[10px] text-built-gray-text">
                    {mod.status === "in_progress"
                      ? "În construcție"
                      : mod.status === "active"
                      ? "Activ"
                      : "Planificat"}
                  </span>
                </div>
                <div className="font-display text-base tracking-wider mb-0.5">
                  {mod.title}
                </div>
                <div className="text-[10px] text-built-gray-text mb-2">
                  {mod.subtitle}
                </div>
                <p className="text-[11px] text-built-white/60 leading-relaxed">
                  {mod.description}
                </p>
              </div>
            );
            const href = mod.id === "M5" ? "/" : `/${mod.slug}`;
            return isClickable ? (
              <Link key={mod.id} href={href}>
                {card}
              </Link>
            ) : (
              <div key={mod.id}>{card}</div>
            );
          })}
        </div>
      </details>
    </div>
  );
}
