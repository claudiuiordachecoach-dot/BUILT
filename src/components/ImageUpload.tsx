"use client";

import { useRef, useState } from "react";
import CropModal from "./CropModal";

type Props = {
  folder: "avatars" | "progress" | "coach" | "journal";
  onUploaded: (url: string) => void;
  /** URL curent (pentru preview inițial) */
  value?: string;
  /** Stil: avatar rotund sau dreptunghi (progres) */
  shape?: "circle" | "rect";
  label?: string;
};

export function ImageUpload({ folder, onUploaded, value, shape = "circle", label }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | undefined>(value);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  const aspect = shape === "circle" ? 1 : 3 / 4;
  const cropShape = shape === "circle" ? "round" : "rect";

  const onPick = (file: File) => {
    setError("");
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result as string);
    reader.readAsDataURL(file);
  };

  const uploadBlob = async (blob: Blob) => {
    setCropSrc(null);
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", new File([blob], "upload.jpg", { type: "image/jpeg" }));
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
    <>
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

        <div className="flex flex-col gap-1 min-w-0">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onPick(f);
              e.target.value = ""; // permite reselectarea aceluiași fișier
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
          {error && <span className="text-red-400 text-xs break-words">{error}</span>}
        </div>
      </div>

      {cropSrc && (
        <CropModal
          src={cropSrc}
          aspect={aspect}
          cropShape={cropShape}
          onCancel={() => setCropSrc(null)}
          onDone={uploadBlob}
        />
      )}
    </>
  );
}
