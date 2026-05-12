"use client";

import { useState, useEffect } from "react";
import { StoryGenerator } from "@/components/StoryGenerator";
import { StoryPackCard } from "@/components/StoryPackCard";
import { listStories, type StoryRecord } from "@/app/stories/actions";

export default function StoriesPage() {
  const [stories, setStories] = useState<StoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listStories().then((s) => { setStories(s); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  function handleGenerated(s: StoryRecord) {
    setStories((prev) => [s, ...prev]);
  }

  const draft = stories.filter((s) => s.status === "draft").length;
  const posted = stories.filter((s) => s.status === "posted").length;

  return (
    <div className="p-8 max-w-5xl">
      <p className="font-condensed text-xs text-built-red uppercase tracking-wider mb-1">M3 · Generator Stories</p>
      <h1 className="font-display text-5xl tracking-[0.06em] text-built-white mb-2">STORIES ÎN VOCEA TA</h1>
      <p className="text-built-gray-text mb-8">
        AI generează 5 stories per pack (1 din fiecare tip: întrebare, BTS, mini-lecție, recap, vulnerabilitate).
      </p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[["Total pack-uri", stories.length], ["Draft", draft], ["Postate", posted]].map(([label, val]) => (
          <div key={label} className="p-4 bg-built-gray-1 border border-built-gray-2 rounded-sm">
            <p className="font-condensed text-[10px] text-built-gray-text uppercase">{label}</p>
            <p className="font-display text-3xl text-built-red mt-1">{val}</p>
          </div>
        ))}
      </div>

      <div className="mb-8"><StoryGenerator onGenerated={handleGenerated} /></div>

      <div>
        <h3 className="font-condensed text-[11px] text-built-gray-text uppercase tracking-wider mb-3">
          Istoric ({stories.length} pack-uri)
        </h3>
        {loading ? (
          <p className="text-built-gray-text text-sm">Se încarcă...</p>
        ) : stories.length === 0 ? (
          <p className="text-built-gray-text text-sm">Niciun story generat încă. Folosește generatorul de mai sus.</p>
        ) : (
          <div className="space-y-3">
            {stories.map((s) => <StoryPackCard key={s.id} story={s} />)}
          </div>
        )}
      </div>
    </div>
  );
}
