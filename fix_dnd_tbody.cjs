const fs = require('fs');
let code = fs.readFileSync('src/components/MenuManager.tsx', 'utf8');

const newTbody = `<DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={products.map(p => p.id)} strategy={verticalListSortingStrategy}>
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
          </SortableContext>
          </DndContext>`;

code = code.replace(/<tbody className="divide-y divide-gray-100">[\s\S]*?<\/tbody>/, newTbody);

fs.writeFileSync('src/components/MenuManager.tsx', code);
