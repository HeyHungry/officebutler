import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data: auth } = await supabase.auth.signInWithPassword({
    email: 'sociaal@heyhungry.nl',
    password: 'password123' // wait I don't know the password
  });
}
