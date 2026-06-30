"use client";

import { useState } from "react";
import { saveTodayNote } from "../actions";

export default function DailyReflection({
  clientId,
  initial,
}: {
  clientId: number;
  initial: string;
}) {
  const [text, setText] = useState(initial || "");
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);

  async function commit() {
    if (!dirty) return;
    try {
      await saveTodayNote(clientId, text);
      setDirty(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 1800);
    } catch {
      /* păstrăm textul; reîncearcă la următorul blur */
    }
  }

  return (
    <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 mb-5">
      <div className="flex items-center justify-between mb-3">
        <p className="font-condensed text-[11px] text-zinc-400 uppercase tracking-[0.2em]">Azi · reflecția ta</p>
        {saved && <span className="text-[11px] text-green-400">salvat ✓</span>}
      </div>
      <textarea
        value={text}
        onChange={(e) => { setText(e.target.value); setDirty(true); }}
        onBlur={commit}
        rows={3}
        maxLength={2000}
        placeholder="Ce a mers azi? Ce nu a mers? Un gând scurt — îl vede doar Claudiu."
        className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 resize-none focus:outline-none focus:border-built-red/50 focus:bg-built-red/[0.02] transition-all leading-relaxed"
      />
    </div>
  );
}
