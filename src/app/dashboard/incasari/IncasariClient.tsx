"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  getClientFinance,
  setClientDeal,
  addPayment,
  deletePayment,
  type FinanceRow,
  type ClientFinance,
} from "@/app/clienti/actions";

function money(n: number, currency: string) {
  return `${Math.round(n).toLocaleString("ro-RO")} ${currency}`;
}
function fmtDate(d: string | null) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("ro-RO", { day: "2-digit", month: "short" });
  } catch {
    return d;
  }
}

function statusBadge(r: { total: number; paid: number; rest: number }) {
  if (r.total <= 0) return { label: "Fără deal", cls: "text-built-gray-text border-built-gray-2" };
  if (r.rest <= 0.001) return { label: "Plătit integral", cls: "text-emerald-400 border-emerald-400/40" };
  if (r.paid > 0) return { label: "Parțial", cls: "text-orange-400 border-orange-400/40" };
  return { label: "Neîncasat", cls: "text-built-red border-built-red/40" };
}

const PACKAGES = [200, 400, 700];

export function IncasariClient({ rows }: { rows: FinanceRow[] }) {
  const [openId, setOpenId] = useState<number | null>(null);

  // Sortare: cei cu rest de plată sus, apoi fără deal, apoi plătiți integral
  const sorted = [...rows].sort((a, b) => {
    const ra = a.total > 0 && a.rest > 0.001 ? 0 : a.total <= 0 ? 1 : 2;
    const rb = b.total > 0 && b.rest > 0.001 ? 0 : b.total <= 0 ? 1 : 2;
    if (ra !== rb) return ra - rb;
    return b.rest - a.rest;
  });

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-condensed text-[11px] text-built-gray-text uppercase tracking-wider">
          Clienți ({rows.length})
        </h3>
      </div>
      {sorted.map((r) => (
        <RowCard key={r.clientId} row={r} open={openId === r.clientId} onToggle={() => setOpenId(openId === r.clientId ? null : r.clientId)} />
      ))}
      {rows.length === 0 && (
        <div className="p-8 bg-built-gray-1 border border-built-gray-2 rounded-sm text-center text-built-gray-text">
          Niciun client încă.
        </div>
      )}
    </div>
  );
}

function RowCard({ row, open, onToggle }: { row: FinanceRow; open: boolean; onToggle: () => void }) {
  const badge = statusBadge(row);
  return (
    <div className="bg-built-gray-1 border border-built-gray-2 rounded-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-built-gray-2/30 transition-colors press"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-display text-lg tracking-wider text-built-white truncate">{row.name}</span>
            <span className={`font-condensed text-[9px] uppercase px-1.5 py-0.5 border rounded-sm ${badge.cls}`}>{badge.label}</span>
          </div>
          {row.note && <p className="text-[11px] text-built-gray-text mt-0.5 line-clamp-1">{row.note}</p>}
        </div>
        <div className="flex items-center gap-4 shrink-0 text-right">
          <div>
            <p className="font-condensed text-[9px] text-built-gray-text uppercase">Plătit</p>
            <p className="font-display text-base text-emerald-400">{money(row.paid, row.currency)}</p>
          </div>
          <div>
            <p className="font-condensed text-[9px] text-built-gray-text uppercase">Rest</p>
            <p className={`font-display text-base ${row.rest > 0.001 && row.total > 0 ? "text-orange-400" : "text-built-gray-text"}`}>
              {row.total > 0 ? money(row.rest, row.currency) : "—"}
            </p>
          </div>
          <span className={`text-built-gray-text transition-transform ${open ? "rotate-90" : ""}`}>→</span>
        </div>
      </button>
      {open && <RowDetail row={row} />}
    </div>
  );
}

