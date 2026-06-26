import { getFinanceOverview } from "@/app/clienti/actions";
import { IncasariClient } from "./IncasariClient";

export const dynamic = "force-dynamic";

function money(n: number, currency: string) {
  return `${Math.round(n).toLocaleString("ro-RO")} ${currency}`;
}

export default async function IncasariPage() {
  const ov = await getFinanceOverview().catch(() => null);

  if (!ov) {
    return (
      <div className="p-5 md:p-8 max-w-3xl">
        <h1 className="font-display text-4xl text-built-white mb-3">ÎNCASĂRI</h1>
        <div className="p-4 bg-amber-400/10 border border-amber-400/40 rounded-sm text-sm text-amber-200">
          Tabela <code>client_finance</code> nu există încă. Rulează migrația{" "}
          <code>supabase/migrations/20260626_client_finance.sql</code> în Supabase, apoi reîncarcă.
        </div>
      </div>
    );
  }

  const restEUR = ov.byCurrency.find((c) => c.currency === "EUR")?.rest ?? 0;

  return (
    <div className="p-5 md:p-8 max-w-4xl">
      <p className="font-condensed text-xs text-built-red uppercase tracking-wider mb-1">Registru · Doar pentru tine</p>
      <h1 className="font-display text-4xl md:text-5xl tracking-[0.06em] text-built-white mb-2">ÎNCASĂRI</h1>
      <p className="text-sm text-built-gray-text mb-8">
        Cine a plătit, cine cât mai are de plătit. Invizibil pentru clienți.
      </p>

      {/* Sumar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
        <div className="p-4 bg-built-gray-1 border border-built-gray-2 rounded-sm">
          <p className="font-condensed text-[10px] text-built-gray-text uppercase">Încasat luna asta</p>
          <p className="font-display text-3xl mt-1 text-emerald-400">{money(ov.collectedThisMonth, "EUR")}</p>
        </div>
        <div className="p-4 bg-built-gray-1 border border-built-gray-2 rounded-sm">
          <p className="font-condensed text-[10px] text-built-gray-text uppercase">De încasat (rest)</p>
          <p className={`font-display text-3xl mt-1 ${restEUR > 0 ? "text-orange-400" : "text-built-red"}`}>{money(restEUR, "EUR")}</p>
        </div>
        <div className="p-4 bg-built-gray-1 border border-built-gray-2 rounded-sm">
          <p className="font-condensed text-[10px] text-built-gray-text uppercase">Clienți cu rest</p>
          <p className={`font-display text-3xl mt-1 ${ov.clientsWithRest > 0 ? "text-orange-400" : "text-built-red"}`}>{ov.clientsWithRest}</p>
        </div>
      </div>

      {/* Defalcare pe monedă (dacă există mai multe) */}
      {ov.byCurrency.length > 1 && (
        <div className="flex flex-wrap gap-3 mb-8 text-xs text-built-gray-text">
          {ov.byCurrency.map((c) => (
            <span key={c.currency} className="px-3 py-1.5 bg-built-gray-1 border border-built-gray-2 rounded-sm">
              <b className="text-built-white">{c.currency}</b> · încasat {money(c.paid, c.currency)} · rest{" "}
              <span className={c.rest > 0 ? "text-orange-400" : ""}>{money(c.rest, c.currency)}</span>
            </span>
          ))}
        </div>
      )}

      <IncasariClient rows={ov.rows} />
    </div>
  );
}
