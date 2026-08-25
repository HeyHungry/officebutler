import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data, error } = await supabase.from('ob_orders').select('*').limit(1);
  if (data) console.log(Object.keys(data[0] || {}));
  else console.log(error);
}
run();
