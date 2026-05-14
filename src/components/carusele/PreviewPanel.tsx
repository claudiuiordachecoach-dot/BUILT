// src/components/carusele/PreviewPanel.tsx
"use client";

import { useState } from "react";
import type { CaruselSlide } from "@/app/carusele/actions";

type PreviewMode = "text" | "mockup" | "canva";

interface PreviewPanelProps {
  slides: CaruselSlide[];
  caruselId: number | null;
  onPngGenerated: (urls: string[]) => void;
}

export function PreviewPanel({ slides, caruselId, onPngGenerated }: PreviewPanelProps) {
  const [mode, setMode] = useState<PreviewMode>("text");
  const [isRendering, setIsRendering] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [pngUrls, setPngUrls] = useState<string[]>([]);

  async function handleGeneratePngs() {
    if (!caruselId) return;
    setIsRendering(true);
    setRenderError(null);
    try {
      const res = await fetch("/api/carusele/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caruselId }),
      });
      const data = await res.json();
      if (data.ok) {
        setPngUrls(data.pngUrls);
        onPngGenerated(data.pngUrls);
      } else {
        setRenderError(data.error ?? "Eroare necunoscută.");
      }
    } catch (e) {
      setRenderError(e instanceof Error ? e.message : "Eroare rețea.");
    } finally {
      setIsRendering(false);
    }
  }

  async function handleDownloadZip() {
    if (!pngUrls.length) return;
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    const folder = zip.folder("carusel-built") ?? zip;

    await Promise.all(
      pngUrls.map(async (url, i) => {
        const res = await fetch(url);
        const blob = await res.blob();
        folder.file(`slide_${String(i + 1).padStart(2, "0")}.png`, blob);
      })
    );

    const content = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    a.download = `carusel-built-${caruselId}.zip`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const canvaText = slides
    .map((s) => `SLIDE ${s.position}\nTitlu: ${s.title}\n${s.body}\n---`)
    .join("\n\n");

  if (!slides.length) {
    return (
      <div className="flex items-center justify-center h-full text-built-gray-text text-sm">
        Preview apare după generare.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Mode tabs */}
      <div className="flex gap-1 border-b border-built-gray-2">
        {(["text", "mockup", "canva"] as PreviewMode[]).map((m) => (
          <button key={m} type="button" onClick={() => setMode(m)}
            className={`px-4 py-2 font-condensed text-[10px] uppercase tracking-wider transition-colors ${mode === m ? "text-built-white border-b border-built-red -mb-px" : "text-built-gray-text hover:text-built-white"}`}>
            {m === "text" ? "Text" : m === "mockup" ? "Mockup" : "Canva Export"}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {mode === "text" && (
          <div className="space-y-3">
            {slides.map((s) => (
              <div key={s.position} className="flex gap-4 p-3 bg-built-black border border-built-gray-2 rounded-sm">
                <span className="font-display text-2xl text-built-red/40 w-8 shrink-0">{s.position}</span>
                <div className="flex-1">
                  <p className="font-display text-lg tracking-wider text-built-white mb-1">{s.title}</p>
                  <p className="text-sm text-built-white/80 mb-2">{s.body}</p>
                  <p className="font-condensed text-[10px] text-built-gray-text">Design: {s.design_brief}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {mode === "mockup" && (
          <div className="space-y-4">
            {slides.map((s) => (
              <SlidePreviewCard key={s.position} slide={s} totalSlides={slides.length} />
            ))}
          </div>
        )}

        {mode === "canva" && (
          <div className="relative">
            <button type="button"
              onClick={() => navigator.clipboard.writeText(canvaText)}
              className="absolute top-2 right-2 px-3 py-1 bg-built-gray-2 text-built-gray-text font-condensed text-[10px] hover:text-built-white transition-colors">
              Copy All
            </button>
            <pre className="bg-built-black border border-built-gray-2 p-4 text-sm text-built-white/80 whitespace-pre-wrap font-mono text-xs leading-relaxed">
              {canvaText}
            </pre>
          </div>
        )}
      </div>

      {/* Export buttons */}
      <div className="border-t border-built-gray-2 pt-4 space-y-2">
        {renderError && <p className="text-built-red font-condensed text-[10px]">{renderError}</p>}
        {pngUrls.length > 0 ? (
          <button type="button" onClick={handleDownloadZip}
            className="w-full px-4 py-3 bg-emerald-700 hover:bg-emerald-600 text-built-white font-condensed text-xs transition-colors">
            ↓ Descarcă ZIP ({pngUrls.length} PNG-uri)
          </button>
        ) : (
          <button type="button" onClick={handleGeneratePngs}
            disabled={isRendering || !caruselId}
            className="w-full px-4 py-3 bg-built-red hover:bg-built-red-dark text-built-white font-condensed text-xs disabled:opacity-50 transition-colors">
            {isRendering ? "Generează PNG-uri... (~30s)" : "Generează PNG-uri gata de Instagram →"}
          </button>
        )}
      </div>
    </div>
  );
}

function SlidePreviewCard({ slide, totalSlides }: { slide: CaruselSlide; totalSlides: number }) {
  const isCta = slide.position === totalSlides;
  const isHook = slide.position === 1;

  return (
    <div
      className="w-full rounded-sm overflow-hidden"
      style={{
        aspectRatio: "1080/1350",
        background: isCta ? "#C0392B" : "#0A0A0A",
        border: "1px solid #2a2a2a",
        padding: "7% 8%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}>
      <span style={{ fontFamily: "monospace", fontSize: "clamp(10px, 1.5vw, 14px)", color: isCta ? "#F5F5F5" : "#C0392B", letterSpacing: "0.2em" }}>BUILT</span>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: "5%" }}>
        <p style={{
          fontFamily: "Georgia, serif",
          fontSize: isHook ? "clamp(18px, 3.5vw, 32px)" : "clamp(14px, 2.8vw, 26px)",
          color: isCta ? "#F5F5F5" : (isHook ? "#C0392B" : "#F5F5F5"),
          lineHeight: 1.1,
          textTransform: "uppercase",
          fontWeight: "bold",
        }}>{slide.title}</p>
        <div style={{ width: "10%", height: "2px", background: isCta ? "#F5F5F5" : "#C0392B" }} />
        <p style={{ fontSize: "clamp(10px, 1.6vw, 14px)", color: isCta ? "rgba(245,245,245,0.9)" : "rgba(245,245,245,0.75)", lineHeight: 1.5 }}>{slide.body}</p>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: "clamp(8px, 1vw, 11px)", color: "rgba(245,245,245,0.3)" }}>
          {String(slide.position).padStart(2, "0")} / {String(totalSlides).padStart(2, "0")}
        </span>
        <span style={{ fontSize: "clamp(8px, 1vw, 11px)", color: "rgba(245,245,245,0.4)" }}>@iordacheclaudiu_</span>
      </div>
    </div>
  );
}
