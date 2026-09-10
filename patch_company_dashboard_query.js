import fs from 'fs';

let code = fs.readFileSync('src/pages/CompanyDashboard.tsx', 'utf8');

const targetQuery = "const { data: orderData } = await supabase.from('ob_orders').select('*').eq('company_id', companyData.id).order('created_at', { ascending: false });";
const replaceQuery = "const { data: orderData } = await supabase.from('ob_orders').select('*, ob_company_addresses(*)').eq('company_id', companyData.id).order('created_at', { ascending: false });";

if (code.includes(targetQuery)) {
  code = code.replace(targetQuery, replaceQuery);
  fs.writeFileSync('src/pages/CompanyDashboard.tsx', code);
  console.log("Patched query successfully in CompanyDashboard");
} else {
  console.log("Could not find query in CompanyDashboard");
}
