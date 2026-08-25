import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data: users, error: err1 } = await supabase.auth.admin.listUsers();
  if (err1) { console.log(err1); return; }
  const { data: profiles, error: err2 } = await supabase.from('ob_user_profiles').select('*');
  if (err2) { console.log(err2); return; }
  
  console.log("Users and their profiles:");
  for (const user of users.users) {
    const profile = profiles.find(p => p.id === user.id);
    console.log(`- Email: ${user.email}, ID: ${user.id}, Profile Role: ${profile ? profile.role : 'NONE'}, Profile Company: ${profile ? profile.company_id : 'NONE'}`);
  }
}
run();
