"use client";

import { useState } from "react";
import { generateCoachMessage, sendCoachBroadcast, type MessagingClient } from "./actions";

export function CoachBroadcast({ roster }: { roster: MessagingClient[] }) {
  const [selected, setSelected] = useState<Set<number>>(() => new Set(roster.map((c) => c.id)));
  const [topic, setTopic] = useState("");
  const [text, setText] = useState("");
  const [gen, setGen] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState("");
  const [err, setErr] = useState("");

  if (roster.length === 0) return null;

  const notifCount = roster.filter((c) => c.notifOn).length;
  const selectedNotif = roster.filter((c) => selected.has(c.id) && c.notifOn).length;

  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const all = () => setSelected(new Set(roster.map((c) => c.id)));
  const onlyNotif = () => setSelected(new Set(roster.filter((c) => c.notifOn).map((c) => c.id)));

  async function generate() {
    setErr("");
    setGen(true);
    const r = await generateCoachMessage(topic);
    setGen(false);
    if (r.ok) setText(r.data);
    else setErr(r.error);
  }

  async function send() {
    setErr("");
    setResult("");
    if (!text.trim()) { setErr("Scrie sau generează un mesaj întâi."); return; }
    if (selected.size === 0) { setErr("Alege măcar un client."); return; }
    setSending(true);
    const r = await sendCoachBroadcast([...selected], text);
    setSending(false);
    if (r.ok) {
      setResult(`Trimis la ${r.sent} ${r.sent === 1 ? "client" : "clienți"} · ${selectedNotif} cu notificare push, restul în inbox.`);
      setText("");
      setTopic("");
    } else setErr(r.error);
  }

  return (
    <div className="mb-8 bg-built-gray-1 border border-built-gray-2 rounded-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="font-condensed text-[10px] text-built-red uppercase tracking-wider">Mesajul zilei · către clienți</p>
        <span className="font-condensed text-[10px] text-built-gray-text uppercase">🔔 {notifCount}/{roster.length} cu notificări</span>
      </div>

      {/* Roster + selecție */}
      <div className="flex items-center gap-2 mb-2">
        <button onClick={all} className="font-condensed text-[10px] uppercase tracking-wider text-built-gray-text hover:text-built-white border border-built-gray-2 px-2 py-1 rounded-sm transition-colors">Toți</button>
        <button onClick={onlyNotif} className="font-condensed text-[10px] uppercase tracking-wider text-built-gray-text hover:text-built-white border border-built-gray-2 px-2 py-1 rounded-sm transition-colors">Doar cu notificări</button>
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        {roster.map((c) => {
          const on = selected.has(c.id);
          return (
            <button
              key={c.id}
              onClick={() => toggle(c.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm border text-[12px] transition-colors ${
                on ? "border-built-red/50 bg-built-red/10 text-built-white" : "border-built-gray-2 text-built-gray-text hover:text-built-white"
              }`}
            >
              <span className={on ? "text-built-red" : "text-built-gray-text"}>{on ? "✓" : "○"}</span>
              {c.name.split(" ")[0]}
              <span title={c.notifOn ? "Notificări pornite" : "Fără notificări — primește doar în inbox"}>{c.notifOn ? "🔔" : "🔕"}</span>
            </button>
          );
        })}
      </div>

      {/* Generare AI (opțional, cu temă) */}
      <div className="flex flex-col sm:flex-row gap-2 mb-2">
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Despre ce? (opțional — lasă gol și aleg eu o temă BUILT)"
          className="flex-1 bg-built-black border border-built-gray-2 rounded-sm px-3 py-2 text-sm text-built-white placeholder-built-gray-text focus:border-built-red/50 focus:outline-none"
        />
        <button
          onClick={generate}
          disabled={gen}
          className="shrink-0 font-condensed text-[10px] uppercase tracking-wider text-built-red border border-built-red/40 hover:bg-built-red/10 px-3 py-2 rounded-sm transition-colors disabled:opacity-50"
        >
          {gen ? "Scriu…" : "Generează cu AI"}
        </button>
      </div>

      {/* Mesajul (editabil) */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        placeholder="Scrie mesajul tău aici — sau generează-l cu AI și editează-l înainte de trimitere."
        className="w-full bg-built-black border border-built-gray-2 rounded-sm p-3 text-sm text-built-white leading-relaxed resize-y focus:border-built-red/50 focus:outline-none mb-3"
      />

      {err && <p className="text-xs text-built-red mb-2">{err}</p>}
      {result && <p className="text-xs text-emerald-400 mb-2">{result}</p>}

      <button
        onClick={send}
        disabled={sending}
        className="font-condensed text-[11px] uppercase tracking-wider bg-built-red text-white px-4 py-2 rounded-sm hover:bg-built-red-dark transition-colors disabled:opacity-50"
      >
        {sending ? "Trimit…" : `Trimite la ${selected.size} ${selected.size === 1 ? "client" : "clienți"} →`}
      </button>
    </div>
  );
}
