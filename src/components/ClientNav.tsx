"use client";
import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { BrandLogo } from "./BrandLogo";
import { SignOutButton } from "./SignOutButton";
import { UserDisplay } from "./UserDisplay";

/* ─── Iconițe line (stil consistent cu sidebar-ul admin) ───────────────────── */
function I({ children }: { children: React.ReactNode }) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}
const ICONS: Record<string, React.ReactNode> = {
  dashboard: <I><path d="M3 11l9-8 9 8" /><path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10" /></I>,
  profil: <I><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></I>,
  antrenamente: <I><path d="m6.5 6.5 11 11" /><path d="m21 21-1-1" /><path d="m3 3 1 1" /><path d="m18 22 4-4" /><path d="m2 6 4-4" /><path d="m3 10 7-7" /><path d="m14 21 7-7" /></I>,
  nutritie: <I><path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" /><path d="M10 2c1 .5 2 2 2 5" /></I>,
  module: <I><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></I>,
  checkin: <I><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></I>,
  bonusuri: <I><rect x="3" y="8" width="18" height="4" rx="1" /><path d="M12 8v13" /><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" /><path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8" /><path d="M16.5 8a2.5 2.5 0 0 0 0-5C13 3 12 8 12 8" /></I>,
  mesaje: <I><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></I>,
};

const NAV = [
  { label: "Acasă", href: "/client/dashboard", key: "dashboard" },
  { label: "Profilul Meu", href: "/client/profil", key: "profil" },
  { label: "Antrenamente", href: "/client/antrenamente", key: "antrenamente" },
  { label: "Nutriție", href: "/client/nutritie", key: "nutritie" },
  { label: "Academia", href: "/client/module", key: "module" },
  { label: "Check-in", href: "/client/checkin", key: "checkin" },
  { label: "Bonusuri", href: "/client/bonusuri", key: "bonusuri" },
  { label: "Mesaje", href: "/client/mesaje", key: "mesaje" },
];

function ClientNavContent() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const clientId = searchParams.get("clientId");
  const qs = clientId ? `?clientId=${clientId}` : "";
  // Buton back peste tot, mai puțin pe home (dashboard).
  const showBack = pathname !== "/client/dashboard";

  return (
    <>
      {/* DESKTOP — sidebar stânga */}
      <aside className="hidden md:flex w-56 shrink-0 bg-[#111111] border-r border-white/10 flex-col h-screen sticky top-0">
        <div className="p-5 border-b border-white/10">
          <BrandLogo variant="full" />
          <div className="mt-4"><UserDisplay /></div>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
          {NAV.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link key={item.href} href={`${item.href}${qs}`}
                className={`group relative flex items-center gap-3 pl-3 pr-3 py-2 rounded-lg text-[13px] press transition-all ${
                  isActive ? 'bg-built-red/15 text-built-red font-medium' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-100'
                }`}>
                {/* accent roșu pe item activ */}
                <span className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full bg-built-red transition-all ${
                  isActive ? 'h-5 opacity-100' : 'h-0 opacity-0'
                }`} />
                <span className={`text-[17px] leading-none transition-transform group-hover:scale-110 ${isActive ? 'text-built-red' : ''}`}>
                  {ICONS[item.key]}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/10">
          <SignOutButton />
        </div>
      </aside>

      {/* MOBILE — header fix sus cu logout */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#111111]/90 backdrop-blur-md border-b border-white/10 mobile-header">
        <div className="flex items-center justify-between px-4 h-12">
          {showBack ? (
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1 -ml-1 pr-2 py-1 rounded-lg text-zinc-100 hover:bg-white/5 press transition-all"
              aria-label="Înapoi"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              <span className="text-[13px] font-medium">Înapoi</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-built-red rounded flex items-center justify-center shrink-0">
                <span className="text-white text-[9px] font-bold">B</span>
              </div>
              <span className="text-zinc-100 font-semibold text-[13px]">BUILT</span>
            </div>
          )}
          <SignOutButton iconOnly />
        </div>
      </header>

      {/* MOBILE — bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#111111]/95 backdrop-blur-md border-t border-white/10 flex items-stretch justify-around px-0 pt-1 mobile-bottomnav">
        {NAV.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={`${item.href}${qs}`}
              className={`relative flex flex-col items-center gap-0.5 flex-1 pt-1.5 pb-1 press transition-colors min-w-0 ${
                isActive ? 'text-built-red' : 'text-zinc-500'
              }`}>
              {/* indicator roșu sus pe tab activ */}
              <span className={`absolute top-0 left-1/2 -translate-x-1/2 h-[2px] rounded-b-full bg-built-red transition-all ${
                isActive ? 'w-6 opacity-100' : 'w-0 opacity-0'
              }`} />
              <span className="text-[19px] leading-none">{ICONS[item.key]}</span>
              <span className={`text-[8.5px] font-semibold tracking-tight w-full text-center truncate px-0.5 ${
                isActive ? 'text-built-red' : 'text-zinc-500'
              }`}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

export function ClientNav() {
  return (
    <Suspense fallback={
      <aside className="hidden md:flex w-56 shrink-0 bg-[#111111] border-r border-white/10 flex-col h-screen sticky top-0" />
    }>
      <ClientNavContent />
    </Suspense>
  );
}
