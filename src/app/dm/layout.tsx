import { redirect } from "next/navigation";
import { getSupabaseAuth } from "@/lib/supabase/auth-server";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const supabase = await getSupabaseAuth();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return <>{children}</>;
}
