"use client";

import { useTransition } from "react";
import toast from "react-hot-toast";
import { sendCheckinReminderNow, type PushStatus } from "@/app/clienti/actions";

export function CheckinPushPanel({ status }: { status: PushStatus }) {
  const [pending, start] = useTransition();
  const missing = status.clients.filter((c) => !c.hasPush);

  function send() {
    start(async () => {
      const r = await sendCheckinReminderNow();
      if (!r.ok) { toast.error(r.error); return; }
      if (r.sent === 0) {
        toast("Niciun client cu notificări active acum.");
      } else {
        toast.success(
          `Trimis la ${r.sent} ${r.sent === 1 ? "abonament" : "abonamente"}` +
          (r.reached.length ? ` — ${r.reached.join(", ")}` : "")
        );
      }
      if (r.cleaned > 0) toast(`Curățat ${r.cleaned} abonament${r.cleaned === 1 ? "" : "e"} mort${r.cleaned === 1 ? "" : "e"}.`);
    });
  }

  return (
    <section className="bg-[#111111] border border-white/[0.08] rounded-xl p-6 mb-8">
      <div className="flex items-baseline justify-between mb-1">
        <h2 className="font-display text-2xl tracking-wide text-zinc-100">REMINDER CHECK-IN</h2>
        <span className="text-[11px] font-mono">
          <span className={status.reachable === status.total ? "text-emerald-400" : "text-orange-400"}>
            {status.reachable}
          </span>
          <span className="text-zinc-500">/{status.total} pot primi push</span>
        </span>
      </div>
      <p className="text-[13px] text-zinc-500 mb-4">
        Trimite acum nudge-ul de check-in către clienții cu notificări active. Abonamentele moarte se curăță automat.
      </p>

      {missing.length > 0 && (
        <p className="text-[12px] text-orange-400/90 mb-4 leading-relaxed">
          Fără notificări: <span className="text-zinc-300 font-medium">{missing.map((c) => c.name).join(", ")}</span>
          {" "}— pune-i să apese „Activează Notificările” în Profilul lor.
        </p>
      )}

      <button
        onClick={send}
        disabled={pending}
        className="press font-condensed text-[11px] uppercase tracking-wider px-4 py-2.5 rounded-lg bg-built-red text-white hover:bg-built-red/90 disabled:opacity-40 transition-colors"
      >
        {pending ? "Se trimite..." : "Trimite check-in acum"}
      </button>
    </section>
  );
}
