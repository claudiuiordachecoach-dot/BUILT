"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { SignOutButton } from "./SignOutButton";

/* ─── Icons ──────────────────────────────────────────────────────────────────*/
function Icon({ d, d2 }: { d: string; d2?: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />{d2 && <path d={d2} />}
    </svg>
  );
}

const Icons = {
  grid:     () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
  star:     () => <Icon d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>,
  calendar: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  message:  () => <Icon d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>,
  brain:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12 Q12 6 16 12 Q12 18 8 12"/><line x1="12" y1="3" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="21"/></svg>,
  arrow:    () => <Icon d="M22 2L11 13" d2="M22 2L15 22 11 13 2 9l20-7z"/>,
  chart:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  search:   () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  user:     () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
  users:    () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  book:     () => <Icon d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" d2="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>,
  settings: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  report:   () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  chevron:  () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>,
  sun:      () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>,
  collapse: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>,
};

type NavEntry = { label: string; href: string; icon: React.ReactNode; exact?: boolean };

const MAIN_ITEMS: NavEntry[] = [
  { label: "Dashboard",        href: "/dashboard/analytics", icon: <Icons.grid />,     exact: true },
  { label: "Content Studio",   href: "/dashboard/content",   icon: <Icons.star /> },
  { label: "Content Calendar", href: "/dashboard/calendar",  icon: <Icons.calendar /> },
  { label: "DM Sales",         href: "/dashboard/outreach",  icon: <Icons.message /> },
  { label: "Ask BUILT AI",     href: "/dashboard/ai",        icon: <Icons.brain /> },
];

const TOOLS_ITEMS: NavEntry[] = [
  { label: "Reel Analyser", href: "/dashboard/reel-copy",     icon: <Icons.chart /> },
  { label: "Profile Audit", href: "/dashboard/profile-audit", icon: <Icons.search /> },
  { label: "My Profile",    href: "/dashboard/onboarding",    icon: <Icons.user /> },
];

const ADMIN_ITEMS: NavEntry[] = [
  { label: "Clients",          href: "/dashboard/clients",            icon: <Icons.users /> },
  { label: "Progress Reports", href: "/dashboard/progress-reports",   icon: <Icons.report /> },
  { label: "Knowledge Base",   href: "/dashboard/knowledge-base",    icon: <Icons.book /> },
];

function NavLink({ item, pathname, collapsed }: { item: NavEntry; pathname: string; collapsed: boolean }) {
  const isActive = item.exact
    ? pathname === item.href
    : pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-all w-full ${
        isActive
          ? "text-white bg-white/10"
          : "text-zinc-500 hover:text-zinc-200 hover:bg-white/5"
      } ${collapsed ? "justify-center" : ""}`}
    >
      <span className={isActive ? "text-zinc-200" : ""}>{item.icon}</span>
      {!collapsed && <span>{item.label}</span>}
    </Link>
  );
}

function SectionLabel({ label, collapsed }: { label: string; collapsed: boolean }) {
  if (collapsed) return <div className="h-px bg-white/[0.06] mx-3 my-2" />;
  return (
    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 px-3 mb-1 mt-4">
      {label}
    </p>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [adminOpen, setAdminOpen] = useState(true);

  return (
    <aside
      className={`shrink-0 flex flex-col h-screen sticky top-0 bg-[#0a0a0a] border-r border-white/[0.06] transition-all duration-200 ${
        collapsed ? "w-[52px]" : "w-56"
      }`}
    >
      {/* Header */}
      <div className={`border-b border-white/[0.06] ${collapsed ? "p-3" : "p-4"}`}>
        <div className={`flex items-center ${collapsed ? "justify-center" : "gap-2"} mb-3`}>
          <div className="w-6 h-6 bg-built-red rounded flex items-center justify-center shrink-0">
            <span className="text-white text-[10px] font-bold">B</span>
          </div>
          {!collapsed && <span className="text-white font-semibold text-[13px]">BUILT AI</span>}
        </div>
        {!collapsed && (
          <div className="flex items-center gap-2 px-2 py-1.5 bg-white/5 rounded-lg">
            <div className="w-6 h-6 rounded-full bg-built-red/20 flex items-center justify-center shrink-0">
              <span className="text-built-red text-[10px] font-bold">C</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] text-zinc-200 font-medium truncate">Claudiu Iordache</p>
              <p className="text-[10px] text-zinc-500">Admin</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 overflow-y-auto overflow-x-hidden">
        {/* Main */}
        <ul className="space-y-0.5 px-2">
          {MAIN_ITEMS.map(item => (
            <li key={item.href + item.label}>
              <NavLink item={item} pathname={pathname} collapsed={collapsed} />
            </li>
          ))}
        </ul>

        {/* Tools */}
        <SectionLabel label="Tools" collapsed={collapsed} />
        <ul className="space-y-0.5 px-2">
          {TOOLS_ITEMS.map(item => (
            <li key={item.label}>
              <NavLink item={item} pathname={pathname} collapsed={collapsed} />
            </li>
          ))}
        </ul>

        {/* Admin — collapsible */}
        <div className="mt-3">
          {!collapsed ? (
            <button
              onClick={() => setAdminOpen(!adminOpen)}
              className="flex items-center justify-between w-full px-3 mb-1 group"
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 group-hover:text-zinc-400 transition-colors">
                Admin
              </p>
              <span className={`text-zinc-600 transition-transform ${adminOpen ? "" : "rotate-180"}`}>
                <Icons.chevron />
              </span>
            </button>
          ) : (
            <div className="h-px bg-white/[0.06] mx-3 my-2" />
          )}

          {(adminOpen || collapsed) && (
            <ul className="space-y-0.5 px-2">
              {ADMIN_ITEMS.map(item => (
                <li key={item.label}>
                  <NavLink item={item} pathname={pathname} collapsed={collapsed} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </nav>

      {/* Footer */}
      <div className={`border-t border-white/[0.06] py-2 space-y-1 ${collapsed ? "px-2" : "px-2"}`}>
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[12px] text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-all ${collapsed ? "justify-center" : ""}`}
          title={collapsed ? "Expand" : "Collapse"}
        >
          <span className={`transition-transform ${collapsed ? "rotate-180" : ""}`}><Icons.collapse /></span>
          {!collapsed && <span>Collapse</span>}
        </button>

        {/* Light mode (placeholder) */}
        <button
          className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[12px] text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-all ${collapsed ? "justify-center" : ""}`}
          title="Light mode"
        >
          <Icons.sun />
          {!collapsed && <span>Light mode</span>}
        </button>

        {/* Sign out */}
        <div className={collapsed ? "flex justify-center" : ""}>
          <SignOutButton collapsed={collapsed} />
        </div>
      </div>
    </aside>
  );
}
