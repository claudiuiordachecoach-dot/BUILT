"use client";

import { useState, useEffect, useRef } from "react";
import { getLastSession, saveWorkoutSession, type WExercise } from "../actions";

type Block =
  | { kind: "ex"; name: string; order: string; presc: string; rest: string; start: string; bodyHtml: string }
  | { kind: "html"; html: string };
type Day = { key: string; label: string; blocks: Block[] };

type SetInput = { kg: string; reps: string };
type ExLog = { sets: SetInput[]; lastBest: { kg: number; reps: number } | null; open: boolean };

function bestOf(sets: { kg: number; reps: number }[]) {
  let b: { kg: number; reps: number } | null = null;
  for (const s of sets) { if (s.kg <= 0 && s.reps <= 0) continue; if (!b || s.kg > b.kg || (s.kg === b.kg && s.reps > b.reps)) b = s; }
  return b;
}

// Randează HTML din foaie izolat în Shadow DOM → stilul QuickRef rămâne EXACT, fără să atingă app-ul.
function ShadowHtml({ html, css }: { html: string; css: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    const root = host.shadowRoot || host.attachShadow({ mode: "open" });
    // Conținutul foii are acordeoane pe JS (toggleEx/toggleCaseta) pe care nu le avem aici.
    // Forțăm tot să fie DESCHIS by default → totul vizibil, fără click mort.
    const forceOpen = `
      .ex-body,.caseta,.caseta-body,.caseta-inner,.acc-content,.acc-body,.opt-body,.opt-content,.wu-body,.cd-body,.collapse,.collapsible,.body,.content{display:block!important;max-height:none!important;height:auto!important;overflow:visible!important;opacity:1!important;visibility:visible!important;}
      .ex-icon,.caseta-icon,.acc-icon,.opt-icon,.chevron,.toggle-icon{display:none!important;}
      .ex-hdr,.caseta-hdr,.acc-hdr{cursor:default!important;}`;
    root.innerHTML = `<style>:host{display:block;color:#F5F5F5;font-family:'DM Sans',-apple-system,sans-serif;line-height:1.6;}${css}${forceOpen}</style>${html}`;
  }, [html, css]);
  return <div ref={ref} />;
}

