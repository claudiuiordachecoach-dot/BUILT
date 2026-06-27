import Link from "next/link";
import { listClients, getRetentionPulse } from "./actions";
import { NewClientForm } from "./NewClientForm";
import { CoachProfileCard } from "./CoachProfileCard";
import { ClientPulse } from "./ClientPulse";

export const dynamic = "force-dynamic";

const STATUS_COLOR: Record<string, string> = {
  active: "text-emerald-400", at_risk: "text-orange-400",
  completed: "text-built-gray-text", paused: "text-amber-400",
};
const STATUS_LABEL: Record<string, string> = {
  active: "Activ", at_risk: "⚠ La risc", completed: "Finalizat", paused: "Pauză",
};

export default async function ClientiPage() {
  const [clients, pulse] = await Promise.all([
    listClients().catch(() => []),
    getRetentionPulse().catch(() => []),
  ]);
  const active = clients.filter((c) => c.status === "active");
  const atRisk = clients.filter((c) => c.status === "at_risk");

  return (
    <div className="p-5 md:p-8 max-w-4xl">
      <p className="font-condensed text-xs text-built-red uppercase tracking-wider mb-1">M12 · Clienți & Retenție</p>
      <h1 className="font-display text-4xl md:text-5xl tracking-[0.06em] text-built-white mb-8">CLIENȚI BUILT</h1>

      <CoachProfileCard />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[["Total", clients.length], ["Activi", active.length], ["La risc", atRisk.length], ["Finalizați", clients.filter(c => c.status === "completed").length]].map(([l, v]) => (
          <div key={l} className="p-4 bg-built-gray-1 border border-built-gray-2 rounded-sm">
            <p className="font-condensed text-[10px] text-built-gray-text uppercase">{l}</p>
            <p className={`font-display text-3xl mt-1 ${l === "La risc" && (v as number) > 0 ? "text-orange-400" : "text-built-red"}`}>{v}</p>
          </div>
        ))}
      </div>

      <ClientPulse rows={pulse} />

      <div className="flex items-center justify-between mb-4">
        <h3 className="font-condensed text-[11px] text-built-gray-text uppercase tracking-wider">Clienți ({clients.length})</h3>
        <NewClientForm />
      </div>

      {clients.length === 0 ? (
        <div className="p-8 bg-built-gray-1 border border-built-gray-2 rounded-sm text-center">
          <p className="text-built-gray-text">Niciun client încă. Adaugă primul client BUILT.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {clients.map((c) => (
            <Link key={c.id} href={`/clienti/${c.id}`}
              className="flex items-center justify-between p-4 bg-built-gray-1 border border-built-gray-2 hover:border-built-red rounded-sm transition-colors">
              <div>
                <span className="font-display text-lg tracking-wider text-built-white mr-3">{c.name}</span>
                {c.email && <span className="text-xs text-built-gray-text">{c.email}</span>}
                {c.objectives && <p className="text-xs text-built-gray-text mt-0.5 line-clamp-1">{c.objectives}</p>}
              </div>
              <div className="flex items-center gap-4">
                <span className="font-condensed text-[10px] text-built-gray-text">Start: {new Date(c.start_date).toLocaleDateString("ro-RO")}</span>
                <span className={`font-condensed text-[10px] uppercase ${STATUS_COLOR[c.status]}`}>{STATUS_LABEL[c.status]}</span>
                <span className="text-built-gray-text">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
