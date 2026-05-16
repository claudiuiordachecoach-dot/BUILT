"use client";

import { useState, useRef } from "react";
import { analyzeReelCopy, fetchReelByUrl, transcribeAudioFile, type ReelCopyAnalysis } from "./actions";

type Tab = "url" | "transcript" | "audio";

const VERDICT_COLOR: Record<string, string> = {
  Exceptional: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  Strong: "text-built-red bg-built-red/10 border-built-red/30",
  Good: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  Weak: "text-red-400 bg-red-500/10 border-red-500/30",
};

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full bg-white/5 rounded-full h-[3px]">
      <div
        className="bg-built-red h-[3px] rounded-full transition-all duration-700"
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  );
}

export default function ReelCopyPage() {
  const [tab, setTab] = useState<Tab>("url");
  const [reelUrl, setReelUrl] = useState("");
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingUrl, setFetchingUrl] = useState(false);
  const [analysis, setAnalysis] = useState<ReelCopyAnalysis | null>(null);
  const [error, setError] = useState("");
  const [showTranscript, setShowTranscript] = useState(false);
  const [copied, setCopied] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transcribing, setTranscribing] = useState(false);
  const audioRef = useRef<HTMLInputElement>(null);

  const handleAnalyse = async () => {
    if (transcript.trim().length < 30) return;
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

  const handleFetchUrl = async () => {
    if (!reelUrl.trim()) return;
    setFetchingUrl(true);
    setError("");
    const fetched = await fetchReelByUrl(reelUrl.trim());
    setFetchingUrl(false);
    if (!fetched.ok) {
      setError(fetched.error);
      return;
    }
    const text = fetched.transcript || fetched.caption;
    setTranscript(text);
    setLoading(true);
    setAnalysis(null);
    const result = await analyzeReelCopy(text);
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

  const TAB_BASE = "pb-3 text-[13px] font-medium transition-colors border-b-2 mr-6";
  const tabStyle = (t: Tab) =>
    tab === t
      ? `${TAB_BASE} text-zinc-100 border-white`
      : `${TAB_BASE} text-zinc-500 border-transparent hover:text-zinc-300`;

  return (
    <div className="p-8 max-w-[860px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500 mb-1">
          REEL ANALYSER
        </p>
        <h1 className="text-[28px] font-semibold text-zinc-100 tracking-tight mb-1">
          Reel Copy Tool
        </h1>
        <p className="text-[13px] text-zinc-500 leading-relaxed max-w-[620px]">
          Drop an Instagram reel → get a full AI breakdown, personalized adaptation advice, and a rewritten hook for your niche.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/8 mb-6">
        <button className={tabStyle("url")} onClick={() => setTab("url")}>
          ✦ Instagram URL
        </button>
        <button className={tabStyle("transcript")} onClick={() => setTab("transcript")}>
          Paste Transcript
        </button>
        <button className={tabStyle("audio")} onClick={() => setTab("audio")}>
          Upload Audio
        </button>
      </div>

      {/* Input panel */}
      <div className="mb-6">
        {/* URL Tab */}
        {tab === "url" && (
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-widest text-zinc-500 mb-2">
                Instagram Reel URL
              </label>
              <input
                type="url"
                value={reelUrl}
                onChange={(e) => setReelUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleFetchUrl()}
                placeholder="https://www.instagram.com/reel/..."
                className="w-full bg-[#111111] border border-white/10 text-zinc-200 text-[13px] px-4 py-3 rounded-lg focus:outline-none focus:border-white/20 placeholder:text-zinc-700 transition-colors"
              />
            </div>
            <p className="text-[12px] text-zinc-600 leading-relaxed">
              Paste any public Instagram reel link. The AI will immediately transcribe it, score it, and tell you exactly how to adapt it for your voice and niche — or whether it&apos;s even worth adapting at all.
            </p>
            <button
              onClick={handleFetchUrl}
              disabled={fetchingUrl || loading || !reelUrl.trim()}
              className="w-full bg-[#1a1a1a] border border-white/10 text-zinc-300 text-[13px] font-medium py-3 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {fetchingUrl ? "Fetching reel… (~60s)" : loading ? "Analysing…" : "Analyse Reel"}
            </button>
          </div>
        )}

        {/* Transcript Tab */}
        {tab === "transcript" && (
          <div className="space-y-3">
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Paste the full transcript or script of the reel you want to analyse…"
              rows={8}
              className="w-full bg-[#111111] border border-white/10 text-zinc-200 text-[13px] px-4 py-3 rounded-lg focus:outline-none focus:border-white/20 placeholder:text-zinc-700 resize-none transition-colors"
            />
            <button
              onClick={handleAnalyse}
              disabled={loading || transcript.trim().length < 30}
              className="w-full bg-[#1a1a1a] border border-white/10 text-zinc-300 text-[13px] font-medium py-3 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Analysing…" : "Analyse Reel"}
            </button>
          </div>
        )}

        {/* Audio Tab */}
        {tab === "audio" && (
          <div className="bg-[#111111] border border-white/10 rounded-lg p-6">
            <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-mono mb-4">
              Upload Audio / Video
            </p>
            <button
              onClick={() => audioRef.current?.click()}
              className="w-full border border-dashed border-white/20 rounded-xl py-10 flex flex-col items-center gap-3 hover:border-white/40 transition-colors mb-4"
            >
              <svg className="w-7 h-7 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              {audioFile
                ? <p className="text-zinc-300 text-[13px] font-medium">{audioFile.name}</p>
                : <p className="text-zinc-400 text-[13px]">MP3, MP4, M4A, WAV, MOV</p>
              }
            </button>
            <input
              ref={audioRef}
              type="file"
              accept="audio/*,video/*"
              className="hidden"
              onChange={e => setAudioFile(e.target.files?.[0] ?? null)}
            />
            <button
              onClick={async () => {
                if (!audioFile) return;
                setTranscribing(true);
                setError("");
                const reader = new FileReader();
                reader.onload = async () => {
                  const base64 = (reader.result as string).split(",")[1];
                  const res = await transcribeAudioFile(base64, audioFile.type || "audio/mpeg");
                  setTranscribing(false);
                  if (!res.ok) { setError(res.error); return; }
                  setTranscript(res.transcript);
                  setLoading(true);
                  setAnalysis(null);
                  const analysis = await analyzeReelCopy(res.transcript);
                  if (analysis.ok) setAnalysis(analysis.analysis);
                  else setError(analysis.error);
                  setLoading(false);
                };
                reader.readAsDataURL(audioFile);
              }}
              disabled={!audioFile || transcribing || loading}
              className="w-full bg-built-red text-white py-3 rounded-lg text-[13px] font-medium hover:bg-built-red/80 transition-colors disabled:opacity-40"
            >
              {transcribing ? "Se transcrie..." : loading ? "Se analizează..." : "Transcrie și Analizează"}
            </button>
          </div>
        )}

        {error && (
          <p className="mt-3 text-red-400 text-[12px]">{error}</p>
        )}
      </div>

      {/* Empty state */}
      {!analysis && !loading && !fetchingUrl && (
        <div className="text-center py-16">
          <p className="text-[40px] opacity-[0.06] mb-3 select-none">◈</p>
          <p className="text-zinc-700 text-[12px]">
            No reel analysed yet. Paste a URL or transcript above.
          </p>
        </div>
      )}

      {/* Loading state */}
      {(loading || fetchingUrl) && !analysis && (
        <div className="text-center py-16">
          <div className="flex gap-1.5 justify-center mb-3">
            {[0, 120, 240].map((delay) => (
              <span
                key={delay}
                className="w-1.5 h-1.5 rounded-full bg-built-red/50 animate-bounce"
                style={{ animationDelay: `${delay}ms` }}
              />
            ))}
          </div>
          <p className="text-zinc-600 text-[12px] font-mono">
            {fetchingUrl ? "Fetching reel from Instagram…" : "Analysing reel…"}
          </p>
        </div>
      )}

      {/* Results */}
      {analysis && (
        <div className="space-y-4">
          {/* Verdict + Score row */}
          <div className="bg-[#111111] border border-white/10 rounded-xl p-5 flex items-center gap-8">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-2">
                Verdict
              </p>
              <span
                className={`inline-block text-[12px] font-semibold px-3 py-1 rounded-full border ${
                  VERDICT_COLOR[analysis.verdict] ?? "text-zinc-400 bg-white/5 border-white/10"
                }`}
              >
                {analysis.verdict}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-1">
                Score
              </p>
              <p className="text-[52px] font-bold text-zinc-100 leading-none">
                {analysis.score}
              </p>
            </div>
            <div className="flex-1" />
            <div className="w-[260px] space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-600">
                    Performance
                  </p>
                  <p className="text-[11px] text-zinc-500">{analysis.score}</p>
                </div>
                <ProgressBar value={analysis.score} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-600">
                    Script Quality
                  </p>
                  <p className="text-[11px] text-zinc-500">{analysis.hook_score}</p>
                </div>
                <ProgressBar value={analysis.hook_score} />
              </div>
            </div>
          </div>

          {/* 3-column grid */}
          <div className="grid grid-cols-3 gap-4">
            {/* THE OPENING LINE */}
            <div className="bg-[#111111] border border-white/10 rounded-xl p-5">
              <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-3">
                The Opening Line
              </p>
              <p className="text-zinc-300 text-[13px] leading-relaxed">
                {analysis.performance_summary}
              </p>
            </div>

            {/* WHAT WORKED */}
            <div className="bg-[#111111] border border-white/10 rounded-xl p-5">
              <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-3">
                What Worked
              </p>
              <ul className="space-y-2">
                {analysis.what_worked.map((item, i) => (
                  <li key={i} className="flex gap-2 text-[13px] text-zinc-300 leading-relaxed">
                    <span className="text-zinc-600 shrink-0 mt-0.5">▸</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA / AUDIENCE FIT */}
            <div className="bg-[#111111] border border-white/10 rounded-xl p-5">
              <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-3">
                CTA / Audience Fit
              </p>
              <p className="text-zinc-300 text-[13px] leading-relaxed">
                {analysis.audience_fit}
              </p>
            </div>
          </div>

          {/* KEY LESSONS */}
          <div className="bg-[#111111] border border-white/10 rounded-xl p-5">
            <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-4">
              Key Lessons
            </p>
            <ol className="space-y-3">
              {analysis.what_worked.map((item, i) => (
                <li key={i} className="flex gap-4 text-[13px] text-zinc-300 leading-relaxed">
                  <span className="text-zinc-700 font-mono shrink-0 w-5 text-right">
                    {i + 1}.
                  </span>
                  {item}
                </li>
              ))}
            </ol>
          </div>

          {/* ADAPTATION BRIEF */}
          <div className="bg-[#111111] border border-white/10 border-l-2 border-l-built-red rounded-xl p-5">
            <p className="text-[10px] font-mono uppercase tracking-widest text-built-red mb-3">
              Adaptation Brief
            </p>
            <p className="text-zinc-300 text-[13px] leading-relaxed italic">
              {analysis.adaptation_brief}
            </p>
          </div>

          {/* SUGGESTED HOOK */}
          <div className="bg-[#111111] border border-white/10 rounded-xl p-6">
            <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-4">
              Suggested Hook for Your Audience
            </p>
            <p className="text-zinc-100 text-[17px] leading-relaxed italic mb-5">
              &ldquo;{analysis.suggested_hook}&rdquo;
            </p>
            <div className="flex gap-2">
              <button
                onClick={copyHook}
                className="text-[12px] text-built-red border border-built-red/30 px-4 py-2 rounded-lg hover:bg-built-red/10 transition-colors"
              >
                {copied ? "✓ Copied" : "Copy Hook"}
              </button>
              <button className="text-[12px] text-zinc-500 border border-white/10 px-4 py-2 rounded-lg hover:bg-white/5 transition-colors">
                Save to Idea Bank
              </button>
            </div>
          </div>

          {/* TRANSCRIPT accordion */}
          <div className="bg-[#111111] border border-white/10 rounded-xl overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors"
              onClick={() => setShowTranscript(!showTranscript)}
            >
              <p className="text-[12px] text-zinc-500 font-medium">Transcript</p>
              <span
                className={`text-zinc-600 text-[16px] transition-transform duration-200 ${
                  showTranscript ? "rotate-90" : ""
                }`}
              >
                ›
              </span>
            </button>
            {showTranscript && (
              <div className="px-5 pb-5 pt-4 border-t border-white/5">
                <p className="text-zinc-600 text-[12px] leading-relaxed whitespace-pre-line">
                  {analysis.transcript_clean || transcript}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
