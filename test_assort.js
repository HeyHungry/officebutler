import { createClient } from '@supabase/supabase-js';
const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);
async function run() {
  const { data, error } = await supabase.from('ob_company_assortment').select('*');
  console.log(JSON.stringify(data, null, 2));
}
run();
