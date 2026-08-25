import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data, error } = await supabase.from('ob_orders').select('*').limit(1).order('created_at', { ascending: false });
  console.log("Data:", data);
}
run();
