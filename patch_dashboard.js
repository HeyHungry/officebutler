import fs from 'fs';
let code = fs.readFileSync('src/pages/CompanyDashboard.tsx', 'utf8');

// 1. Add state
code = code.replace("const [billingInfo, setBillingInfo] = useState('');", "const [billingInfo, setBillingInfo] = useState('');\n  const [spendLimit, setSpendLimit] = useState('');");

// 2. Fetch value
code = code.replace("setBillingInfo(comp.billing_info || '');", "setBillingInfo(comp.billing_info || '');\n        setSpendLimit(comp.employee_spend_limit ? comp.employee_spend_limit.toString() : '');");

// 3. Save value
code = code.replace("billing_info: billingInfo", "billing_info: billingInfo,\n        employee_spend_limit: spendLimit ? parseFloat(spendLimit) : null");

// 4. Render input field
const inputHtml = `
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Maximale bestelwaarde per medewerker (€)</label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={spendLimit}
                        onChange={(e) => setSpendLimit(e.target.value)}
                        placeholder="Bijv. 15.00 (Leeg = onbeperkt)"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-ob-blue focus:ring-1 focus:ring-ob-blue outline-none transition-colors"
                      />
                      <p className="text-xs text-gray-500 mt-1">Laat dit veld leeg als er geen limiet is.</p>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-100">
`;

code = code.replace('<div className="pt-4 border-t border-gray-100">', inputHtml.trim());

fs.writeFileSync('src/pages/CompanyDashboard.tsx', code);
console.log("Patched CompanyDashboard.tsx");
