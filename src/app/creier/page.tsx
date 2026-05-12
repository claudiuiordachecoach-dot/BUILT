import { readCreierFromFile, readCreierFromSupabase } from "@/lib/creier";
import { CreierSectionCard } from "@/components/CreierSectionCard";
import { UpdateAIButton } from "@/components/UpdateAIButton";

export const dynamic = "force-dynamic";

export default async function CreierPage() {
  let creier;
  let loadError: string | null = null;
  let source: "supabase" | "file" = "supabase";

  try {
    creier = await readCreierFromSupabase();
  } catch (supabaseErr) {
    console.warn(
      "[creier] Supabase a eșuat, cad pe file:",
      supabaseErr instanceof Error ? supabaseErr.message : supabaseErr
    );
    try {
      creier = await readCreierFromFile();
      source = "file";
    } catch (fileErr) {
      loadError =
        fileErr instanceof Error
          ? fileErr.message
          : "Nu pot citi creierul nici din Supabase, nici din fișier.";
      creier = null;
    }
  }

  const completedCount =
    creier?.sections.filter((s) => s.status === "completed").length ?? 0;
  const totalCount = creier?.sections.length ?? 10;
  const progress = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="p-10 max-w-6xl">
      <div className="mb-8 flex items-start justify-between gap-6">
        <div className="flex-1">
          <p className="font-condensed text-xs text-built-red mb-2">
            M1 · Onboarding Hub
          </p>
          <h1 className="font-display text-5xl tracking-[0.06em] text-built-white mb-3">
            Creierul lui Claudiu
          </h1>
          <p className="text-built-gray-text max-w-3xl leading-relaxed">
            Sursa de adevăr pentru toate modulele AI BUILT. Fiecare secțiune
            alimentează generatoarele de conținut, scripturile DM și apelurile
            de diagnostic. Schimbă aici → toate modulele se calibrează.
          </p>
        </div>
        <UpdateAIButton />
      </div>

      {loadError ? (
        <div className="p-6 bg-built-red-dark/20 border border-built-red rounded-sm mb-8">
          <p className="font-condensed text-xs text-built-red mb-2">
            Eroare la citire
          </p>
          <p className="text-built-white text-sm">{loadError}</p>
          <p className="text-built-gray-text text-xs mt-2">
            Verifică că <code>CREIERUL_CLAUDIU/creierul-claudiu.json</code>{" "}
            există la rădăcina folderului BUILT Cowork.
          </p>
        </div>
      ) : creier ? (
        <>
          {/* Progress + metadata */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-built-gray-1 border border-built-gray-2 rounded-sm">
              <span className="font-condensed text-[10px] text-built-gray-text">
                Progres
              </span>
              <div className="font-display text-3xl text-built-red mt-1">
                {progress}%
              </div>
              <div className="text-xs text-built-gray-text mt-1">
                {completedCount} / {totalCount} secțiuni
              </div>
              <div className="mt-3 h-1 bg-built-black rounded-full overflow-hidden">
                <div
                  className="h-full bg-built-red transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="p-5 bg-built-gray-1 border border-built-gray-2 rounded-sm">
              <span className="font-condensed text-[10px] text-built-gray-text">
                Versiune
              </span>
              <div className="font-display text-3xl text-built-white mt-1">
                v{creier.metadata.version}
              </div>
              <div className="text-xs text-built-gray-text mt-1">
                {creier.metadata.created}
              </div>
            </div>

            <div className="p-5 bg-built-gray-1 border border-built-gray-2 rounded-sm">
              <span className="font-condensed text-[10px] text-built-gray-text">
                Status
              </span>
              <div className="font-display text-3xl text-built-white mt-1">
                {creier.metadata.session_status}
              </div>
              <div className="text-xs text-built-gray-text mt-1">
                Sursa: {source === "supabase" ? "Supabase (live)" : "fișier JSON local (fallback)"}
              </div>
            </div>
          </div>

          {/* Status edit */}
          <div className="mb-8 p-4 bg-built-gray-1 border-l-2 border-built-red rounded-sm">
            <p className="font-condensed text-xs text-built-red mb-1">
              {source === "supabase" ? "Editare activă" : "Mod doar-citire (fallback)"}
            </p>
            <p className="text-sm text-built-white/80">
              {source === "supabase"
                ? "Click pe orice secțiune → Editează → Salvează. Modulele AI văd update-ul instant prin prompt caching."
                : "Supabase nu răspunde. Citesc din fișier local, dar nu pot salva. Verifică .env.local și că schema DB e deployed."}
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-3">
            {creier.sections.map((section) => (
              <CreierSectionCard key={section.key} section={section} />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
