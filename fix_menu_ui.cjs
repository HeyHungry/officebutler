const fs = require('fs');
let code = fs.readFileSync('src/components/MenuManager.tsx', 'utf8');

const targetHtml = `<td className="px-2 py-2 align-top space-y-2">
          <input type="text" placeholder="Naam" className="w-full px-2 py-1.5 border rounded focus:border-[#151f33] focus:outline-none" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} />
          <input type="text" placeholder="Afbeelding URL" className="w-full px-2 py-1.5 border rounded text-xs focus:border-[#151f33] focus:outline-none" value={editForm.image_url || ''} onChange={e => setEditForm({...editForm, image_url: e.target.value})} />
          <input type="text" placeholder="Varianten (komma gescheiden, bijv: Rund, Kalf)" className="w-full px-2 py-1.5 border rounded text-xs focus:border-[#151f33] focus:outline-none" value={editForm.variants_str !== undefined ? editForm.variants_str : (editForm.variants || []).join(', ')} onChange={e => setEditForm({...editForm, variants_str: e.target.value})} />
          <input type="text" placeholder="Sauzen (komma gescheiden, bijv: Mayo, Mosterd)" className="w-full px-2 py-1.5 border rounded text-xs focus:border-[#151f33] focus:outline-none" value={editForm.sauces_str !== undefined ? editForm.sauces_str : (editForm.sauces || []).join(', ')} onChange={e => setEditForm({...editForm, sauces_str: e.target.value})} />
        </td>`;

const newHtml = `<td className="px-2 py-2 align-top space-y-3">
          <div className="space-y-1.5">
            <input type="text" placeholder="Naam" className="w-full px-2 py-1.5 border rounded focus:border-[#151f33] focus:outline-none" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} />
            <input type="text" placeholder="Afbeelding URL" className="w-full px-2 py-1.5 border rounded text-xs focus:border-[#151f33] focus:outline-none" value={editForm.image_url || ''} onChange={e => setEditForm({...editForm, image_url: e.target.value})} />
          </div>
          
          <div className="space-y-1">
             <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Varianten</div>
             <div className="flex flex-wrap gap-1.5 items-center">
               {(editForm.variants || []).map(v => (
                 <span key={v} className="bg-blue-50 text-ob-blue border border-blue-200 px-2 py-0.5 rounded-md text-xs flex items-center gap-1">
                   {v}
                   <button onClick={() => setEditForm({...editForm, variants: (editForm.variants || []).filter(x => x !== v)})} className="hover:text-red-500"><X size={12} /></button>
                 </span>
               ))}
               <input type="text" placeholder="+ Voeg toe" className="px-2 py-0.5 rounded-md text-xs border border-gray-200 w-24 focus:outline-none focus:border-ob-blue" onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); const val = e.currentTarget.value.trim(); if(val && !(editForm.variants || []).includes(val)) { setEditForm({...editForm, variants: [...(editForm.variants || []), val]}); } e.currentTarget.value = ''; } }} />
             </div>
          </div>
          
          <div className="space-y-1">
             <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Sauzen</div>
             <div className="flex flex-wrap gap-1.5 items-center">
               {(editForm.sauces || []).map(s => (
                 <span key={s} className="bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-md text-xs flex items-center gap-1">
                   {s}
                   <button onClick={() => setEditForm({...editForm, sauces: (editForm.sauces || []).filter(x => x !== s)})} className="hover:text-red-500"><X size={12} /></button>
                 </span>
               ))}
               <input type="text" placeholder="+ Voeg toe" className="px-2 py-0.5 rounded-md text-xs border border-gray-200 w-24 focus:outline-none focus:border-orange-400" onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); const val = e.currentTarget.value.trim(); if(val && !(editForm.sauces || []).includes(val)) { setEditForm({...editForm, sauces: [...(editForm.sauces || []), val]}); } e.currentTarget.value = ''; } }} />
             </div>
          </div>
        </td>`;

code = code.replace(targetHtml, newHtml);
fs.writeFileSync('src/components/MenuManager.tsx', code);
