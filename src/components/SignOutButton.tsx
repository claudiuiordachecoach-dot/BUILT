"use client";
import { signOut } from "@/app/login/actions";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] text-zinc-400 hover:bg-white/5 hover:text-zinc-200 transition-all w-full"
      >
        <span className="text-zinc-600">↪</span> Sign Out
      </button>
    </form>
  );
}
