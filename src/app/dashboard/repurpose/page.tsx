"use client";

import { useState, useEffect } from "react";
import {
  generateRepurpose,
  listRepurpose,
  type RepurposeRecord,
} from "./actions";
import type { Pillar } from "@/app/reels/actions";

const PILLARS: { key: Pillar; label: string }[] = [
  { key: "mix", label: "Mix" },
  { key: "B", label: "B · Forță" },
  { key: "U", label: "U · Rezistență" },
  { key: "I", label: "I · Nutriție" },
  { key: "L", label: "L · Lifestyle" },
  { key: "T", label: "T · Mindset" },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="text-[10px] font-condensed uppercase tracking-wider px-2.5 py-1 rounded border border-built-gray-2 text-built-gray-text hover:text-built-white hover:border-built-red/50 transition-colors"
    >
      {copied ? "✓ Copiat" : "Copiază"}
    </button>
  );
}

function OutputCard({ title, tag, children, copyText }: { title: string; tag: string; children: React.ReactNode; copyText: string }) {
  return (
    <div className="bg-built-gray-1 border border-built-gray-2 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-condensed uppercase tracking-widest text-built-red">{tag}</span>
          <h3 className="font-display text-xl tracking-wide text-built-white">{title}</h3>
        </div>
        <CopyButton text={copyText} />
      </div>
      {children}
    </div>
  );
}

export default function RepurposePage() {
  const [idea, setIdea] = useState("");
  const [pillar, setPillar] = useState<Pillar>("mix");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RepurposeRecord | null>(null);
  const [history, setHistory] = useState<RepurposeRecord[]>([]);

  useEffect(() => {
    listRepurpose().then(setHistory).catch(() => setHistory([]));
  }, []);

  async function handleGenerate() {
    if (idea.trim().length < 3) { setError("Scrie o idee (minim 3 caractere)."); return; }
    setLoading(true);
    setError(null);
    const r = await generateRepurpose(pillar, idea.trim());
    setLoading(false);
    if (r.ok) {
      setResult(r.record);
      setHistory((h) => [r.record, ...h]);
    } else {
      setError(r.error);
    }
  }

  const b = result?.body;

  return (
    <div className="p-8 max-w-5xl">
      <p className="font-condensed text-xs text-built-red uppercase tracking-wider mb-1">Repurpose Engine</p>
      <h1 className="font-display text-5xl tracking-[0.06em] text-built-white mb-2">O IDEE → 4 PIESE</h1>
      <p className="text-built-gray-text mb-6">Scrie o singură idee. Primești reel, carusel, 3 story-uri și un email — toate în vocea ta, gata de postat.</p>

      {/* Input */}
      <div className="bg-built-gray-1 border border-built-gray-2 rounded-xl p-5 mb-8">
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="Ex: De ce cardio-ul zilnic nu te ajută să slăbești dacă ai cortizolul ridicat"
          rows={3}
          className="w-full bg-built-black border border-built-gray-2 rounded-lg px-4 py-3 text-built-white placeholder-built-gray-text/50 focus:outline-none focus:border-built-red/50 transition-colors resize-none"
        />
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <div className="flex flex-wrap gap-1">
            {PILLARS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setPillar(p.key)}
                className={`text-[11px] font-condensed uppercase tracking-wider px-3 py-1.5 rounded border transition-colors ${
                  pillar === p.key
                    ? "border-built-red text-built-white bg-built-red/15"
                    : "border-built-gray-2 text-built-gray-text hover:text-built-white"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className="ml-auto bg-built-red hover:bg-built-red/85 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
          >
            {loading ? "Generez cele 4 piese..." : "Generează"}
          </button>
        </div>
        {error && <p className="text-built-red text-sm mt-3">⚠ {error}</p>}
      </div>

      {/* Results */}
      {b && (
        <div className="space-y-5 mb-10">
          <OutputCard title="Reel" tag="Video" copyText={`HOOK: ${b.reel.hook}\n\nSCRIPT:\n${b.reel.script}\n\nCAPTION:\n${b.reel.caption}`}>
            <p className="text-built-white font-medium mb-2">🎬 {b.reel.hook}</p>
            <p className="text-built-gray-text text-sm whitespace-pre-wrap mb-3">{b.reel.script}</p>
            <div className="border-t border-built-gray-2 pt-3">
              <p className="text-[10px] font-condensed uppercase tracking-widest text-built-gray-text mb-1">Caption</p>
              <p className="text-built-gray-text text-sm whitespace-pre-wrap">{b.reel.caption}</p>
            </div>
          </OutputCard>

          <OutputCard title="Carusel" tag={`${b.carousel.length} slide-uri`} copyText={b.carousel.map((s) => `${s.position}. ${s.title}\n${s.body}`).join("\n\n")}>
            <div className="space-y-2">
              {b.carousel.map((s) => (
                <div key={s.position} className="flex gap-3">
                  <span className="text-built-red font-display text-lg w-6 shrink-0">{s.position}</span>
                  <div>
                    <p className="text-built-white font-medium text-sm">{s.title}</p>
                    <p className="text-built-gray-text text-sm">{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </OutputCard>

          <OutputCard title="Story-uri" tag={`${b.stories.length} secvențiale`} copyText={b.stories.map((s) => `${s.position}. ${s.text}\n→ ${s.interaction}`).join("\n\n")}>
            <div className="space-y-3">
              {b.stories.map((s) => (
                <div key={s.position} className="border border-built-gray-2 rounded-lg p-3">
                  <p className="text-built-white text-sm mb-1">{s.text}</p>
                  <p className="text-[11px] text-built-red">↳ {s.interaction}</p>
                </div>
              ))}
            </div>
          </OutputCard>

          <OutputCard title="Email" tag="Newsletter" copyText={`SUBJECT: ${b.email.subject}\n\n${b.email.body}`}>
            <p className="text-built-white font-medium mb-2">✉ {b.email.subject}</p>
            <p className="text-built-gray-text text-sm whitespace-pre-wrap">{b.email.body}</p>
          </OutputCard>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div>
          <p className="font-condensed text-xs text-built-gray-text uppercase tracking-wider mb-3">Generate recent</p>
          <div className="space-y-2">
            {history.slice(0, 10).map((h) => (
              <button
                key={h.id}
                type="button"
                onClick={() => setResult(h)}
                className="w-full text-left bg-built-gray-1 border border-built-gray-2 rounded-lg px-4 py-3 hover:border-built-red/40 transition-colors"
              >
                <p className="text-built-white text-sm truncate">{h.body.idea}</p>
                <p className="text-[11px] text-built-gray-text">{new Date(h.created_at).toLocaleString("ro-RO")} · pilon {h.pillar}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
