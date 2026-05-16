import { listClients, getClientCheckins } from "@/app/clienti/actions";
import Link from "next/link";

export const dynamic = "force-dynamic";

const SCORE_COLOR = (v: number) =>
  v >= 8 ? "text-emerald-400" : v >= 6 ? "text-yellow-400" : "text-built-red";

export default async function ProgressReportsPage() {
  const clients = await listClients().catch(() => []);
  const active = clients.filter((c) => c.status === "active" || c.status === "at_risk");

  const reports = await Promise.all(
    active.map(async (c) => {
      const checkins = await getClientCheckins(c.id).catch(() => []);
      const last = checkins[0] ?? null;
      const weeksPassed = checkins.length;
      return { client: c, last, weeksPassed };
    })
  );

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-100 mb-1">Progress Reports</h1>
        <p className="text-zinc-500 text-sm">
          {active.length} clienți activi · check-in-uri săptămânale
        </p>
      </div>

      {reports.length === 0 && (
        <div className="bg-[#111111] border border-white/[0.08] rounded-xl p-12 text-center">
          <p className="text-zinc-500 text-[13px]">Niciun client activ momentan.</p>
          <Link href="/dashboard/clients" className="mt-3 inline-block text-[12px] text-built-red hover:underline">
            Adaugă client →
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {reports.map(({ client, last, weeksPassed }) => (
          <div key={client.id} className="bg-[#111111] border border-white/[0.08] rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-[15px] font-semibold text-zinc-100">{client.name}</h2>
                <p className="text-[12px] text-zinc-500 mt-0.5">
                  Săptămâna {weeksPassed} · Start: {new Date(client.start_date).toLocaleDateString("ro-RO")}
                </p>
              </div>
              <Link
                href={`/dashboard/clients/${client.id}`}
                className="text-[12px] text-zinc-500 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
              >
                Profil complet →
              </Link>
            </div>

            {last ? (
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Antrenament", value: last.training_adherence },
                  { label: "Nutriție", value: last.nutrition_adherence },
                  { label: "Energie", value: last.energy_level },
                  { label: "Mental", value: last.mood },
                ].map((item) => (
                  <div key={item.label} className="bg-[#0a0a0a] rounded-lg p-3 text-center">
                    <p className={`text-2xl font-mono font-bold ${SCORE_COLOR(item.value ?? 0)}`}>
                      {item.value ?? "—"}
                    </p>
                    <p className="text-[11px] text-zinc-600 mt-1">{item.label}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-zinc-600 italic">Niciun check-in trimis încă.</p>
            )}

            {last?.notes && (
              <p className="mt-3 text-[12px] text-zinc-400 border-t border-white/5 pt-3">
                {last.notes}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
