import { createClient } from '@supabase/supabase-js';
import path from 'path';
import process from 'process';

try {
  process.loadEnvFile(path.resolve(process.cwd(), '.env.local'));
} catch (err) {}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Lipsesc variabilele de mediu');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function testLogin() {
  const email = 'nadejde_nelu@yahoo.ro';
  const password = 'NeluBUILT924!';

  console.log(`Testez login-ul pentru ${email}...`);

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password
  });

  if (error) {
    console.error('Eroare la autentificare:', error.message);
  } else {
    console.log('Autentificare cu succes!');
    console.log('Access Token primit:', !!data.session?.access_token);
    console.log('User ID:', data.user.id);
  }
}

testLogin();
