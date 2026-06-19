"use client";

import { useCallback, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";

async function getCroppedBlob(src: string, area: Area, maxOut = 1280): Promise<Blob> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.crossOrigin = "anonymous";
    i.onload = () => resolve(i);
    i.onerror = reject;
    i.src = src;
  });

  const scale = Math.min(1, maxOut / Math.max(area.width, area.height));
  const outW = Math.round(area.width * scale);
  const outH = Math.round(area.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, area.x, area.y, area.width, area.height, 0, 0, outW, outH);

  return new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.9)
  );
}

export default function CropModal({
  src,
  aspect,
  cropShape,
  onCancel,
  onDone,
}: {
  src: string;
  aspect: number;
  cropShape: "round" | "rect";
  onCancel: () => void;
  onDone: (blob: Blob) => void;
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [areaPixels, setAreaPixels] = useState<Area | null>(null);
  const [working, setWorking] = useState(false);

  const onCropComplete = useCallback((_a: Area, areaPx: Area) => setAreaPixels(areaPx), []);

  const handleDone = async () => {
    if (!areaPixels) return;
    setWorking(true);
    try {
      const blob = await getCroppedBlob(src, areaPixels);
      onDone(blob);
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col">
      <div className="relative flex-1 min-h-0">
        <Cropper
          image={src}
          crop={crop}
          zoom={zoom}
          aspect={aspect}
          cropShape={cropShape}
          showGrid={false}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          restrictPosition
        />
      </div>

      <div className="shrink-0 bg-[#0A0A0A] border-t border-white/10 p-4 pb-[env(safe-area-inset-bottom)] space-y-4">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <span className="text-xs text-zinc-500">Zoom</span>
          <input
            type="range"
            min={1}
            max={4}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 accent-built-red"
          />
        </div>
        <div className="flex gap-3 max-w-md mx-auto">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-lg border border-white/15 text-zinc-300 text-sm font-medium hover:bg-white/5"
          >
            Anulează
          </button>
          <button
            onClick={handleDone}
            disabled={working || !areaPixels}
            className="flex-1 py-3 rounded-lg bg-built-red text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
          >
            {working ? "Se procesează..." : "Salvează poza"}
          </button>
        </div>
      </div>
    </div>
  );
}
