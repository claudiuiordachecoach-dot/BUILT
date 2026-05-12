"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "./BrandLogo";
import { SignOutButton } from "./SignOutButton";
import { UserDisplay } from "./UserDisplay";

type NavItem = {
  label: string;
  href: string;
  icon?: string;
};

type NavGroup = {
  group: string;
  items: NavItem[];
};

const NAV: NavGroup[] = [
  {
    group: "MAIN MENU",
    items: [
      { label: "Dashboard", href: "/dashboard/analytics", icon: "◈" },
      { label: "Content Studio", href: "/dashboard/content", icon: "✦" },
      { label: "Content Calendar", href: "/dashboard/calendar", icon: "⬦" },
      { label: "DM Sales", href: "/dm", icon: "◉" },
      { label: "Ask BUILT AI", href: "/knowledge", icon: "◎" },
    ],
  },
  {
    group: "TOOLS",
    items: [
      { label: "Reel Copy Tool", href: "/dashboard/reel-copy", icon: "◈" },
      { label: "Outreach", href: "/dashboard/outreach", icon: "⟡" },
      { label: "Reel Analyser", href: "/analizor", icon: "◈" },
      { label: "Profile Audit", href: "/dashboard/profile-audit", icon: "◈" },
      { label: "Competitors Intel", href: "/competitors", icon: "◈" },
      { label: "My Profile", href: "/dashboard/onboarding", icon: "◈" },
    ],
  },
  {
    group: "ADMIN",
    items: [
      { label: "Clients", href: "/clienti", icon: "◈" },
      { label: "Progress Reports", href: "/analytics", icon: "◈" },
      { label: "Knowledge Base", href: "/creier", icon: "◈" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 shrink-0 bg-[#111111] border-r border-white/10 flex flex-col h-screen sticky top-0">
      {/* Header — logo + profile */}
      <div className="p-5 border-b border-white/10">
        <BrandLogo variant="full" showTagline={false} />
        <div className="mt-4"><UserDisplay /></div>
      </div>

      {/* Navigation groups */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-4">
        {NAV.map((section) => (
          <div key={section.group}>
            <div className="px-5 mb-1">
              <span className="text-[10px] font-semibold tracking-widest text-zinc-600 uppercase">
                {section.group}
              </span>
            </div>
            <ul className="space-y-0.5 px-3">
              {section.items.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href ||
                      pathname.startsWith(item.href + "/");
                return (
                  <li key={item.href + item.label}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all ${
                        isActive
                          ? "bg-built-red/15 text-built-red font-medium"
                          : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/10 space-y-1">
        <SignOutButton />
        <div className="flex items-center gap-2 text-zinc-600 px-3">
          <span className="w-1.5 h-1.5 rounded-full bg-built-red" />
          <span className="text-[10px] font-mono">v0.2 · BUILT AI</span>
        </div>
      </div>
    </aside>
  );
}
