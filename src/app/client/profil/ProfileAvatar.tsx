"use client";

import { useState } from "react";
import { ImageUpload } from "@/components/ImageUpload";
import { saveClientAvatar } from "../actions";

export default function ProfileAvatar({
  clientId,
  name,
  initialUrl,
}: {
  clientId: number;
  name: string;
  initialUrl?: string | null;
}) {
  const [url, setUrl] = useState<string | undefined>(initialUrl || undefined);

  const handleUploaded = async (newUrl: string) => {
    setUrl(newUrl);
    await saveClientAvatar(clientId, newUrl);
  };

  return (
    <div className="flex items-center gap-5">
      <ImageUpload
        folder="avatars"
        shape="circle"
        value={url}
        label={url ? "Schimbă poza" : "Adaugă poză"}
        onUploaded={handleUploaded}
      />
      <div>
        <p className="text-lg font-semibold text-white">{name}</p>
        <p className="text-xs text-zinc-500">Membru BUILT</p>
      </div>
    </div>
  );
}
