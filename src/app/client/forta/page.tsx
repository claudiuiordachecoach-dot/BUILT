import StrengthJournal from "./StrengthJournal";

export const dynamic = "force-dynamic";

export default function FortaPage() {
  return (
    <div className="p-5 md:p-8 max-w-4xl">
      <div className="mb-6">
        <p className="font-condensed text-[11px] text-built-red uppercase tracking-[0.25em] mb-1">Base Strength</p>
        <h1 className="font-display text-4xl tracking-wider text-built-white">Jurnal de Forță</h1>
        <p className="text-zinc-500 mt-1">Notează ce ridici. Sistemul îți arată cum crești — săptămână de săptămână.</p>
      </div>
      <StrengthJournal />
    </div>
  );
}
