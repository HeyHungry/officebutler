const fs = require('fs');
let code = fs.readFileSync('src/components/MenuManager.tsx', 'utf8');

const tableBlock = `      <div className="w-full max-w-full overflow-auto custom-scrollbar bg-white border border-gray-200 rounded-xl max-h-[calc(100vh-320px)]">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={products.map(p => p.id)} strategy={verticalListSortingStrategy}>
            <table className="w-full text-left text-sm min-w-[1000px]">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-2 py-2 font-semibold text-gray-700 w-24">Acties</th>
                  <th className="px-2 py-2 font-semibold text-gray-700 w-1/3">Product</th>
                  <th className="px-2 py-2 font-semibold text-gray-700 w-1/6">Categorie</th>
                  <th className="px-2 py-2 font-semibold text-gray-700 w-1/6">Status</th>
                  <th className="px-2 py-2 font-semibold text-gray-700 ">Porties (stuks)</th>
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

// Use a regex to match the old div up to the closing table tag
code = code.replace(/<div className="w-full max-w-full overflow-auto custom-scrollbar[^>]+>[\s\S]*?<\/table>\s*<\/div>/, tableBlock);

fs.writeFileSync('src/components/MenuManager.tsx', code);
