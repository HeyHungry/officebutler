import fs from 'fs';

let code = fs.readFileSync('src/pages/GuestOrdering.tsx', 'utf8');

if (!code.includes('const [dbProducts, setDbProducts] = useState<any[]>([])')) {
  // Add state
  code = code.replace(
    "  const [selections, setSelections] = useState<Record<string, number>>({});",
    "  const [selections, setSelections] = useState<Record<string, number>>({});\n  const [dbProducts, setDbProducts] = useState<any[]>([]);"
  );
  
  // Update useEffect to fetch products
  code = code.replace(
    "const { data: globalPrices } = await supabase.from('ob_product_prices').select('*');",
    "const { data: globalPrices } = await supabase.from('ob_product_prices').select('*');\n        const { data: prods } = await supabase.from('ob_products').select('*');\n        if (prods) setDbProducts(prods);"
  );

  // Re-define menuCategories dynamically
  const findMenuCategoriesUse = `          {menuCategories.map((category) => (
            <div key={category.title} className="mb-12">
              <h3 className="text-2xl font-serif text-[#05053D] mb-6 flex items-center gap-3">`;
              
  const replaceMenuCategoriesUse = `          {(() => {
              const activeProds = dbProducts.filter(p => p.status !== 'inactive');
              let cats = [];
              if (activeProds.length > 0) {
                const groups = activeProds.reduce((acc, p) => {
                  acc[p.category] = acc[p.category] || [];
                  acc[p.category].push(p);
                  return acc;
                }, {});
                cats = Object.entries(groups).map(([title, items]) => ({ title, items }));
              } else {
                cats = menuCategories; // fallback
              }
              return cats.map((category: any) => (
            <div key={category.title} className="mb-12">
              <h3 className="text-2xl font-serif text-[#05053D] mb-6 flex items-center gap-3">`;

  code = code.replace(findMenuCategoriesUse, replaceMenuCategoriesUse);
  
  const findMenuCategoriesEnd = `                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>`;
  const replaceMenuCategoriesEnd = `                  ))}
                </div>
              </div>
            </div>
          ));
          })()}
        </div>`;
  code = code.replace(findMenuCategoriesEnd, replaceMenuCategoriesEnd);

  // Update item rendering
  const findItemRender = `                        const product = item.name;
                        const selectedSize = selections[product];
                        const productSizes = Object.keys(prices)
                          .filter(key => key.startsWith(product + "_"))
                          .map(key => parseInt(key.split('_')[1]))
                          .sort((a, b) => a - b);`;
                          
  const replaceItemRender = `                        const product = item.name;
                        const selectedSize = selections[product];
                        let productSizes = [];
                        if (item.portions && item.portions.length > 0) {
                           productSizes = item.portions;
                        } else {
                           productSizes = Object.keys(prices)
                            .filter(key => key.startsWith(product + "_"))
                            .map(key => parseInt(key.split('_')[1]))
                            .sort((a, b) => a - b);
                        }`;
  code = code.replace(findItemRender, replaceItemRender);

  // Replace image tag with the badges
  const findImage = `<img src={item.image || item.image_url} alt={product} className="w-full h-full object-cover" />`;
  const replaceImage = `<img src={item.image || item.image_url} alt={product} className="w-full h-full object-cover" />
                              {item.status && item.status !== 'active' && item.status !== 'inactive' && (
                                <div className={\`absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider backdrop-blur-md 
                                  \${item.status === 'sold_out' ? 'bg-red-500/90 text-white' : ''}
                                  \${item.status === 'coming_soon' ? 'bg-yellow-400/90 text-black' : ''}
                                  \${item.status === 'new' ? 'bg-blue-500/90 text-white' : ''}
                                  \${item.status === 'popular' ? 'bg-purple-500/90 text-white' : ''}
                                \`}>
                                  {item.status === 'sold_out' ? 'Uitverkocht' : item.status === 'coming_soon' ? 'Binnenkort' : item.status === 'new' ? 'Nieuw' : 'Meest Gekozen'}
                                </div>
                              )}`;
  // Actually wait, let me just add the badges. But what if it's already disabled?
  // Let's also disable sizes if sold_out or coming_soon
  const findSizeButton = `onClick={() => handlePortionSelect(product, size)}`;
  const replaceSizeButton = `onClick={() => { if (item.status !== 'sold_out' && item.status !== 'coming_soon') handlePortionSelect(product, size); }}`;
  
  const findSizeClass = `className={\`flex-1 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer`;
  const replaceSizeClass = `className={\`flex-1 py-2 rounded-lg text-sm font-medium transition-colors \${(item.status === 'sold_out' || item.status === 'coming_soon') ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`;
  
  code = code.replace(findImage, replaceImage);
  code = code.replace(findImage, replaceImage); // Just in case it's there twice or I should just replace all.
  code = code.replaceAll(findSizeButton, replaceSizeButton);
  code = code.replaceAll(findSizeClass, replaceSizeClass);

  fs.writeFileSync('src/pages/GuestOrdering.tsx', code);
  console.log("Patched GuestOrdering.");
}
