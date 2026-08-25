import fs from 'fs';
let code = fs.readFileSync('src/pages/EmployeeOrdering.tsx', 'utf8');

// 1. Replace state
code = code.replace(
  "const [selectedProduct, setSelectedProduct] = useState('');\n  const [selectedPortion, setSelectedPortion] = useState<number | ''>('');",
  "const [selections, setSelections] = useState<Record<string, number>>({});"
);

// 2. Remove old state usage in handleLogout/handleSubmit
code = code.replace(
  "if (!selectedProduct || !selectedPortion || !selectedAddress || !phone) {",
  "if (Object.keys(selections).length === 0 || !selectedAddress || !phone) {"
);

// 3. Update handleSubmit
const newSubmit = `
    const totalOrderPrice = Object.entries(selections).reduce((sum, [prod, size]) => sum + (prices[\`\${prod}_\${size}\`] || 0), 0);
    
    if (maxSpendLimit !== null && totalOrderPrice > maxSpendLimit) {
      setError(\`Het maximaal toegestane bedrag per bestelling is €\${maxSpendLimit.toFixed(2)}. Het totaalbedrag is €\${totalOrderPrice.toFixed(2)}.\`);
      setIsSubmitting(false);
      return;
    }
    
    if (supabase) {
      try {
        const orderPromises = Object.entries(selections).map(([prod, size]) => {
          const price = prices[\`\${prod}_\${size}\`] || 0;
          return supabase.from('ob_orders').insert({
            company_id: companyId,
            user_id: userId,
            product_name: prod,
            portion_size: size,
            price: price,
            address_id: selectedAddress,
            phone: phone,
            notes: notes
          });
        });
        
        const results = await Promise.all(orderPromises);
        const errors = results.filter(r => r.error);
        if (errors.length > 0) throw errors[0].error;

        setOrderSuccess(true);
      } catch (e: any) {
        console.error(e);
        setError("Er ging iets mis bij het plaatsen van de bestelling.");
      }
    } else {
      // Mock success
      setTimeout(() => setOrderSuccess(true), 1000);
    }
`;

code = code.replace(/    const orderPrice = prices[\s\S]*?setTimeout\(\(\) => setOrderSuccess\(true\), 1000\);\n    \}/, newSubmit.trim());

// 4. Update the reset in orderSuccess
code = code.replace(
  "setSelectedProduct('');\n              setSelectedPortion('');",
  "setSelections({});"
);

// 5. Replace Step 1 and 2 UI
const newSteps = `
          {/* Step 1: Producten & Porties */}
          <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-ob-text flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-ob-blue text-white flex items-center justify-center text-sm">1</span> 
                Kies uw Snacks & Porties
              </h2>
              {maxSpendLimit !== null && (
                <div className="text-sm font-medium bg-blue-50 text-ob-blue px-3 py-1 rounded-lg">
                  Budget: €{maxSpendLimit.toFixed(2)}
                </div>
              )}
            </div>
            
            {assortment.length === 0 ? (
              <p className="text-gray-500 italic">Uw kantoor heeft momenteel geen assortiment geselecteerd. Neem contact op met uw office manager.</p>
            ) : (
              <div className="space-y-4">
                {assortment.map(product => {
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
                          {PORTION_SIZES.map(size => {
                            const price = prices[\`\${product}_\${size}\`];
                            const isSizeSelected = selections[product] === size;
                            
                            // If no price is set for this product+size, we might disable it, or just show '-'
                            const hasPrice = price !== undefined;
                            
                            return (
                              <button
                                key={size}
                                type="button"
                                disabled={!hasPrice}
                                onClick={() => {
                                  setSelections(prev => {
                                    const next = { ...prev };
                                    if (next[product] === size) delete next[product];
                                    else next[product] = size;
                                    return next;
                                  });
                                }}
                                className={\`flex-1 min-w-[80px] py-2 px-3 rounded-lg border text-center transition-all \${!hasPrice ? 'opacity-50 cursor-not-allowed border-gray-100 bg-gray-50' : isSizeSelected ? 'border-ob-blue bg-ob-blue text-white shadow-sm' : 'border-gray-200 hover:border-ob-blue text-gray-700 bg-white'}\`}
                              >
                                <div className="font-bold">{size}</div>
                                <div className={\`text-xs \${isSizeSelected ? 'text-blue-100' : 'text-gray-500'}\`}>
                                  {hasPrice ? \`€\${price.toFixed(2)}\` : '-'}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {Object.keys(selections).length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center">
                <span className="font-bold text-gray-700">Totaalbedrag:</span>
                <span className="text-2xl font-bold text-ob-blue">
                  €{Object.entries(selections).reduce((sum, [prod, size]) => sum + (prices[\`\${prod}_\${size}\`] || 0), 0).toFixed(2)}
                </span>
              </div>
            )}
          </section>
`;

code = code.replace(/\{.*?Step 1: Product Selection.*?\<\/section\>/s, newSteps.trim());

// 6. Change Step 3 to Step 2
code = code.replace('Step 3: Delivery Details', 'Step 2: Delivery Details');
code = code.replace('<span className="w-8 h-8 rounded-full bg-ob-blue text-white flex items-center justify-center text-sm">3</span>', '<span className="w-8 h-8 rounded-full bg-ob-blue text-white flex items-center justify-center text-sm">2</span>');

fs.writeFileSync('src/pages/EmployeeOrdering.tsx', code);
