"use client";
import { signOut } from "@/app/login/actions";

interface SignOutButtonProps {
  iconOnly?: boolean;
}

export function SignOutButton({ iconOnly = false }: SignOutButtonProps) {
  if (iconOnly) {
    return (
      <form action={signOut} className="w-full flex justify-center">
        <div className="relative group">
          <button
            type="submit"
            className="flex items-center justify-center w-10 h-10 rounded-xl text-zinc-600 hover:text-zinc-300 hover:bg-white/5 transition-all"
            aria-label="Sign out"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
          <div className="pointer-events-none absolute left-14 top-1/2 -translate-y-1/2 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <div className="bg-[#1A1A1A] border border-white/10 text-zinc-100 text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-xl">
              Sign out
              <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#1A1A1A]" />
            </div>
          </div>
        </div>
      </form>
    );
  }

  return (
    <form action={signOut} className="w-full">
      <button
        type="submit"
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] text-zinc-400 hover:bg-white/5 hover:text-zinc-200 transition-all w-full"
      >
        <span className="text-zinc-600">↪</span> Sign Out
      </button>
    </form>
  );
}
