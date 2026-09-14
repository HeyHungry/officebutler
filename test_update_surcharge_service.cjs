require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseKey) { console.log("no service key"); process.exit(0); }
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: prodData } = await supabase.from('ob_products').select('name, variant_surcharges').limit(1);
  console.log("Before:", prodData);
  
  if (prodData && prodData.length > 0) {
     const p = prodData[0].name;
     const { data, error } = await supabase.from('ob_products').update({ variant_surcharges: { "test": 1 } }).eq('name', p).select();
     console.log("Update result:", JSON.stringify({ data, error }, null, 2));
  }
}
test();
