const fs = require('fs');

function fixFile(file) {
  let code = fs.readFileSync(file, 'utf8');

  // Let's just write a very dumb, safe script that finds the ENTIRE block between {category.items.map((item) => { and the END of the map
  const lines = code.split('\\n');
  let startIdx = -1;
  let endIdx = -1;
  
  for(let i=0; i<lines.length; i++) {
    if (lines[i].includes("{category.items.map((item) => {")) {
      startIdx = i;
    }
    // The closing is a line that has just "                      })}"
    if (startIdx !== -1 && lines[i].includes("                      })}") && !lines[i].includes("div")) {
      endIdx = i;
      break;
    }
  }

  if (startIdx !== -1 && endIdx !== -1) {
    const before = lines.slice(0, startIdx + 1).join('\\n');
    const after = lines.slice(endIdx).join('\\n');
    
    const newCardBody = `
                        const product = item.name;
                        const prodSelections = selections[product] || {};
                        return (
                          <div key={product} className={\`flex flex-col h-full border rounded-xl overflow-hidden transition-all \${Object.keys(prodSelections).length > 0 ? 'border-ob-blue shadow-md ring-1 ring-ob-blue/10 bg-white' : 'border-gray-200 bg-white hover:border-ob-blue/40 hover:shadow-sm'}\`}>
                            {/* Top info section */}
                            <div className="p-4 flex gap-4">
                              <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-100">
                                <img src={item.image_url || item.image} alt={product} className="w-full h-full object-cover" />
                              </div>
                              
                              <div className="flex-1 min-w-0 flex flex-col">
                                <h4 className="font-bold text-[15px] text-[#05053D] leading-tight mb-1.5">{product}</h4>
                                
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                  {item.status && !['actief', 'inactief', 'verborgen', 'active', 'inactive', 'hidden'].includes((item.status || '').toLowerCase()) && (
                                    <span className={\`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase \${['uitverkocht', 'sold out', 'sold_out'].includes((item.status || '').toLowerCase()) ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-blue-700 border border-blue-100'}\`}>
                                      {item.status === 'new' ? 'Nieuw' : item.status === 'popular' ? 'Meest Gekozen' : item.status === 'sold_out' ? 'Uitverkocht' : item.status === 'coming_soon' ? 'Binnenkort' : item.status}
                                    </span>
                                  )}
                                </div>

                                {item.sauces && item.sauces.length > 0 && (
                                  <p className="text-[11px] text-gray-500 font-medium flex items-center gap-1 mt-auto">
                                    <span className="text-[#d4af37]">✦</span> 
                                    <span>Inclusief: <span className="font-semibold text-gray-700">{item.sauces.join(', ')}</span></span>
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            {/* Action section pushed to bottom */}
                            <div className="p-4 bg-gray-50/50 mt-auto border-t border-gray-100 flex flex-col gap-3">
                              {item.variants && item.variants.length > 0 && (
                                <select 
                                  className="w-full text-[13px] border border-gray-300 rounded-lg shadow-sm focus:border-ob-blue focus:ring-1 focus:ring-ob-blue py-1.5 px-3 bg-white text-[#05053D] font-semibold cursor-pointer"
                                  value={selectedVariants[product] || item.variants[0]}
                                  onChange={(e) => setSelectedVariants({...selectedVariants, [product]: e.target.value})}
                                >
                                  {item.variants.map((v: string) => <option key={v} value={v}>{v}</option>)}
                                </select>
                              )}
                              
                              <div className="grid grid-cols-2 gap-2 w-full">
                                {productSizes.length > 0 ? (
                                  productSizes.map(size => {
                                    const currentVariant = (item.variants && item.variants.length > 0) ? (selectedVariants[product] || item.variants[0]) : '';
                                    const selKey = currentVariant ? \`\${size}_\${currentVariant}\` : size.toString();
                                    const countForCurrentSelection = prodSelections[selKey] || 0;
                                    const totalCountForSize = Object.keys(prodSelections).reduce((sum, key) => (key === size.toString() || key.startsWith(size + '_')) ? sum + prodSelections[key] : sum, 0);
                                    
                                    const basePrice = prices[product + '_' + size];
                                    const displayPrice = basePrice !== undefined ? basePrice + getVariantSurcharge(product, currentVariant, size) : undefined;
                                    
                                    const isSoldOut = ['uitverkocht', 'sold out', 'sold_out'].includes((item.status || '').toLowerCase());
                                    const isDisabled = basePrice === undefined || isSoldOut;
                                    
                                    return (
                                    <button
                                      key={size}
                                      type="button"
                                      disabled={isDisabled} 
                                      onClick={() => {
                                        handlePortionSelect(product, size, currentVariant);
                                      }}
                                      className={\`relative py-2 px-1 text-sm rounded-lg border transition-all flex flex-col items-center justify-center gap-0.5 \${isDisabled ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200' : countForCurrentSelection > 0 ? 'bg-[#151f33] text-white border-[#151f33] shadow-md' : 'bg-white text-gray-700 border-gray-200 hover:border-[#151f33] hover:shadow-sm'}\`}
                                    >
                                      <span className="font-bold text-[13px]">{size} st.</span>
                                      <span className={\`text-[11px] font-medium \${countForCurrentSelection > 0 ? 'text-white/90' : 'text-gray-500'}\`}>{displayPrice !== undefined ? \`€\${displayPrice.toFixed(2)}\` : '-'}</span>
                                      
                                      {countForCurrentSelection > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 bg-[#d4af37] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm border border-white">
                                          {countForCurrentSelection}
                                        </span>
                                      )}
                                      
                                      {countForCurrentSelection === 0 && totalCountForSize > 0 && (
                                        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-ob-blue/40" title="Al gekozen in een andere variant"></span>
                                      )}
                                    </button>
                                  )})
                                ) : (
                                  <span className="text-xs text-gray-400 italic col-span-2">Prijs wordt geladen...</span>
                                )}
                              </div>

                              {Object.keys(prodSelections).length > 0 && (
                                <div className="mt-2 pt-3 border-t border-gray-200">
                                  <div className="flex flex-col gap-1">
                                    {Object.entries(prodSelections).map(([s, qty]) => {
                                      const parts = s.split('_');
                                      const sizeNum = parts[0];
                                      const variant = parts[1] || '';
                                      return (
                                        <div key={s} className="flex justify-between items-center">
                                          <span className="text-[11px] font-semibold text-[#151f33]">{qty as number}x {sizeNum} st. {variant && <span className="text-gray-500 font-normal">({variant})</span>}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );`;
                        
    fs.writeFileSync(file, before + '\\n' + newCardBody + '\\n' + after);
  }
}

fixFile('src/pages/GuestOrdering.tsx');
fixFile('src/pages/EmployeeOrdering.tsx');

