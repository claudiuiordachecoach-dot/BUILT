"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "./SignOutButton";

/* ─── SVG Icons (16×16, strokeWidth 1.8) ─── */
function IconGrid() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}
function IconStar() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
function IconCalendar() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
function IconMessage() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function IconBrain() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12 Q12 6 16 12 Q12 18 8 12" />
      <line x1="12" y1="3" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="21" />
    </svg>
  );
}
function IconArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
function IconBarChart() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}
function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}
function IconUser() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}
function IconUsers() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function IconBook() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}
function IconTarget() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
  );
}
/* ─── Nav item type ─── */
type NavEntry = { label: string; href: string; icon: React.ReactNode; exact?: boolean };

const MAIN_ITEMS: NavEntry[] = [
  { label: "Dashboard",        href: "/dashboard/analytics", icon: <IconGrid />,    exact: true },
  { label: "Content Studio",   href: "/dashboard/content",   icon: <IconStar /> },
  { label: "Content Calendar", href: "/dashboard/calendar",  icon: <IconCalendar /> },
  { label: "DM Sales",         href: "/dm",                  icon: <IconMessage /> },
  { label: "Ask BUILT AI",     href: "/dashboard/ai",        icon: <IconBrain /> },
];

const TOOLS_ITEMS: NavEntry[] = [
  { label: "Outreach",      href: "/dashboard/outreach",      icon: <IconArrow /> },
  { label: "Reel Analyser", href: "/dashboard/reel-copy",     icon: <IconBarChart /> },
  { label: "Profile Audit", href: "/dashboard/profile-audit", icon: <IconSearch /> },
  { label: "My Profile",    href: "/dashboard/onboarding",    icon: <IconUser /> },
];

const ADMIN_ITEMS: NavEntry[] = [
  { label: "Clients",        href: "/clienti",     icon: <IconUsers /> },
  { label: "Knowledge Base", href: "/creier",      icon: <IconBook /> },
  { label: "Competitors",    href: "/competitors", icon: <IconTarget /> },
];

function NavLink({ item, pathname }: { item: NavEntry; pathname: string }) {
  const isActive = item.exact
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <Link
      href={item.href}
      className={
        isActive
          ? "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-built-red bg-built-red/10 w-full text-left"
          : "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-all w-full text-left"
      }
    >
      {item.icon}
      <span>{item.label}</span>
    </Link>
  );
}

function Separator() {
  return <div className="mx-3 border-t border-white/10 my-2" />;
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 flex flex-col h-screen sticky top-0 bg-[#0a0a0a] border-r border-white/10">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 bg-built-red rounded flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">B</span>
          </div>
          <span className="text-white font-semibold text-[13px]">BUILT AI</span>
        </div>
        <div className="flex items-center gap-2 px-2 py-1.5 bg-white/5 rounded-lg">
          <div className="w-6 h-6 rounded-full bg-built-red/20 flex items-center justify-center">
            <span className="text-built-red text-[10px] font-bold">C</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] text-zinc-200 font-medium truncate">Claudiu Iordache</p>
            <p className="text-[10px] text-zinc-500">Admin</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto">
        <ul className="space-y-0.5 px-2">
          {MAIN_ITEMS.map((item) => (
            <li key={item.href}>
              <NavLink item={item} pathname={pathname} />
            </li>
          ))}
        </ul>

        <Separator />

        <ul className="space-y-0.5 px-2">
          {TOOLS_ITEMS.map((item) => (
            <li key={item.href}>
              <NavLink item={item} pathname={pathname} />
            </li>
          ))}
        </ul>

        <Separator />

        <ul className="space-y-0.5 px-2">
          {ADMIN_ITEMS.map((item) => (
            <li key={item.href}>
              <NavLink item={item} pathname={pathname} />
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer — Sign Out */}
      <div className="p-2 border-t border-white/10">
        <SignOutButton />
      </div>
    </aside>
  );
}
