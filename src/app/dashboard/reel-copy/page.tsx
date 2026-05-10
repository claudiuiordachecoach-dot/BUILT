"use client";

import { useState } from "react";
import { analyzeReelCopy, type ReelCopyAnalysis } from "./actions";

type Tab = "url" | "transcript" | "audio";

const VERDICT_COLOR: Record<string, string> = {
  Exceptional: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  Strong: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  Good: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  Weak: "text-built-red bg-built-red/10 border-built-red/20",
};

export default function ReelCopyPage() {
  const [tab, setTab] = useState<Tab>("transcript");
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ReelCopyAnalysis | null>(null);
  const [error, setError] = useState("");
  const [showTranscript, setShowTranscript] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleAnalyse = async () => {
    setLoading(true);
    setError("");
    setAnalysis(null);
    const result = await analyzeReelCopy(transcript);
    if (result.ok) {
      setAnalysis(result.analysis);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const copyHook = () => {
    if (!analysis) return;
    navigator.clipboard.writeText(analysis.suggested_hook);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const TAB_STYLE = (t: Tab) =>
    `px-4 py-2 text-[12px] font-medium rounded-lg transition-colors ${
      tab === t
        ? "bg-built-red/15 text-built-red border border-built-red/20"
        : "text-zinc-500 hover:text-zinc-200 border border-transparent"
    }`;

  return (
    <div className="p-8 max-w-[900px] mx-auto">
      <div className="mb-8">
        <p className="text-[11px] text-built-red font-mono uppercase tracking-widest mb-1">
          Tools · Reel Analyser
        </p>
        <h1 className="text-4xl font-display tracking-[0.06em] text-zinc-100">
          REEL COPY TOOL
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          Lipsește un reel — obții un breakdown AI complet, brief de adaptare pentru BUILT și un hook nou.
        </p>
      </div>

      <div className="flex gap-1 mb-6">
        <button className={TAB_STYLE("url")} onClick={() => setTab("url")}>
          🔗 Instagram URL
        </button>
        <button className={TAB_STYLE("transcript")} onClick={() => setTab("transcript")}>
          📋 Paste Transcript
        </button>
        <button className={TAB_STYLE("audio")} onClick={() => setTab("audio")}>
          🎙 Upload Audio
        </button>
      </div>

      <div className="bg-[#111111] border border-white/10 rounded-xl p-6 mb-6">
        {tab === "url" && (
          <div>
            <label className="text-[11px] text-zinc-500 uppercase tracking-widest font-mono block mb-2">
              Instagram Reel URL
            </label>
            <input
              type="url"
              placeholder="https://www.instagram.com/reel/..."
              className="w-full bg-[#1a1a1a] border border-white/10 text-zinc-200 text-[13px] px-4 py-3 rounded-lg focus:outline-none focus:border-built-red/40 placeholder:text-zinc-600 mb-3"
            />
            <p className="text-[11px] text-zinc-600 mb-3">
              Funcționalitatea de scraping URL este în dezvoltare. Între timp, copiază transcriptul reelului și lipește-l în tab-ul Paste Transcript.
            </p>
            <button
              onClick={() => setTab("transcript")}
              className="text-[12px] text-built-red border border-built-red/20 px-3 py-1.5 rounded-lg hover:bg-built-red/10"
            >
              → Treci la Paste Transcript
            </button>
          </div>
        )}

        {tab === "transcript" && (
          <div>
            <label className="text-[11px] text-zinc-500 uppercase tracking-widest font-mono block mb-2">
              Transcript / Script Reel
            </label>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Lipește transcriptul complet al reelului pe care vrei să-l analizezi..."
              rows={8}
              className="w-full bg-[#1a1a1a] border border-white/10 text-zinc-200 text-[13px] px-4 py-3 rounded-lg focus:outline-none focus:border-built-red/40 placeholder:text-zinc-600 resize-none mb-3"
            />
            <p className="text-[11px] text-zinc-600">
              Lipește orice reel public — AI va transcrie, scora și îți va spune exact cum să-l adaptezi pentru BUILT.
            </p>
          </div>
        )}

        {tab === "audio" && (
          <div className="text-center py-8">
            <p className="text-zinc-600 text-[13px] mb-2">Upload Audio — Coming Soon</p>
            <p className="text-zinc-700 text-[11px]">
              Suportul pentru fișiere audio vine în curând.
            </p>
            <button
              onClick={() => setTab("transcript")}
              className="mt-4 text-[12px] text-built-red border border-built-red/20 px-3 py-1.5 rounded-lg hover:bg-built-red/10"
            >
              → Paste Transcript acum
            </button>
          </div>
        )}

        {tab === "transcript" && (
          <button
            onClick={handleAnalyse}
            disabled={loading || transcript.trim().length < 30}
            className="w-full mt-4 bg-built-red/10 text-built-red border border-built-red/20 py-3 rounded-lg text-[13px] font-medium hover:bg-built-red/20 transition-colors disabled:opacity-40"
          >
            {loading ? "Analizez..." : "✦ Analyse Reel"}
          </button>
        )}

        {error && <p className="mt-3 text-built-red text-[12px]">{error}</p>}
      </div>

      {!analysis && !loading && (
        <div className="text-center py-12">
          <p className="text-4xl opacity-10 mb-3">◈</p>
          <p className="text-zinc-700 text-[12px]">
            Niciun reel analizat încă. Lipește un transcript și apasă Analyse Reel.
          </p>
        </div>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="flex gap-1 justify-center mb-3">
            {[0, 150, 300].map((delay) => (
              <span
                key={delay}
                className="w-2 h-2 rounded-full bg-built-red/60 animate-bounce"
                style={{ animationDelay: `${delay}ms` }}
              />
            ))}
          </div>
          <p className="text-zinc-600 text-[12px] font-mono">Fetching & analysing...</p>
        </div>
      )}

      {analysis && (
        <div className="space-y-4">
          <div className="bg-[#111111] border border-white/10 rounded-xl p-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-1">Verdict</p>
              <span className={`text-[13px] font-bold px-3 py-1 rounded-full border ${VERDICT_COLOR[analysis.verdict] ?? "text-zinc-400 bg-white/5 border-white/10"}`}>
                {analysis.verdict}
              </span>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-1">Score</p>
              <p className="text-4xl font-display text-zinc-100">{analysis.score}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-1">Hook Score</p>
              <p className="text-4xl font-display text-zinc-100">{analysis.hook_score}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#111111] border border-white/10 rounded-xl p-5">
              <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-2">Performance</p>
              <p className="text-zinc-300 text-[13px] leading-relaxed">{analysis.performance_summary}</p>
            </div>
            <div className="bg-[#111111] border border-white/10 rounded-xl p-5">
              <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-2">Script Quality</p>
              <p className="text-zinc-300 text-[13px] leading-relaxed">{analysis.script_quality}</p>
            </div>
          </div>

          <div className="bg-[#111111] border border-white/10 rounded-xl p-5">
            <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-3">What Worked</p>
            <ul className="space-y-2">
              {analysis.what_worked.map((item, i) => (
                <li key={i} className="flex gap-2.5 text-[13px] text-zinc-300">
                  <span className="text-built-red shrink-0 mt-0.5">▸</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[#111111] border border-white/10 rounded-xl p-5">
            <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-2">Audience Fit</p>
            <p className="text-zinc-300 text-[13px] leading-relaxed">{analysis.audience_fit}</p>
          </div>

          <div className="bg-[#111111] border border-built-red/20 rounded-xl p-5 border-l-4 border-l-built-red">
            <p className="text-[10px] text-built-red font-mono uppercase tracking-widest mb-2">Adaptation Brief</p>
            <p className="text-zinc-200 text-[13px] leading-relaxed">{analysis.adaptation_brief}</p>
          </div>

          <div className="bg-[#0d0d0d] border border-white/10 rounded-xl p-6">
            <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-3">Suggested Hook for Your Audience</p>
            <p className="text-zinc-100 text-lg leading-relaxed font-medium">&ldquo;{analysis.suggested_hook}&rdquo;</p>
            <div className="flex gap-2 mt-4">
              <button onClick={copyHook} className="text-[12px] text-zinc-400 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-white/5">
                {copied ? "✓ Copiat" : "Copy Hook"}
              </button>
              <button className="text-[12px] text-zinc-400 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-white/5">
                Save to Idea Bank
              </button>
            </div>
          </div>

          <div className="bg-[#111111] border border-white/10 rounded-xl overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors"
              onClick={() => setShowTranscript(!showTranscript)}
            >
              <p className="text-[12px] text-zinc-400 font-medium">Transcript</p>
              <span className={`text-zinc-500 transition-transform ${showTranscript ? "rotate-90" : ""}`}>›</span>
            </button>
            {showTranscript && (
              <div className="px-5 pb-5 border-t border-white/5 pt-4">
                <p className="text-zinc-500 text-[12px] leading-relaxed whitespace-pre-line">{analysis.transcript_clean}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
