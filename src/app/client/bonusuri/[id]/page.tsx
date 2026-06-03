"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getBonusById, BONUSURI } from "@/data/bonusuri";

export default function BonusDetailPage() {
  const { id } = useParams();
  const protocol = getBonusById(id as string);

  if (!protocol) {
    return (
      <div className="p-8 text-center">
        <p className="text-zinc-500 text-sm">Protocol negăsit.</p>
        <Link href="/client/bonusuri" className="text-built-red text-sm mt-2 inline-block">
          ← Înapoi la Bonusuri
        </Link>
      </div>
    );
  }

  const sameCat = BONUSURI.filter(b => b.category === protocol.category);
  const idx = sameCat.findIndex(b => b.id === id);
  const prev = idx > 0 ? sameCat[idx - 1] : null;
  const next = idx < sameCat.length - 1 ? sameCat[idx + 1] : null;

  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Top bar */}
      <div className="sticky top-0 z-10 h-12 bg-[#0A0A0A]/95 backdrop-blur border-b border-white/5 flex items-center px-6 gap-4">
        <Link
          href="/client/bonusuri"
          className="text-zinc-500 hover:text-white transition-colors text-sm flex items-center gap-1.5"
        >
          ← Bonusuri
        </Link>
        <div className="w-px h-4 bg-white/10" />
        <span className={`text-xs font-bold uppercase tracking-widest ${protocol.categoryColor}`}>
          {protocol.categoryLabel}
        </span>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="mb-10">
          <div className="text-5xl mb-4">{protocol.icon}</div>
          <h1 className="text-3xl font-bold text-white mb-2">{protocol.title}</h1>
          <p className="text-zinc-400 text-base">{protocol.subtitle}</p>
        </div>

        {/* Mecanism */}
        <section className="mb-8">
          <h2 className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest mb-3">
            De ce se întâmplă
          </h2>
          <p className="text-sm text-zinc-300 leading-relaxed">{protocol.mechanism}</p>
        </section>

        {/* Regula de Aur */}
        <section className="mb-8 bg-built-red/5 border border-built-red/20 rounded-xl p-5">
          <span className="text-[10px] font-bold text-built-red uppercase tracking-widest block mb-2">
            Regula de Aur
          </span>
          <p className="text-base font-bold text-white">&ldquo;{protocol.goldenRule}&rdquo;</p>
        </section>

        {/* Protocol */}
        <section className="mb-8">
          <h2 className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest mb-4">
            Protocolul
          </h2>
          <ol className="space-y-3">
            {protocol.protocol.map((step, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-built-red font-bold text-sm shrink-0 w-5 text-right">
                  {i + 1}.
                </span>
                <p className="text-sm text-zinc-300 leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Ce nu faci */}
        <section className="mb-8">
          <h2 className="text-[11px] font-bold text-zinc-600 uppercase tracking-widest mb-4">
            Ce nu faci
          </h2>
          <ul className="space-y-2">
            {protocol.forbidden.map((item, i) => (
              <li key={i} className="flex gap-3">
                <span className="text-red-500 shrink-0 mt-0.5">✕</span>
                <p className="text-sm text-zinc-400 leading-relaxed">{item}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Reîncadrarea BUILT */}
        <section className="mb-10 border-l-2 border-built-red pl-5">
          <h2 className="text-[11px] font-bold text-built-red uppercase tracking-widest mb-3">
            Reîncadrarea BUILT
          </h2>
          <p className="text-sm text-zinc-300 leading-relaxed italic">{protocol.reframe}</p>
        </section>

        {/* Nav prev/next */}
        <div className="flex items-center justify-between pt-6 border-t border-white/5">
          {prev ? (
            <Link
              href={`/client/bonusuri/${prev.id}`}
              className="flex items-center gap-2 text-xs text-zinc-500 hover:text-white transition-colors"
            >
              <span>←</span>
              <span className="hidden sm:block">{prev.title}</span>
            </Link>
          ) : (
            <div />
          )}
          <Link
            href="/client/bonusuri"
            className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
          >
            Toate protocoalele
          </Link>
          {next ? (
            <Link
              href={`/client/bonusuri/${next.id}`}
              className="flex items-center gap-2 text-xs text-zinc-500 hover:text-white transition-colors"
            >
              <span className="hidden sm:block">{next.title}</span>
              <span>→</span>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  );
}
