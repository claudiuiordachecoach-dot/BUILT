"use server";
import { redirect } from "next/navigation";
import { getSupabaseAuth } from "@/lib/supabase/auth-server";

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await getSupabaseAuth();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: error.message };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Autentificare eșuată." };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  // Admin explicit → centrul de comandă zilnic (Azi)
  if (profile?.role === 'admin') redirect('/dashboard/azi');

  // Client sau user nou fără profil → portal client
  redirect('/client/dashboard');
}

export async function signOut() {
  const supabase = await getSupabaseAuth();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function resetPassword(email: string): Promise<{ error?: string }> {
  const supabase = await getSupabaseAuth();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${appUrl}/auth/callback?next=/login/reset`,
  });
  if (error) return { error: error.message };
  return {};
}
