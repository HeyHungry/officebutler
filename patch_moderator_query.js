import fs from 'fs';
let code = fs.readFileSync('src/components/ModeratorPanel.tsx', 'utf8');

const targetQuery = "const { data: orderData } = await supabase.from('ob_orders').select('*, ob_companies(name)').order('created_at', { ascending: false });";
const replaceQuery = "const { data: orderData } = await supabase.from('ob_orders').select('*, ob_companies(name), ob_company_addresses(*)').order('created_at', { ascending: false });";

if (code.includes(targetQuery)) {
  code = code.replace(targetQuery, replaceQuery);
  fs.writeFileSync('src/components/ModeratorPanel.tsx', code);
  console.log("Patched query successfully");
} else {
  console.log("Could not find query");
}
