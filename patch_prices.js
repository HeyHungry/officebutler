import fs from 'fs';

let code = fs.readFileSync('src/components/ModeratorPanel.tsx', 'utf8');

if (!code.includes('const [dbProducts, setDbProducts]')) {
  // Add state
  code = code.replace(
    '  const [productPrices, setProductPrices] = useState<ObProductPrice[]>([]);',
    '  const [dbProducts, setDbProducts] = useState<any[]>([]);\n  const [productPrices, setProductPrices] = useState<ObProductPrice[]>([]);'
  );
  
  // Update fetchDashboardData to fetch products
  code = code.replace(
    "const { data: priceData } = await supabase.from('ob_product_prices').select('*');",
    "const { data: priceData } = await supabase.from('ob_product_prices').select('*');\n      const { data: prodData } = await supabase.from('ob_products').select('*');\n      if (prodData) { setDbProducts(prodData); if (prodData.length > 0 && selectedPriceProduct === AVAILABLE_PRODUCTS[0]) setSelectedPriceProduct(prodData[0].name); }"
  );

  // Update rendering of products select
  const findProductSelect = `{AVAILABLE_PRODUCTS.map(prod => (
                                 <option key={prod} value={prod}>{prod}</option>
                               ))}`;
  const replaceProductSelect = `{dbProducts.length > 0 ? dbProducts.map(prod => (
                                 <option key={prod.name} value={prod.name}>{prod.name}</option>
                               )) : AVAILABLE_PRODUCTS.map(prod => (
                                 <option key={prod} value={prod}>{prod}</option>
                               ))}`;
  code = code.replace(findProductSelect, replaceProductSelect);

  // Update PORTIONS rendering based on selectedProduct
  const findTableBody = `<tbody className="divide-y divide-gray-100">
                              {PORTIONS.map(portion => (
                                <tr key={portion} className="hover:bg-gray-50/50 transition-colors">`;
  
  const replaceTableBody = `{(() => {
                                const selectedProdObj = dbProducts.find(p => p.name === selectedPriceProduct);
                                const portionsToUse = selectedProdObj?.portions && selectedProdObj.portions.length > 0 ? selectedProdObj.portions : PORTIONS;
                                return (
                                  <tbody className="divide-y divide-gray-100">
                                    {portionsToUse.map((portion: number) => (
                                      <tr key={portion} className="hover:bg-gray-50/50 transition-colors">`
  code = code.replace(findTableBody, replaceTableBody);

  const findTableBodyEnd = `                                </tr>
                              ))}
                            </tbody>`;
  const replaceTableBodyEnd = `                                </tr>
                              ))}
                            </tbody>
                                );
                              })()}`;
  code = code.replace(findTableBodyEnd, replaceTableBodyEnd);

  fs.writeFileSync('src/components/ModeratorPanel.tsx', code);
  console.log("Patched ModeratorPanel pricing logic to use dbProducts.");
}
