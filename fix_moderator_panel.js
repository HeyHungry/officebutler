import fs from 'fs';
let code = fs.readFileSync('src/components/ModeratorPanel.tsx', 'utf8');

const targetButton = `                      <button 
                        onClick={() => { setActiveTab('prices'); setImpersonating(null); }}`;

const replacement = `                      <button onClick={() => { setActiveTab('orders'); setImpersonating(null); }}
                        className={\`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors shrink-0 md:shrink \${activeTab === 'orders' && !impersonating ? 'bg-[#151f33] text-white' : 'text-gray-600 hover:bg-gray-100'}\`}>
                        <ShoppingBag size={18} />
                        <span>Bestellingen</span>
                      </button>
                      <button 
                        onClick={() => { setActiveTab('prices'); setImpersonating(null); }}`;

code = code.replace(targetButton, replacement);
fs.writeFileSync('src/components/ModeratorPanel.tsx', code);
console.log("Fixed tab button");
