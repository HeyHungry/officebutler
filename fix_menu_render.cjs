const fs = require('fs');
let code = fs.readFileSync('src/components/MenuManager.tsx', 'utf8');

const targetRender = `<div className="w-full max-w-full overflow-auto custom-scrollbar bg-white border border-gray-200 rounded-xl max-h-[calc(100vh-320px)]">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={products.map(p => p.id)} strategy={verticalListSortingStrategy}>
            <table className="w-full text-left text-sm min-w-[1000px]">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                
                <tr>
                  <th className="px-2 py-2 font-semibold text-gray-700 w-24">Acties</th>
                  <th className="px-2 py-2 font-semibold text-gray-700 w-1/3">Product</th>
                  <th className="px-2 py-2 font-semibold text-gray-700 w-1/6">Categorie</th>
                  <th className="px-2 py-2 font-semibold text-gray-700 ">Porties (stuks)</th>
                  <th className="px-2 py-2 font-semibold text-gray-700 w-1/6">Status</th>
                </tr>

              </thead>
              <tbody className="divide-y divide-gray-100">
                {editingId === 'new' && (
                  <tr className="bg-blue-50/50">
                    {renderEditRow()}
                  </tr>
                )}
                
                {products.map(p => (
                  <SortableRow key={p.id} p={p} editingId={editingId} renderEditRow={renderEditRow} handleEdit={handleEdit} handleDelete={handleDelete} />
                ))}
              </tbody>
            </table>
          </SortableContext>
        </DndContext>
      </div>`;

const newRender = `<div className="w-full max-w-full overflow-auto custom-scrollbar max-h-[calc(100vh-320px)] space-y-6 p-1 pb-10">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          
          {editingId === 'new' && (
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
          )}

          {categoryList.map((cat, catIndex) => (
            <div key={cat.title} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-[#f8f9fa] px-4 py-3 flex items-center justify-between border-b border-gray-200">
                <h4 className="font-bold text-[#05053D] text-lg">{cat.title}</h4>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => moveCategory(catIndex, -1)}
                    disabled={catIndex === 0}
                    className="p-1 rounded text-gray-500 hover:bg-gray-200 hover:text-gray-800 disabled:opacity-30 transition-colors"
                  ><ChevronUp size={20} /></button>
                  <button 
                    onClick={() => moveCategory(catIndex, 1)}
                    disabled={catIndex === categoryList.length - 1}
                    className="p-1 rounded text-gray-500 hover:bg-gray-200 hover:text-gray-800 disabled:opacity-30 transition-colors"
                  ><ChevronDown size={20} /></button>
                </div>
              </div>
              <SortableContext items={cat.items.map((p: any) => p.id)} strategy={verticalListSortingStrategy}>
                <table className="w-full text-left text-sm min-w-[1000px]">
                  {catIndex === 0 && (
                    <thead className="bg-gray-50 border-b border-gray-200 text-xs">
                      <tr>
                        <th className="px-2 py-2 font-semibold text-gray-700 w-24">Acties</th>
                        <th className="px-2 py-2 font-semibold text-gray-700 w-1/3">Product</th>
                        <th className="px-2 py-2 font-semibold text-gray-700 w-1/6">Categorie</th>
                        <th className="px-2 py-2 font-semibold text-gray-700 ">Porties (stuks)</th>
                        <th className="px-2 py-2 font-semibold text-gray-700 w-1/6">Status</th>
                      </tr>
                    </thead>
                  )}
                  <tbody className="divide-y divide-gray-100">
                    {cat.items.map((p: any) => (
                      <SortableRow key={p.id} p={p} editingId={editingId} renderEditRow={renderEditRow} handleEdit={handleEdit} handleDelete={handleDelete} />
                    ))}
                    {cat.items.length === 0 && (
                      <tr><td colSpan={5} className="p-4 text-center text-gray-500 italic">Geen producten in deze categorie.</td></tr>
                    )}
                  </tbody>
                </table>
              </SortableContext>
            </div>
          ))}

        </DndContext>
      </div>`;

if (code.includes('<div className="w-full max-w-full overflow-auto custom-scrollbar bg-white border border-gray-200 rounded-xl max-h-[calc(100vh-320px)]">')) {
  code = code.replace(targetRender, newRender);
} else {
  console.log("Could not find exact block to replace");
}

fs.writeFileSync('src/components/MenuManager.tsx', code);
