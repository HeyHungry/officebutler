const fs = require('fs');
let code = fs.readFileSync('src/pages/GuestOrdering.tsx', 'utf8');

const sizesLogic = `
                        let productSizes = Object.keys(prices)
                          .filter(key => key.startsWith(product + "_"))
                          .map(key => parseInt(key.split("_")[1], 10))
                          .sort((a, b) => a - b);
                        if (item.portions && item.portions.length > 0) {
                          productSizes = item.portions;
                        }
`;

code = code.replace(
  /const productSizes = Object\.keys\(prices\)[\s\S]*?\.sort\(\(a, b\) => a - b\);/,
  sizesLogic.trim()
);

const statusLogicRegex = /\{item\.status && !\['Actief', 'Inactief', 'Verborgen'\]\.includes\(item\.status\) && \(\s*<span className="text-\[10px\] uppercase tracking-wider bg-ob-blue\/10 text-ob-blue px-2 py-0\.5 rounded-full font-bold shrink-0">\{item\.status\}<\/span>\s*\)\}/;

const newStatusLogic = `
{item.status && !['actief', 'inactief', 'verborgen', 'active', 'inactive', 'hidden'].includes((item.status || '').toLowerCase()) && (
<span className={\`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold shrink-0 \${['uitverkocht', 'sold out', 'sold_out'].includes((item.status || '').toLowerCase()) ? 'bg-red-100 text-red-700' : 'bg-ob-blue/10 text-ob-blue'}\`}>{item.status}</span>
)}`;

code = code.replace(statusLogicRegex, newStatusLogic.trim());

// We also need to fix the buttons disabled/price check in GuestOrdering
// It loops over productSizes
// if price doesn't exist, it should say "Prijs onbekend" or disable
code = code.replace(
  /onClick=\{[^\}]*handlePortionSelect[^\}]*\}/g,
  "disabled={prices[product + '_' + size] === undefined || ['uitverkocht', 'sold out', 'sold_out'].includes((item.status || '').toLowerCase())} onClick={() => handlePortionSelect(product, size)}"
);
code = code.replace(
  /className=\{"p-2 text-xs rounded-lg border transition-colors flex flex-col items-center justify-center gap-0\.5 " \+ \(selectedSize === size \? 'bg-ob-blue text-white border-ob-blue font-semibold' : 'bg-white text-gray-600 border-gray-200 hover:border-ob-blue'\)\}/g,
  "className={`p-2 text-xs rounded-lg border transition-colors flex flex-col items-center justify-center gap-0.5 ${(prices[product + '_' + size] === undefined || ['uitverkocht', 'sold out', 'sold_out'].includes((item.status || '').toLowerCase())) ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-100' : selectedSize === size ? 'bg-ob-blue text-white border-ob-blue font-semibold' : 'bg-white text-gray-600 border-gray-200 hover:border-ob-blue'}`}"
);
code = code.replace(
  /<span className=\{selectedSize === size \? "text-white\/90" : "text-gray-500"\}>€\{prices\[product \+ "_" \+ size\]\.toFixed\(2\)\}<\/span>/g,
  "<span className={selectedSize === size ? 'text-white/90' : 'text-gray-500'}>{prices[product + '_' + size] !== undefined ? `€${prices[product + '_' + size].toFixed(2)}` : '-'}</span>"
);

fs.writeFileSync('src/pages/GuestOrdering.tsx', code);
console.log('GuestOrdering updated');
