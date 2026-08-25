import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { error } = await supabase.rpc('execute_sql', { sql_statement: `ALTER TABLE ob_orders ADD COLUMN IF NOT EXISTS product_name TEXT, ADD COLUMN IF NOT EXISTS portion_size INTEGER;` });
  console.log("Error adding cols:", error);
}
run();
