"use client";
import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { BrandLogo, BuiltPillars, BuiltWordmark } from "./BrandLogo";
import { SignOutButton } from "./SignOutButton";
import { UserDisplay } from "./UserDisplay";
import { NAV_ICONS as ICONS } from "./nav-icons";

// Bara de jos (mobil): doar cele 5 esențiale. Restul (Profil/Academia/Bonusuri)
// sunt accesibile din header (Profil) și din cardurile de pe Acasă.
const BOTTOM_KEYS = ["dashboard", "antrenamente", "nutritie", "checkin", "mesaje"];

const NAV = [
  { label: "Acasă", short: "Acasă", href: "/client/dashboard", key: "dashboard" },
  { label: "Profilul Meu", short: "Profil", href: "/client/profil", key: "profil" },
  { label: "Antrenamente", short: "Antren.", href: "/client/antrenamente", key: "antrenamente" },
  { label: "Nutriție", short: "Nutriție", href: "/client/nutritie", key: "nutritie" },
  { label: "Academia", short: "Academia", href: "/client/module", key: "module" },
  { label: "Check-in", short: "Check-in", href: "/client/checkin", key: "checkin" },
  { label: "Bonusuri", short: "Bonus", href: "/client/bonusuri", key: "bonusuri" },
  { label: "Mesaje", short: "Mesaje", href: "/client/mesaje", key: "mesaje" },
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
              <BuiltPillars size={16} />
              <BuiltWordmark className="text-lg text-zinc-100" />
            </div>
          )}
          <div className="flex items-center gap-1">
            <Link
              href={`/client/profil${qs}`}
              aria-label="Profilul meu"
              className="p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-white/5 press transition-colors"
            >
              <span className="text-[18px] leading-none block">{ICONS.profil}</span>
            </Link>
            <SignOutButton iconOnly />
          </div>
        </div>
      </header>

      {/* MOBILE — bottom nav: 5 esențiale */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#111111]/95 backdrop-blur-md border-t border-white/10 flex items-stretch px-1 pt-1 mobile-bottomnav">
        {NAV.filter(item => BOTTOM_KEYS.includes(item.key)).map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={`${item.href}${qs}`}
              className={`relative flex flex-col items-center justify-center gap-1 flex-1 min-w-0 pt-2 pb-1 press transition-colors ${
                isActive ? 'text-built-red' : 'text-zinc-500'
              }`}>
              {/* indicator roșu sus pe tab activ */}
              <span className={`absolute top-0 left-1/2 -translate-x-1/2 h-[2px] rounded-b-full bg-built-red transition-all ${
                isActive ? 'w-6 opacity-100' : 'w-0 opacity-0'
              }`} />
              <span className="text-[21px] leading-none">{ICONS[item.key]}</span>
              <span className={`text-[10px] font-semibold leading-none whitespace-nowrap ${
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
