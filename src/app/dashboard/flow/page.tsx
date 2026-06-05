"use client";

// ─── BUILT — Conversion System Map ───────────────────────────────────────────
// Fluxul complet: Reel → DM → Apel → Client → Ambasador

export default function FlowPage() {
  return (
    <div className="min-h-screen bg-[#080808] p-10 font-sans">
      <div className="max-w-[1100px] mx-auto">

        {/* Header */}
        <div className="mb-12">
          <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#C0392B] mb-2">
            BUILT — SISTEM DE CONVERSIE
          </p>
          <h1 className="text-[32px] font-bold text-white tracking-tight mb-1">
            De la Vizualizare la Client Plătitor
          </h1>
          <p className="text-[13px] text-zinc-500">
            Flux complet · Reel → DM → Apel Diagnostic → Onboarding → Ambasador
          </p>
        </div>

        {/* Flow */}
        <div className="flex flex-col items-center gap-0">

          {/* ── STAGE 1: CONTENT ─────────────────────────────────────────────── */}
          <Stage
            number="01"
            label="CONTENT"
            color="#C0392B"
            title="Reel / TikTok"
            subtitle="Apare pe feed — primul contact"
            items={[
              { time: "0–3s",   text: "Hook contraintuitiv sau cifră + durere. Oprești scrollul sau clipul nu există." },
              { time: "3–20s",  text: "Validezi situația exactă. Explici mecanismul, nu bro-science." },
              { time: "20–50s", text: "Prezinți Sistemul BUILT legat de un pilon specific. Specificitate extremă." },
              { time: "50–55s", text: 'CTA keyword: "Dacă te regăsești, scrie-mi SISTEM în DM." — o singură acțiune.' },
            ]}
          />

          <Arrow label="Comentariu sau DM spontan" />

          {/* ── STAGE 2: DM INBOUND ──────────────────────────────────────────── */}
          <Stage
            number="02"
            label="DM INBOUND"
            color="#7C3AED"
            title="Calificarea în DM"
            subtitle="Nu vindem. Diagnosticăm. Nu convingem. Calificăm."
            items={[
              { time: "M1", text: '"Ce te-a făcut să comentezi chiar azi?" — forțezi verbalizarea durerii reale.' },
              { time: "M2", text: '"Unde ești acum, concret?" — identifici profilul: Saltu direct / Ciclist cronic / Atlet blocat.' },
              { time: "M3", text: '"Ce te-a oprit până acum? Nu mă refer la timp sau bani..." — dezarmezi mecanismul de apărare.' },
              { time: "M4", text: '"Dacă în 90 de zile ai fi exact omul pe care ți-l dorești — cum arată ziua ta?" — creezi tensiune emoțională pozitivă.' },
            ]}
          />

          {/* Fork */}
          <div className="flex flex-col items-center my-1">
            <div className="w-[2px] h-6 bg-zinc-700" />
            <div className="flex items-center gap-0">
              <div className="w-[160px] h-[2px] bg-zinc-700" />
              <DiamondShape label="CALIFICAT?" />
              <div className="w-[160px] h-[2px] bg-zinc-700" />
            </div>
            <div className="flex w-full justify-between px-[140px] mt-0">
              <div className="flex flex-col items-center">
                <div className="w-[2px] h-6 bg-red-700" />
                <span className="text-[10px] text-red-400 font-mono uppercase tracking-widest">NU → Stop</span>
                <div className="mt-1 bg-[#1a1a1a] border border-red-900/40 rounded-lg px-3 py-2 text-[11px] text-zinc-500 max-w-[160px] text-center">
                  Răspunsuri monosilabice, obiective nerealiste, lipsă totală de timp → nu continui
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-[2px] h-6 bg-emerald-700" />
                <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-widest">DA → Apel</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end w-full pr-[180px]">
            <div className="w-[2px] h-4 bg-zinc-700" />
          </div>

          {/* ── STAGE 3: TRANZIȚIE APEL ──────────────────────────────────────── */}
          <div className="flex justify-end w-full pr-[40px]">
            <div className="w-[560px]">
              <Stage
                number="03"
                label="TRANZIȚIE"
                color="#0891B2"
                title="Setarea Apelului"
                subtitle="Oferi diagnostic, nu pitch"
                items={[
                  { time: "→", text: '"Îți ofer 15 minute de diagnostic gratuit — nu o prezentare de vânzare. Vrei să înțeleg exact situația ta și să-ți spun dacă și cum te pot ajuta."' },
                  { time: "→", text: "Confirmi slot-ul. Follow-up o singură dată la 24–48h dacă nu răspunde. Dacă tace — nu mai contactezi." },
                ]}
              />
            </div>
          </div>

          <div className="flex justify-end w-full pr-[calc(40px+280px-1px)]">
            <Arrow label="Call confirmat" compact />
          </div>

          {/* ── STAGE 4: APEL DIAGNOSTIC ─────────────────────────────────────── */}
          <div className="flex justify-end w-full pr-[40px]">
            <div className="w-[560px]">
              <Stage
                number="04"
                label="APEL DIAGNOSTIC"
                color="#D97706"
                title="Apelul de 20–30 min"
                subtitle="Challenger Sale — conduci, nu cerșești"
                items={[
                  { time: "F1", text: "Setezi cadrul: «Acesta e un diagnostic, nu o prezentare de vânzare.»" },
                  { time: "F2", text: "Diagnostic superficial → adânc → costul invizibil al inacțiunii." },
                  { time: "F3", text: "Challenger Reframe: contrazici constructiv credința falsă (voință, timp, eșecuri anterioare)." },
                  { time: "F4", text: "Prezinți soluția: fiecare element BUILT legat de o durere verbalizată de client." },
                  { time: "F5", text: "Preț: 500 EUR, ferm, o dată, fără scuze. Obiecții → Validare → Adâncire → Returnare control." },
                ]}
              />
            </div>
          </div>

          {/* Fork 2 */}
          <div className="flex justify-end w-full pr-[40px]">
            <div className="w-[560px] flex flex-col items-center">
              <div className="w-[2px] h-6 bg-zinc-700" />
              <div className="flex items-center gap-0">
                <div className="w-[120px] h-[2px] bg-zinc-700" />
                <DiamondShape label="DECIZIE?" small />
                <div className="w-[120px] h-[2px] bg-zinc-700" />
              </div>
              <div className="flex w-full justify-between px-[100px] mt-1">
                <div className="flex flex-col items-center">
                  <div className="w-[2px] h-5 bg-amber-700" />
                  <span className="text-[10px] text-amber-400 font-mono uppercase tracking-widest">FOLLOW-UP</span>
                  <div className="mt-1 bg-[#1a1a1a] border border-amber-900/40 rounded-lg px-3 py-2 text-[11px] text-zinc-500 max-w-[140px] text-center">
                    Un singur follow-up la 24–48h. Dacă nu răspunde — close.
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <div className="w-[2px] h-5 bg-emerald-700" />
                  <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-widest">DA → Plată</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end w-full pr-[calc(40px+280px-1px)]">
            <Arrow label="500 EUR confirmați" compact />
          </div>

          {/* ── STAGE 5: ONBOARDING ──────────────────────────────────────────── */}
          <div className="flex justify-end w-full pr-[40px]">
            <div className="w-[560px]">
              <Stage
                number="05"
                label="ONBOARDING"
                color="#059669"
                title="Primele 7 Zile — Apple Style"
                subtitle="Unboxing experience. Prima victorie programată în 48h."
                items={[
                  { time: "Z1", text: "Mesaj de bun venit + acces platforma. Primul pas mic dar simbolic." },
                  { time: "Z2", text: "Prima victorie executată — o masă bună sau un antrenament de 20 min." },
                  { time: "Z3", text: "Integrare în grupa cohortei. Ritualizezi apartenența la trib." },
                  { time: "Z7", text: "Check-in complet. Recalibrezi planul pe realitatea săptămânii." },
                ]}
              />
            </div>
          </div>

          <div className="flex justify-end w-full pr-[calc(40px+280px-1px)]">
            <Arrow label="Program activ" compact />
          </div>

          {/* ── STAGE 6: 90 ZILE ─────────────────────────────────────────────── */}
          <div className="flex justify-end w-full pr-[40px]">
            <div className="w-[560px]">
              <Stage
                number="06"
                label="EXECUȚIE"
                color="#C0392B"
                title="90 Zile — Arhitectura Corpului"
                subtitle="5 piloni B.U.I.L.T. · Check-in săptămânal · Manager Succes Client"
                items={[
                  { time: "B", text: "Base Strength — forță compusă, progresie logaritmică." },
                  { time: "U", text: "Unbreakable Capacity — Zone 2, rezistență cardiovasculară." },
                  { time: "I", text: "Intelligent Fueling — nutriție ca sistem, 80/20, anti-binge." },
                  { time: "L", text: "Lifestyle Integration — integrat în viața reală cu job și familie." },
                  { time: "T", text: "Tough Mindset — identitate de om echilibrat, nu om la dietă." },
                ]}
              />
            </div>
          </div>

          <div className="flex justify-end w-full pr-[calc(40px+280px-1px)]">
            <Arrow label="Rezultate vizibile" compact />
          </div>

          {/* ── STAGE 7: AMBASADOR ───────────────────────────────────────────── */}
          <div className="flex justify-end w-full pr-[40px]">
            <div className="w-[560px]">
              <Stage
                number="07"
                label="AMBASADOR"
                color="#7C3AED"
                title="Flywheel de Creștere"
                subtitle="Clientul cu rezultate devine motorul organic"
                items={[
                  { time: "→", text: "Testimonial video sau text — dovadă socială stratificată în conținut." },
                  { time: "→", text: "Referral activ — trimite pe cineva din rețeaua lui. Comunitatea se hrănește singură." },
                  { time: "→", text: "Re-înscriere cohortă nouă sau program extins — LTV crește." },
                ]}
              />
            </div>
          </div>

          {/* Flywheel arrow back to top */}
          <div className="flex justify-end w-full pr-[40px] mt-2">
            <div className="w-[560px] flex justify-center">
              <div className="border border-dashed border-zinc-700 rounded-xl px-5 py-3 text-center">
                <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 mb-1">Flywheel</p>
                <p className="text-[12px] text-zinc-500">
                  Client → Rezultat vizibil → Povestit → Referral → Client nou → Comunitate mai mare
                </p>
                <p className="text-[10px] text-zinc-700 mt-1 font-mono">↑ Reia din Stage 01</p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-16 pt-6 border-t border-white/5 flex items-center justify-between">
          <p className="text-[10px] font-mono text-zinc-700 uppercase tracking-widest">
            BUILT — Arhitectura Corpului pe 90 de zile
          </p>
          <p className="text-[10px] font-mono text-zinc-700">
            Iordache Claudiu · 2026
          </p>
        </div>

      </div>
    </div>
  );
}

