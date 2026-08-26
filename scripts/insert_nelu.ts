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

async function insertClient() {
  const email = 'nadejde_nelu@yahoo.ro';
  
  // 1. Get the auth user ID
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
  const user = authData?.users?.find(u => u.email === email);
  
  if (!user) {
      console.error('User auth nu a fost gasit');
      return;
  }

  // 2. Insert into clients table
  const { data, error } = await supabase
    .from('clients')
    .insert({
      email: email,
      name: 'Nelu',
      auth_user_id: user.id,
      status: 'active'
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
       console.log('Clientul exista deja in tabelul clients!');
       
       // Seteaza auth_user_id
       await supabase.from('clients').update({ auth_user_id: user.id, status: 'active' }).eq('email', email);
       console.log('Am updatat auth_user_id pentru el.');
    } else {
       console.error('Eroare:', error.message);
    }
  } else {
    console.log('Client adaugat in baza de date (tabelul clients)! ID:', data.id);
  }
}

insertClient();
