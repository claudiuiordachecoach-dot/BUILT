import { createClient } from '@supabase/supabase-js';
import path from 'path';
import process from 'process';

try {
  process.loadEnvFile(path.resolve(process.cwd(), '.env.local'));
} catch (err) {}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Lipsesc variabilele de mediu');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function createUser() {
  const email = 'nadejde_nelu@yahoo.ro';
  const password = 'NeluBUILT' + Math.floor(Math.random() * 1000) + '!';

  const { data, error } = await supabase.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true,
    user_metadata: { name: 'Nelu' }
  });

  if (error) {
    if (error.message.toLowerCase().includes('already')) {
        console.log('User-ul exista deja.');
    } else {
        console.error('Eroare:', error.message);
    }
  } else {
    console.log('User creat cu succes!');
    console.log('Email:', data?.user.email);
    console.log('Parola:', password);
  }
}

createUser();
