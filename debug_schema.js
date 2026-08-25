import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data, error } = await supabase.from('ob_orders').insert({
    company_id: '123e4567-e89b-12d3-a456-426614174000',
    user_id: '123e4567-e89b-12d3-a456-426614174000',
    product_name: 'test',
    portion_size: 25,
    price: 10.0,
    total_price: 10.0,
    address_id: '123e4567-e89b-12d3-a456-426614174000',
    phone: '123',
    notes: 'none'
  }).select();
  console.log("Error:", error);
}
run();
