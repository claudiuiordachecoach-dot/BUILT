import { redirect } from "next/navigation";
import { getSupabaseAuth, getUserRole } from "@/lib/supabase/auth-server";

export default async function RootPage() {
  const supabase = await getSupabaseAuth();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const role = await getUserRole().catch(() => null);
  if (role === "admin") redirect("/dashboard/azi");
  redirect("/client/dashboard");
}