function RowDetail({ row }: { row: FinanceRow }) {
  const [fin, setFin] = useState<ClientFinance | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  // deal form
  const [total, setTotal] = useState<string>(String(row.total || ""));
  const [currency, setCurrency] = useState<string>(row.currency || "EUR");
  const [dealNote, setDealNote] = useState<string>(row.note || "");

  // payment form
  const [amount, setAmount] = useState<string>("");
  const [payDate, setPayDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [method, setMethod] = useState<string>("");
  const [payNote, setPayNote] = useState<string>("");

  const router = useRouter();

  async function reload() {
    setLoading(true);
    const f = await getClientFinance(row.clientId);
    setFin(f);
    setTotal(String(f.total || ""));
    setCurrency(f.currency);
    setDealNote(f.note || "");
    setLoading(false);
    // reîmprospătează sumarul de sus + rândul colapsat (date din server)
    router.refresh();
  }

  // load on first render
  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function saveDeal() {
    setErr(null);
    startTransition(async () => {
      const res = await setClientDeal(row.clientId, Number(total) || 0, currency, dealNote || null);
      if (!res.ok) setErr(res.error);
      else await reload();
    });
  }

  function logPayment() {
    setErr(null);
    if (!(Number(amount) > 0)) {
      setErr("Pune o sumă mai mare ca 0.");
      return;
    }
    startTransition(async () => {
      const res = await addPayment(row.clientId, {
        amount: Number(amount),
        date: payDate,
        method: method || undefined,
        note: payNote || undefined,
      });
      if (!res.ok) setErr(res.error);
      else {
        setAmount("");
        setMethod("");
        setPayNote("");
        await reload();
      }
    });
  }

  function removePayment(id: string) {
    startTransition(async () => {
      const res = await deletePayment(row.clientId, id);
      if (!res.ok) setErr(res.error);
      else await reload();
    });
  }

  const f = fin;
  const rest = f ? f.total - f.paid : row.rest;

  const inputCls =
    "w-full rounded-sm border border-built-gray-2 bg-built-black px-3 py-2 text-sm text-built-white outline-none focus:border-built-red";

  return (
    <div className="border-t border-built-gray-2 p-4 space-y-5 bg-built-black/40">
      {err && <p className="text-xs text-built-red">{err}</p>}

      {/* Deal */}
      <div>
        <p className="font-condensed text-[10px] text-built-gray-text uppercase mb-2">Deal agreat</p>
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex gap-1">
            {PACKAGES.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setTotal(String(p))}
                className={`font-condensed text-xs px-2.5 py-2 rounded-sm border transition-colors ${
                  Number(total) === p ? "border-built-red text-built-red" : "border-built-gray-2 text-built-gray-text hover:text-built-white"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="w-24">
            <input value={total} onChange={(e) => setTotal(e.target.value)} inputMode="decimal" placeholder="Total" className={inputCls} />
          </div>
          <div className="w-20">
            <input value={currency} onChange={(e) => setCurrency(e.target.value.toUpperCase())} placeholder="EUR" className={inputCls} />
          </div>
          <div className="flex-1 min-w-[140px]">
            <input value={dealNote} onChange={(e) => setDealNote(e.target.value)} placeholder="Notă (ex: cuplu, avans Revolut)" className={inputCls} />
          </div>
          <button
            onClick={saveDeal}
            disabled={pending}
            className="font-condensed uppercase text-xs tracking-wider px-4 py-2.5 bg-built-gray-2 text-built-white rounded-sm hover:bg-built-gray-2/70 disabled:opacity-50"
          >
            Salvează
          </button>
        </div>
      </div>

      {/* Plăți */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="font-condensed text-[10px] text-built-gray-text uppercase">Tranșe</p>
          {f && f.total > 0 && (
            <p className="font-condensed text-[10px] uppercase">
              <span className="text-emerald-400">{money(f.paid, f.currency)}</span>
              <span className="text-built-gray-text"> din {money(f.total, f.currency)} · rest </span>
              <span className={rest > 0.001 ? "text-orange-400" : "text-emerald-400"}>{money(rest, f.currency)}</span>
            </p>
          )}
        </div>

        {loading && <p className="text-xs text-built-gray-text">Se încarcă…</p>}

        {!loading && f && f.payments.length > 0 && (
          <div className="space-y-1 mb-3">
            {f.payments.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-2 px-3 py-2 bg-built-gray-1 border border-built-gray-2 rounded-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-display text-base text-emerald-400">{money(p.amount, f.currency)}</span>
                  <span className="text-[11px] text-built-gray-text">{fmtDate(p.date)}</span>
                  {p.method && <span className="text-[10px] uppercase text-built-gray-text border border-built-gray-2 px-1.5 rounded-sm">{p.method}</span>}
                  {p.note && <span className="text-[11px] text-built-gray-text truncate">{p.note}</span>}
                </div>
                <button onClick={() => removePayment(p.id)} disabled={pending} className="text-built-gray-text hover:text-built-red text-xs shrink-0">
                  Șterge
                </button>
              </div>
            ))}
          </div>
        )}

        {!loading && f && f.payments.length === 0 && (
          <p className="text-xs text-built-gray-text mb-3">Nicio tranșă încă.</p>
        )}

        {/* Adaugă tranșă */}
        <div className="flex flex-wrap items-end gap-2">
          <div className="w-28">
            <label className="block font-condensed text-[9px] text-built-gray-text uppercase mb-1">Sumă</label>
            <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" placeholder="ex: 200" className={inputCls} />
          </div>
          <div className="w-36">
            <label className="block font-condensed text-[9px] text-built-gray-text uppercase mb-1">Data</label>
            <input type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} className={inputCls} />
          </div>
          <div className="w-32">
            <label className="block font-condensed text-[9px] text-built-gray-text uppercase mb-1">Metodă</label>
            <input value={method} onChange={(e) => setMethod(e.target.value)} placeholder="Revolut / cash" className={inputCls} />
          </div>
          <div className="flex-1 min-w-[120px]">
            <label className="block font-condensed text-[9px] text-built-gray-text uppercase mb-1">Notă</label>
            <input value={payNote} onChange={(e) => setPayNote(e.target.value)} placeholder="ex: avans" className={inputCls} />
          </div>
          <button
            onClick={logPayment}
            disabled={pending}
            className="font-condensed uppercase text-xs tracking-wider px-4 py-2.5 bg-built-red text-white rounded-sm hover:bg-built-red/85 disabled:opacity-50"
          >
            + Tranșă
          </button>
        </div>
      </div>
    </div>
  );
}
