import { getClientDashboard } from "../actions";

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
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Start Photo */}
            <div className="aspect-[3/4] bg-[#111111] border border-white/10 rounded-lg flex flex-col items-center justify-center relative overflow-hidden group p-4 text-center">
              <p className="text-zinc-600 text-[10px] font-condensed uppercase tracking-wider mb-2">Lipește link URL poză</p>
              <input type="text" placeholder="https://..." className="w-full bg-black/50 border border-white/10 rounded text-[9px] p-2 text-zinc-300 focus:outline-none focus:border-built-red transition-colors" />
              <div className="absolute bottom-0 inset-x-0 bg-black/80 py-2 px-2 border-t border-white/10">
                <p className="text-[9px] font-condensed text-built-gray-text uppercase tracking-widest text-center">Poza Inițială (Ziua 1)</p>
              </div>
            </div>

            {/* Week 2 Photo */}
            <div className="aspect-[3/4] bg-[#111111] border border-white/10 rounded-lg flex flex-col items-center justify-center relative overflow-hidden group p-4 text-center">
              <p className="text-zinc-600 text-[10px] font-condensed uppercase tracking-wider mb-2">Lipește link URL poză</p>
              <input type="text" placeholder="https://..." className="w-full bg-black/50 border border-white/10 rounded text-[9px] p-2 text-zinc-300 focus:outline-none focus:border-built-red transition-colors" />
              <div className="absolute bottom-0 inset-x-0 bg-black/80 py-2 px-2 border-t border-white/10">
                <p className="text-[9px] font-condensed text-built-gray-text uppercase tracking-widest text-center">Săptămâna 2</p>
              </div>
            </div>

            {/* Week 4 Photo */}
            <div className="aspect-[3/4] bg-[#111111] border border-white/10 rounded-lg flex flex-col items-center justify-center relative overflow-hidden group p-4 text-center">
              <p className="text-zinc-600 text-[10px] font-condensed uppercase tracking-wider mb-2">Lipește link URL poză</p>
              <input type="text" placeholder="https://..." className="w-full bg-black/50 border border-white/10 rounded text-[9px] p-2 text-zinc-300 focus:outline-none focus:border-built-red transition-colors" />
              <div className="absolute bottom-0 inset-x-0 bg-black/80 py-2 px-2 border-t border-white/10">
                <p className="text-[9px] font-condensed text-built-gray-text uppercase tracking-widest text-center">Săptămâna 4</p>
              </div>
            </div>

            {/* Add more */}
            <div className="aspect-[3/4] bg-[#111111] border border-white/10 rounded-lg flex items-center justify-center border-dashed border-built-gray-2 hover:border-built-red/50 transition-colors cursor-pointer" title="Mai târziu vei putea salva galeria.">
              <p className="text-built-gray-text text-2xl font-light">+</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
