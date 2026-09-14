const fs = require('fs');
let code = fs.readFileSync('src/components/MenuManager.tsx', 'utf8');

const oldHeader = `      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-serif font-semibold text-[#05053D] mb-1">Menu & Producten Beheren</h3>
          <p className="text-sm text-gray-500">Voeg producten toe, bewerk porties en statussen, en verwijder items.</p>
        </div>
        
      </div>`;

const newHeader = `      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-serif font-semibold text-[#05053D] mb-1">Menu & Producten Beheren</h3>
          <p className="text-sm text-gray-500">Voeg producten toe, bewerk porties en statussen, en verwijder items.</p>
        </div>
        <button 
          onClick={() => {
            setEditingId('new');
            setEditForm({ status: 'active', portions: [], category: '__NEW__' });
            setIsCreatingCategory(true);
            setNewCategory('');
          }}
          className="flex items-center gap-2 bg-[#05053D] text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-[#0a0a5c] transition-colors"
        >
          <Plus size={16} /> Nieuwe Categorie
        </button>
      </div>`;

code = code.replace(oldHeader, newHeader);
fs.writeFileSync('src/components/MenuManager.tsx', code);
