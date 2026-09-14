const fs = require('fs');
let code = fs.readFileSync('src/pages/EmployeeOrdering.tsx', 'utf8');

// 1. Types and selectedVariants state
code = code.replace(/const \[selections, setSelections\] = useState<Record<string, Record<number, number>>>\(\{\}\);/, "const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});\n  const [selections, setSelections] = useState<Record<string, Record<string, number>>>({});");

// 2. handlePortionSelect
const oldSelect = `const handlePortionSelect = (product: string, size: number) => {
    setSelections(prev => {
      const currentObj = prev[product] || {};
      const currentQty = currentObj[size] || 0;
      return {
        ...prev,
        [product]: {
          ...currentObj,
          [size]: currentQty + 1
        }
      };
    });
  };`;
const newSelect = `const handlePortionSelect = (product: string, size: number, variant: string = '') => {
    setSelections(prev => {
      const currentObj = prev[product] || {};
      const key = variant ? \`\${size}_\${variant}\` : \`\${size}\`;
      const currentQty = currentObj[key] || 0;
      return {
        ...prev,
        [product]: {
          ...currentObj,
          [key]: currentQty + 1
        }
      };
    });
  };`;
code = code.replace(oldSelect, newSelect);

// 3. price calc
code = code.replace(/prodSum \+= \(prices\[\`\$\{prod\}_\$\{s\}\`\] \|\| 0\) \* \(qty as number\);/g, "const sizeNum = String(s).split('_')[0];\n        prodSum += (prices[`${prod}_${sizeNum}`] || 0) * (qty as number);");

// 4. Submit loop
const oldLoop = `Object.entries(sizes as any).forEach(([sizeStr, qty]) => {
            const size = Number(sizeStr);
            const price = prices[\`\${prod}_\${size}\`] || 0;
            
            for (let i = 0; i < (qty as number); i++) {
              orderPromises.push(supabase.from('ob_orders').insert({
                product_name: prod,`;
const newLoop = `Object.entries(sizes as any).forEach(([sizeStr, qty]) => {
            const parts = sizeStr.split('_');
            const size = Number(parts[0]);
            const variant = parts[1] || '';
            const price = prices[\`\${prod}_\${size}\`] || 0;
            const finalProdName = variant ? \`\${prod} (\${variant})\` : prod;
            
            for (let i = 0; i < (qty as number); i++) {
              orderPromises.push(supabase.from('ob_orders').insert({
                product_name: finalProdName,`;
code = code.replace(oldLoop, newLoop);

// 5. Render Info
const targetInfo = `<h4 className="font-bold text-gray-900 leading-tight flex flex-wrap items-center gap-2">{product}
{item.status && !['actief', 'inactief', 'verborgen', 'active', 'inactive', 'hidden'].includes((item.status || '').toLowerCase()) && (
<span className={\`px-2 py-1 rounded-full text-xs font-medium shrink-0 \${['uitverkocht', 'sold out', 'sold_out'].includes((item.status || '').toLowerCase()) ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}\`}>{item.status === 'new' ? 'Nieuw' : item.status === 'popular' ? 'Meest Gekozen' : item.status === 'sold_out' ? 'Uitverkocht' : item.status === 'coming_soon' ? 'Binnenkort' : item.status}</span>
)}</h4>
                              </div>`;

const newInfo = `<h4 className="font-bold text-gray-900 leading-tight flex flex-wrap items-center gap-2">{product}
{item.status && !['actief', 'inactief', 'verborgen', 'active', 'inactive', 'hidden'].includes((item.status || '').toLowerCase()) && (
<span className={\`px-2 py-1 rounded-full text-xs font-medium shrink-0 \${['uitverkocht', 'sold out', 'sold_out'].includes((item.status || '').toLowerCase()) ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}\`}>{item.status === 'new' ? 'Nieuw' : item.status === 'popular' ? 'Meest Gekozen' : item.status === 'sold_out' ? 'Uitverkocht' : item.status === 'coming_soon' ? 'Binnenkort' : item.status}</span>
)}</h4>
                              </div>
                              
                              {item.sauces && item.sauces.length > 0 && (
                                <p className="text-xs text-gray-500 mb-2 italic">Inclusief: {item.sauces.join(', ')}</p>
                              )}
                              {item.variants && item.variants.length > 0 && (
                                <div className="mb-3">
                                  <select 
                                    className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-ob-blue focus:ring focus:ring-ob-blue focus:ring-opacity-50 py-1.5 px-2 bg-gray-50 text-gray-700 font-medium"
                                    value={selectedVariants[product] || item.variants[0]}
                                    onChange={(e) => setSelectedVariants({...selectedVariants, [product]: e.target.value})}
                                  >
                                    {item.variants.map((v: string) => <option key={v} value={v}>{v}</option>)}
                                  </select>
                                </div>
                              )}`;
code = code.replace(targetInfo, newInfo);

// 6. productSizes mapping
const oldMap = `productSizes.map(size => (
                                    <button
                                      key={size}
                                      type="button"
                                      disabled={prices[product + '_' + size] === undefined || ['uitverkocht', 'sold out', 'sold_out'].includes((item.status || '').toLowerCase())} onClick={() => handlePortionSelect(product, size)}
                                      className={\`p-2 text-xs rounded-lg border transition-colors flex flex-col items-center justify-center gap-0.5 \${(prices[product + '_' + size] === undefined || ['uitverkocht', 'sold out', 'sold_out'].includes((item.status || '').toLowerCase())) ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-100' : (prodSelections[size] || 0) > 0 ? 'bg-ob-blue text-white border-ob-blue font-semibold' : 'bg-white text-gray-600 border-gray-200 hover:border-ob-blue hover:-translate-y-1 hover:shadow-md transition-all'}\`}
                                    >
                                      <span className="font-semibold text-[13px]">{size} st.</span>
                                      <span className={(prodSelections[size] || 0) > 0 ? 'text-white/90' : 'text-gray-500'}>{prices[product + '_' + size] !== undefined ? \`€\${prices[product + '_' + size].toFixed(2)}\` : '-'}</span>
                                    </button>
                                  ))`;

const newMap = `productSizes.map(size => {
                                    const selectedCountForSize = Object.keys(prodSelections).reduce((sum, key) => (key === size.toString() || key.startsWith(size + '_')) ? sum + prodSelections[key] : sum, 0);
                                    return (
                                    <button
                                      key={size}
                                      type="button"
                                      disabled={prices[product + '_' + size] === undefined || ['uitverkocht', 'sold out', 'sold_out'].includes((item.status || '').toLowerCase())} onClick={() => {
                                        const variant = (item.variants && item.variants.length > 0) ? (selectedVariants[product] || item.variants[0]) : '';
                                        handlePortionSelect(product, size, variant);
                                      }}
                                      className={\`p-2 text-xs rounded-lg border transition-colors flex flex-col items-center justify-center gap-0.5 \${(prices[product + '_' + size] === undefined || ['uitverkocht', 'sold out', 'sold_out'].includes((item.status || '').toLowerCase())) ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-100' : selectedCountForSize > 0 ? 'bg-ob-blue text-white border-ob-blue font-semibold' : 'bg-white text-gray-600 border-gray-200 hover:border-ob-blue hover:-translate-y-1 hover:shadow-md transition-all'}\`}
                                    >
                                      <span className="font-semibold text-[13px]">{size} st.</span>
                                      <span className={selectedCountForSize > 0 ? 'text-white/90' : 'text-gray-500'}>{prices[product + '_' + size] !== undefined ? \`€\${prices[product + '_' + size].toFixed(2)}\` : '-'}</span>
                                    </button>
                                  )})`;
code = code.replace(oldMap, newMap);

// 7. Summary
const oldSummary = `<div className="flex flex-col gap-1">
                                    {Object.entries(prodSelections).map(([s, qty]) => (
                                      <span key={s} className="text-xs font-semibold text-ob-blue">{qty as number}x {s} st.</span>
                                    ))}
                                  </div>`;

const newSummary = `<div className="flex flex-col gap-1">
                                    {Object.entries(prodSelections).map(([s, qty]) => {
                                      const parts = s.split('_');
                                      const sizeNum = parts[0];
                                      const variant = parts[1] || '';
                                      return (
                                        <span key={s} className="text-xs font-semibold text-ob-blue">{qty as number}x {sizeNum} st. {variant && \`\${variant}\`}</span>
                                      );
                                    })}
                                  </div>`;
code = code.replace(oldSummary, newSummary);

fs.writeFileSync('src/pages/EmployeeOrdering.tsx', code);
