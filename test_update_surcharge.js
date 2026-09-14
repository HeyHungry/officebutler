require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: prodData } = await supabase.from('ob_products').select('name, variant_surcharges').limit(1);
  console.log("Before:", prodData);
  
  if (prodData && prodData.length > 0) {
     const p = prodData[0].name;
     const { data, error } = await supabase.from('ob_products').update({ variant_surcharges: { "test": 1 } }).eq('name', p).select();
     console.log("Update result:", { data, error });
  }
}
test();
