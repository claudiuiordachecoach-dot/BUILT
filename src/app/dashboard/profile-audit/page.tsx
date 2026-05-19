"use client";

import { useState, useRef, useEffect, type ChangeEvent } from "react";
import { auditProfile, type InstagramAudit } from "@/app/audit/actions";

const ELEMENT_LABELS: Record<string, string> = {
  profile_picture: "Profile Picture",
  name_username: "Name & Username",
  bio: "Bio",
  link_in_bio: "Link in Bio",
  highlights: "Highlights",
  pinned_posts: "Pinned Posts",
};

const getScoreColor = (s: number) =>
  s >= 8 ? "text-emerald-400" : s >= 6 ? "text-yellow-400" : "text-built-red";

const getBarColor = (s: number) =>
  s >= 8 ? "bg-emerald-500" : s >= 6 ? "bg-yellow-500" : "bg-built-red";

const getVerdict = (s: number) =>
  s >= 8 ? { label: "Strong", style: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" }
  : s >= 6 ? { label: "Needs Work", style: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" }
  : { label: "Critical", style: "bg-built-red/10 text-built-red border border-built-red/20" };

function Toast({ show, onHide }: { show: boolean; onHide: () => void }) {
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(onHide, 3000);
    return () => clearTimeout(t);
  }, [show, onHide]);

  if (!show) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[13px] font-medium px-4 py-3 rounded-xl flex items-center gap-2 shadow-2xl">
      <span>✓</span> Audit completed
    </div>
  );
}

