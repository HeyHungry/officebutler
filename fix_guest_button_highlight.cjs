const fs = require('fs');
let code = fs.readFileSync('src/pages/GuestOrdering.tsx', 'utf8');

const oldMap = `productSizes.map(size => (
                                    <button
                                      key={size}
                                      type="button"
                                      disabled={prices[product + '_' + size] === undefined || ['uitverkocht', 'sold out', 'sold_out'].includes((item.status || '').toLowerCase())} onClick={() => {
                                        const variant = (item.variants && item.variants.length > 0) ? (selectedVariants[product] || item.variants[0]) : '';
                                        handlePortionSelect(product, size, variant);
                                      }}
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
fs.writeFileSync('src/pages/GuestOrdering.tsx', code);
