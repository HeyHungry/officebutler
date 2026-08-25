import { createClient } from "@supabase/supabase-js";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  
  try {
    const { email, password, companyId } = req.body;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    
    if (!serviceKey || !supabaseUrl) {
      console.error("Missing SUPABASE_SERVICE_ROLE_KEY or VITE_SUPABASE_URL");
      return res.status(500).json({ error: "Server configuratie ontbreekt (Service Role Key)" });
    }
    
    const supabaseAdmin = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });
    
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true // bypasses the email confirmation requirement
    });
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    
    if (data.user) {
      // Also save the email inside the user profile so we can list it easily in the dashboard
      await supabaseAdmin.from('ob_user_profiles').insert({
        id: data.user.id,
        company_id: companyId,
        role: 'employee',
        first_name: email // Store email here as a hack since we can't fetch auth.users on client
      });
    }
    
    res.status(200).json({ success: true });
  } catch (err: any) {
    console.error("Error creating employee:", err);
    res.status(500).json({ error: err.message });
  }
}
