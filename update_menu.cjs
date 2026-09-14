const fs = require('fs');
let code = fs.readFileSync('src/components/MenuManager.tsx', 'utf8');

// 1. Remove the global button
const globalButton = `<button 
          onClick={() => {
            setEditingId('new');
            setEditForm({ status: 'active', portions: [], category: categories[0] || 'Snacks' });
          }}
          className="flex items-center gap-2 bg-[#05053D] text-white px-2 py-2 rounded-lg text-sm font-medium hover:bg-[#0a0a5c] transition-colors"
        >
          <Plus size={16} /> Nieuw Product
        </button>`;

code = code.replace(globalButton, "");

// 2. Add the button to each category header
const oldCatHeader = `<h4 className="font-bold text-[#05053D] text-lg">{cat.title}</h4>
                <div className="flex items-center gap-1">`;
const newCatHeader = `<div className="flex items-center gap-3">
                  <h4 className="font-bold text-[#05053D] text-lg">{cat.title}</h4>
                  <button 
                    onClick={() => {
                      setEditingId('new');
                      setEditForm({ status: 'active', portions: [], category: cat.title });
                    }}
                    className="flex items-center gap-1 text-sm bg-white border border-gray-200 px-2 py-1 rounded-md text-gray-600 hover:text-ob-blue hover:border-ob-blue transition-colors"
                  >
                    <Plus size={14} /> Nieuw Product
                  </button>
                </div>
                <div className="flex items-center gap-1">`;
code = code.replace(oldCatHeader, newCatHeader);

// 3. Remove the standalone 'new' block and put it in the map
const standaloneNewBlock = `{editingId === 'new' && (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-blue-50 px-4 py-3 font-semibold text-ob-blue border-b border-gray-200">
                Nieuw Product Toevoegen
              </div>
              <table className="w-full text-left text-sm min-w-[1000px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-2 py-2 font-semibold text-gray-700 w-24">Acties</th>
                    <th className="px-2 py-2 font-semibold text-gray-700 w-1/3">Product</th>
                    <th className="px-2 py-2 font-semibold text-gray-700 w-1/6">Categorie</th>
                    <th className="px-2 py-2 font-semibold text-gray-700 ">Porties (stuks)</th>
                    <th className="px-2 py-2 font-semibold text-gray-700 w-1/6">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-blue-50/50">
                    {renderEditRow()}
                  </tr>
                </tbody>
              </table>
            </div>
          )}`;
code = code.replace(standaloneNewBlock, "");

// 4. Put the new block inside the tbody of each category
const tbodyStart = `<tbody className="divide-y divide-gray-100">`;
const newTbodyStart = `<tbody className="divide-y divide-gray-100">
                    {editingId === 'new' && editForm.category === cat.title && (
                      <tr className="bg-blue-50/50">
                        {renderEditRow()}
                      </tr>
                    )}`;
// Only replace the ones inside the category list. Since we already removed the standalone one, all remaining tbodys are the ones we want. Wait, we use replaceAll or just global replace.
code = code.replace(new RegExp(tbodyStart.replace(/[.*+?^\${}()|[\\]\\]/g, '\\$&'), 'g'), newTbodyStart);

fs.writeFileSync('src/components/MenuManager.tsx', code);
