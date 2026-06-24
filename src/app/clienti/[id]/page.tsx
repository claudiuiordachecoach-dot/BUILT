import { notFound } from "next/navigation";
import { getClient, getClientCheckins, getIntake, getIntakeToken, getClientDailyMetrics } from "../actions";
import { ClientDetail } from "./ClientDetail";
import { CopyIntakeLink } from "./CopyIntakeLink";
import { ALL_INTAKE_FIELDS } from "@/app/fisa-start/[token]/fields";

export const dynamic = "force-dynamic";

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);
  if (!numId) notFound();
  const [client, checkins, intake, intakeToken, dailyMetrics] = await Promise.all([
    getClient(numId).catch(() => null),
    getClientCheckins(numId).catch(() => []),
    getIntake(numId).catch(() => null),
    getIntakeToken(numId).catch(() => null),
    getClientDailyMetrics(numId).catch(() => []),
  ]);
  if (!client) notFound();

  const avg = (vals: number[]) => (vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null);
  const avgSteps = avg(dailyMetrics.map((r) => r.steps).filter((v): v is number => v != null));
  const sleepVals = dailyMetrics.map((r) => r.sleep_h).filter((v): v is number => v != null);
  const avgSleep = sleepVals.length ? (sleepVals.reduce((a, b) => a + b, 0) / sleepVals.length).toFixed(1) : null;
  const lastWeight = dailyMetrics.find((r) => r.weight != null)?.weight ?? null;
  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-2">
        <a href="/clienti" className="font-condensed text-[10px] text-built-gray-text hover:text-built-red">← Clienți</a>
        <span className="text-built-gray-text">/</span>
        <p className="font-condensed text-[10px] text-built-red uppercase">{client.name}</p>
      </div>
      <ClientDetail client={client} initialCheckins={checkins} />

      {/* ---------- Numere zilnice (pași/somn/greutate de la client) ---------- */}
      <section className="mt-10 border-t border-white/10 pt-6">
        <h2 className="font-display text-2xl tracking-wide text-built-white mb-1">Numere zilnice</h2>
        <p className="font-condensed text-[10px] uppercase tracking-wider text-built-gray-text mb-4">
          Pași · somn · greutate, completate zilnic de client
        </p>

        {dailyMetrics.length === 0 ? (
          <p className="text-sm text-zinc-500">Clientul nu a logat încă numere zilnice.</p>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: "Media pași", value: avgSteps != null ? avgSteps.toLocaleString("ro-RO") : "—" },
                { label: "Media somn", value: avgSleep != null ? `${avgSleep}h` : "—" },
                { label: "Greutate", value: lastWeight != null ? `${lastWeight} kg` : "—" },
              ].map((s) => (
                <div key={s.label} className="min-w-0 p-4 bg-built-gray-1 border border-built-gray-2 rounded-sm">
                  <p className="font-condensed text-[10px] text-built-gray-text uppercase tracking-wide whitespace-nowrap">{s.label}</p>
                  <p className="font-display text-2xl text-built-red mt-1 leading-none whitespace-nowrap tabular-nums">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="overflow-hidden rounded-lg border border-white/10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-white/[0.03] font-condensed text-[10px] uppercase tracking-wider text-built-gray-text">
                    <th className="text-left px-4 py-2.5 font-normal">Zi</th>
                    <th className="text-right px-3 py-2.5 font-normal">Pași</th>
                    <th className="text-right px-3 py-2.5 font-normal">Somn</th>
                    <th className="text-right px-4 py-2.5 font-normal">Greutate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {dailyMetrics.map((r) => (
                    <tr key={r.date}>
                      <td className="px-4 py-2.5 text-zinc-400 whitespace-nowrap">
                        {new Date(r.date + "T12:00:00").toLocaleDateString("ro-RO", { weekday: "short", day: "numeric", month: "short" })}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-zinc-200">{r.steps != null ? r.steps.toLocaleString("ro-RO") : "—"}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-zinc-200">{r.sleep_h != null ? `${r.sleep_h}h` : "—"}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-zinc-200">{r.weight != null ? `${r.weight} kg` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {/* ---------- Fișa de Start (intake onboarding) ---------- */}
      <section className="mt-10 border-t border-white/10 pt-6">
        <div className="flex items-center justify-between mb-4 gap-4">
          <h2 className="font-display text-2xl tracking-wide text-built-white">Fișa de Start</h2>
          {intakeToken && <CopyIntakeLink token={intakeToken} />}
        </div>

        {intake ? (
          <div className="space-y-3">
            <p className="font-condensed text-[10px] uppercase tracking-wider text-built-gray-text">
              Completată {new Date(intake.submitted_at).toLocaleDateString("ro-RO")}
            </p>
            <div className="grid gap-3">
              {ALL_INTAKE_FIELDS.map((f) => {
                const val = intake.answers?.[f.key];
                if (!val) return null;
                return (
                  <div key={f.key} className="bg-[#111111] border border-white/10 rounded-lg p-4">
                    <p className="font-condensed text-[10px] uppercase tracking-wider text-built-red mb-1">{f.label}</p>
                    <p className="text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed">{val}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-sm text-zinc-500">
            Clientul nu a completat încă Fișa de Start. Copiază linkul și trimite-i-l pe WhatsApp.
          </p>
        )}
      </section>
    </div>
  );
}
