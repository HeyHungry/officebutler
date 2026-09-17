const fs = require('fs');

let code = fs.readFileSync('src/components/MenuManager.tsx', 'utf8');

const search = '<input type="text" placeholder="Afbeelding URL" className="w-full px-2 py-1.5 border rounded text-xs focus:border-[#151f33] focus:outline-none" value={editForm.image_url || \'\'} onChange={e => setEditForm({...editForm, image_url: e.target.value})} />';

const replace = search + `
            <textarea placeholder="Extra informatie (bijv. allergenen)..." className="w-full px-2 py-1.5 border rounded text-xs focus:border-[#151f33] focus:outline-none min-h-[60px]" value={editForm.extra_info || ''} onChange={e => setEditForm({...editForm, extra_info: e.target.value})} />
            
            <div className="flex flex-col gap-1 mt-2">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Extra Categorieën</span>
              <div className="flex flex-wrap gap-1 items-center">
               {(editForm.additional_categories || []).map(c => (
                 <span key={c} className="bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                   {c}
                   <button onClick={() => setEditForm({...editForm, additional_categories: (editForm.additional_categories || []).filter(x => x !== c)})} className="hover:text-red-500"><X size={12} /></button>
                 </span>
               ))}
               <select className="px-2 py-0.5 rounded-md text-xs border border-gray-200 bg-gray-50 cursor-pointer focus:outline-none" onChange={(e) => {
                   const val = e.target.value;
                   if (val && !(editForm.additional_categories || []).includes(val)) {
                     setEditForm({...editForm, additional_categories: [...(editForm.additional_categories || []), val]});
                   }
                   e.target.value = '';
                 }}>
                 <option value="">+ Toevoegen</option>
                 {categories.filter(c => !(editForm.additional_categories || []).includes(c) && c !== editForm.category).map(c => (
                   <option key={c} value={c}>{c}</option>
                 ))}
               </select>
              </div>
            </div>
`;

code = code.replace(search, replace);
fs.writeFileSync('src/components/MenuManager.tsx', code);
