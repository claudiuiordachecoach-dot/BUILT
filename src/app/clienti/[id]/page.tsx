import { notFound } from "next/navigation";
import { getClient, getClientCheckins } from "../actions";
import { ClientDetail } from "./ClientDetail";

export const dynamic = "force-dynamic";

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);
  if (!numId) notFound();
  const [client, checkins] = await Promise.all([getClient(numId).catch(() => null), getClientCheckins(numId).catch(() => [])]);
  if (!client) notFound();
  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-2">
        <a href="/clienti" className="font-condensed text-[10px] text-built-gray-text hover:text-built-red">← Clienți</a>
        <span className="text-built-gray-text">/</span>
        <p className="font-condensed text-[10px] text-built-red uppercase">{client.name}</p>
      </div>
      <ClientDetail client={client} initialCheckins={checkins} />
    </div>
  );
}
