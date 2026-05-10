"use client";

import { useState, useRef, type ChangeEvent } from "react";
import { auditProfile, type InstagramAudit } from "./actions";

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

export default function ProfileAuditPage() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageType, setImageType] = useState<string>("image/jpeg");
  const [loading, setLoading] = useState(false);
  const [audit, setAudit] = useState<InstagramAudit | null>(null);
  const [error, setError] = useState("");
  const [openSection, setOpenSection] = useState<string | null>("bio");
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
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const overallScore = audit ? audit.overall : null;
  const elements = audit ? Object.entries(audit.elements) : [];

  return (
    <div className="p-8 max-w-[900px] mx-auto">
      <div className="mb-8">
        <p className="text-[11px] text-built-red font-mono uppercase tracking-widest mb-1">
          Tools · Profile Audit
        </p>
        <h1 className="text-4xl font-display tracking-[0.06em] text-zinc-100">
          PROFILE AUDIT
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          Fă un screenshot profilului tău din Instagram, uploadează-l mai jos. Claude îl scorează pe 6 elemente și îți spune exact ce să repari.
        </p>
      </div>

      <div className="bg-[#111111] border border-white/10 rounded-xl p-6 mb-6">
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
            className="w-full border border-dashed border-white/20 rounded-xl py-10 flex flex-col items-center gap-2 hover:border-white/40 transition-colors mb-4"
          >
            <span className="text-2xl text-zinc-600">↑</span>
            <p className="text-zinc-500 text-[13px]">Upload your Instagram profile screenshot</p>
            <p className="text-zinc-700 text-[11px]">
              Pe telefon: deschide Instagram → profilul tău → fă screenshot → uploadează aici
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
          className="w-full bg-built-red/10 text-built-red border border-built-red/20 py-3 rounded-lg text-[13px] font-medium hover:bg-built-red/20 transition-colors disabled:opacity-40"
        >
          {loading ? "Analizez..." : "Run Audit"}
        </button>

        {error && <p className="mt-3 text-built-red text-[12px]">{error}</p>}
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="flex gap-1 justify-center mb-3">
            {[0, 150, 300].map((delay) => (
              <span key={delay} className="w-2 h-2 rounded-full bg-built-red/60 animate-bounce" style={{ animationDelay: `${delay}ms` }} />
            ))}
          </div>
          <p className="text-zinc-600 text-[12px] font-mono">Claude analizează profilul tău...</p>
        </div>
      )}

      {audit && (
        <div className="space-y-4">
          <div className="grid grid-cols-[auto_1fr] gap-4">
            <div className="bg-[#111111] border border-white/10 rounded-xl p-6 flex flex-col items-center justify-center w-44">
              <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-2">Overall Score</p>
              <div className="relative w-24 h-24 mb-2">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#1a1a1a" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="40" fill="none" stroke="#C0392B" strokeWidth="8"
                    strokeDasharray={`${(overallScore! / 10) * 251.2} 251.2`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-display text-zinc-100">{overallScore}</span>
                  <span className="text-[9px] text-zinc-600">/10</span>
                </div>
              </div>
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                overallScore! >= 8 ? "text-emerald-400 bg-emerald-400/10" :
                overallScore! >= 6 ? "text-yellow-400 bg-yellow-400/10" :
                "text-built-red bg-built-red/10"
              }`}>
                {overallScore! >= 8 ? "Good" : overallScore! >= 6 ? "Needs Work" : "Critical"}
              </span>
            </div>

            <div className="bg-[#111111] border border-white/10 rounded-xl p-5">
              <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-3">Scoruri per element</p>
              <div className="space-y-3">
                {elements.map(([key, el]) => (
                  <div key={key}>
                    <div className="flex justify-between text-[12px] mb-1">
                      <span className="text-zinc-400">{ELEMENT_LABELS[key] ?? key}</span>
                      <span className={`font-mono font-bold ${getScoreColor(el.score)}`}>{el.score}/10</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full">
                      <div className={`h-full rounded-full ${getBarColor(el.score)}`} style={{ width: `${el.score * 10}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-3">Element Breakdown</p>
            <div className="space-y-2">
              {elements.map(([key, el]) => (
                <div key={key} className="bg-[#111111] border border-white/10 rounded-xl overflow-hidden">
                  <button
                    className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-white/5 transition-colors"
                    onClick={() => setOpenSection(openSection === key ? null : key)}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-[14px] font-mono font-bold ${getScoreColor(el.score)}`}>{el.score}</span>
                      <span className="text-[13px] text-zinc-200">{ELEMENT_LABELS[key] ?? key}</span>
                    </div>
                    <span className={`text-zinc-500 transition-transform ${openSection === key ? "rotate-90" : ""}`}>›</span>
                  </button>
                  {openSection === key && (
                    <div className="px-5 pb-4 border-t border-white/5 pt-3 space-y-3">
                      <p className="text-zinc-400 text-[12px] leading-relaxed">{el.feedback}</p>
                      <div className="flex gap-2 items-start">
                        <span className="text-built-red shrink-0 text-[12px] mt-0.5">▸</span>
                        <p className="text-zinc-300 text-[12px] leading-relaxed">{el.fix}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#111111] border border-built-red/20 rounded-xl p-5">
            <p className="text-[10px] text-built-red font-mono uppercase tracking-widest mb-3">Priority Fix #1</p>
            <p className="text-zinc-200 text-[13px] leading-relaxed">{audit.top_priority}</p>
          </div>

          {audit.rewritten_bio && (
            <div className="bg-[#111111] border border-white/10 rounded-xl p-5">
              <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest mb-3">Bio rescris</p>
              <p className="text-zinc-200 text-[13px] leading-relaxed italic">{audit.rewritten_bio}</p>
              <button
                onClick={() => navigator.clipboard.writeText(audit.rewritten_bio)}
                className="mt-3 text-[11px] text-zinc-400 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-white/5"
              >
                Copiază bio-ul
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
