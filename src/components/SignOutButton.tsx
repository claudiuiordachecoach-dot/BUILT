"use client";
import { getSupabaseClient } from "@/lib/supabase/auth-client";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();
  async function handleSignOut() {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    router.push('/login');
  }
  return (
    <button
      onClick={handleSignOut}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] text-zinc-400 hover:bg-white/5 hover:text-zinc-200 transition-all w-full"
    >
      <span className="text-zinc-600">↪</span> Sign Out
    </button>
  );
}
