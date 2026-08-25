import { createClient } from '@supabase/supabase-js';
const url = process.env.VITE_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(url, key);
async function run() {
  await supabase.from('ob_product_prices').delete().like('product_name', '%Deal%');
  await supabase.from('ob_company_assortment').delete().like('product_name', '%Deal%');
  console.log("Deleted Deals from DB");
}
run();
