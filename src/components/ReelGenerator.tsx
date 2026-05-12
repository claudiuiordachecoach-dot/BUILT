"use client";

import { useState, useTransition } from "react";
import {
  generateReel,
  type Pillar,
  type GenerateReelResult,
} from "@/app/reels/actions";

const PILLARS: { id: Pillar; label: string; subtitle: string }[] = [
  { id: "B", label: "Base Strength", subtitle: "Forță compusă" },
  { id: "U", label: "Unbreakable Capacity", subtitle: "Rezistență, Zone 2" },
  { id: "I", label: "Intelligent Fueling", subtitle: "Nutriție ca sistem" },
  { id: "L", label: "Lifestyle Integration", subtitle: "Job + familie + corp" },
  { id: "T", label: "Tough Mindset", subtitle: "Identitate + automatisme" },
  { id: "mix", label: "Mix", subtitle: "Mai mulți piloni" },
];

const ANGLE_PRESETS = [
  "Burta de stres la antreprenorul de 35 de ani",
  "De ce dietele restrictive te fac mai gras pe termen lung",
  "Paradoxul competenței: reușești la tot, mai puțin la corp",
  "Costul invizibil al inacțiunii: ce pierzi în 5 ani fără sistem",
  "De ce voința e cea mai proastă strategie pentru reconstrucție",
];

export function ReelGenerator() {
  const [pillar, setPillar] = useState<Pillar>("I");
  const [angle, setAngle] = useState("");
  const [result, setResult] = useState<GenerateReelResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function trigger() {
    if (angle.trim().length < 3) return;
    startTransition(async () => {
      const res = await generateReel(pillar, angle);
      setResult(res);
      if (res.ok) setAngle("");
    });
  }

  return (
    <div className="bg-built-gray-1 border border-built-gray-2 rounded-sm p-6">
      <div className="mb-5">
        <p className="font-condensed text-[10px] uppercase tracking-wider text-built-red mb-1">
          Generator
        </p>
        <h2 className="font-display text-2xl tracking-wider text-built-white">
          Construiește un Reel
        </h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="font-condensed text-[10px] uppercase tracking-wider text-built-gray-text mb-2 block">
            Pilon
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {PILLARS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPillar(p.id)}
                disabled={isPending}
                className={`text-left p-3 border rounded-sm transition-colors ${
                  pillar === p.id
                    ? "bg-built-red/15 border-built-red"
                    : "bg-built-black border-built-gray-2 hover:border-built-gray-text"
                }`}
              >
                <div className="font-display text-lg text-built-white">
                  {p.id} · {p.label}
                </div>
                <div className="text-[11px] text-built-gray-text mt-0.5">
                  {p.subtitle}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="font-condensed text-[10px] uppercase tracking-wider text-built-gray-text mb-2 block">
            Unghi / temă
          </label>
          <textarea
            value={angle}
            onChange={(e) => setAngle(e.target.value)}
            disabled={isPending}
            placeholder="Ex: De ce dietele restrictive cresc cortizolul și te fac să mănânci mai mult"
            rows={2}
            className="w-full bg-built-black border border-built-gray-2 text-built-white text-sm p-3 rounded-sm focus:outline-none focus:border-built-red leading-relaxed"
          />
          <div className="flex flex-wrap gap-1.5 mt-2">
            {ANGLE_PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() => setAngle(preset)}
                disabled={isPending}
                className="text-[11px] px-2 py-1 border border-built-gray-2 text-built-gray-text hover:text-built-white hover:border-built-gray-text rounded-sm transition-colors"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={trigger}
            disabled={isPending || angle.trim().length < 3}
            className="font-condensed text-xs uppercase tracking-wider px-5 py-2.5 bg-built-red text-built-white hover:bg-built-red-dark transition-colors rounded-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Generez 3 variante..." : "Generează 3 variante"}
          </button>
          {result && !result.ok && (
            <span className="text-xs text-built-red font-condensed">
              {result.error.slice(0, 100)}
            </span>
          )}
          {result && result.ok && !isPending && (
            <span className="text-xs text-green-400 font-condensed">
              ✓ Salvat ca draft #{result.reel.id}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
