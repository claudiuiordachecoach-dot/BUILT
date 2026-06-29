import { getClientDashboard } from "../actions";
import ProgressGallery from "./ProgressGallery";
import ProfileAvatar from "./ProfileAvatar";
import WeightSummary from "./WeightSummary";
import WeightGoal from "./WeightGoal";
import BeforeAfter from "./BeforeAfter";
import { EnableNotificationsButton } from "../components/EnableNotificationsButton";

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
    <div className="p-5 md:p-8 max-w-4xl pb-24">
      <h1 className="text-3xl font-display tracking-wider text-white mb-8">
        Profilul Meu
      </h1>

      <div className="stagger space-y-8">
        {/* Avatar */}
        <section>
          <div className="bg-[#111111] border border-white/10 rounded-lg p-6">
            <ProfileAvatar
              clientId={clientId!}
              name={client?.name || "Membru BUILT"}
              initialUrl={client?.avatar_url}
            />
          </div>
        </section>

        {/* Greutate actuală + evoluție */}
        <section>
          <h2 className="text-xl font-display tracking-wider text-built-white mb-4">Greutate &amp; Evoluție</h2>
          <div className="space-y-4">
            <WeightSummary gallery={client?.progress_gallery || []} />
            <WeightGoal gallery={client?.progress_gallery || []} target={client?.target_weight_kg} />
          </div>
        </section>

        {/* Înainte / Acum */}
        <section>
          <h2 className="text-xl font-display tracking-wider text-built-white mb-4">Înainte / Acum</h2>
          <BeforeAfter gallery={client?.progress_gallery || []} />
        </section>

        {/* Notificări Push */}
        <section>
          <h2 className="text-xl font-display tracking-wider text-built-white mb-4">Notificări</h2>
          <div className="bg-[#111111] border border-white/10 rounded-lg p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-zinc-300">Remindere de check-in și mesaje de la antrenor, direct pe telefon.</p>
            </div>
            <EnableNotificationsButton clientId={clientId!} />
          </div>
        </section>

        {/* Obiective — secțiune internă a coach-ului (preț, note tactice, contact);
            NU se afișează clientului. Coach-ul o vede în /clienti/[id]. */}

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

