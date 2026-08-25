import fs from 'fs';
let code = fs.readFileSync('src/pages/GuestOrdering.tsx', 'utf8');

const target = `                        const price25 = prices[product + "_25"];
                        const price50 = prices[product + "_50"];
                        const selectedSize = selections[product];
                        
                        return (
                          <div key={product} className={"flex gap-4 border rounded-xl p-4 transition-all " + (selectedSize ? 'border-ob-blue bg-blue-50/30 shadow-sm' : 'border-gray-200 hover:border-ob-blue/30')}>
                            <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                              <img src={item.image} alt={product} className="w-full h-full object-cover" />
                            </div>
                            
                            <div className="flex-1 flex flex-col justify-between">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-gray-900 leading-tight">{product}</h4>
                              </div>
                              
                              <div className="flex flex-wrap gap-2 mt-auto">
                                {price25 !== undefined && (
                                  <button
                                    type="button"
                                    onClick={() => handlePortionSelect(product, 25)}
                                    className={"px-3 py-1.5 text-xs rounded-lg border transition-colors " + (selectedSize === 25 ? 'bg-ob-blue text-white border-ob-blue font-semibold' : 'bg-white text-gray-600 border-gray-200 hover:border-ob-blue')}
                                  >
                                    25 st. (€{price25.toFixed(2)})
                                  </button>
                                )}
                                {price50 !== undefined && (
                                  <button
                                    type="button"
                                    onClick={() => handlePortionSelect(product, 50)}
                                    className={"px-3 py-1.5 text-xs rounded-lg border transition-colors " + (selectedSize === 50 ? 'bg-ob-blue text-white border-ob-blue font-semibold' : 'bg-white text-gray-600 border-gray-200 hover:border-ob-blue')}
                                  >
                                    50 st. (€{price50.toFixed(2)})
                                  </button>
                                )}
                                {price25 === undefined && price50 === undefined && (
                                  <span className="text-xs text-gray-400 italic">Prijs wordt geladen...</span>
                                )}
                              </div>`;

const replacement = `                        const selectedSize = selections[product];
                        const productSizes = Object.keys(prices)
                          .filter(key => key.startsWith(product + "_"))
                          .map(key => parseInt(key.split("_")[1], 10))
                          .sort((a, b) => a - b);
                        
                        return (
                          <div key={product} className={"flex gap-4 border rounded-xl p-4 transition-all " + (selectedSize ? 'border-ob-blue bg-blue-50/30 shadow-sm' : 'border-gray-200 hover:border-ob-blue/30')}>
                            <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                              <img src={item.image} alt={product} className="w-full h-full object-cover" />
                            </div>
                            
                            <div className="flex-1 flex flex-col justify-between">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-gray-900 leading-tight">{product}</h4>
                              </div>
                              
                              <div className="flex flex-wrap gap-2 mt-auto">
                                {productSizes.length > 0 ? (
                                  productSizes.map(size => (
                                    <button
                                      key={size}
                                      type="button"
                                      onClick={() => handlePortionSelect(product, size)}
                                      className={"px-3 py-1.5 text-xs rounded-lg border transition-colors " + (selectedSize === size ? 'bg-ob-blue text-white border-ob-blue font-semibold' : 'bg-white text-gray-600 border-gray-200 hover:border-ob-blue')}
                                    >
                                      {size} st. (€{prices[product + "_" + size].toFixed(2)})
                                    </button>
                                  ))
                                ) : (
                                  <span className="text-xs text-gray-400 italic">Prijs wordt geladen...</span>
                                )}
                              </div>`;

if (code.includes(target)) {
  fs.writeFileSync('src/pages/GuestOrdering.tsx', code.replace(target, replacement));
  console.log("Patched successfully.");
} else {
  console.log("Target not found!");
}
