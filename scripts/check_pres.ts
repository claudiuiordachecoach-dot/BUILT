import { createClient } from '@supabase/supabase-js';
import path from 'path';
import process from 'process';

try {
  // @ts-ignore
  process.loadEnvFile(path.resolve(process.cwd(), '.env.local'));
} catch (err) {}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkPresentations() {
  const { data, error } = await supabase.from('presentations').select('*').order('created_at', { ascending: false }).limit(5);
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  for (const p of data) {
    console.log(`\n--- Presentation: ${p.slug} for ${p.prospect_name} ---`);
    console.log(`Created at: ${p.created_at}`);
    console.log(`Content length: ${p.html_content?.length} bytes`);
    console.log(`Preview: ${p.html_content?.substring(0, 200)}...`);
  }
}

checkPresentations();
