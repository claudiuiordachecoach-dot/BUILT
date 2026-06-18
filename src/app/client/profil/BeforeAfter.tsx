"use client";

type Entry = { label: string; weight_kg: number; photo_url: string; date: string };

function Card({ entry, tag }: { entry: Entry; tag: string }) {
  return (
    <div className="flex-1">
      <div className="aspect-[3/4] rounded-lg overflow-hidden bg-[#111111] border border-white/10 relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={entry.photo_url} alt={tag} className="w-full h-full object-cover" />
        <div className="absolute top-2 left-2 bg-black/70 px-2 py-0.5 rounded text-[10px] font-condensed uppercase tracking-widest text-white">
          {tag}
        </div>
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent pt-6 pb-2 px-2">
          <p className="text-center text-sm font-bold text-white">{entry.weight_kg} kg</p>
          <p className="text-center text-[10px] text-zinc-400">{entry.label}</p>
        </div>
      </div>
    </div>
  );
}

export default function BeforeAfter({ gallery }: { gallery: Entry[] }) {
  const points = (gallery || [])
    .filter((e) => e.photo_url)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (points.length < 2) {
    return (
      <div className="bg-[#111111] border border-white/10 rounded-lg p-6">
        <p className="text-sm text-zinc-500">
          Adaugă cel puțin 2 poze în Galeria de Progres ca să vezi comparația înainte / acum.
        </p>
      </div>
    );
  }

  const first = points[0];
  const last = points[points.length - 1];

  return (
    <div className="flex gap-4 items-stretch">
      <Card entry={first} tag="Înainte" />
      <Card entry={last} tag="Acum" />
    </div>
  );
}
