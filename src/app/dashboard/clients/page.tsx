import Link from "next/link";
import { listClients } from "@/app/clienti/actions";
import { NewClientForm } from "@/app/clienti/NewClientForm";
import { getUnreadCountPerClient } from "@/app/client/actions";

export const dynamic = "force-dynamic";

const STATUS_COLOR: Record<string, string> = {
  active: "text-emerald-400",
  at_risk: "text-orange-400",
  completed: "text-zinc-500",
  paused: "text-amber-400",
};
const STATUS_LABEL: Record<string, string> = {
  active: "Activ",
  at_risk: "⚠ La risc",
  completed: "Finalizat",
  paused: "Pauza",
};

export default async function ClientsDashboardPage() {
  const [clients, unreadPerClient] = await Promise.all([
    listClients().catch(() => []),
    getUnreadCountPerClient().catch(() => ({} as Record<number, number>)),
  ]);
  const active = clients.filter((c) => c.status === "active");
  const atRisk = clients.filter((c) => c.status === "at_risk");

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-100 mb-1">Clienti BUILT</h1>
        <p className="text-zinc-500 text-sm">
          {clients.length} clienti total · {active.length} activi · {atRisk.length} la risc
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          ["Total", clients.length],
          ["Activi", active.length],
          ["La risc", atRisk.length],
          ["Finalizati", clients.filter((c) => c.status === "completed").length],
        ].map(([label, value]) => (
          <div key={String(label)} className="bg-[#111111] border border-white/[0.08] rounded-xl p-5">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono mb-2">
              {label}
            </p>
            <p className={`text-3xl font-semibold font-mono ${label === "La risc" && Number(value) > 0 ? "text-orange-400" : "text-zinc-100"}`}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* At Risk Alert */}
      {atRisk.length > 0 && (
        <div className="mb-6 p-4 bg-orange-400/10 border border-orange-400/30 rounded-xl">
          <p className="text-[10px] text-orange-400 uppercase tracking-widest font-mono mb-2">
            ⚠ Interventie necesara
          </p>
          <div className="space-y-1">
            {atRisk.map((c) => (
              <Link
                key={c.id}
                href={`/dashboard/clients/${c.id}`}
                className="flex items-center gap-3 hover:text-orange-300 transition-colors"
              >
                <span className="text-[13px] text-zinc-200">{c.name}</span>
                <span className="text-[11px] text-orange-400">→ Aplica MVR</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Header + Add */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-mono">
          Clienti ({clients.length})
        </p>
        <NewClientForm />
      </div>

      {/* List */}
      {clients.length === 0 ? (
        <div className="bg-[#111111] border border-white/[0.08] rounded-xl p-12 text-center">
          <p className="text-zinc-500 text-[13px]">
            Niciun client inca. Adauga primul client BUILT.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {clients.map((c) => (
            <Link
              key={c.id}
              href={`/dashboard/clients/${c.id}`}
              className="flex items-center justify-between gap-3 p-4 bg-[#111111] border border-white/[0.08] hover:border-built-red/40 rounded-xl transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="text-[14px] font-medium text-zinc-200">{c.name}</span>
                  {(unreadPerClient[c.id] ?? 0) > 0 && (
                    <span className="bg-built-red text-white text-[10px] font-bold rounded-full px-1.5 py-0.5 leading-none">
                      {unreadPerClient[c.id]} mesaj{unreadPerClient[c.id] > 1 ? "e" : ""}
                    </span>
                  )}
                </div>
                {c.email && <p className="text-[11px] text-zinc-500 truncate">{c.email}</p>}
                {c.objectives && (
                  <p className="text-[11px] text-zinc-600 line-clamp-1">{c.objectives}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className={`text-[11px] font-mono uppercase ${STATUS_COLOR[c.status]}`}>
                  {STATUS_LABEL[c.status]}
                </span>
                <span className="text-[10px] text-zinc-600 font-mono whitespace-nowrap">
                  {new Date(c.start_date).toLocaleDateString("ro-RO")}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
