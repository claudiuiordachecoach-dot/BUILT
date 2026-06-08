import { notFound } from "next/navigation";
import { getClient, getClientCheckins, getIntake, getIntakeToken } from "../actions";
import { ClientDetail } from "./ClientDetail";
import { CopyIntakeLink } from "./CopyIntakeLink";
import { ALL_INTAKE_FIELDS } from "@/app/fisa-start/[token]/fields";

export const dynamic = "force-dynamic";

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);
  if (!numId) notFound();
  const [client, checkins, intake, intakeToken] = await Promise.all([
    getClient(numId).catch(() => null),
    getClientCheckins(numId).catch(() => []),
    getIntake(numId).catch(() => null),
    getIntakeToken(numId).catch(() => null),
  ]);
  if (!client) notFound();
  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-2">
        <a href="/clienti" className="font-condensed text-[10px] text-built-gray-text hover:text-built-red">← Clienți</a>
        <span className="text-built-gray-text">/</span>
        <p className="font-condensed text-[10px] text-built-red uppercase">{client.name}</p>
      </div>
      <ClientDetail client={client} initialCheckins={checkins} />

      {/* ---------- Fișa de Start (intake onboarding) ---------- */}
      <section className="mt-10 border-t border-white/10 pt-6">
        <div className="flex items-center justify-between mb-4 gap-4">
          <h2 className="font-display text-2xl tracking-wide text-built-white">Fișa de Start</h2>
          {intakeToken && <CopyIntakeLink token={intakeToken} />}
        </div>

        {intake ? (
          <div className="space-y-3">
            <p className="font-condensed text-[10px] uppercase tracking-wider text-built-gray-text">
              Completată {new Date(intake.submitted_at).toLocaleDateString("ro-RO")}
            </p>
            <div className="grid gap-3">
              {ALL_INTAKE_FIELDS.map((f) => {
                const val = intake.answers?.[f.key];
                if (!val) return null;
                return (
                  <div key={f.key} className="bg-[#111111] border border-white/10 rounded-lg p-4">
                    <p className="font-condensed text-[10px] uppercase tracking-wider text-built-red mb-1">{f.label}</p>
                    <p className="text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed">{val}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-sm text-zinc-500">
            Clientul nu a completat încă Fișa de Start. Copiază linkul și trimite-i-l pe WhatsApp.
          </p>
        )}
      </section>
    </div>
  );
}
