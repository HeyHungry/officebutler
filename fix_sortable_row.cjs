const fs = require('fs');
let code = fs.readFileSync('src/components/MenuManager.tsx', 'utf8');

const targetRow = `<span className="font-semibold text-gray-800">{p.name}</span>
        </div>`;
const newRow = `<div className="flex flex-col">
            <span className="font-semibold text-gray-800">{p.name}</span>
            {p.variants && p.variants.length > 0 && <span className="text-[10px] text-gray-500">Varianten: {p.variants.join(', ')}</span>}
            {p.sauces && p.sauces.length > 0 && <span className="text-[10px] text-gray-500">Sauzen: {p.sauces.join(', ')}</span>}
          </div>
        </div>`;

code = code.replace(targetRow, newRow);
fs.writeFileSync('src/components/MenuManager.tsx', code);
