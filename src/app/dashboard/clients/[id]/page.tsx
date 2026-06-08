import { notFound } from "next/navigation";
import Link from "next/link";
import { getClient, getClientCheckins, getIntake, getIntakeToken } from "@/app/clienti/actions";
import { ClientDetail } from "@/app/clienti/[id]/ClientDetail";
import { markClientMessagesRead } from "@/app/client/actions";

export const dynamic = "force-dynamic";

export default async function DashboardClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idStr } = await params;
  const id = Number(idStr);
  if (isNaN(id)) notFound();

  const [client, checkins, intake, intakeToken] = await Promise.all([
    getClient(id),
    getClientCheckins(id),
    getIntake(id).catch(() => null),
    getIntakeToken(id).catch(() => null),
    markClientMessagesRead(id),
  ]);

  if (!client) notFound();

  return (
    <div className="px-8 pt-4">
      <Link href="/dashboard/clients" className="text-[12px] text-zinc-500 hover:text-zinc-300 transition-colors block mb-4">
        ← Clienți
      </Link>
      <ClientDetail client={client} initialCheckins={checkins} intake={intake} intakeToken={intakeToken} />
    </div>
  );
}
