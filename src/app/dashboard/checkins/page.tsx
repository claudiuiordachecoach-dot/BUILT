import { listPendingCheckins } from "@/app/clienti/actions";
import { CheckinQueue } from "./CheckinQueue";

export const dynamic = "force-dynamic";

export default async function CheckinsPage() {
  const pending = await listPendingCheckins().catch(() => []);

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <p className="font-condensed text-[11px] text-built-red uppercase tracking-[0.25em] mb-1">Retenție</p>
        <h1 className="text-2xl font-semibold text-zinc-100 mb-1">Check-in-uri de răspuns</h1>
        <p className="text-zinc-500 text-sm">
          Fiecare client care a trimis un check-in așteaptă un răspuns. Generează draftul în vocea ta, ajustează-l, trimite — clientul primește notificare pe loc.
        </p>
      </div>
      <CheckinQueue initial={pending} />
    </div>
  );
}
