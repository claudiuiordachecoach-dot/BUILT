"use client";

import { useEffect, useState } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { getCoachAvatar, saveCoachAvatar } from "@/app/client/actions";

export function CoachProfileCard() {
  const [url, setUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    getCoachAvatar().then((u) => setUrl(u || undefined));
  }, []);

  const handleUploaded = async (newUrl: string) => {
    setUrl(newUrl);
    await saveCoachAvatar(newUrl);
  };

  return (
    <div className="mb-8 p-5 bg-built-gray-1 border border-built-gray-2 rounded-sm">
      <p className="font-condensed text-[10px] text-built-red uppercase tracking-wider mb-3">Profil Coach</p>
      <ImageUpload
        folder="coach"
        shape="circle"
        value={url}
        label={url ? "Schimbă poza" : "Adaugă poza ta"}
        onUploaded={handleUploaded}
      />
      <p className="text-[11px] text-built-gray-text mt-3">
        Poza apare în chat-ul fiecărui client (antetul conversației).
      </p>
    </div>
  );
}
