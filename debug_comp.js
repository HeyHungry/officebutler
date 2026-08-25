import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data: comp, error } = await supabase.from('ob_companies').select('*').eq('id', '626c9483-25dc-448d-ab9f-589e82d21005').single();
  console.log("Company:", comp);
  console.log("Error:", error);
}
run();
