import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { data: users } = await supabase.auth.admin.listUsers();
  for (const u of users.users) {
      if (u.email === 'sociaal@heyhungry.nl' || u.email === 'admin@heyhungry.nl') {
        const { error } = await supabase.from('ob_user_profiles').upsert({
          id: u.id,
          role: 'admin'
        });
        console.log("Upserted admin profile for", u.email, error);
      }
  }
}
run();
