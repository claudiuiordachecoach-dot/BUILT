"use client";
import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase/auth-client";

export function UserDisplay() {
  const [name, setName] = useState("...");
  const [role, setRole] = useState("...");
  const [initials, setInitials] = useState("?");

  useEffect(() => {
    const supabase = getSupabaseClient();
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
          .from('profiles')
          .select('full_name,role')
          .eq('id', user.id)
          .single();
        const n = data?.full_name ?? user.email ?? "User";
        setName(n);
        setRole(data?.role === 'admin' ? 'Admin' : 'Client');
        setInitials(n.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase());
      } catch {
        // Silently keep default state if profile fetch fails
      }
    })();
  }, []);

  return (
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-full bg-built-red flex items-center justify-center text-[10px] font-bold text-white shrink-0">
        {initials}
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-semibold text-zinc-200 truncate">{name}</div>
        <div className="text-[10px] text-zinc-500">{role}</div>
      </div>
    </div>
  );
}
