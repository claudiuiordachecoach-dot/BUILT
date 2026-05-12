"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "./BrandLogo";
import { SignOutButton } from "./SignOutButton";
import { UserDisplay } from "./UserDisplay";

const NAV = [
  { label: "Dashboard", href: "/client/dashboard", icon: "◈" },
  { label: "Antrenamente", href: "/client/antrenamente", icon: "⚡" },
  { label: "Nutriție", href: "/client/nutritie", icon: "◉" },
  { label: "Check-in", href: "/client/checkin", icon: "✓" },
  { label: "Mesaje", href: "/client/mesaje", icon: "◎" },
];

export function ClientNav() {
  const pathname = usePathname();
  return (
    <aside className="w-56 shrink-0 bg-[#111111] border-r border-white/10 flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-white/10">
        <BrandLogo variant="full" showTagline={false} />
        <div className="mt-4"><UserDisplay /></div>
      </div>
      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        {NAV.map(item => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href}
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
  );
}
