import fs from 'fs';

let code = fs.readFileSync('src/pages/CompanyDashboard.tsx', 'utf8');

const targetQuery = "const { data: orderData } = await supabase.from('ob_orders').select('*, ob_users(name)').eq('company_id', companyData.id).order('created_at', { ascending: false });";
const replaceQuery = "const { data: orderData } = await supabase.from('ob_orders').select('*, ob_users(name), ob_company_addresses(*)').eq('company_id', companyData.id).order('created_at', { ascending: false });";

if (code.includes(targetQuery)) {
  code = code.replace(targetQuery, replaceQuery);
  console.log("Patched query successfully in CompanyDashboard 1");
} else {
  // try another variant
  const query2 = "const { data: orderData } = await supabase.from('ob_orders').select('*').eq('company_id', comp.id).order('created_at', { ascending: false });";
  const replace2 = "const { data: orderData } = await supabase.from('ob_orders').select('*, ob_company_addresses(*)').eq('company_id', comp.id).order('created_at', { ascending: false });";
  if (code.includes(query2)) {
    code = code.replace(query2, replace2);
    console.log("Patched query successfully in CompanyDashboard 2");
  } else {
     console.log("Still could not find query");
  }
}
fs.writeFileSync('src/pages/CompanyDashboard.tsx', code);
