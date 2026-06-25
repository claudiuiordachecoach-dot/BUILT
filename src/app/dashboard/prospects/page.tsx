import { listProspects } from "./actions";
import { ProspectsBoard } from "./ProspectsBoard";

export const dynamic = "force-dynamic";

export default async function ProspectsPage() {
  const prospects = await listProspects().catch(() => []);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-2 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-100 mb-1">Pipeline Prospecți</h1>
          <p className="text-zinc-500 text-sm">
            Veriga dintre DM și client. Actualizezi status + următorul pas după fiecare apel. Selectăm, nu cerșim.
          </p>
        </div>
        <a href="/aplica" target="_blank" rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-2 text-[13px] font-medium text-zinc-200 border border-white/15 hover:border-built-red/50 hover:text-white bg-white/[0.03] px-3.5 py-2 rounded-lg transition-colors">
          Pagina de aplicare ↗
        </a>
      </div>
      <p className="text-[12px] text-zinc-600 mb-8">
        Linkul public de pus în bio: <span className="text-zinc-400">/aplica</span> — followerul completează, aterizează aici cu scor + pas următor.
      </p>
      <ProspectsBoard initial={prospects} />
    </div>
  );
}
