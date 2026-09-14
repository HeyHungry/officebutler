const fs = require('fs');
let code = fs.readFileSync('src/pages/GuestOrdering.tsx', 'utf8');

// Add state for delivery methods
code = code.replace(/const \[categories, setCategories\] = useState<any\[\]>\(\[\]\);/, "const [categories, setCategories] = useState<any[]>([]);\n  const [deliveryMethods, setDeliveryMethods] = useState<any[]>([]);\n  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState<any>(null);");

// Fetch delivery methods
const newFetch = `
        if (globalPrices) {
          const pricesMap: Record<string, number> = {};
          globalPrices.forEach(p => {
            pricesMap[\`\${p.product_name}_\${p.portion_size}\`] = Number(p.price);
          });
          setPrices(pricesMap);
        }

        const { data: dmData } = await supabase.from('ob_delivery_methods').select('*').eq('is_active', true).order('sort_order', { ascending: true });
        if (dmData && dmData.length > 0) {
          setDeliveryMethods(dmData);
          // Set default to first option
          setSelectedDeliveryMethod(dmData[0]);
        }
`;
code = code.replace(/if \(globalPrices\) \{[\s\S]*?setPrices\(pricesMap\);\n\s*\}/, newFetch);

// Insert delivery row in ob_orders
const insertDeliveryRow = `
            for (let i = 0; i < (qty as number); i++) {
              orderPromises.push(supabase.from('ob_orders').insert({
                product_name: prod,
                portion_size: size,
                price: price,
                total_price: price,
                phone: phone,
                notes: fullNotes,
                delivery_date: deliveryMode === 'zsm' ? new Date().toISOString().split('T')[0] : deliveryDate,
                delivery_time: deliveryMode === 'zsm' ? 'Zo snel mogelijk' : deliveryTime
              }));
            }
          });
        });

        if (selectedDeliveryMethod && selectedDeliveryMethod.price > 0) {
          orderPromises.push(supabase.from('ob_orders').insert({
            product_name: 'Bezorging: ' + selectedDeliveryMethod.name,
            portion_size: 1,
            price: selectedDeliveryMethod.price,
            total_price: selectedDeliveryMethod.price,
            phone: phone,
            notes: fullNotes,
            delivery_date: deliveryMode === 'zsm' ? new Date().toISOString().split('T')[0] : deliveryDate,
            delivery_time: deliveryMode === 'zsm' ? 'Zo snel mogelijk' : deliveryTime
          }));
        }
`;
code = code.replace(/for \(let i = 0; i < \(qty as number\); i\+\+\) \{[\s\S]*?\}\);/, insertDeliveryRow);

// Render the delivery method selection at the top
const renderDeliveryMethod = `
      <div className="max-w-4xl mx-auto px-6 py-12 md:py-20 flex-1">
        
        {deliveryMethods.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-12">
            <h2 className="text-2xl font-serif font-bold text-[#05053D] mb-2">Kies je bezorgmethode</h2>
            <p className="text-gray-500 mb-6">Selecteer hoe je je bestelling wilt ontvangen of laten verzorgen.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {deliveryMethods.map(method => (
                <label key={method.id} className={\`flex flex-col p-4 border rounded-xl cursor-pointer transition-colors \${selectedDeliveryMethod?.id === method.id ? 'border-ob-blue bg-blue-50/30 ring-1 ring-ob-blue' : 'border-gray-200 hover:bg-gray-50'}\`}>
                  <div className="w-full h-32 rounded-lg overflow-hidden bg-gray-100 mb-4 shrink-0">
                    <img src={method.image_url} alt={method.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-start gap-3">
                    <input 
                      type="radio" 
                      name="delivery_method"
                      checked={selectedDeliveryMethod?.id === method.id}
                      onChange={() => setSelectedDeliveryMethod(method)}
                      className="w-5 h-5 mt-0.5 rounded-full border-gray-300 text-ob-blue focus:ring-ob-blue shrink-0" 
                    />
                    <div>
                      <span className="font-semibold text-gray-900 block text-lg">{method.name}</span>
                      <span className="text-xs text-gray-500 block mb-2">{method.description}</span>
                      <span className="font-bold text-[#05053D] block">
                        {method.price === 0 ? 'Gratis' : \`+ €\${Number(method.price).toFixed(2)}\`}
                      </span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-12">
`;
code = code.replace(/<div className="max-w-4xl mx-auto px-6 py-12 md:py-20 flex-1">\s*<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 mb-12">/, renderDeliveryMethod);

// Add delivery cost to total sum in render
const renderTotal = `
                  <div className="flex justify-between items-center text-xl font-bold mt-4 pt-4 border-t border-gray-200">
                    <span className="font-serif">Totaal:</span>
                    <span>€{(Object.entries(selections).reduce((sum, [prod, sizes]) => {
                      return sum + Object.entries(sizes as any).reduce((subSum, [sizeStr, qty]) => {
                        return subSum + ((prices[\`\${prod}_\${sizeStr}\`] || 0) * (qty as number));
                      }, 0);
                    }, 0) + (selectedDeliveryMethod?.price || 0)).toFixed(2)}</span>
                  </div>
`;
code = code.replace(/<div className="flex justify-between items-center text-xl font-bold mt-4 pt-4 border-t border-gray-200">[\s\S]*?<\/div>/, renderTotal);

fs.writeFileSync('src/pages/GuestOrdering.tsx', code);
