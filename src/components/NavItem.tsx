"use client";

import Link from "next/link";

interface NavItemProps {
  href: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
}

export function NavItem({ href, label, icon, isActive }: NavItemProps) {
  return (
    <li className="relative group">
      <Link
        href={href}
        className={`flex items-center justify-center w-10 h-10 rounded-xl mx-auto transition-all ${
          isActive
            ? "bg-built-red/15 text-built-red"
            : "text-zinc-500 hover:text-zinc-100 hover:bg-white/5"
        }`}
        aria-label={label}
      >
        {icon}
      </Link>
      {/* Tooltip */}
      <div className="pointer-events-none absolute left-14 top-1/2 -translate-y-1/2 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <div className="bg-[#1A1A1A] border border-white/10 text-zinc-100 text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
          {label}
          {/* Arrow */}
          <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#1A1A1A]" />
        </div>
      </div>
    </li>
  );
}
