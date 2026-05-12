import { listReels, type ReelRecord } from "@/app/reels/actions";
import { ReelGenerator } from "@/components/ReelGenerator";
import { ReelOutputCard } from "@/components/ReelOutputCard";

export const dynamic = "force-dynamic";

export default async function ReelsPage() {
  let reels: ReelRecord[] = [];
  let loadError: string | null = null;

  try {
    reels = await listReels();
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Eroare la citire reels.";
  }

  const draftCount = reels.filter((r) => r.status === "draft").length;
  const editedCount = reels.filter((r) => r.status === "edited").length;
  const postedCount = reels.filter((r) => r.status === "posted").length;

  return (
    <div className="p-10 max-w-6xl">
      <div className="mb-8">
        <p className="font-condensed text-xs text-built-red mb-2">
          M2 · Generator Reels
        </p>
        <h1 className="font-display text-5xl tracking-[0.06em] text-built-white mb-3">
          Reels în vocea ta
        </h1>
        <p className="text-built-gray-text max-w-3xl leading-relaxed">
          AI generează 3 variante pe pilon + unghi, în structura BUILT
          obligatorie: hook → problemă → sistem → CTA. Editezi orice variantă
          → diff-ul se salvează pentru re-antrenare M11.
        </p>
      </div>

      {loadError ? (
        <div className="mb-6 p-6 bg-built-red-dark/20 border border-built-red rounded-sm">
          <p className="font-condensed text-xs text-built-red mb-2">
            Eroare la citire reels
          </p>
          <p className="text-built-white text-sm">{loadError}</p>
        </div>
      ) : (
        <div className="mb-6 grid grid-cols-3 gap-4">
          <Stat label="Draft" value={draftCount} />
          <Stat label="Editate" value={editedCount} />
          <Stat label="Postate" value={postedCount} />
        </div>
      )}

      <div className="mb-8">
        <ReelGenerator />
      </div>

      <div className="mb-4">
        <h2 className="font-display text-2xl tracking-wider text-built-white mb-1">
          Istoric
        </h2>
        <p className="text-built-gray-text text-sm">
          {reels.length === 0
            ? "Niciun reel generat încă. Folosește generatorul de mai sus."
            : `${reels.length} reel${reels.length === 1 ? "" : "uri"} salvate`}
        </p>
      </div>

      <div className="space-y-3">
        {reels.map((reel) => (
          <ReelOutputCard key={reel.id} reel={reel} />
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="p-4 bg-built-gray-1 border border-built-gray-2 rounded-sm">
      <span className="font-condensed text-[10px] uppercase tracking-wider text-built-gray-text">
        {label}
      </span>
      <div className="font-display text-3xl text-built-red mt-1">{value}</div>
    </div>
  );
}
