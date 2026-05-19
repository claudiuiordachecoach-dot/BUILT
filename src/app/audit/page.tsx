"use client";

import { useState, useTransition, useRef } from "react";
import { auditProfile, type InstagramAudit, type AuditInput } from "./actions";

export default function AuditPage() {
  const [form, setForm] = useState<Omit<AuditInput, "screenshot_base64" | "screenshot_media_type">>({
    handle: "", followers: "", bio: "", highlights: "", last_posts: "", posting_frequency: "",
  });
  const [screenshot, setScreenshot] = useState<{ base64: string; mediaType: string; preview: string } | null>(null);
  const [audit, setAudit] = useState<InstagramAudit | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const [header, data] = dataUrl.split(",");
      const mediaType = header.replace("data:", "").replace(";base64", "");
      setScreenshot({ base64: data, mediaType, preview: dataUrl });
    };
    reader.readAsDataURL(file);
  }

  function handleAudit() {
    setError(null); setAudit(null);
    startTransition(async () => {
      const input: AuditInput = {
        ...form,
        screenshot_base64: screenshot?.base64,
        screenshot_media_type: screenshot?.mediaType,
      };
      const r = await auditProfile(input);
      if (r.ok) setAudit(r.audit);
      else setError(r.error);
    });
  }

  function copyBio() {
    if (audit?.rewritten_bio) {
      navigator.clipboard.writeText(audit.rewritten_bio);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="p-8 max-w-4xl">
      <p className="font-condensed text-xs text-built-red uppercase tracking-wider mb-1">M10 · Audit Profil Instagram</p>
      <h1 className="font-display text-5xl tracking-[0.06em] text-built-white mb-2">AUDIT INSTAGRAM</h1>
      <p className="text-built-gray-text mb-8">Încarcă un screenshot al profilului tău — Claude vede tot și auditează 6 elemente. Bio-ul e rescris gata de copiat.</p>

      <div className="p-6 bg-built-gray-1 border border-built-gray-2 rounded-sm mb-6 space-y-4">

        {/* SCREENSHOT UPLOAD */}
        <div>
          <p className="font-condensed text-[10px] text-built-gray-text uppercase mb-2">
            Screenshot profil Instagram <span className="text-built-red">*</span>
          </p>
          <div
            onClick={() => fileRef.current?.click()}
            className="border border-dashed border-built-gray-2 hover:border-built-red rounded-sm p-6 text-center cursor-pointer transition-colors"
          >
            {screenshot ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={screenshot.preview} alt="Preview" className="max-h-64 mx-auto rounded-sm object-contain" />
            ) : (
              <div>
                <p className="text-built-gray-text text-sm mb-1">Click pentru a încărca</p>
                <p className="font-condensed text-[10px] text-built-gray-text uppercase">PNG, JPG, WEBP · max 5MB</p>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          {screenshot && (
            <button onClick={() => { setScreenshot(null); if (fileRef.current) fileRef.current.value = ""; }}
              className="mt-2 font-condensed text-[10px] uppercase tracking-wider text-built-gray-text hover:text-built-red">
              Șterge screenshot
            </button>
          )}
        </div>

        {/* DATE TEXT (opționale dacă ai screenshot, recomandate) */}
        <details className="group">
          <summary className="font-condensed text-[10px] text-built-gray-text uppercase tracking-wider cursor-pointer hover:text-built-white list-none flex items-center gap-2">
            <span>+ Date suplimentare (opțional, îmbunătățesc precizia)</span>
          </summary>
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {[["handle", "Handle (fără @)"], ["followers", "Nr. followeri"]].map(([k, l]) => (
                <div key={k}>
                  <p className="font-condensed text-[10px] text-built-gray-text uppercase mb-1">{l}</p>
                  <input value={(form as Record<string, string>)[k]} onChange={set(k as keyof typeof form)}
                    className="w-full bg-built-black border border-built-gray-2 text-built-white text-sm px-3 py-2 focus:outline-none focus:border-built-red" />
                </div>
              ))}
            </div>
            {[
              ["bio", "Bio complet", 2],
              ["highlights", "Highlights (titluri + descriere scurtă)", 2],
              ["last_posts", "Ultimele posturi fixate (hooks)", 3],
              ["posting_frequency", "Frecvența postărilor", 1],
            ].map(([k, l, rows]) => (
              <div key={k as string}>
                <p className="font-condensed text-[10px] text-built-gray-text uppercase mb-1">{l as string}</p>
                <textarea value={(form as Record<string, string>)[k as string]} onChange={set(k as keyof typeof form)} rows={rows as number}
                  className="w-full bg-built-black border border-built-gray-2 text-built-white text-sm p-3 resize-none focus:outline-none focus:border-built-red" />
              </div>
            ))}
          </div>
        </details>

        {error && <p className="text-built-red font-condensed text-xs">⚠ {error}</p>}

        <button onClick={handleAudit} disabled={isPending || (!screenshot && !form.bio.trim())}
          className="px-6 py-3 bg-built-red hover:bg-built-red-dark text-white font-condensed text-xs disabled:opacity-50 transition-colors">
          {isPending ? "Auditează... (~15s)" : "Auditează profilul →"}
        </button>
      </div>

      {audit && (
        <div className="space-y-5">
          {/* SCOR GLOBAL + PRIORITATE */}
          <div className="flex items-start gap-6 p-6 bg-built-gray-1 border border-built-gray-2 rounded-sm">
            <div className="text-center shrink-0">
              <p className="font-condensed text-[10px] text-built-gray-text uppercase mb-1">Scor global</p>
              <p className={`font-display text-7xl leading-none ${audit.overall >= 70 ? "text-emerald-400" : audit.overall >= 50 ? "text-amber-400" : "text-built-red"}`}>
                {audit.overall}
              </p>
              <p className="font-condensed text-[10px] text-built-gray-text mt-1">/ 10 × 10</p>
            </div>
            <div className="flex-1">
              <p className="font-condensed text-[10px] text-built-red uppercase mb-1">Prioritate #1</p>
              <p className="text-sm text-built-white mb-4">{audit.top_priority}</p>
              <div className="flex flex-wrap gap-2">
                {(audit.priority_fixes ?? []).map((w: string, i: number) => (
                  <span key={i} className="px-2 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-condensed text-[10px]">
                    ⚡ {w}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* BIO RESCRIS */}
          <div className="p-5 bg-built-gray-1 border border-built-red/50 rounded-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="font-condensed text-[10px] text-built-red uppercase tracking-wider">Bio rescris — copy-paste ready</p>
              <button onClick={copyBio}
                className="font-condensed text-[10px] uppercase tracking-wider px-3 py-1.5 border border-built-gray-2 hover:border-built-red text-built-gray-text hover:text-built-white transition-colors">
                {copied ? "✓ Copiat!" : "Copiază"}
              </button>
            </div>
            <p className="text-sm text-built-white leading-relaxed whitespace-pre-wrap">{audit.rewritten_bio}</p>
          </div>

          {/* 6 ELEMENTE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.values(audit.elements).map((el) => (
              <div key={el.label} className="p-4 bg-built-gray-1 border border-built-gray-2 rounded-sm">
                <div className="flex justify-between mb-2">
                  <span className="font-condensed text-xs text-built-white uppercase">{el.label}</span>
                  <span className={`font-display text-xl ${el.score >= 8 ? "text-emerald-400" : el.score >= 5 ? "text-amber-400" : "text-built-red"}`}>
                    {el.score}<span className="text-built-gray-text text-sm">/10</span>
                  </span>
                </div>
                <div className="h-1 bg-built-gray-2 mb-3">
                  <div className={`h-1 ${el.score >= 8 ? "bg-emerald-500" : el.score >= 5 ? "bg-amber-500" : "bg-built-red"}`}
                    style={{ width: `${el.score * 10}%` }} />
                </div>
                <p className="text-xs text-built-white/70 mb-2">{el.feedback_good}{el.feedback_bad ? ` — ${el.feedback_bad}` : ""}</p>
                <p className="text-xs text-built-red border-t border-built-gray-2/50 pt-2">→ {el.fix}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
