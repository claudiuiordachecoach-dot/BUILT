import Link from "next/link";
import { redirect } from "next/navigation";
import { ClientNav } from "@/components/ClientNav";
import { getUserRole, getSupabaseAuth } from "@/lib/supabase/auth-server";
import { linkAuthToClient } from "./actions";

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  // Verifică sesiunea direct — nu depinde de middleware
  const supabase = await getSupabaseAuth();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const role = await getUserRole().catch(() => null);
  const isAdmin = role === "admin";

  // Leagă auth_user_id la clientul invitat (silențios, doar dacă e necesar)
  if (!isAdmin) await linkAuthToClient().catch(() => null);

  return (
    <div className="flex min-h-screen flex-col">
      {isAdmin && (
        <div className="bg-built-red/10 border-b border-built-red/30 px-6 py-2 flex items-center justify-between">
          <p className="text-[11px] font-condensed uppercase tracking-widest text-built-red">
            ◈ Admin Mode — Vizualizezi portalul ca și clientul
          </p>
          <Link
            href="/clienti"
            className="text-[11px] font-condensed uppercase tracking-widest text-built-red hover:text-built-white transition-colors"
          >
            ← Înapoi la Admin
          </Link>
        </div>
      )}
      <div className="flex flex-1 min-h-0">
        <ClientNav />
        <main className="flex-1 min-w-0 mobile-header-offset mobile-bottomnav-offset md:pt-0 md:pb-0">{children}</main>
      </div>
    </div>
  );
}
