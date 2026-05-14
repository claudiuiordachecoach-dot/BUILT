"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { BrandLogo } from "./BrandLogo";
import { NavItem } from "./NavItem";
import { SignOutButton } from "./SignOutButton";

/* ─── SVG Icon Components ─── */
function IconGrid() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}
function IconStar() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
function IconCalendar() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
function IconMessage() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function IconBrain() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a5 5 0 0 1 5 5v1h1a3 3 0 0 1 0 6h-1v1a5 5 0 0 1-10 0v-1H6a3 3 0 0 1 0-6h1V7a5 5 0 0 1 5-5z" />
    </svg>
  );
}
function IconFilm() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="2.18" /><line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" /><line x1="2" y1="12" x2="22" y2="12" /><line x1="2" y1="7" x2="7" y2="7" /><line x1="2" y1="17" x2="7" y2="17" /><line x1="17" y1="17" x2="22" y2="17" /><line x1="17" y1="7" x2="22" y2="7" />
    </svg>
  );
}
function IconArrow() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
function IconBarChart() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}
function IconSearch() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function IconTarget() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
  );
}
function IconUser() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function IconEye() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function IconBook() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

/* ─── Navigation structure ─── */
type NavEntry = { label: string; href: string; icon: React.ReactNode };
type NavGroup = { group: string; items: NavEntry[] };

const NAV: NavGroup[] = [
  {
    group: "MAIN",
    items: [
      { label: "Dashboard", href: "/dashboard/analytics", icon: <IconGrid /> },
      { label: "Content Studio", href: "/dashboard/content", icon: <IconStar /> },
      { label: "Calendar", href: "/dashboard/calendar", icon: <IconCalendar /> },
      { label: "DM Sales", href: "/dm", icon: <IconMessage /> },
      { label: "Ask BUILT AI", href: "/knowledge", icon: <IconBrain /> },
    ],
  },
  {
    group: "TOOLS",
    items: [
      { label: "Reel Copy Tool", href: "/dashboard/reel-copy", icon: <IconFilm /> },
      { label: "Outreach", href: "/dashboard/outreach", icon: <IconArrow /> },
      { label: "Reel Analyser", href: "/analizor", icon: <IconBarChart /> },
      { label: "Profile Audit", href: "/dashboard/profile-audit", icon: <IconSearch /> },
      { label: "Competitors Intel", href: "/competitors", icon: <IconTarget /> },
      { label: "My Profile", href: "/dashboard/onboarding", icon: <IconUser /> },
    ],
  },
  {
    group: "ADMIN",
    items: [
      { label: "Clients", href: "/clienti", icon: <IconUsers /> },
      { label: "View as Client", href: "/client/dashboard", icon: <IconEye /> },
      { label: "Progress Reports", href: "/analytics", icon: <IconBarChart /> },
      { label: "Knowledge Base", href: "/creier", icon: <IconBook /> },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [lightMode, setLightMode] = useState(false);

  return (
    <aside className={`${collapsed ? "w-12" : "w-16"} shrink-0 flex flex-col h-screen sticky top-0 items-center transition-all duration-200`}>
      {/* Logo — doar icon, fără wordmark */}
      <div className="h-16 flex items-center justify-center w-full">
        <BrandLogo variant="icon" />
      </div>

      {/* Nav groups — overflow-x visible pt tooltips */}
      <nav className="flex-1 py-4 w-full overflow-x-visible">
        {NAV.map((section, sectionIdx) => (
          <div key={section.group} className={sectionIdx > 0 ? "mt-3" : ""}>
            <ul className="space-y-0.5 px-3">
              {section.items.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <NavItem
                    key={item.href + item.label}
                    href={item.href}
                    label={item.label}
                    icon={item.icon}
                    isActive={isActive}
                  />
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="pb-4 pt-3 w-full flex flex-col items-center gap-1">
        {/* Collapse toggle */}
        <div className="relative group">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center w-10 h-10 rounded-xl text-zinc-600 hover:text-zinc-300 hover:bg-white/5 transition-all"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              {collapsed ? (
                <polyline points="13 17 18 12 13 7" />
              ) : (
                <polyline points="11 17 6 12 11 7" />
              )}
            </svg>
          </button>
          <div className="pointer-events-none absolute left-14 top-1/2 -translate-y-1/2 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <div className="bg-[#1A1A1A] border border-white/10 text-zinc-100 text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
              {collapsed ? "Expand" : "Collapse"}
              <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#1A1A1A]" />
            </div>
          </div>
        </div>
        {/* Light mode toggle */}
        <div className="relative group">
          <button
            onClick={() => setLightMode(!lightMode)}
            className="flex items-center justify-center w-10 h-10 rounded-xl text-zinc-600 hover:text-zinc-300 hover:bg-white/5 transition-all"
            aria-label={lightMode ? "Dark mode" : "Light mode"}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          </button>
          <div className="pointer-events-none absolute left-14 top-1/2 -translate-y-1/2 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <div className="bg-[#1A1A1A] border border-white/10 text-zinc-100 text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
              {lightMode ? "Dark mode" : "Light mode"}
              <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#1A1A1A]" />
            </div>
          </div>
        </div>
        <SignOutButton iconOnly />
        <span className="w-1.5 h-1.5 rounded-full bg-built-red mt-1" title="v0.3 · BUILT AI" />
      </div>
    </aside>
  );
}