export default function NativeWorkout({ quickrefUrl, todayKey, labelFor }: { quickrefUrl: string; todayKey: string | null; labelFor: (k: string) => string }) {
  const [css, setCss] = useState("");
  const [days, setDays] = useState<Day[]>([]);
  const [activeKey, setActiveKey] = useState("");
  const [loadingSheet, setLoadingSheet] = useState(true);
  const [log, setLog] = useState<ExLog[]>([]);
  const [lastDate, setLastDate] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [rest, setRest] = useState(0);
  const restRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (rest <= 0) { if (restRef.current) { clearInterval(restRef.current); restRef.current = null; } return; }
    if (!restRef.current) restRef.current = setInterval(() => setRest((r) => (r <= 1 ? 0 : r - 1)), 1000);
    return () => { if (restRef.current) { clearInterval(restRef.current); restRef.current = null; } };
  }, [rest]);

  // 1) Fetch + parse foaia (same-origin) → CSS + zile cu blocuri în ORDINE (zero pierdere).
  useEffect(() => {
    let alive = true;
    fetch(quickrefUrl).then((r) => r.text()).then((text) => {
      if (!alive) return;
      const doc = new DOMParser().parseFromString(text, "text/html");
      const styleCss = [...doc.querySelectorAll("style")].map((s) => s.textContent || "").join("\n").replace(/:root/g, ":host");
      setCss(styleCss);
      // Includem TOATE tab-urile foii (program/ghid/cardio/reguli + zilele de exerciții) → zero pierdere.
      const ds: Day[] = [];
      for (const p of [...doc.querySelectorAll('[id^="tab-"]')]) {
        const key = p.id.replace("tab-", "");
        const blocks: Block[] = [];
        for (const child of [...p.children]) {
          const isEx = child.classList.contains("ex-block") && child.querySelector(".ex-meta");
          if (isEx) {
            const tag = (c: string) => (child.querySelector(`.ex-meta .tag-${c}`)?.textContent || "").trim();
            const body = child.querySelector(".ex-body") as HTMLElement | null;
            if (body) body.querySelectorAll(".sets-wrap").forEach((e) => e.remove());
            blocks.push({
              kind: "ex",
              name: (child.querySelector(".ex-ttl")?.textContent || "").trim(),
              order: (child.querySelector(".ex-num")?.textContent || "").trim(),
              presc: tag("red"), rest: tag("orange"), start: tag("green"),
              bodyHtml: body?.innerHTML || "",
            });
          } else {
            blocks.push({ kind: "html", html: (child as HTMLElement).outerHTML });
          }
        }
        if (blocks.length) ds.push({ key, label: labelFor(key), blocks });
      }
      setDays(ds);
      setActiveKey(todayKey && ds.some((d) => d.key === todayKey) ? todayKey : ds[0]?.key || "");
      setLoadingSheet(false);
    }).catch(() => { if (alive) setLoadingSheet(false); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quickrefUrl]);

  const active = days.find((d) => d.key === activeKey);
  const exNames = active ? active.blocks.filter((b): b is Extract<Block, { kind: "ex" }> => b.kind === "ex").map((b) => b.name) : [];

  // 2) La schimbarea zilei → încarcă ultima sesiune pentru comparație.
  useEffect(() => {
    if (!active) return;
    setSaved(false);
    (async () => {
      const last = await getLastSession(active.key);
      setLastDate(last?.logged_on ?? null);
      const byName = new Map((last?.exercises ?? []).map((e) => [e.name, e]));
      setLog(exNames.map((n) => {
        const le = byName.get(n);
        return { sets: [{ kg: "", reps: "" }], lastBest: le ? bestOf(le.sets) : null, open: false };
      }));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey, days]);

  const setField = (i: number, j: number, f: keyof SetInput, v: string) =>
    setLog((p) => p.map((e, k) => (k === i ? { ...e, sets: e.sets.map((s, m) => (m === j ? { ...s, [f]: v } : s)) } : e)));
  const addSet = (i: number) => setLog((p) => p.map((e, k) => (k === i ? { ...e, sets: [...e.sets, { kg: "", reps: "" }] } : e)));
  const toggleOpen = (i: number) => setLog((p) => p.map((e, k) => (k === i ? { ...e, open: !e.open } : e)));

  function regressed(e: ExLog) {
    if (!e?.lastBest) return false;
    const cur = bestOf(e.sets.map((s) => ({ kg: Number(s.kg) || 0, reps: Number(s.reps) || 0 })));
    return !!cur && (cur.kg < e.lastBest.kg || (cur.kg === e.lastBest.kg && cur.reps < e.lastBest.reps));
  }

  async function save() {
    if (!active) return;
    setSaving(true);
    const payload: WExercise[] = exNames.map((name, i) => ({
      name,
      sets: (log[i]?.sets ?? []).map((s) => ({ kg: Number(s.kg) || 0, reps: Number(s.reps) || 0 })).filter((s) => s.kg > 0 || s.reps > 0),
    })).filter((e) => e.sets.length > 0);
    const r = await saveWorkoutSession(active.key, payload, "");
    setSaving(false);
    if (r.ok) { setSaved(true); setLastDate(new Date().toISOString().slice(0, 10)); setTimeout(() => setSaved(false), 4000); }
    else alert("Loghează măcar un set la un exercițiu.");
  }

  const fmtD = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("ro-RO", { day: "numeric", month: "short" });
  if (loadingSheet) return <p className="text-zinc-500 text-sm px-1 py-4">Se încarcă antrenamentul…</p>;
  if (days.length === 0) return null;

  // index exerciții (pentru a mapa blocurile la starea de logging)
  let exIdx = -1;

  return (
    <div className="pb-28">
      {/* Tab-uri zile + timer pauză (sticky) */}
      <div className="sticky top-0 z-10 bg-built-black/95 backdrop-blur-sm py-2.5 flex items-center gap-3 border-b border-white/5 mb-3">
        <div className="flex gap-1.5 overflow-x-auto flex-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {days.map((d) => (
            <button key={d.key} onClick={() => setActiveKey(d.key)}
              className={`shrink-0 font-condensed text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-lg transition-colors ${d.key === activeKey ? "bg-built-red text-white" : "bg-white/5 text-zinc-400 hover:text-white"}`}>
              {d.label}{d.key === todayKey ? " · azi" : ""}
            </button>
          ))}
        </div>
        {rest > 0 ? (
          <button onClick={() => setRest(0)} className="shrink-0 font-display text-xl text-built-red tabular-nums leading-none">{Math.floor(rest / 60)}:{String(rest % 60).padStart(2, "0")}</button>
        ) : (
          <div className="shrink-0 flex gap-1">{[60, 90].map((s) => <button key={s} onClick={() => setRest(s)} className="font-condensed text-[10px] text-zinc-500 border border-white/10 hover:text-white px-1.5 py-1 rounded">{s}s</button>)}</div>
        )}
      </div>

      {lastDate && <p className="text-[11px] text-zinc-600 mb-3">Ultima dată {active?.label}: {fmtD(lastDate)}</p>}

      <div className="space-y-4">
        {active?.blocks.map((b, bi) => {
          if (b.kind === "html") return <ShadowHtml key={bi} html={b.html} css={css} />;
          exIdx++;
          const i = exIdx;
          const el = log[i];
          const warn = el && regressed(el);
          return (
            <div key={bi} className={`bg-[#111111] border rounded-2xl overflow-hidden ${warn ? "border-amber-500/40" : "border-white/10"}`}>
              <div className="p-4">
                {b.order && <p className="font-condensed text-[9px] uppercase tracking-[0.2em] text-zinc-600 mb-0.5">{b.order}</p>}
                <p className="font-display text-lg text-built-white leading-tight">{b.name}</p>
                {(b.presc || b.rest || b.start) && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {b.presc && <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-built-red/15 text-built-red border border-built-red/30">{b.presc}</span>}
                    {b.rest && <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white/5 text-zinc-300 border border-white/10">{b.rest}</span>}
                    {b.start && <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{b.start}</span>}
                  </div>
                )}
                {el?.lastBest && <p className="text-[12px] text-zinc-500 mt-2">Data trecută: <span className="text-zinc-300">{el.lastBest.kg}kg × {el.lastBest.reps}</span></p>}
                {warn && <p className="text-[12px] text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-1.5 mt-2">↓ Sub data trecută ({el!.lastBest!.kg}kg × {el!.lastBest!.reps}).</p>}

                <div className="space-y-1.5 mt-3">
                  {el?.sets.map((s, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <span className="font-condensed text-[10px] text-zinc-600 w-9 shrink-0">Set {j + 1}</span>
                      <input inputMode="decimal" value={s.kg} onChange={(e) => setField(i, j, "kg", e.target.value)} placeholder={el?.lastBest ? String(el.lastBest.kg) : "kg"} className="w-20 bg-[#0A0A0A] border border-white/10 rounded-lg px-2.5 py-2 text-sm text-white text-center placeholder-zinc-600 focus:border-built-red/50 focus:outline-none tabular-nums" />
                      <span className="text-zinc-600 text-sm">×</span>
                      <input inputMode="numeric" value={s.reps} onChange={(e) => setField(i, j, "reps", e.target.value)} placeholder={el?.lastBest ? String(el.lastBest.reps) : "reps"} className="w-16 bg-[#0A0A0A] border border-white/10 rounded-lg px-2.5 py-2 text-sm text-white text-center placeholder-zinc-600 focus:border-built-red/50 focus:outline-none tabular-nums" />
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-3 mt-2.5">
                  <button onClick={() => addSet(i)} className="font-condensed text-[10px] uppercase tracking-wider text-built-red hover:text-built-red-dark">+ set</button>
                  {b.bodyHtml.trim() && <button onClick={() => toggleOpen(i)} className="font-condensed text-[10px] uppercase tracking-wider text-zinc-500 hover:text-white">{el?.open ? "ascunde execuția" : "▼ execuție + video"}</button>}
                </div>
              </div>
              {el?.open && b.bodyHtml.trim() && (
                <div className="border-t border-white/10 bg-black/30 p-3"><ShadowHtml html={b.bodyHtml} css={css} /></div>
              )}
            </div>
          );
        })}
      </div>

      {exNames.length > 0 && (
        <div className="fixed bottom-[64px] md:bottom-4 left-0 md:left-56 right-0 px-4 z-20">
          <div className="max-w-5xl mx-auto">
            {saved && <p className="text-sm text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-2 mb-2 text-center">Antrenament salvat ✓</p>}
            <button onClick={save} disabled={saving} className="w-full font-condensed text-sm uppercase tracking-wider bg-built-red text-white py-3 rounded-xl hover:bg-built-red-dark transition-colors disabled:opacity-50 shadow-lg shadow-black/40">
              {saving ? "Salvez…" : `Salvează ${active?.label ?? "antrenamentul"}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
