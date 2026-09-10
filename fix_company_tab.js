import fs from 'fs';
let code = fs.readFileSync('src/pages/CompanyDashboard.tsx', 'utf8');

const targetButton = `                <button onClick={() => setActiveTab('orders')} className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors \${activeTab === 'orders' ? 'bg-blue-50 text-ob-blue' : 'text-gray-600 hover:bg-gray-50'}\`}>
                    <ShoppingBag size={20} />
                    <span>Bestelgeschiedenis</span>
                  </button>`;

const replacement = `                <button onClick={() => setActiveTab('orders')} className={\`w-full flex items-center gap-3 px-6 py-4 text-sm font-semibold transition-colors shrink-0 \${activeTab === 'orders' ? 'bg-[#151f33] text-white border-l-4 border-white' : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'}\`}>
                    <ShoppingBag size={18} /> Bestelgeschiedenis
                  </button>`;

code = code.replace(targetButton, replacement);
fs.writeFileSync('src/pages/CompanyDashboard.tsx', code);
console.log("Fixed company dashboard tab styling");
