"use client";

import { useState, useTransition } from "react";
import { generateStory, type StoryRecord } from "@/app/stories/actions";
import type { Pillar } from "@/app/reels/actions";

const PILLARS: { id: Pillar; label: string }[] = [
  { id: "B", label: "B · Forță" },
  { id: "U", label: "U · Cardio" },
  { id: "I", label: "I · Nutriție" },
  { id: "L", label: "L · Lifestyle" },
  { id: "T", label: "T · Mindset" },
  { id: "mix", label: "Mix" },
];

const THEMES = [
  "Rutina de dimineață fără motivație",
  "De ce ai nevoie de sistem, nu de voință",
  "Cortizolul și burta de stres",
  "Ce faci când nu ai timp de sală",
  "Nutriție fără obsesie",
];

interface Props { onGenerated: (s: StoryRecord) => void; }

export function StoryGenerator({ onGenerated }: Props) {
  const [pillar, setPillar] = useState<Pillar>("mix");
  const [theme, setTheme] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleGenerate() {
    const t = theme.trim() || "Sistemul bate voința";
    setError(null);
    startTransition(async () => {
      const result = await generateStory(pillar, t);
      if (result.ok) { onGenerated(result.story); setTheme(""); }
      else setError(result.error);
    });
  }

  return (
    <div className="p-6 bg-built-gray-1 border border-built-gray-2 rounded-sm">
      <p className="font-condensed text-[10px] text-built-red uppercase tracking-wider mb-4">Generator</p>
      <h2 className="font-display text-2xl tracking-wider mb-6">Construiește un Pack de 5 Stories</h2>

      <div className="mb-5">
        <p className="font-condensed text-[10px] text-built-gray-text uppercase mb-2">Pilon</p>
        <div className="flex flex-wrap gap-2">
          {PILLARS.map((p) => (
            <button key={p.id} type="button" onClick={() => setPillar(p.id)}
              className={`px-3 py-1.5 border font-condensed text-xs transition-colors ${pillar === p.id ? "bg-built-red border-built-red text-built-white" : "border-built-gray-2 text-built-gray-text hover:border-built-red hover:text-built-white"}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <p className="font-condensed text-[10px] text-built-gray-text uppercase mb-2">Temă / unghi</p>
        <div className="flex flex-wrap gap-2 mb-2">
          {THEMES.map((t) => (
            <button key={t} type="button" onClick={() => setTheme(t)}
              className="px-2 py-1 border border-built-gray-2 text-built-gray-text font-condensed text-[10px] hover:border-built-red hover:text-built-white transition-colors">
              {t}
            </button>
          ))}
        </div>
        <textarea value={theme} onChange={(e) => setTheme(e.target.value)} rows={2}
          placeholder="Sau scrie tema ta..."
          className="w-full bg-built-black border border-built-gray-2 text-built-white text-sm p-3 resize-none focus:outline-none focus:border-built-red" />
      </div>

      {error && <p className="text-built-red font-condensed text-xs mb-3">{error}</p>}

      <button type="button" onClick={handleGenerate} disabled={isPending}
        className="px-6 py-3 bg-built-red hover:bg-built-red-dark text-built-white font-condensed text-xs disabled:opacity-50 transition-colors">
        {isPending ? "Generează... (~20s)" : "Generează 5 Stories →"}
      </button>
    </div>
  );
}
