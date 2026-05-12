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

  if (profile?.role === 'client') redirect('/client/dashboard');
  redirect('/dashboard/analytics');
}

export async function signOut() {
  const supabase = await getSupabaseAuth();
  await supabase.auth.signOut();
  redirect('/login');
}
