const fs = require('fs');
let code = fs.readFileSync('src/components/MenuManager.tsx', 'utf8');

const sortableRow = `
export type ObProduct = {
  id: string;
  name: string;
  category: string;
  image_url: string;
  status: string;
  portions: number[];
  sort_order?: number;
};

function SortableRow({ p, editingId, renderEditRow, handleEdit, handleDelete }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: p.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    position: 'relative' as 'relative',
  };

  if (editingId === p.id) {
    return (
      <tr ref={setNodeRef} style={style} className="bg-blue-50/50">
        {renderEditRow()}
      </tr>
    );
  }

  return (
    <tr ref={setNodeRef} style={style} className={\`hover:bg-gray-50 transition-colors \${isDragging ? 'bg-gray-100 shadow-md' : ''}\`}>
      <td className="px-2 py-2 space-x-2 w-24">
        <button {...attributes} {...listeners} className="text-gray-400 hover:text-gray-600 p-1 cursor-grab active:cursor-grabbing"><GripVertical size={16} /></button>
        <button onClick={() => handleEdit(p)} className="text-gray-400 hover:text-blue-600 p-1"><Edit2 size={16} /></button>
        <button onClick={() => handleDelete(p.id)} className="text-gray-400 hover:text-red-600 p-1"><Trash2 size={16} /></button>
      </td>
      <td className="px-2 py-2">
        <div className="flex items-center gap-3">
          {p.image_url ? (
            <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
              <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-md bg-gray-100 shrink-0 border border-gray-200 flex items-center justify-center text-gray-400">
              <ImageIcon size={16} />
            </div>
          )}
          <span className="font-semibold text-gray-800">{p.name}</span>
        </div>
      </td>
      <td className="px-2 py-2"><span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-medium">{p.category}</span></td>
      <td className="px-2 py-2"><div className="flex flex-wrap gap-1">{p.portions && p.portions.map((port: number) => (<span key={port} className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-xs font-medium">{port} st.</span>))}</div></td>
      <td className="px-2 py-2">
        <span className={\`px-2 py-1 rounded-md text-xs font-medium \${['uitverkocht', 'verborgen'].includes((p.status || '').toLowerCase()) ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}\`}>
          {p.status || 'Actief'}
        </span>
      </td>
    </tr>
  );
}
`;

code = code.replace(/export type ObProduct = \{[\s\S]*?portions: number\[\];\n\};/, sortableRow);

fs.writeFileSync('src/components/MenuManager.tsx', code);
