const fs = require('fs');

let code = fs.readFileSync('src/pages/GuestOrdering.tsx', 'utf8');

// 1. Update setInfoModalProduct to include _openedFromCategory
code = code.replace(
  'onClick={() => item.extra_info && setInfoModalProduct(item)}',
  'onClick={() => item.extra_info && setInfoModalProduct({ ...item, _openedFromCategory: category.title })}'
);

// 2. Update list variant logic
const oldListLogic = `                            {/* Action section pushed to bottom */}
                            <div className="p-4 bg-gray-50/50 mt-auto border-t border-gray-100 flex flex-col gap-3">
                              {item.variants && item.variants.length > 0 && (
                                <select 
                                  className="w-full text-sm border-2 border-gray-200 rounded-full shadow-sm focus:border-ob-blue focus:ring-0 py-2 px-4 bg-white text-[#05053D] font-bold cursor-pointer hover:border-gray-300 transition-colors"
                                  value={selectedVariants[product] || item.variants[0]}
                                  onChange={(e) => setSelectedVariants({...selectedVariants, [product]: e.target.value})}
                                >
                                  {item.variants.map((v: string) => <option key={v} value={v}>{v}</option>)}
                                </select>
                              )}
                              
                              <div className="grid grid-cols-2 gap-2 w-full">
                                {productSizes.length > 0 ? (
                                  productSizes.map(size => {
                                    const currentVariant = (item.variants && item.variants.length > 0) ? (selectedVariants[product] || item.variants[0]) : '';`;

const newListLogic = `                            {/* Action section pushed to bottom */}
                            <div className="p-4 bg-gray-50/50 mt-auto border-t border-gray-100 flex flex-col gap-3">
                              {(() => {
                                const defaultVariant = (item.variants && item.variants.length > 0) ? (item.variants.find(v => v.toLowerCase() === category.title.toLowerCase()) || item.variants[0]) : '';
                                const variantKey = \`\${category.title}_\${product}\`;
                                const currentVariant = (item.variants && item.variants.length > 0) ? (selectedVariants[variantKey] || defaultVariant) : '';
                                
                                return (
                                  <>
                                    {item.variants && item.variants.length > 0 && (
                                      <select 
                                        className="w-full text-sm border-2 border-gray-200 rounded-full shadow-sm focus:border-ob-blue focus:ring-0 py-2 px-4 bg-white text-[#05053D] font-bold cursor-pointer hover:border-gray-300 transition-colors"
                                        value={currentVariant}
                                        onChange={(e) => setSelectedVariants({...selectedVariants, [variantKey]: e.target.value})}
                                      >
                                        {item.variants.map((v: string) => <option key={v} value={v}>{v}</option>)}
                                      </select>
                                    )}
                                    
                                    <div className="grid grid-cols-2 gap-2 w-full">
                                      {productSizes.length > 0 ? (
                                        productSizes.map(size => {
                                          const selKey = currentVariant ? \`\${size}_\${currentVariant}\` : size.toString();`;

code = code.replace(oldListLogic, newListLogic);


// 3. Update modal logic 
const oldModalLogic = `              <div className="mt-2 pt-4 border-t border-gray-100">
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
                    const selKey = currentVariant ? \`\${size}_\${currentVariant}\` : size.toString();`;

const newModalLogic = `              <div className="mt-2 pt-4 border-t border-gray-100">
                <h4 className="font-bold text-ob-blue mb-3">Toevoegen aan bestelling</h4>
                {(() => {
                  const modalCategory = infoModalProduct._openedFromCategory || '';
                  const defaultModalVariant = (infoModalProduct.variants && infoModalProduct.variants.length > 0) ? (infoModalProduct.variants.find((v: string) => v.toLowerCase() === modalCategory.toLowerCase()) || infoModalProduct.variants[0]) : '';
                  const variantKey = modalCategory ? \`\${modalCategory}_\${infoModalProduct.name}\` : infoModalProduct.name;
                  const currentVariant = (infoModalProduct.variants && infoModalProduct.variants.length > 0) ? (selectedVariants[variantKey] || defaultModalVariant) : '';
                  
                  return (
                    <>
                      {infoModalProduct.variants && infoModalProduct.variants.length > 0 && (
                        <select 
                          className="w-full text-sm border-2 border-gray-200 rounded-full shadow-sm focus:border-ob-blue focus:ring-0 py-2 px-4 bg-white text-[#05053D] font-bold cursor-pointer hover:border-gray-300 transition-colors mb-3"
                          value={currentVariant}
                          onChange={(e) => setSelectedVariants({...selectedVariants, [variantKey]: e.target.value})}
                        >
                          {infoModalProduct.variants.map((v: string) => <option key={v} value={v}>{v}</option>)}
                        </select>
                      )}
                      
                      <div className="grid grid-cols-2 gap-2 w-full">
                        {infoModalProduct.portions && [...infoModalProduct.portions].sort((a: number, b: number) => a - b).map((size: number) => {
                          const selKey = currentVariant ? \`\${size}_\${currentVariant}\` : size.toString();`;

code = code.replace(oldModalLogic, newModalLogic);

// We need to close the tags in the modal logic map
const oldModalClose = `                        )}
                      </button>
                    )
                  })}
                </div>
              </div>`;
const newModalClose = `                        )}
                      </button>
                    )
                  })}
                </div>
              </>
            );
          })()}
        </div>`;
code = code.replace(oldModalClose, newModalClose);

// We need to close the tags in the list logic map
const oldListClose = `                                        </div>
                                      )}
                                      {countForCurrentSelection > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[11px] font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md border-2 border-white">
                                          {countForCurrentSelection}
                                        </span>
                                      )}
                                    </button>
                                  )})
                                ) : (
                                  <div className="col-span-2 text-sm text-gray-500 text-center py-2 bg-gray-50 rounded-lg">Geen porties beschikbaar</div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>`;

const newListClose = `                                        </div>
                                      )}
                                      {countForCurrentSelection > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[11px] font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md border-2 border-white">
                                          {countForCurrentSelection}
                                        </span>
                                      )}
                                    </button>
                                  )})
                                ) : (
                                  <div className="col-span-2 text-sm text-gray-500 text-center py-2 bg-gray-50 rounded-lg">Geen porties beschikbaar</div>
                                )}
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>`;

// Wait, doing simple replacement for closing tags might be brittle.
// I'll do it more precisely.

fs.writeFileSync('src/pages/GuestOrdering.cjs', code);
