"use client";

import { useState, useTransition } from "react";
import { analyzeReel, type ReelScore } from "./actions";

type InputMode = "url" | "paste";

const VERDICT_STYLE: Record<string, string> = {
  Strong: "text-emerald-400",
  Good: "text-amber-400",
  Weak: "text-orange-400",
  Poor: "text-built-red",
};

function ScoreBar({ label, score, max, feedback }: { label: string; score: number; max: number; feedback: string }) {
  const pct = Math.round((score / max) * 100);
  const color = pct >= 75 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-built-red";
  return (
    <div className="mb-5">
      <div className="flex justify-between mb-1">
        <span className="font-condensed text-xs text-built-white uppercase tracking-wider">{label}</span>
        <span className="font-display text-lg text-built-red">{score}<span className="text-built-gray-text text-sm">/{max}</span></span>
      </div>
      <div className="h-1.5 bg-built-gray-2 rounded-full mb-2">
        <div className={`h-1.5 rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-xs text-built-white/70 leading-relaxed">{feedback}</p>
    </div>
  );
}

export default function AnalizorPage() {
  const [mode, setMode] = useState<InputMode>("url");
  const [url, setUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [context, setContext] = useState("");
  const [score, setScore] = useState<ReelScore | null>(null);
  const [fetchedTranscript, setFetchedTranscript] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleAnalyze() {
    setError(null); setScore(null); setFetchedTranscript(null);
    startTransition(async () => {
      let text = transcript.trim();

      // URL mode: transcrie mai întâi
      if (mode === "url") {
        if (!url.includes("instagram.com")) {
          setError("URL invalid. Trebuie să fie un link Instagram.");
          return;
        }
        try {
          const res = await fetch("/api/reel/transcribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url }),
          });
          const data = (await res.json()) as { transcript?: string; error?: string };
          if (!res.ok || !data.transcript) {
            setError(data.error ?? "Transcrierea a eșuat.");
            return;
          }
          text = data.transcript;
          setFetchedTranscript(text);
        } catch {
          setError("Nu s-a putut contacta API-ul de transcriere.");
          return;
        }
      }

      if (text.length < 20) {
        setError("Transcriptul e prea scurt.");
        return;
      }

      const result = await analyzeReel(text, context);
      if (result.ok) setScore(result.score);
      else setError(result.error);
    });
  }

  const overall = score?.overall ?? 0;
  const verdictColor = VERDICT_STYLE[score?.verdict ?? ""] ?? "text-built-white";

  return (
    <div className="p-8 max-w-4xl">
      <p className="font-condensed text-xs text-built-red uppercase tracking-wider mb-1">M8 · Analizor Reel</p>
      <h1 className="font-display text-5xl tracking-[0.06em] text-built-white mb-2">ANALIZOR REEL</h1>
      <p className="text-built-gray-text mb-8">Paste URL sau transcript — AI scoruează hook / mesaj / CTA / voce BUILT și scrie brief-ul de adaptare.</p>

      {/* MODE TABS */}
      <div className="flex gap-1 mb-6">
        {(["url", "paste"] as InputMode[]).map((m) => (
          <button key={m} onClick={() => setMode(m)}
            className={`font-condensed text-xs uppercase tracking-wider px-4 py-2 border transition-colors ${mode === m ? "border-built-red bg-built-red text-white" : "border-built-gray-2 text-built-gray-text hover:border-built-red hover:text-built-white"}`}>
            {m === "url" ? "URL Instagram" : "Paste Script"}
          </button>
        ))}
      </div>

      <div className="p-6 bg-built-gray-1 border border-built-gray-2 rounded-sm mb-6 space-y-4">
        {mode === "url" ? (
          <div>
            <p className="font-condensed text-[10px] text-built-gray-text uppercase mb-2">Link Reel (al tău sau al unui competitor)</p>
            <input value={url} onChange={(e) => setUrl(e.target.value)}
              placeholder="https://www.instagram.com/reel/DXYZabc..."
              className="w-full bg-built-black border border-built-gray-2 text-built-white text-sm px-3 py-2 focus:outline-none focus:border-built-red" />
            <p className="text-[10px] text-built-gray-text mt-1">Durează ~60-90 sec (download + Whisper local).</p>
          </div>
        ) : (
          <div>
            <p className="font-condensed text-[10px] text-built-gray-text uppercase mb-2">Script / Transcript</p>
            <textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} rows={8}
              placeholder="Lipește scriptul sau transcriptul reel-ului..."
              className="w-full bg-built-black border border-built-gray-2 text-built-white text-sm p-3 resize-none focus:outline-none focus:border-built-red" />
          </div>
        )}

        <div>
          <p className="font-condensed text-[10px] text-built-gray-text uppercase mb-2">Context (opțional)</p>
          <input value={context} onChange={(e) => setContext(e.target.value)}
            placeholder="Ex: reel competitor @dan_toma, pilon B, audiență bărbați 35-40..."
            className="w-full bg-built-black border border-built-gray-2 text-built-white text-sm px-3 py-2 focus:outline-none focus:border-built-red" />
        </div>

        {error && <p className="text-built-red font-condensed text-xs">⚠ {error}</p>}

        <button onClick={handleAnalyze}
          disabled={isPending || (mode === "url" ? !url.trim() : transcript.trim().length < 20)}
          className="px-6 py-3 bg-built-red hover:bg-built-red-dark text-white font-condensed text-xs disabled:opacity-50 transition-colors">
          {isPending
            ? mode === "url" ? "Transcrie + analizează... (~90s)" : "Analizează... (~10s)"
            : "Analizează Reel →"}
        </button>
      </div>

      {/* TRANSCRIPT PREVIEW (after URL fetch) */}
      {fetchedTranscript && (
        <div className="p-4 bg-built-black border border-built-gray-2 rounded-sm mb-6">
          <p className="font-condensed text-[10px] text-built-gray-text uppercase mb-2">Transcript extras</p>
          <p className="text-xs text-built-white/80 whitespace-pre-wrap">{fetchedTranscript}</p>
        </div>
      )}

      {score && (
        <div className="space-y-5">
          {/* VERDICT + SCOR */}
          <div className="p-6 bg-built-gray-1 border border-built-gray-2 rounded-sm flex items-center gap-8">
            <div className="text-center shrink-0">
              <p className="font-condensed text-[10px] text-built-gray-text uppercase mb-1">Scor total</p>
              <p className={`font-display text-7xl leading-none ${verdictColor}`}>{overall}</p>
              <p className={`font-condensed text-sm uppercase tracking-wider mt-1 ${verdictColor}`}>{score.verdict}</p>
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap gap-2 mb-3">
                {score.key_strengths.map((s, i) => (
                  <span key={i} className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-condensed text-[10px]">✓ {s}</span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {score.key_fixes.map((s, i) => (
                  <span key={i} className="px-3 py-1 bg-built-red/10 border border-built-red/30 text-built-red font-condensed text-[10px]">✗ {s}</span>
                ))}
              </div>
            </div>
          </div>

          {/* SCORURI DETALIATE */}
          <div className="p-6 bg-built-gray-1 border border-built-gray-2 rounded-sm">
            <ScoreBar label="Hook" score={score.hook.score} max={25} feedback={score.hook.feedback} />
            <ScoreBar label="Mesaj" score={score.message.score} max={35} feedback={score.message.feedback} />
            <ScoreBar label="CTA" score={score.cta.score} max={20} feedback={score.cta.feedback} />
            <ScoreBar label="Voce BUILT" score={score.voice.score} max={20} feedback={score.voice.feedback} />
          </div>

          {/* KEY LESSONS */}
          {score.key_lessons?.length > 0 && (
            <div className="p-6 bg-built-gray-1 border border-built-gray-2 rounded-sm">
              <p className="font-condensed text-[10px] text-built-gray-text uppercase tracking-wider mb-3">Key Lessons</p>
              <ul className="space-y-2">
                {score.key_lessons.map((l, i) => (
                  <li key={i} className="flex gap-2 text-sm text-built-white/80">
                    <span className="text-built-red shrink-0">{i + 1}.</span>
                    <span>{l}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* ADAPTATION BRIEF */}
          <div className="p-6 bg-built-gray-1 border border-built-red/40 rounded-sm">
            <p className="font-condensed text-[10px] text-built-red uppercase tracking-wider mb-2">Adaptation Brief — cum adaptezi pentru BUILT</p>
            <p className="text-sm text-built-white leading-relaxed">{score.adaptation_brief}</p>
          </div>

          {/* HOOK ALTERNATIV */}
          <div className="p-5 bg-built-gray-1 border border-built-gray-2 rounded-sm">
            <p className="font-condensed text-[10px] text-built-gray-text uppercase tracking-wider mb-2">Hook alternativ sugerat</p>
            <p className="font-display text-xl tracking-wider text-built-white">{score.suggested_hook}</p>
          </div>
        </div>
      )}
    </div>
  );
}
