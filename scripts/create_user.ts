import { createClient } from '@supabase/supabase-js';
import path from 'path';
import process from 'process';

try {
  process.loadEnvFile(path.resolve(process.cwd(), '.env.local'));
} catch (err) {
  console.log('Fără fișier .env.local sau loadEnvFile nu a mers, continuăm...');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Lipsesc variabilele de mediu pentru Supabase (NEXT_PUBLIC_SUPABASE_URL sau SUPABASE_SERVICE_ROLE_KEY).');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function createUser() {
  const email = 'andreistamate7@gmail.com';
  const password = 'AndreiBuilt2026!';

  console.log(`Creăm sau actualizăm user-ul: ${email}...`);

  const { data, error } = await supabase.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true,
    user_metadata: { name: 'Andrei Stamate' }
  });

  if (error) {
    if (error.message.toLowerCase().includes('already been registered') || error.message.toLowerCase().includes('already exists')) {
        console.log('User-ul există deja. Îi updatăm parola...');
        
        const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) {
             console.error('Nu s-au putut lista userii:', listError);
             return;
        }
        
        const existingUser = usersData.users.find(u => u.email === email);
        if (existingUser) {
            const { error: updateError } = await supabase.auth.admin.updateUserById(
                existingUser.id,
                { password: password }
            );
            if (updateError) {
                console.error('Eroare la update parolă:', updateError.message);
            } else {
                console.log('Parola a fost updatată cu succes pentru user-ul existent!');
                console.log('Email:', existingUser.email);
                console.log('Noua parolă setată:', password);
            }
        } else {
             console.log('Userul nu a fost găsit în lista adminului?!');
        }
    } else {
        console.error('Eroare la crearea user-ului:', error.message);
    }
  } else {
    console.log('User creat cu succes!');
    console.log('Email:', data.user.email);
    console.log('Parola setată:', password);
  }
}

createUser();
