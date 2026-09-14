const fs = require('fs');
let code = fs.readFileSync('src/components/MenuManager.tsx', 'utf8');

const targetHtml = `<td className="px-2 py-2 align-top">
          <input type="text" placeholder="Naam" className="w-full px-2 py-1.5 border rounded focus:border-[#151f33] focus:outline-none" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} />
          <input type="text" placeholder="Afbeelding URL" className="w-full px-2 py-1.5 border rounded mt-2 text-xs focus:border-[#151f33] focus:outline-none" value={editForm.image_url || ''} onChange={e => setEditForm({...editForm, image_url: e.target.value})} />
        </td>`;

const newHtml = `<td className="px-2 py-2 align-top space-y-2">
          <input type="text" placeholder="Naam" className="w-full px-2 py-1.5 border rounded focus:border-[#151f33] focus:outline-none" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} />
          <input type="text" placeholder="Afbeelding URL" className="w-full px-2 py-1.5 border rounded text-xs focus:border-[#151f33] focus:outline-none" value={editForm.image_url || ''} onChange={e => setEditForm({...editForm, image_url: e.target.value})} />
          <input type="text" placeholder="Varianten (komma gescheiden, bijv: Rund, Kalf)" className="w-full px-2 py-1.5 border rounded text-xs focus:border-[#151f33] focus:outline-none" value={editForm.variants_str !== undefined ? editForm.variants_str : (editForm.variants || []).join(', ')} onChange={e => setEditForm({...editForm, variants_str: e.target.value})} />
          <input type="text" placeholder="Sauzen (komma gescheiden, bijv: Mayo, Mosterd)" className="w-full px-2 py-1.5 border rounded text-xs focus:border-[#151f33] focus:outline-none" value={editForm.sauces_str !== undefined ? editForm.sauces_str : (editForm.sauces || []).join(', ')} onChange={e => setEditForm({...editForm, sauces_str: e.target.value})} />
        </td>`;

code = code.replace(targetHtml, newHtml);
fs.writeFileSync('src/components/MenuManager.tsx', code);
