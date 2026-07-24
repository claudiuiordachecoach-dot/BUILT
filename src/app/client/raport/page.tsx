import Link from "next/link";
import { getWeeklyRecap } from "../actions";

export const dynamic = "force-dynamic";

const PILLAR_LABELS: Record<string, string> = {
  B: "Bază (forță)",
  U: "Capacitate",
  I: "Nutriție",
  L: "Stil de viață",
  T: "Mindset",
};

function Stat({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className="bg-[#111111] border border-white/10 rounded-2xl p-4">
      <p className="font-condensed text-[10px] text-zinc-500 uppercase tracking-wide">{label}</p>
      <p className={`font-display text-3xl mt-1 leading-none tabular-nums ${accent ? "text-built-red" : "text-white"}`}>{value}</p>
      {sub && <p className="text-[11px] text-zinc-600 mt-1">{sub}</p>}
    </div>
  );
}

export default async function RaportPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const { clientId: clientIdStr } = await searchParams;
  const overrideId = clientIdStr ? Number(clientIdStr) : undefined;
  const qs = overrideId ? `?clientId=${overrideId}` : "";
  const r = await getWeeklyRecap(overrideId);

  if (!r) {
    return (
      <div className="p-5 md:p-8 max-w-4xl">
        <p className="text-zinc-500 text-sm">Niciun client găsit.</p>
      </div>
    );
  }

  const deltaColor = (d: number | null, lowerIsBetter = true) =>
    d == null || d === 0 ? "text-zinc-400" : (lowerIsBetter ? d < 0 : d > 0) ? "text-green-400" : "text-amber-400";
  const deltaStr = (d: number | null, unit: string) => (d == null ? "" : `${d > 0 ? "+" : ""}${d}${unit} de la start`);

  return (
    <div className="p-5 md:p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6 flex items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="font-condensed text-[11px] text-built-red uppercase tracking-[0.25em] mb-1">
            Raportul tău · Săptămâna {r.weekNumber}
          </p>
          <h1 className="font-display text-4xl md:text-5xl tracking-wide text-built-white leading-none">
            {r.firstName ? `${r.firstName.toUpperCase()}, ` : ""}IATĂ SĂPTĂMÂNA TA
          </h1>
        </div>
        {r.streak > 0 && (
          <div className="text-right shrink-0">
            <p className="font-display text-4xl text-built-red leading-none">🔥{r.streak}</p>
            <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-600 mt-1">zile la rând</p>
          </div>
        )}
      </div>

      {/* Stare goală — motivantă, nu un zid de „--" */}
      {!r.hasData && (
        <div className="bg-built-red/[0.06] border border-built-red/30 rounded-2xl p-6 mb-6">
          <p className="text-zinc-200 leading-relaxed">
            Săptămâna asta încă n-ai lăsat nicio urmă în sistem. Nu e o problemă — e doar un raport gol care
            așteaptă date. <span className="text-white font-semibold">Un singur lucru</span> îl pornește:
          </p>
        </div>
      )}

      {/* Micro-obiectivul — UN singur lucru */}
      <div className="bg-gradient-to-br from-built-red/15 to-transparent border border-built-red/40 rounded-2xl p-6 mb-6">
        <p className="font-condensed text-[10px] text-built-red uppercase tracking-[0.25em] mb-2">
          Pasul tău pentru săptămâna viitoare
        </p>
        <p className="font-display text-2xl md:text-3xl text-white leading-tight mb-2">{r.microTarget.title}</p>
        <p className="text-sm text-zinc-400 leading-relaxed">{r.microTarget.why}</p>
      </div>

      {r.hasData && (
        <>
          {/* Cifrele săptămânii */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <Stat
              label="Antrenamente"
              value={String(r.trainingsDone)}
              sub={r.trainingsSkipped > 0 ? `${r.trainingsSkipped} sărite` : "făcute"}
              accent={r.trainingsDone > 0}
            />
            <Stat label="Pași / zi" value={r.avgSteps != null ? r.avgSteps.toLocaleString("ro-RO") : "—"} sub="media săptămânii" />
            <Stat label="Somn / noapte" value={r.avgSleep != null ? `${r.avgSleep}h` : "—"} sub="media săptămânii" />
            <Stat label="Zile bifate" value={`${r.daysLogged}/7`} sub="prezență" accent={r.daysLogged >= 4} />
          </div>

          {/* Evoluția corpului */}
          {(r.weightNow != null || r.waistNow != null) && (
            <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 mb-6">
              <p className="font-condensed text-[10px] text-zinc-500 uppercase tracking-wide mb-3">Evoluția ta</p>
              <div className="grid grid-cols-2 gap-4">
                {r.weightNow != null && (
                  <div>
                    <p className="font-display text-3xl text-white leading-none tabular-nums">{r.weightNow} kg</p>
                    <p className={`text-sm mt-1 ${deltaColor(r.weightDelta)}`}>{deltaStr(r.weightDelta, " kg") || "greutate"}</p>
                    {r.targetWeight != null && <p className="text-[11px] text-zinc-600 mt-0.5">țintă {r.targetWeight} kg</p>}
                  </div>
                )}
                {r.waistNow != null && (
                  <div>
                    <p className="font-display text-3xl text-white leading-none tabular-nums">{r.waistNow} cm</p>
                    <p className={`text-sm mt-1 ${deltaColor(r.waistDelta)}`}>{deltaStr(r.waistDelta, " cm") || "talie"}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cei 5 piloni */}
          {r.pillars && (
            <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 mb-6">
              <p className="font-condensed text-[10px] text-zinc-500 uppercase tracking-wide mb-3">
                Cei 5 piloni · din ultimul check-in
              </p>
              <div className="space-y-2.5">
                {(["B", "U", "I", "L", "T"] as const).map((k) => (
                  <div key={k} className="flex items-center gap-3">
                    <span className="w-28 shrink-0 text-[12px] text-zinc-400">{PILLAR_LABELS[k]}</span>
                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-built-red-dark to-built-red rounded-full"
                        style={{ width: `${r.pillars![k]}%` }}
                      />
                    </div>
                    <span className="w-9 text-right text-[12px] text-zinc-300 tabular-nums">{Math.round(r.pillars![k])}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recorduri de forță */}
          {r.strengthPRs.length > 0 && (
            <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 mb-6">
              <p className="font-condensed text-[10px] text-zinc-500 uppercase tracking-wide mb-3">Forță · cele mai bune seturi</p>
              <div className="space-y-2">
                {r.strengthPRs.map((p) => (
                  <div key={p.exercise} className="flex items-center justify-between gap-3">
                    <span className="text-sm text-zinc-200 truncate">{p.exercise}</span>
                    <span className="flex items-center gap-2 shrink-0">
                      {p.isPR && (
                        <span className="font-condensed text-[9px] uppercase tracking-wider text-green-400 bg-green-500/10 border border-green-500/30 px-2 py-0.5 rounded">
                          record nou
                        </span>
                      )}
                      <span className="font-display text-xl text-white tabular-nums">{p.weight}kg × {p.reps}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Check-in: dacă lipsește săptămâna asta */}
      {!r.checkinThisWeek && (
        <Link
          href={`/client/checkin${qs}`}
          className="flex items-center gap-3 bg-built-red/[0.06] border border-built-red/30 rounded-2xl p-4 mb-6 press transition-colors"
        >
          <span className="flex-1 text-sm text-zinc-100">
            <span className="font-semibold">N-ai trimis check-in-ul săptămâna asta.</span> 2 minute — și sistemul se recalibrează.
          </span>
          <span className="text-built-red text-lg">→</span>
        </Link>
      )}

      <p className="text-center text-[12px] text-zinc-600 mt-8">
        Nu construim săptămâni perfecte. Construim săptămâni care se adună.
      </p>
    </div>
  );
}
