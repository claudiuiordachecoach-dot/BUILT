"use client";

import { useState } from "react";
import { askAdvisor, askBoard } from "./actions";
import { ADVISORS, type AdvisorId, type BoardEntry } from "./data";

type Mode = AdvisorId | "board";

function Avatar({ initial, accent, size = 56 }: { initial: string; accent: string; size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold shrink-0"
      style={{
        width: size,
        height: size,
        background: `${accent}22`,
        border: `2px solid ${accent}`,
        color: accent,
        fontSize: size * 0.4,
      }}
    >
      {initial}
    </div>
  );
}

// Markdown-light: **bold** + paragrafe. Suficient pentru output-ul advisorilor.
function Rendered({ text }: { text: string }) {
  return (
    <div className="space-y-2 text-[14px] leading-relaxed text-foreground/90">
      {text.split("\n").map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={i}>
            {parts.map((p, j) =>
              p.startsWith("**") && p.endsWith("**") ? (
                <strong key={j} className="text-foreground font-semibold">{p.slice(2, -2)}</strong>
              ) : (
                <span key={j}>{p}</span>
              ),
            )}
          </p>
        );
      })}
    </div>
  );
}

export default function AdvisorsPage() {
  const [mode, setMode] = useState<Mode>("naval");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [single, setSingle] = useState<{ advisor: AdvisorId; answer: string } | null>(null);
  const [board, setBoard] = useState<BoardEntry[] | null>(null);

  const advisorOf = (id: AdvisorId) => ADVISORS.find((a) => a.id === id)!;

  async function run() {
    if (!question.trim() || loading) return;
    setLoading(true);
    setError("");
    setSingle(null);
    setBoard(null);
    try {
      if (mode === "board") {
        const r = await askBoard({ question });
        if (r.ok) setBoard(r.entries);
        else setError(r.error);
      } else {
        const r = await askAdvisor({ advisor: mode, question });
        if (r.ok) setSingle({ advisor: mode, answer: r.answer });
        else setError(r.error);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Eroare.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-10 pt-16 md:pt-10">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-bebas text-4xl md:text-5xl uppercase tracking-wide text-foreground">
          Board de Advisori
        </h1>
        <p className="text-muted-foreground text-sm mt-2">
          Hormozi, Rubin și Naval — pe situația ta reală BUILT. Alege o lentilă sau întreabă tot boardul.
        </p>
      </div>

      {/* Avatars / selectoare */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        {ADVISORS.map((a) => {
          const active = mode === a.id;
          return (
            <button
              key={a.id}
              onClick={() => setMode(a.id)}
              className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${
                active
                  ? "border-built-red bg-muted"
                  : "border-border hover:border-foreground/30 hover:bg-muted/40"
              }`}
            >
              <Avatar initial={a.initial} accent={a.accent} />
              <div className="text-center">
                <p className="text-foreground font-semibold text-[13px] leading-tight">{a.name}</p>
                <p className="text-muted-foreground text-[11px] mt-0.5">{a.role}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Board întreg */}
      <button
        onClick={() => setMode("board")}
        className={`w-full rounded-xl border p-3 mb-5 text-center transition-all ${
          mode === "board"
            ? "border-built-red bg-muted"
            : "border-border hover:border-foreground/30 hover:bg-muted/40"
        }`}
      >
        <span className="text-foreground font-semibold text-[13px]">Întreabă tot boardul</span>
        <span className="text-muted-foreground text-[11px] ml-2">· toți 3, pe rând</span>
      </button>

      {/* Input */}
      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Situația ta, cu context. Ex: „Ofertă Co-pilot 400 EUR pe 90 zile. Prospectul e atlet blocat. Las bani pe masă? Care-i cea mai tare obiecție?”"
        rows={5}
        className="w-full bg-white/5 dark:bg-white/5 border border-border rounded-lg px-4 py-3 text-foreground placeholder-muted-foreground/60 focus:outline-none focus:border-built-red/50 transition-colors text-[14px] resize-y"
      />

      <button
        onClick={run}
        disabled={loading || !question.trim()}
        className="mt-3 w-full bg-built-red hover:bg-[#a93226] disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-lg transition-colors"
      >
        {loading
          ? "Se gândește…"
          : mode === "board"
            ? "Întreabă boardul"
            : `Întreabă pe ${advisorOf(mode).name.split(" ")[0]}`}
      </button>

      {error && (
        <div className="mt-4 rounded-lg border border-built-red/40 bg-built-red/10 px-4 py-3 text-[13px] text-built-red">
          {error}
        </div>
      )}

      {/* Răspuns single */}
      {single && (
        <div className="mt-6 rounded-xl border border-border bg-muted/30 p-5">
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
            <Avatar initial={advisorOf(single.advisor).initial} accent={advisorOf(single.advisor).accent} size={40} />
            <div>
              <p className="text-foreground font-semibold text-[14px]">{advisorOf(single.advisor).name}</p>
              <p className="text-muted-foreground text-[11px]">{advisorOf(single.advisor).tagline}</p>
            </div>
          </div>
          <Rendered text={single.answer} />
        </div>
      )}

      {/* Răspuns board */}
      {board && (
        <div className="mt-6 space-y-4">
          {board.map((e) => {
            const a = advisorOf(e.advisor);
            return (
              <div key={e.advisor} className="rounded-xl border border-border bg-muted/30 p-5">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
                  <Avatar initial={a.initial} accent={a.accent} size={40} />
                  <div>
                    <p className="text-foreground font-semibold text-[14px]">{a.name}</p>
                    <p className="text-muted-foreground text-[11px]">{a.role}</p>
                  </div>
                </div>
                {e.error ? (
                  <p className="text-built-red text-[13px]">{e.error}</p>
                ) : (
                  <Rendered text={e.answer} />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
