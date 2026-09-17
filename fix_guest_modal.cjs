const fs = require('fs');
let code = fs.readFileSync('src/pages/GuestOrdering.tsx', 'utf8');

const oldModal = `{infoModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setInfoModalProduct(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setInfoModalProduct(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900"><X size={20} /></button>
            <h3 className="text-2xl font-serif font-bold text-ob-blue mb-4 pr-6">{infoModalProduct.name}</h3>
            <div className="text-gray-600 whitespace-pre-wrap">{infoModalProduct.extra_info}</div>
          </div>
        </div>
      )}`;

const newModal = `{infoModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setInfoModalProduct(null)}>
          <div className="bg-white rounded-2xl p-0 max-w-sm w-full shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <button onClick={() => setInfoModalProduct(null)} className="absolute top-4 right-4 text-white bg-black/40 hover:bg-black/60 rounded-full p-1.5 backdrop-blur-sm z-10 transition-colors">
              <X size={20} />
            </button>
            
            {(infoModalProduct.image_url || infoModalProduct.image) ? (
               <div className="w-full h-48 sm:h-56 shrink-0 bg-gray-100">
                 <img src={infoModalProduct.image_url || infoModalProduct.image} alt={infoModalProduct.name} className="w-full h-full object-cover" />
               </div>
            ) : null}
            
            <div className="p-6 overflow-y-auto flex flex-col gap-4">
              <div>
                <h3 className="text-2xl font-serif font-bold text-ob-blue pr-6 mb-2">{infoModalProduct.name}</h3>
                {infoModalProduct.extra_info && <div className="text-gray-600 whitespace-pre-wrap">{infoModalProduct.extra_info}</div>}
              </div>
              
              <div className="mt-2 pt-4 border-t border-gray-100">
                <h4 className="font-bold text-ob-blue mb-3">Toevoegen aan bestelling</h4>
                {infoModalProduct.variants && infoModalProduct.variants.length > 0 && (
                  <select 
                    className="w-full text-sm border-2 border-gray-200 rounded-full shadow-sm focus:border-ob-blue focus:ring-0 py-2 px-4 bg-white text-[#05053D] font-bold cursor-pointer hover:border-gray-300 transition-colors mb-3"
                    value={selectedVariants[infoModalProduct.name] || infoModalProduct.variants[0]}
                    onChange={(e) => setSelectedVariants({...selectedVariants, [infoModalProduct.name]: e.target.value})}
                  >
                    {infoModalProduct.variants.map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                )}
                
                <div className="grid grid-cols-2 gap-2 w-full">
                  {infoModalProduct.portions && [...infoModalProduct.portions].sort((a, b) => a - b).map(size => {
                    const currentVariant = (infoModalProduct.variants && infoModalProduct.variants.length > 0) ? (selectedVariants[infoModalProduct.name] || infoModalProduct.variants[0]) : '';
                    const selKey = currentVariant ? \`\${size}_\${currentVariant}\` : size.toString();
                    const prodSelections = selections[infoModalProduct.name] || {};
                    const countForCurrentSelection = prodSelections[selKey] || 0;
                    
                    const basePrice = prices[infoModalProduct.name + '_' + size];
                    const displayPrice = basePrice !== undefined ? basePrice + getVariantSurcharge(infoModalProduct.name, currentVariant, size) : undefined;
                    
                    const isSoldOut = ['uitverkocht', 'sold out', 'sold_out'].includes((infoModalProduct.status || '').toLowerCase());
                    const isDisabled = basePrice === undefined || isSoldOut;
                    
                    return (
                      <button
                        key={size}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => {
                          handlePortionSelect(infoModalProduct.name, size, currentVariant);
                        }}
                        className={\`relative py-3 px-1 text-sm rounded-lg border transition-all flex flex-col items-center justify-center gap-1 \${isDisabled ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200' : countForCurrentSelection > 0 ? 'bg-[#151f33] text-white border-[#151f33] shadow-md' : 'bg-white text-gray-700 border-gray-200 hover:border-[#151f33] hover:shadow-sm'}\`}
                      >
                        <span className="font-bold text-[14px]">{size} stuks</span>
                        <span className={\`text-[12px] font-medium \${countForCurrentSelection > 0 ? 'text-white/90' : 'text-gray-500'}\`}>{displayPrice !== undefined ? \`€\${displayPrice.toFixed(2)}\` : '-'}</span>
                        
                        {countForCurrentSelection > 0 && (
                          <div 
                            className="absolute -top-2 -right-2 bg-red-500 text-white text-[11px] font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md border-2 border-white hover:bg-red-600 transition-colors z-10 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePortionRemove(infoModalProduct.name, size, currentVariant);
                            }}
                          >
                            <X size={12} />
                          </div>
                        )}
                        {countForCurrentSelection > 0 && (
                          <span className="absolute -top-2 -left-2 bg-blue-500 text-white text-[11px] font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md border-2 border-white">
                            {countForCurrentSelection}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}`;

code = code.replace(oldModal, newModal);
fs.writeFileSync('src/pages/GuestOrdering.tsx', code);
