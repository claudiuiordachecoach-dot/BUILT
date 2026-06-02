"use client";

import { useState } from "react";
import { generatePresentation } from "./actions";

export default function VanzarePage() {
  const [transcript, setTranscript] = useState("");
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    setError("");
    setLink("");

    const result = await generatePresentation(transcript);

    if (!result.ok) {
      setError(result.error);
    } else {
      setLink(`${window.location.origin}/p/${result.slug}`);
    }
    setLoading(false);
  }

  async function copyLink() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F5F5] p-8">
      <div className="max-w-3xl mx-auto">
        <p className="text-[#C0392B] text-[11px] tracking-[4px] uppercase mb-3">
          Generator
        </p>
        <h1 className="text-4xl font-bold mb-2">Prezentare Vânzare</h1>
        <p className="text-[#666] mb-10 text-sm">
          Paste transcriptul din TurboScribe → AI generează cele 10 slide-uri personalizate.
        </p>

        <label className="block text-[11px] text-[#666] mb-2 uppercase tracking-widest">
          Transcript Discovery Call
        </label>
        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          className="w-full h-64 bg-[#111] border border-[#222] text-[#F5F5F5] p-4 text-sm resize-none focus:outline-none focus:border-[#C0392B] transition-colors"
          placeholder="Paste transcriptul complet al callului de discovery..."
        />

        <button
          onClick={handleGenerate}
          disabled={loading || !transcript.trim()}
          className="mt-4 bg-[#C0392B] text-white px-8 py-3 text-[13px] uppercase tracking-widest disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#a93226] transition-colors"
        >
          {loading ? "Se generează..." : "Generează Prezentarea"}
        </button>

        {error && (
          <p className="mt-4 text-[#C0392B] text-sm">{error}</p>
        )}

        {link && (
          <div className="mt-8 border border-[#1E1E1E] p-6">
            <p className="text-[11px] text-[#555] uppercase tracking-widest mb-3">
              Link generat — expiră în 48h
            </p>
            <p className="text-[#F5F5F5] text-sm mb-5 break-all font-mono">
              {link}
            </p>
            <div className="flex gap-4">
              <button
                onClick={copyLink}
                className="border border-[#333] text-[#F5F5F5] px-6 py-2 text-[13px] hover:border-[#C0392B] transition-colors"
              >
                {copied ? "✓ Copiat" : "Copiază Link"}
              </button>
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="border border-[#C0392B] text-[#C0392B] px-6 py-2 text-[13px] hover:bg-[#C0392B] hover:text-white transition-colors"
              >
                Preview
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
