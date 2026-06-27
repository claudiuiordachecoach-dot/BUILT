"use client";

import { useState } from "react";
import { generateIntervention, type RetentionPulseRow } from "./actions";
import { sendAdminMessage } from "@/app/client/actions";

const DOT: Record<RetentionPulseRow["level"], string> = {
  ok: "bg-emerald-400",
  atentie: "bg-orange-400",
  tacut: "bg-built-red",
};

export function ClientPulse({ rows }: { rows: RetentionPulseRow[] }) {
  const needsAction = rows.filter((r) => r.level !== "ok");
  const [openId, setOpenId] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [sentId, setSentId] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  if (rows.length === 0) return null;

  async function generate(id: number) {
    setOpenId(id);
    setDraft("");
    setErr("");
    setSentId(null);
    setLoading(true);
    const res = await generateIntervention(id);
    setLoading(false);
    if (res.ok) setDraft(res.data);
    else setErr(res.error);
  }

  async function send(id: number) {
    if (!draft.trim()) return;
    setLoading(true);
    await sendAdminMessage(id, draft.trim());
    setLoading(false);
    setSentId(id);
    setOpenId(null);
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <p className="font-condensed text-[10px] text-built-red uppercase tracking-wider">
          Pulsul retenției · activitate reală
        </p>
        {needsAction.length === 0 && <span className="text-[10px] text-emerald-400 font-condensed uppercase">Toți pe traseu ✓</span>}
      </div>

      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.id} className="bg-built-gray-1 border border-built-gray-2 rounded-sm overflow-hidden">
            <div className="flex items-center gap-3 p-3">
              <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${DOT[r.level]}`} />
              <div className="min-w-0 flex-1">
                <span className="font-display text-base text-built-white">{r.name}</span>
                <span className="text-xs text-built-gray-text ml-2">
                  {r.everActive ? `tăcut de ${r.daysSilent} ${r.daysSilent === 1 ? "zi" : "zile"}` : "niciodată activ în app"}
                  {r.neverCheckedIn && " · 0 check-in"}
                  {r.loggedThisWeek > 0 && ` · ${r.loggedThisWeek} loguri săpt.`}
                </span>
              </div>
              {r.level !== "ok" ? (
                <button
                  onClick={() => (openId === r.id ? setOpenId(null) : generate(r.id))}
                  className="shrink-0 font-condensed text-[10px] uppercase tracking-wider text-built-red border border-built-red/40 hover:bg-built-red/10 px-3 py-1.5 rounded-sm transition-colors"
                >
                  {sentId === r.id ? "Trimis ✓" : openId === r.id ? "Închide" : "Scrie intervenția"}
                </button>
              ) : (
                <span className="shrink-0 text-[10px] text-emerald-400 uppercase font-condensed">Pe traseu</span>
              )}
            </div>

            {openId === r.id && (
              <div className="border-t border-built-gray-2 p-3 space-y-2">
                {loading && !draft && <p className="text-xs text-built-gray-text">Scriu intervenția (Skill 3)… ~5s</p>}
                {err && <p className="text-xs text-built-red">{err}</p>}
                {draft && (
                  <>
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      rows={6}
                      className="w-full bg-[#0A0A0A] border border-built-gray-2 rounded-sm p-2.5 text-sm text-built-white leading-relaxed resize-y focus:border-built-red/50 focus:outline-none"
                    />
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => send(r.id)}
                        disabled={loading}
                        className="font-condensed text-[10px] uppercase tracking-wider bg-built-red text-white px-3 py-1.5 rounded-sm disabled:opacity-50 hover:bg-built-red-dark transition-colors"
                      >
                        {loading ? "Trimit…" : "Trimite pe push + inbox →"}
                      </button>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(draft);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 1500);
                        }}
                        className="font-condensed text-[10px] uppercase tracking-wider border border-built-gray-2 text-built-gray-text hover:text-built-white px-3 py-1.5 rounded-sm transition-colors"
                      >
                        {copied ? "Copiat ✓" : "Copiază (WhatsApp)"}
                      </button>
                    </div>
                    <p className="text-[10px] text-built-gray-text">
                      Mesajul ajunge ca notificare push + în inbox-ul lui din app. Editează-l înainte dacă vrei.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
