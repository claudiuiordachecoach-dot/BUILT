import { createClient } from '@supabase/supabase-js';
import path from 'path';
import process from 'process';
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseServiceKey!, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function addClient() {
  const email = 'otilia.diaconu27@yahoo.com';
  const name = 'Otilia Diaconu';
  const objectives = 'Arhitectura Corpului 90 de zile · Reconstrucție (120kg -> 86kg)';
  const startDate = new Date().toISOString().slice(0, 10);

  console.log(`Verificăm dacă clientul ${name} există deja...`);
  const { data: existing } = await supabase
    .from('clients')
    .select('id')
    .eq('email', email)
    .single();

  if (existing) {
    console.log(`Clientul există deja cu ID: ${existing.id}`);
  } else {
    console.log(`Adăugăm clientul în tabelul clients...`);
    const { data, error } = await supabase
      .from('clients')
      .insert({
        name: name,
        email: email,
        start_date: startDate,
        objectives: objectives,
        status: 'active'
      })
      .select('id')
      .single();

    if (error) {
      console.error('Eroare la adăugarea clientului:', error.message);
    } else {
      console.log('Client adăugat cu succes! ID:', data.id);
    }
  }
}

addClient();
