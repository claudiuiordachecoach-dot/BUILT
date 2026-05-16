import { notFound } from "next/navigation";
import Link from "next/link";
import { getClient, getClientCheckins } from "@/app/clienti/actions";
import { ClientDetail } from "@/app/clienti/[id]/ClientDetail";

export const dynamic = "force-dynamic";

export default async function DashboardClientPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (isNaN(id)) notFound();

  const [client, checkins] = await Promise.all([
    getClient(id),
    getClientCheckins(id),
  ]);

  if (!client) notFound();

  return (
    <div>
      <div className="px-6 pt-4">
        <Link href="/dashboard/clients" className="text-[12px] text-zinc-500 hover:text-zinc-300 transition-colors">
          ← Clienți
        </Link>
      </div>
      <ClientDetail client={client} initialCheckins={checkins} />
    </div>
  );
}
