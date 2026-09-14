const fs = require('fs');
let code = fs.readFileSync('src/pages/EmployeeOrdering.tsx', 'utf8');

const getSurchargeFn = `  const getVariantSurcharge = (productName: string, variant: string) => {
    if (!variant) return 0;
    const prod = assortment.find(p => p.name === productName);
    if (!prod || !prod.variant_surcharges) return 0;
    return prod.variant_surcharges[variant] || 0;
  };`;

const insertPoint = `  }, []);`;
code = code.replace(insertPoint, insertPoint + "\\n\\n" + getSurchargeFn);

// 1. Calc loop (could be in 2 places: total sum and submit)
const oldCalc = `      for (const [s, qty] of Object.entries(sizes as any)) {
        const sizeNum = String(s).split('_')[0];
        prodSum += (prices[\`\${prod}_\${sizeNum}\`] || 0) * (qty as number);
      }`;
const newCalc = `      for (const [s, qty] of Object.entries(sizes as any)) {
        const parts = String(s).split('_');
        const sizeNum = parts[0];
        const variant = parts[1] || '';
        const basePrice = prices[\`\${prod}_\${sizeNum}\`] || 0;
        const surcharge = getVariantSurcharge(prod, variant);
        prodSum += (basePrice + surcharge) * (qty as number);
      }`;
code = code.replace(oldCalc, newCalc); // First match
code = code.replace(oldCalc, newCalc); // Second match if exists

// 2. Submit loop price
const oldLoopPrice = `            const variant = parts[1] || '';
            const price = prices[\`\${prod}_\${size}\`] || 0;
            const finalProdName = variant ? \`\${prod} (\${variant})\` : prod;`;
const newLoopPrice = `            const variant = parts[1] || '';
            const basePrice = prices[\`\${prod}_\${size}\`] || 0;
            const surcharge = getVariantSurcharge(prod, variant);
            const price = basePrice + surcharge;
            const finalProdName = variant ? \`\${prod} (\${variant})\` : prod;`;
code = code.replace(oldLoopPrice, newLoopPrice);

// 3. Button
const targetButton = `                                    return (
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

const newButton = `                                    const currentVariant = (item.variants && item.variants.length > 0) ? (selectedVariants[product] || item.variants[0]) : '';
                                    const basePrice = prices[product + '_' + size];
                                    const displayPrice = basePrice !== undefined ? basePrice + getVariantSurcharge(product, currentVariant) : undefined;
                                    
                                    return (
                                    <button
                                      key={size}
                                      type="button"
                                      disabled={basePrice === undefined || ['uitverkocht', 'sold out', 'sold_out'].includes((item.status || '').toLowerCase())} onClick={() => {
                                        handlePortionSelect(product, size, currentVariant);
                                      }}
                                      className={\`p-2 text-xs rounded-lg border transition-colors flex flex-col items-center justify-center gap-0.5 \${(basePrice === undefined || ['uitverkocht', 'sold out', 'sold_out'].includes((item.status || '').toLowerCase())) ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-100' : selectedCountForSize > 0 ? 'bg-ob-blue text-white border-ob-blue font-semibold' : 'bg-white text-gray-600 border-gray-200 hover:border-ob-blue hover:-translate-y-1 hover:shadow-md transition-all'}\`}
                                    >
                                      <span className="font-semibold text-[13px]">{size} st.</span>
                                      <span className={selectedCountForSize > 0 ? 'text-white/90' : 'text-gray-500'}>{displayPrice !== undefined ? \`€\${displayPrice.toFixed(2)}\` : '-'}</span>
                                    </button>
                                  )})`;

code = code.replace(targetButton, newButton);
fs.writeFileSync('src/pages/EmployeeOrdering.tsx', code);
