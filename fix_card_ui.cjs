const fs = require('fs');

function updateFile(file) {
  let code = fs.readFileSync(file, 'utf8');

  const oldCardStart = `<div key={product} className={"flex gap-4 border rounded-xl p-4 transition-all " + (Object.keys(prodSelections).length > 0 ? 'border-ob-blue bg-blue-50/30 shadow-sm' : 'border-gray-200 hover:border-ob-blue/30')}>
                            <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                              <img src={item.image_url || item.image} alt={product} className="w-full h-full object-cover" />
                            </div>
                            
                            <div className="flex-1 flex flex-col justify-between">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-gray-900 leading-tight flex flex-wrap items-center gap-2">{product}
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
                              
  const newCardStart = `<div key={product} className={"flex flex-col sm:flex-row gap-5 border rounded-xl p-5 transition-all " + (Object.keys(prodSelections).length > 0 ? 'border-ob-blue bg-blue-50/20 shadow-sm' : 'border-gray-200 hover:border-ob-blue/30 hover:shadow-sm')}>
                            <div className="w-full sm:w-32 h-40 sm:h-32 shrink-0 rounded-xl overflow-hidden bg-gray-100 shadow-inner">
                              <img src={item.image_url || item.image} alt={product} className="w-full h-full object-cover" />
                            </div>
                            
                            <div className="flex-1 flex flex-col justify-between">
                              <div className="flex justify-between items-start mb-3">
                                <h4 className="text-lg font-bold text-[#05053D] leading-tight flex flex-wrap items-center gap-2">{product}
{item.status && !['actief', 'inactief', 'verborgen', 'active', 'inactive', 'hidden'].includes((item.status || '').toLowerCase()) && (
<span className={\`px-2 py-1 rounded-full text-xs font-semibold shrink-0 \${['uitverkocht', 'sold out', 'sold_out'].includes((item.status || '').toLowerCase()) ? 'bg-red-100 text-red-700' : 'bg-[#151f33]/10 text-[#151f33]'}\`}>{item.status === 'new' ? 'Nieuw' : item.status === 'popular' ? 'Meest Gekozen' : item.status === 'sold_out' ? 'Uitverkocht' : item.status === 'coming_soon' ? 'Binnenkort' : item.status}</span>
)}</h4>
                              </div>
                              
                              {item.sauces && item.sauces.length > 0 && (
                                <div className="text-[13px] text-gray-700 font-medium mb-4 flex items-start gap-1.5 bg-yellow-50/50 p-2.5 rounded-lg border border-yellow-100/50">
                                  <span className="text-yellow-600 mt-0.5">✦</span> 
                                  <span>Inclusief: <span className="font-semibold text-gray-900">{item.sauces.join(', ')}</span></span>
                                </div>
                              )}
                              
                              {item.variants && item.variants.length > 0 && (
                                <div className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200 shadow-sm">
                                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">1. Kies Smaak / Variant</label>
                                  <select 
                                    className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-ob-blue focus:ring focus:ring-ob-blue focus:ring-opacity-50 py-2 px-3 bg-white text-gray-800 font-semibold cursor-pointer"
                                    value={selectedVariants[product] || item.variants[0]}
                                    onChange={(e) => setSelectedVariants({...selectedVariants, [product]: e.target.value})}
                                  >
                                    {item.variants.map((v: string) => <option key={v} value={v}>{v}</option>)}
                                  </select>
                                  <p className="text-[11px] text-gray-500 mt-2 italic leading-tight">Wissel van variant om van beide smaken een portie toe te voegen.</p>
                                </div>
                              )}
                              
                              {item.variants && item.variants.length > 0 && (
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 block">2. Voeg portie toe aan bestelling</label>
                              )}`;
  
  code = code.replace(oldCardStart, newCardStart);

  const oldMap = `                                {productSizes.length > 0 ? (
                                  productSizes.map(size => {
                                    const selectedCountForSize = Object.keys(prodSelections).reduce((sum, key) => (key === size.toString() || key.startsWith(size + '_')) ? sum + prodSelections[key] : sum, 0);
                                    const currentVariant = (item.variants && item.variants.length > 0) ? (selectedVariants[product] || item.variants[0]) : '';
                                    const basePrice = prices[product + '_' + size];
                                    const displayPrice = basePrice !== undefined ? basePrice + getVariantSurcharge(product, currentVariant, size) : undefined;
                                    
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
                                  
  const newMap = `                                {productSizes.length > 0 ? (
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
                                      className={\`relative p-3 text-sm rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 \${isDisabled ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-100' : countForCurrentSelection > 0 ? 'bg-[#151f33] text-white border-[#151f33] shadow-md scale-[1.02]' : 'bg-white text-gray-700 border-gray-200 hover:border-[#151f33] hover:shadow-md'}\`}
                                    >
                                      <span className="font-bold text-base">{size} stuks</span>
                                      <span className={\`text-xs font-medium \${countForCurrentSelection > 0 ? 'text-white/90' : 'text-gray-500'}\`}>{displayPrice !== undefined ? \`€\${displayPrice.toFixed(2)}\` : '-'}</span>
                                      
                                      {countForCurrentSelection > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-[#d4af37] text-white text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-sm border-2 border-white">
                                          {countForCurrentSelection}
                                        </span>
                                      )}
                                      
                                      {/* Show dot if other variant is selected for this size */}
                                      {countForCurrentSelection === 0 && totalCountForSize > 0 && (
                                        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-ob-blue/50" title="Je hebt deze portiegrootte al voor een andere variant gekozen"></span>
                                      )}
                                    </button>
                                  )})`;

  code = code.replace(oldMap, newMap);
  fs.writeFileSync(file, code);
}

updateFile('src/pages/GuestOrdering.tsx');
updateFile('src/pages/EmployeeOrdering.tsx');

