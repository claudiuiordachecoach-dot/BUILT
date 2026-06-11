import { createClient } from '@supabase/supabase-js';
import path from 'path';
import process from 'process';

try {
  // @ts-ignore
  process.loadEnvFile(path.resolve(process.cwd(), '.env.local'));
} catch (err) {}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseServiceKey!, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function checkAllProfiles() {
  const { data: profiles, error } = await supabase.from('profiles').select('*');
  if (error) console.error('Error fetching profiles:', error.message);
  console.log('Profiles:', profiles);
}

checkAllProfiles();
