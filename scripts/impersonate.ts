import { createClient } from '@supabase/supabase-js';
import path from 'path';
import process from 'process';

try {
  process.loadEnvFile(path.resolve(process.cwd(), '.env.local'));
} catch (err) {}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
  auth: { persistSession: false }
});

async function impersonateClaudia() {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'claudia.cristi1984@gmail.com',
    password: 'Password123!'
  });

  if (error) {
    console.error('Eroare login:', error.message);
    return;
  }

  console.log('Logged in as Claudia:', data.user.id);

  // Determina rolul exact cum face middleware.ts
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  if (profileError) {
    console.error('Eroare profil:', profileError.message);
  }

  const role = profile?.role ?? "client";
  console.log('Role calculated by middleware:', role);
}

impersonateClaudia();
