import { getClientDashboard } from "../actions";
import ProgressGallery from "./ProgressGallery";

export const dynamic = "force-dynamic";

export default async function ClientProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const { clientId: clientIdStr } = await searchParams;
  const overrideId = clientIdStr ? Number(clientIdStr) : undefined;

  const data = await getClientDashboard(overrideId);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-zinc-500 text-sm">Nu s-a putut încărca profilul.</p>
      </div>
    );
  }

  const { client } = data;
  const clientId = overrideId || data.client?.id;

  return (
    <div className="p-8 max-w-4xl pb-24">
      <h1 className="text-3xl font-display tracking-wider text-white mb-8">
        Profilul Meu
      </h1>

      <div className="space-y-8">
        {/* Obiective */}
        <section>
          <h2 className="text-xl font-display tracking-wider text-built-white mb-4">Foaia de Parcurs (Obiective)</h2>
          <div className="bg-[#111111] border border-white/10 rounded-lg p-6">
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
              {client?.objectives || "Niciun obiectiv setat încă de către antrenor."}
            </p>
          </div>
        </section>

        {/* Galeria Foto */}
        <section>
          <h2 className="text-xl font-display tracking-wider text-built-white mb-4">Galeria de Progres (Foto)</h2>
          
          <ProgressGallery 
            clientId={clientId} 
            initialGallery={client?.progress_gallery || []} 
          />
        </section>
      </div>
    </div>
  );
}
