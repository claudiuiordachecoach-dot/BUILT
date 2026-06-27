import { createClient } from '@supabase/supabase-js';
import path from 'path';
import process from 'process';

try {
  process.loadEnvFile(path.resolve(process.cwd(), '.env.local'));
} catch (err) {}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseServiceKey!, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function checkProfile() {
  const { data: authUser } = await supabase.auth.admin.listUsers();
  const claudia = authUser.users.find(u => u.email === 'claudia.cristi1984@gmail.com');
  
  if (!claudia) {
    console.log('Claudia nu e in auth.');
    return;
  }
  
  console.log('Claudia Auth ID:', claudia.id);
  
  const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', claudia.id).single();
  if (error) console.error('Error fetching profile:', error.message);
  console.log('Profile:', profile);
}

checkProfile();