// ─── Components ───────────────────────────────────────────────────────────────

function Stage({
  number,
  label,
  color,
  title,
  subtitle,
  items,
}: {
  number: string;
  label: string;
  color: string;
  title: string;
  subtitle: string;
  items: { time: string; text: string }[];
}) {
  return (
    <div className="w-full rounded-2xl border border-white/[0.07] bg-[#0f0f0f] overflow-hidden">
      {/* Stage header */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-white/[0.06]">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0"
          style={{ backgroundColor: color + "22", border: `1px solid ${color}44`, color }}
        >
          {number}
        </div>
        <div>
          <p className="text-[9px] font-mono uppercase tracking-[0.25em] mb-0.5" style={{ color }}>
            {label}
          </p>
          <p className="text-[15px] font-semibold text-white leading-none">{title}</p>
        </div>
        <p className="ml-auto text-[11px] text-zinc-600 max-w-[260px] text-right leading-relaxed hidden md:block">
          {subtitle}
        </p>
      </div>

      {/* Items */}
      <div className="divide-y divide-white/[0.04]">
        {items.map((item, i) => (
          <div key={i} className="flex gap-4 px-6 py-3">
            <span
              className="text-[10px] font-mono font-bold shrink-0 w-6 pt-[2px]"
              style={{ color }}
            >
              {item.time}
            </span>
            <p className="text-[12px] text-zinc-400 leading-relaxed">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Arrow({ label, compact = false }: { label?: string; compact?: boolean }) {
  return (
    <div className={`flex flex-col items-center ${compact ? "my-0" : "my-1"}`}>
      <div className={`w-[2px] ${compact ? "h-4" : "h-6"} bg-zinc-700`} />
      {label && (
        <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest my-0.5">
          {label}
        </span>
      )}
      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
        <path d="M5 8L0 0h10L5 8z" fill="#3f3f3f" />
      </svg>
    </div>
  );
}

function DiamondShape({ label, small = false }: { label: string; small?: boolean }) {
  return (
    <div
      className={`flex items-center justify-center border border-zinc-600 bg-[#111] text-zinc-400 font-mono uppercase tracking-widest rotate-0 ${
        small ? "text-[9px] px-3 py-2" : "text-[10px] px-4 py-2.5"
      }`}
      style={{ clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)", width: small ? 110 : 130, height: small ? 50 : 60 }}
    >
      {label}
    </div>
  );
}
