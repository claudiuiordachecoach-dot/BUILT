"use client";

import { useState, useRef, type ChangeEvent } from "react";
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

const getBadgeStyle = (score: number) =>
  score >= 8
    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
    : score >= 6
    ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
    : "bg-built-red/10 text-built-red border border-built-red/20";

const getBadgeLabel = (score: number) =>
  score >= 8 ? "Excellent" : score >= 6 ? "Needs Work" : "Critical";

export default function ProfileAuditPage() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageType, setImageType] = useState<string>("image/jpeg");
  const [loading, setLoading] = useState(false);
  const [audit, setAudit] = useState<InstagramAudit | null>(null);
  const [error, setError] = useState("");
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [copiedBio, setCopiedBio] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setImageType(file.type || "image/jpeg");

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      setImageBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleRunAudit = async () => {
    if (!imageBase64) return;
    setLoading(true);
    setError("");
    setAudit(null);

    const result = await auditProfile({
      handle: "@iordacheclaudiu_",
      followers: "2780",
      screenshot_base64: imageBase64,
      screenshot_media_type: imageType,
      bio: "",
      highlights: "",
      last_posts: "",
      posting_frequency: "",
    });

    if (result.ok) {
      setAudit(result.audit);
      setOpenSection(null);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const overallScore = audit ? audit.overall : null;
  const elements = audit ? Object.entries(audit.elements) : [];

  const handleCopyBio = () => {
    if (!audit?.rewritten_bio) return;
    navigator.clipboard.writeText(audit.rewritten_bio);
    setCopiedBio(true);
    setTimeout(() => setCopiedBio(false), 2000);
  };

  return (
    <div className="p-8 max-w-[900px] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-display tracking-[0.06em] text-zinc-100 mb-2">
          Profile Audit
        </h1>
        <p className="text-zinc-500 text-sm leading-relaxed">
          Take a screenshot of your Instagram profile from your phone and upload it below. Claude will score you out of 10 across 6 elements and tell you exactly what to fix.
        </p>
      </div>

      {/* Upload Section */}
      <div className="bg-[#111111] border border-white/[0.08] rounded-xl p-6 mb-6">
        <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-mono mb-4">
          Profile Screenshot
        </p>

        {previewUrl ? (
          <div className="relative mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Profile screenshot"
              className="max-h-64 rounded-lg border border-white/10 mx-auto block"
            />
            <button
              onClick={() => {
                setPreviewUrl(null);
                setImageBase64(null);
                setAudit(null);
                setOpenSection(null);
                if (fileRef.current) fileRef.current.value = "";
              }}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-zinc-400 hover:text-zinc-200 flex items-center justify-center text-[12px]"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full border border-dashed border-white/20 rounded-xl py-12 flex flex-col items-center gap-3 hover:border-white/40 transition-colors mb-4"
          >
            <svg className="w-8 h-8 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <p className="text-zinc-400 text-[13px] font-medium">Upload your Instagram profile screenshot</p>
            <p className="text-zinc-600 text-[12px] text-center px-6">
              On your phone: open Instagram → your profile → take a screenshot → upload here
            </p>
          </button>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <button
          onClick={handleRunAudit}
          disabled={!imageBase64 || loading}
          className="w-full bg-[#1a1a1a] border border-white/10 text-zinc-200 py-3 rounded-lg text-[13px] font-medium hover:bg-white/5 transition-colors disabled:opacity-40"
        >
          {loading ? "Analyzing..." : "Run Audit"}
        </button>

        {error && <p className="mt-3 text-built-red text-[12px]">{error}</p>}
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <div className="flex gap-1 justify-center mb-3">
            {[0, 150, 300].map((delay) => (
              <span
                key={delay}
                className="w-2 h-2 rounded-full bg-built-red/60 animate-bounce"
                style={{ animationDelay: `${delay}ms` }}
              />
            ))}
          </div>
          <p className="text-zinc-600 text-[12px] font-mono">Claude is analyzing your profile...</p>
        </div>
      )}

      {/* Results */}
      {audit && overallScore !== null && (
        <div className="space-y-4">
          {/* Score Header Row */}
          <div className="bg-[#111111] border border-white/[0.08] rounded-xl p-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono mb-1">
                OVERALL SCORE
              </p>
              <div className="flex items-center gap-3">
                <span className="text-5xl font-display text-zinc-100 leading-none">
                  {overallScore}
                  <span className="text-2xl text-zinc-500">/10</span>
                </span>
                <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${getBadgeStyle(overallScore)}`}>
                  {getBadgeLabel(overallScore)}
                </span>
              </div>
            </div>

            {/* Mini scorecard */}
            <div className="text-right space-y-1">
              {elements.map(([key, el]) => (
                <div key={key} className="flex items-center gap-3 justify-end">
                  <span className="text-[11px] text-zinc-500">{ELEMENT_LABELS[key] ?? key}</span>
                  <span className={`text-[12px] font-mono font-bold w-6 text-right ${getScoreColor(el.score)}`}>
                    {el.score}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Element Breakdown */}
          <div>
            <p className="text-[11px] text-zinc-500 uppercase tracking-widest font-mono mb-3">
              ELEMENT BREAKDOWN
            </p>
            <div className="space-y-2">
              {elements.map(([key, el]) => (
                <div
                  key={key}
                  className="bg-[#111111] border border-white/[0.08] rounded-xl overflow-hidden"
                >
                  <button
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors text-left"
                    onClick={() => setOpenSection(openSection === key ? null : key)}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`text-[15px] font-mono font-bold ${getScoreColor(el.score)}`}>
                        {el.score}/10
                      </span>
                      <span className="text-[13px] text-zinc-200">{ELEMENT_LABELS[key] ?? key}</span>
                    </div>
                    <span
                      className={`text-zinc-500 text-[16px] transition-transform duration-200 ${
                        openSection === key ? "rotate-90" : ""
                      }`}
                    >
                      ›
                    </span>
                  </button>

                  {openSection === key && (
                    <div className="px-5 pb-5 border-t border-white/[0.06] pt-4 space-y-4">
                      <p className="text-zinc-400 text-[13px] leading-relaxed">{el.feedback}</p>

                      {el.fix && (
                        <div className="space-y-2">
                          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
                            PRIORITY FIXES
                          </p>
                          <p className="text-zinc-300 text-[13px] leading-relaxed">{el.fix}</p>
                        </div>
                      )}

                      {/* Rewritten bio only in bio section */}
                      {key === "bio" && audit.rewritten_bio && (
                        <div className="space-y-2">
                          <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
                            NEW BIO
                          </p>
                          <div className="bg-[#0f0f0f] border border-white/[0.06] rounded-lg p-4">
                            <p className="text-zinc-200 text-[13px] leading-relaxed italic">
                              {audit.rewritten_bio}
                            </p>
                          </div>
                          <button
                            onClick={handleCopyBio}
                            className="text-[11px] text-zinc-400 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
                          >
                            {copiedBio ? "Copied!" : "Copy Bio"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Top Priority */}
          {audit.top_priority && (
            <div className="bg-[#111111] border border-built-red/20 rounded-xl p-5">
              <p className="text-[10px] text-built-red font-mono uppercase tracking-widest mb-2">
                TOP PRIORITY
              </p>
              <p className="text-zinc-200 text-[13px] leading-relaxed">{audit.top_priority}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
