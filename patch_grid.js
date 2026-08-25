import fs from 'fs';
let code = fs.readFileSync('src/pages/GuestOrdering.tsx', 'utf8');

const target = `                              <div className="flex flex-wrap gap-2 mt-auto">
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

const replacement = `                              <div className="grid grid-cols-2 gap-2 mt-auto w-full">
                                {productSizes.length > 0 ? (
                                  productSizes.map(size => (
                                    <button
                                      key={size}
                                      type="button"
                                      onClick={() => handlePortionSelect(product, size)}
                                      className={"p-2 text-xs rounded-lg border transition-colors flex flex-col items-center justify-center gap-0.5 " + (selectedSize === size ? 'bg-ob-blue text-white border-ob-blue font-semibold' : 'bg-white text-gray-600 border-gray-200 hover:border-ob-blue')}
                                    >
                                      <span className="font-semibold text-[13px]">{size} st.</span>
                                      <span className={selectedSize === size ? "text-white/90" : "text-gray-500"}>€{prices[product + "_" + size].toFixed(2)}</span>
                                    </button>
                                  ))
                                ) : (
                                  <span className="text-xs text-gray-400 italic col-span-2">Prijs wordt geladen...</span>
                                )}
                              </div>`;

if (code.includes(target)) {
  fs.writeFileSync('src/pages/GuestOrdering.tsx', code.replace(target, replacement));
  console.log("Patched successfully.");
} else {
  console.log("Target not found!");
}
