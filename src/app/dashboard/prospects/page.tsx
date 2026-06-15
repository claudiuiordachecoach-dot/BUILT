import { listProspects } from "./actions";
import { ProspectsBoard } from "./ProspectsBoard";

export const dynamic = "force-dynamic";

export default async function ProspectsPage() {
  const prospects = await listProspects().catch(() => []);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-100 mb-1">Pipeline Prospecți</h1>
        <p className="text-zinc-500 text-sm">
          Veriga dintre DM și client. Actualizezi status + următorul pas după fiecare apel. Selectăm, nu cerșim.
        </p>
      </div>
      <ProspectsBoard initial={prospects} />
    </div>
  );
}
