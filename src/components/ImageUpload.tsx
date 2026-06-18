"use client";

import { useRef, useState } from "react";

type Props = {
  folder: "avatars" | "progress" | "coach";
  onUploaded: (url: string) => void;
  /** URL curent (pentru preview inițial) */
  value?: string;
  /** Stil: avatar rotund sau dreptunghi (progres) */
  shape?: "circle" | "rect";
  label?: string;
};

/** Redimensionează imaginea client-side la max `max` px pe latura lungă (JPEG). */
async function downscale(file: File, max = 1280, quality = 0.85): Promise<Blob> {
  // HEIC/gif: lasă-le așa cum sunt (canvas nu le suportă bine)
  if (file.type === "image/heic" || file.type === "image/gif") return file;
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, w, h);
  return new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b || file), "image/jpeg", quality)
  );
}

export function ImageUpload({ folder, onUploaded, value, shape = "circle", label }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | undefined>(value);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file: File) => {
    setError("");
    setLoading(true);
    try {
      const blob = await downscale(file);
      const fd = new FormData();
      const ext = file.type === "image/heic" ? "heic" : file.type === "image/gif" ? "gif" : "jpg";
      fd.append("file", new File([blob], `upload.${ext}`, { type: blob.type || file.type }));
      fd.append("folder", folder);

      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Eroare la încărcare.");
      setPreview(json.url);
      onUploaded(json.url);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Eroare la încărcare.");
    } finally {
      setLoading(false);
    }
  };

  const rounded = shape === "circle" ? "rounded-full" : "rounded-lg";

  return (
    <div className="flex items-center gap-4">
      <div
        className={`relative ${shape === "circle" ? "w-20 h-20" : "w-24 h-32"} ${rounded} overflow-hidden bg-[#1a1a1a] border border-white/10 flex items-center justify-center shrink-0`}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="preview" className="w-full h-full object-cover" />
        ) : (
          <span className="text-zinc-600 text-2xl">📷</span>
        )}
        {loading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-[10px] text-white">Se urcă...</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
          className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-500 transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          {loading ? "Se urcă..." : label || "Alege poza"}
        </button>
        {error && <span className="text-red-400 text-xs">{error}</span>}
      </div>
    </div>
  );
}
