import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const emails = [
    { email: 'info@heyliefde.nl', compId: '0f33179a-4228-4e5d-8507-88deb867b838' },
    { email: 'Meeslist@gmail.com', compId: '80bf8789-6a61-46d4-96f3-5fe48ea2a577' },
    { email: 'boatbutler@gmail.com', compId: 'cdee7d6d-0226-45a3-a1ad-80838489a48c' }
  ];

  for (const acc of emails) {
    const { data: user, error: createErr } = await supabase.auth.admin.createUser({
      email: acc.email,
      password: 'Password123!',
      email_confirm: true
    });
    if (createErr && createErr.status !== 422) {
      console.log(`Error creating ${acc.email}:`, createErr);
    } else {
      console.log(`Created or exists: ${acc.email}`);
      const userId = user ? user.user.id : null;
      if (userId) {
        await supabase.from('ob_user_profiles').upsert({
          id: userId,
          company_id: acc.compId,
          role: 'office_manager'
        });
        console.log(`Linked profile for ${acc.email}`);
      }
    }
  }
}
run();