export default function ProfileAuditPage() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageType, setImageType] = useState<string>("image/jpeg");
  const [loading, setLoading] = useState(false);
  const [audit, setAudit] = useState<InstagramAudit | null>(null);
  const [error, setError] = useState("");
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [copiedBio, setCopiedBio] = useState(false);
  const [handle, setHandle] = useState("@iordacheclaudiu_");
  const [followers, setFollowers] = useState("2780");
  const [toast, setToast] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setImageType(file.type || "image/jpeg");
    const reader = new FileReader();
    reader.onload = () => {
      setImageBase64((reader.result as string).split(",")[1]);
    };
    reader.readAsDataURL(file);
  };

  const handleRunAudit = async () => {
    if (!imageBase64) return;
    setLoading(true);
    setError("");
    setAudit(null);
    const result = await auditProfile({
      handle, followers,
      screenshot_base64: imageBase64,
      screenshot_media_type: imageType,
      bio: "", highlights: "", last_posts: "", posting_frequency: "",
    });
    setLoading(false);
    if (result.ok) {
      setAudit(result.audit);
      setOpenSection(null);
      setToast(true);
    } else {
      setError(result.error);
    }
  };

  const elements = audit ? Object.entries(audit.elements) : [];
  const verdict = audit ? getVerdict(audit.overall) : null;

  return (
    <div className="p-8 max-w-[900px] mx-auto">
      <Toast show={toast} onHide={() => setToast(false)} />

      <div className="mb-8">
        <h1 className="text-3xl font-display tracking-[0.06em] text-zinc-100 mb-2">Profile Audit</h1>
        <p className="text-zinc-500 text-sm leading-relaxed">
          Take a screenshot of your Instagram profile from your phone and upload it below. Claude will score you out of 10 across 6 elements and tell you exactly what to fix.
        </p>
      </div>

      {/* Profile Info */}
      <div className="bg-[#111111] border border-white/[0.08] rounded-xl p-6 mb-4">
        <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-mono mb-4">Profile Info</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-zinc-500 mb-1 block">Instagram Handle</label>
            <input type="text" value={handle} onChange={e => setHandle(e.target.value)} placeholder="@username"
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-[13px] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-white/20" />
          </div>
          <div>
            <label className="text-[11px] text-zinc-500 mb-1 block">Followers</label>
            <input type="text" value={followers} onChange={e => setFollowers(e.target.value)} placeholder="ex: 2780"
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-[13px] text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-white/20" />
          </div>
        </div>
      </div>

      {/* Upload */}
      <div className="bg-[#111111] border border-white/[0.08] rounded-xl p-6 mb-6">
        <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-mono mb-4">Profile Screenshot</p>
        {previewUrl ? (
          <div className="relative mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Profile screenshot" className="max-h-64 rounded-lg border border-white/10 mx-auto block" />
            <button onClick={() => { setPreviewUrl(null); setImageBase64(null); setAudit(null); if (fileRef.current) fileRef.current.value = ""; }}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-zinc-400 hover:text-zinc-200 flex items-center justify-center text-[12px]">✕</button>
          </div>
        ) : (
          <button onClick={() => fileRef.current?.click()}
            className="w-full border border-dashed border-white/20 rounded-xl py-12 flex flex-col items-center gap-3 hover:border-white/40 transition-colors mb-4">
            <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <p className="text-zinc-400 text-[13px] font-medium">Upload your Instagram profile screenshot</p>
            <p className="text-zinc-600 text-[12px] text-center px-6">On your phone: open Instagram → your profile → take a screenshot → upload here</p>
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
        <button onClick={handleRunAudit} disabled={!imageBase64 || loading}
          className="w-full bg-[#1a1a1a] border border-white/10 text-zinc-200 py-3 rounded-lg text-[13px] font-medium hover:bg-white/5 transition-colors disabled:opacity-40">
          {loading ? "Analysing profile..." : "Run Audit"}
        </button>
        {error && <p className="mt-3 text-built-red text-[12px]">{error}</p>}
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <div className="flex gap-1 justify-center mb-3">
            {[0, 150, 300].map((delay) => (
              <span key={delay} className="w-2 h-2 rounded-full bg-built-red/60 animate-bounce" style={{ animationDelay: `${delay}ms` }} />
            ))}
          </div>
          <p className="text-zinc-600 text-[12px] font-mono">Claude is analyzing your profile...</p>
        </div>
      )}

      {/* Results */}
      {audit && verdict && (
        <div className="space-y-4">

          {/* Score header */}
          <div className="bg-[#111111] border border-white/[0.08] rounded-xl p-5 flex items-start justify-between">
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono mb-1">OVERALL SCORE</p>
              <div className="flex items-center gap-3">
                <span className="text-5xl font-display text-zinc-100 leading-none">
                  {audit.overall}<span className="text-2xl text-zinc-500">/10</span>
                </span>
                <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${verdict.style}`}>
                  {verdict.label}
                </span>
              </div>
            </div>
            {/* Mini scorecard with bars */}
            <div className="space-y-2 min-w-[200px]">
              {elements.map(([key, el]) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-[11px] text-zinc-500 w-32 text-right">{ELEMENT_LABELS[key] ?? key}</span>
                  <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${getBarColor(el.score)}`} style={{ width: `${el.score * 10}%` }} />
                  </div>
                  <span className={`text-[11px] font-mono w-4 ${getScoreColor(el.score)}`}>{el.score}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Element Breakdown */}
          <div>
            <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-mono mb-3">ELEMENT BREAKDOWN</p>
            <div className="space-y-2">
              {elements.map(([key, el]) => (
                <div key={key} className="bg-[#111111] border border-white/[0.08] rounded-xl overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors text-left"
                    onClick={() => setOpenSection(openSection === key ? null : key)}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`text-[15px] font-mono font-bold ${getScoreColor(el.score)}`}>{el.score}/10</span>
                      <span className="text-[13px] text-zinc-200">{ELEMENT_LABELS[key] ?? key}</span>
                    </div>
                    <span className={`text-zinc-500 text-[16px] transition-transform duration-200 ${openSection === key ? "rotate-90" : ""}`}>›</span>
                  </button>

                  {openSection === key && (
                    <div className="px-5 pb-5 border-t border-white/[0.06] pt-4 space-y-3">
                      {/* What's good */}
                      {el.feedback_good && (
                        <div className="flex gap-2.5">
                          <span className="text-emerald-400 text-[13px] mt-0.5 shrink-0">✓</span>
                          <p className="text-zinc-400 text-[13px] leading-relaxed">{el.feedback_good}</p>
                        </div>
                      )}
                      {/* What's missing */}
                      {el.feedback_bad && (
                        <div className="flex gap-2.5">
                          <span className="text-built-red text-[13px] mt-0.5 shrink-0">✗</span>
                          <p className="text-zinc-400 text-[13px] leading-relaxed">{el.feedback_bad}</p>
                        </div>
                      )}
                      {/* Blue recommendation */}
                      {el.fix && (
                        <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg px-4 py-3">
                          <p className="text-blue-300 text-[12px] leading-relaxed">{el.fix}</p>
                        </div>
                      )}
                      {/* Suggested Highlights chips — only in highlights section */}
                      {key === "highlights" && audit.suggested_highlights?.length > 0 && (
                        <div className="pt-1">
                          <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-mono mb-2">Suggested Highlight Names</p>
                          <div className="flex flex-wrap gap-2">
                            {audit.suggested_highlights.map((name) => (
                              <span key={name} className="text-[11px] text-zinc-300 bg-white/[0.06] border border-white/10 px-3 py-1 rounded-full">
                                {name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* YOUR NEW BIO */}
          {audit.rewritten_bio && (
            <div className="bg-[#111111] border border-white/[0.08] rounded-xl p-5 space-y-4">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Your New Bio</p>
              {audit.new_bio_explanation && (
                <p className="text-zinc-500 text-[12px] leading-relaxed">{audit.new_bio_explanation}</p>
              )}
              <div className="bg-[#0f0f0f] border border-white/[0.06] rounded-lg p-4">
                <p className="text-zinc-100 text-[14px] leading-relaxed">{audit.rewritten_bio}</p>
              </div>
              <button
                onClick={() => { navigator.clipboard.writeText(audit.rewritten_bio); setCopiedBio(true); setTimeout(() => setCopiedBio(false), 2000); }}
                className="text-[11px] text-zinc-400 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
              >
                {copiedBio ? "✓ Copied" : "Copy Bio"}
              </button>
            </div>
          )}

          {/* PRIORITY FIXES */}
          {audit.priority_fixes?.length > 0 && (
            <div className="bg-[#111111] border border-built-red/20 rounded-xl p-5">
              <p className="text-[10px] text-built-red font-mono uppercase tracking-widest mb-4">Priority Fixes</p>
              <ol className="space-y-3">
                {audit.priority_fixes.map((fix, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="text-built-red font-mono text-[12px] shrink-0 mt-0.5">{i + 1}.</span>
                    <p className="text-zinc-300 text-[13px] leading-relaxed">{fix}</p>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
