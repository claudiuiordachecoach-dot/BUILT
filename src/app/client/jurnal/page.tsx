import { getJournalEntries, getClientDashboard } from "../actions";
import JournalGallery from "./JournalGallery";

export const dynamic = "force-dynamic";

export default async function ClientJournalPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string }>;
}) {
  const { clientId: clientIdStr } = await searchParams;
  const overrideId = clientIdStr ? Number(clientIdStr) : undefined;

  const data = await getClientDashboard(overrideId);
  const entries = await getJournalEntries(overrideId);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-zinc-500 text-sm">Nu s-a putut încărca jurnalul.</p>
      </div>
    );
  }

  const clientId = overrideId || data.client?.id;

  return (
    <div className="p-5 md:p-8 max-w-4xl pb-24">
      <h1 className="font-display text-4xl tracking-wider text-white mb-2">Jurnal Zilnic</h1>
      <p className="font-condensed text-[11px] text-zinc-500 uppercase tracking-[0.2em] mb-8">
        Mese · Antrenamente · Pași
      </p>

      <section>
        <JournalGallery 
          clientId={clientId!} 
          initialEntries={entries} 
        />
      </section>
    </div>
  );
}
