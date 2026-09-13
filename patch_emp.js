import fs from 'fs';

let code = fs.readFileSync('src/pages/EmployeeOrdering.tsx', 'utf8');

// 1. Add dbProducts state
code = code.replace(
  "  const [assortment, setAssortment] = useState<string[]>([]);",
  "  const [assortment, setAssortment] = useState<string[]>([]);\n  const [dbProducts, setDbProducts] = useState<any[]>([]);"
);

// 2. Fetch dbProducts
code = code.replace(
  "      const { data: priceData } = await supabase.from('ob_product_prices').select('*');",
  "      const { data: prods } = await supabase.from('ob_products').select('*');\n      if (prods) setDbProducts(prods);\n      const { data: priceData } = await supabase.from('ob_product_prices').select('*');"
);

// 3. Render items
const findRender = `{assortment.map(product => {
                  const isSelected = !!selections[product];
                  return (
                    <div key={product} className={\`border-2 rounded-xl p-4 transition-all \${isSelected ? 'border-ob-blue bg-blue-50/10' : 'border-gray-100'}\`}>
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex items-center gap-4 md:w-1/3">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                            {PRODUCT_IMAGES[product] ? (
                              <img src={PRODUCT_IMAGES[product]} alt={product} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <PackageOpen size={24} />
                              </div>
                            )}
                          </div>
                          <span className="font-semibold text-ob-text text-lg">{product}</span>
                        </div>
                        
                        <div className="flex-1 flex flex-wrap gap-2">
                          {PORTION_SIZES.map(size => {`;
                          
const replaceRender = `{(() => {
                  const itemsToRender = dbProducts.length > 0 
                    ? dbProducts.filter(p => assortment.includes(p.name) && p.status !== 'inactive')
                    : assortment.map(name => ({ name }));
                    
                  return itemsToRender.map((item: any) => {
                    const product = item.name;
                    const isSelected = !!selections[product];
                    let productSizes = PORTION_SIZES;
                    if (item.portions && item.portions.length > 0) {
                      productSizes = item.portions;
                    }
                    
                  return (
                    <div key={product} className={\`border-2 rounded-xl p-4 transition-all \${isSelected ? 'border-ob-blue bg-blue-50/10' : 'border-gray-100'} \${item.status === 'sold_out' || item.status === 'coming_soon' ? 'opacity-70' : ''}\`}>
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex items-center gap-4 md:w-1/3">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-50 shrink-0 relative">
                            {item.image_url || PRODUCT_IMAGES[product] ? (
                              <img src={item.image_url || PRODUCT_IMAGES[product]} alt={product} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <PackageOpen size={24} />
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-semibold text-ob-text text-lg">{product}</span>
                            {item.status && item.status !== 'active' && (
                                <div className={\`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider w-max
                                  \${item.status === 'sold_out' ? 'bg-red-500/90 text-white' : ''}
                                  \${item.status === 'coming_soon' ? 'bg-yellow-400/90 text-black' : ''}
                                  \${item.status === 'new' ? 'bg-blue-500/90 text-white' : ''}
                                  \${item.status === 'popular' ? 'bg-purple-500/90 text-white' : ''}
                                \`}>
                                  {item.status === 'sold_out' ? 'Uitverkocht' : item.status === 'coming_soon' ? 'Binnenkort' : item.status === 'new' ? 'Nieuw' : 'Meest Gekozen'}
                                </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex-1 flex flex-wrap gap-2">
                          {productSizes.map((size: number) => {`;
code = code.replace(findRender, replaceRender);

const findEndRender = `                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}`;
const replaceEndRender = `                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                });
                })()}`;
code = code.replace(findEndRender, replaceEndRender);

const findSizeClick = `onClick={() => handleSelection(product, size)}`;
const replaceSizeClick = `onClick={() => { if (item.status !== 'sold_out' && item.status !== 'coming_soon') handleSelection(product, size); }}`;
const findSizeDisabledClass = `disabled={!hasPrice}`;
const replaceSizeDisabledClass = `disabled={!hasPrice || item.status === 'sold_out' || item.status === 'coming_soon'}`;

code = code.replaceAll(findSizeClick, replaceSizeClick);
code = code.replaceAll(findSizeDisabledClass, replaceSizeDisabledClass);

fs.writeFileSync('src/pages/EmployeeOrdering.tsx', code);
console.log("Patched EmployeeOrdering.");

