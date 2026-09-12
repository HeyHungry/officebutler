const fs = require('fs');
let code = fs.readFileSync('src/pages/EmployeeOrdering.tsx', 'utf8');

// Add wissen button next to title
code = code.replace(
  /<span className="font-semibold text-ob-text text-lg">\{product\}<\/span>/,
  `<div className="flex items-center gap-2">
      <span className="font-semibold text-ob-text text-lg">{product}</span>
      {isSelected && (
        <button type="button" onClick={() => setSelections(prev => { const c = {...prev}; delete c[product]; return c; })} className="text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200 uppercase font-bold">Wissen</button>
      )}
    </div>`
);

// Show quantity inside the size button
code = code.replace(
  /<div className="font-bold">\{size\}<\/div>/g,
  '<div className="font-bold">{isSizeSelected ? `${selections[product][size]}x ${size}` : size}</div>'
);

fs.writeFileSync('src/pages/EmployeeOrdering.tsx', code);
