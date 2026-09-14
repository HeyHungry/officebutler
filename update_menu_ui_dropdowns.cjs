const fs = require('fs');
let code = fs.readFileSync('src/components/MenuManager.tsx', 'utf8');

// 1. Get all unique variants and sauces at the top of MenuManager component
const targetCategories = `const allCategories = Array.from(new Set(products.map(p => p.category))).sort();`;
const newCategories = `const allCategories = Array.from(new Set(products.map(p => p.category))).sort();
  const allVariants = Array.from(new Set(products.flatMap(p => p.variants || []))).sort();
  const allSauces = Array.from(new Set(products.flatMap(p => p.sauces || []))).sort();`;
code = code.replace(targetCategories, newCategories);

// 2. Replace the variants input
const oldVariantsInput = `<input type="text" placeholder="+ Voeg toe" className="px-2 py-0.5 rounded-md text-xs border border-gray-200 w-24 focus:outline-none focus:border-ob-blue" onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); const val = e.currentTarget.value.trim(); if(val && !(editForm.variants || []).includes(val)) { setEditForm({...editForm, variants: [...(editForm.variants || []), val]}); } e.currentTarget.value = ''; } }} />`;

const newVariantsInput = `<select 
                 className="px-2 py-0.5 rounded-md text-xs border border-gray-200 w-auto focus:outline-none focus:border-ob-blue bg-white"
                 onChange={(e) => {
                   const val = e.target.value;
                   if (val && !(editForm.variants || []).includes(val)) {
                     setEditForm({...editForm, variants: [...(editForm.variants || []), val]});
                   }
                   e.target.value = "";
                 }}
                 defaultValue=""
               >
                 <option value="" disabled>+ Kies Variant...</option>
                 {allVariants.filter(v => !(editForm.variants || []).includes(v)).map(v => (
                   <option key={v} value={v}>{v}</option>
                 ))}
               </select>
               <input type="text" placeholder="Of typ nieuw..." className="px-2 py-0.5 rounded-md text-xs border border-gray-200 w-24 focus:outline-none focus:border-ob-blue" onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); const val = e.currentTarget.value.trim(); if(val && !(editForm.variants || []).includes(val)) { setEditForm({...editForm, variants: [...(editForm.variants || []), val]}); } e.currentTarget.value = ''; } }} />`;
code = code.replace(oldVariantsInput, newVariantsInput);

// 3. Replace the sauces input
const oldSaucesInput = `<input type="text" placeholder="+ Voeg toe" className="px-2 py-0.5 rounded-md text-xs border border-gray-200 w-24 focus:outline-none focus:border-orange-400" onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); const val = e.currentTarget.value.trim(); if(val && !(editForm.sauces || []).includes(val)) { setEditForm({...editForm, sauces: [...(editForm.sauces || []), val]}); } e.currentTarget.value = ''; } }} />`;

const newSaucesInput = `<select 
                 className="px-2 py-0.5 rounded-md text-xs border border-gray-200 w-auto focus:outline-none focus:border-orange-400 bg-white"
                 onChange={(e) => {
                   const val = e.target.value;
                   if (val && !(editForm.sauces || []).includes(val)) {
                     setEditForm({...editForm, sauces: [...(editForm.sauces || []), val]});
                   }
                   e.target.value = "";
                 }}
                 defaultValue=""
               >
                 <option value="" disabled>+ Kies Saus...</option>
                 {allSauces.filter(s => !(editForm.sauces || []).includes(s)).map(s => (
                   <option key={s} value={s}>{s}</option>
                 ))}
               </select>
               <input type="text" placeholder="Of typ nieuw..." className="px-2 py-0.5 rounded-md text-xs border border-gray-200 w-24 focus:outline-none focus:border-orange-400" onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); const val = e.currentTarget.value.trim(); if(val && !(editForm.sauces || []).includes(val)) { setEditForm({...editForm, sauces: [...(editForm.sauces || []), val]}); } e.currentTarget.value = ''; } }} />`;
code = code.replace(oldSaucesInput, newSaucesInput);

fs.writeFileSync('src/components/MenuManager.tsx', code);
