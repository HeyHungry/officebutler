const fs = require('fs');
let code = fs.readFileSync('src/pages/GuestOrdering.tsx', 'utf8');

code = code.replace("const [selections, setSelections]", "const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});\n  const [selections, setSelections]");

const targetRender = `                    <div key={product} className={\`border-2 rounded-xl p-4 transition-all \${isSelected ? 'border-ob-blue bg-blue-50/10' : 'border-gray-100'} \${['uitverkocht', 'sold out', 'sold_out'].includes((item.status || '').toLowerCase()) ? 'opacity-70' : ''}\`}>
                      <div className="flex flex-col md:flex-row md:items-start gap-4">`;

const newRender = `                    <div key={product} className={\`border-2 rounded-xl p-4 transition-all \${isSelected ? 'border-ob-blue bg-blue-50/10' : 'border-gray-100'} \${['uitverkocht', 'sold out', 'sold_out'].includes((item.status || '').toLowerCase()) ? 'opacity-70' : ''}\`}>
                      <div className="flex flex-col md:flex-row md:items-start gap-4">`;

code = code.replace(targetRender, newRender);

const targetSelect = `disabled={prices[product + '_' + size] === undefined || ['uitverkocht', 'sold out', 'sold_out'].includes((item.status || '').toLowerCase())} onClick={() => handlePortionSelect(product, size)}`;
const newSelect = `disabled={prices[product + '_' + size] === undefined || ['uitverkocht', 'sold out', 'sold_out'].includes((item.status || '').toLowerCase())} onClick={() => {
                                        const variant = (item.variants && item.variants.length > 0) ? (selectedVariants[product] || item.variants[0]) : '';
                                        handlePortionSelect(product, size, variant);
                                      }}`;
code = code.replace(targetSelect, newSelect);

fs.writeFileSync('src/pages/GuestOrdering.tsx', code);
