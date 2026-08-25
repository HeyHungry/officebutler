import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { error } = await supabase.from('ob_orders').insert({
    product_name: 'test',
    portion_size: 25,
    price: 10,
    total_price: 10,
    phone: '123'
  });
  console.log("Error:", error);
}
run();
