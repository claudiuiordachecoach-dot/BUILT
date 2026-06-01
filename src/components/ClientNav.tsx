"use client";
import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { BrandLogo } from "./BrandLogo";
import { SignOutButton } from "./SignOutButton";
import { UserDisplay } from "./UserDisplay";

const NAV = [
  { label: "Dashboard", href: "/client/dashboard", icon: "◈" },
  { label: "Antrenamente", href: "/client/antrenamente", icon: "⚡" },
  { label: "Nutriție", href: "/client/nutritie", icon: "◉" },
  { label: "Academia", href: "/client/module", icon: "📚" },
  { label: "Check-in", href: "/client/checkin", icon: "✓" },
  { label: "Mesaje", href: "/client/mesaje", icon: "◎" },
];

function ClientNavContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const clientId = searchParams.get("clientId");
  const qs = clientId ? `?clientId=${clientId}` : "";

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
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all ${
                  isActive ? 'bg-built-red/15 text-built-red font-medium' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                }`}>
                <span className="text-[10px]">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/10">
          <SignOutButton />
        </div>
      </aside>

      {/* MOBILE — bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#111111] border-t border-white/10 flex items-center justify-around px-1 py-2 safe-area-inset-bottom">
        {NAV.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={`${item.href}${qs}`}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-all min-w-0 ${
                isActive ? 'text-built-red' : 'text-zinc-500'
              }`}>
              <span className="text-lg leading-none">{item.icon}</span>
              <span className={`text-[9px] font-semibold tracking-wide truncate ${
                isActive ? 'text-built-red' : 'text-zinc-600'
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
