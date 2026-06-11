import { createClient } from '@supabase/supabase-js';
import process from 'process';
import path from 'path';

try {
  // @ts-ignore
  process.loadEnvFile(path.resolve(process.cwd(), '.env.local'));
} catch (err) {}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkClient() {
  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('email', 'claudia.cristi1984@gmail.com')
    .single();

  console.log("Client in DB:", client);
  console.log("Error:", error);

  const { data: authUsers } = await supabase.auth.admin.listUsers();
  const authUser = authUsers.users.find(u => u.email === 'claudia.cristi1984@gmail.com');
  console.log("Auth user:", authUser?.id);
  
  if (client && authUser && client.auth_user_id !== authUser.id) {
    console.log("Mismatched or missing auth_user_id!");
    await supabase.from('clients').update({ auth_user_id: authUser.id }).eq('id', client.id);
    console.log("Fixed!");
  }
}

checkClient();
