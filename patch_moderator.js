import fs from 'fs';

let code = fs.readFileSync('src/components/ModeratorPanel.tsx', 'utf8');

// 1. Add types and constants
const typesAndConstants = `
const AVAILABLE_PRODUCTS = [
  'Bitterballen Deal', 'Dutch Classic Deal', 'Deluxe Deal', 'Chicken Deal', 'Vega Deal',
  'Snack Mix', 'Bitterballen', 'Vlammetjes', 'Frikandelletjes', 'Mini Kroketjes', 
  'Chicken Wings', 'Kipnuggets', 'Karaage Kip', 'Butterfly Gamba\\'s',
  'Kaasstengels', 'Curry Samosas', 'Mini Loempia', 'Vegan Bitterballen'
];
const PORTIONS = [25, 50, 100, 150];

type ObProductPrice = {
  id?: string;
  company_id: string | null;
  product_name: string;
  portion_size: number;
  price: number;
};
`;
code = code.replace("const DAYS_OF_WEEK = [", typesAndConstants + "\nconst DAYS_OF_WEEK = [");

// 2. Add state
const states = `
  const [productPrices, setProductPrices] = useState<ObProductPrice[]>([]);
  const [selectedPriceProduct, setSelectedPriceProduct] = useState(AVAILABLE_PRODUCTS[0]);
  const [selectedPriceCompany, setSelectedPriceCompany] = useState<string | null>(null);
`;
code = code.replace("const [prices, setPrices] = useState<ObPortionPrice[]>([]);", states);

// 3. Update fetch
const fetchReplacement = `
      const { data: priceData } = await supabase.from('ob_product_prices').select('*');
      if (priceData) setProductPrices(priceData);
`;
// We'll just replace the whole price fetch block
code = code.replace(/const { data: priceData } = await supabase\.from\('ob_portion_prices'\)[\s\S]*?\}\n/, fetchReplacement);

// 4. Update save function
const saveFunctionReplacement = `
  const handleSaveProductPrices = async () => {
    setIsSaving(true);
    try {
      if (supabase) {
        // We only save the current product & company combination to avoid huge updates
        // But for simplicity, let's just find the inputs and update them.
        // Actually, we manage state locally via handlePriceChange, so let's push the filtered ones to DB.
        const currentPrices = productPrices.filter(p => p.product_name === selectedPriceProduct && p.company_id === selectedPriceCompany);
        
        for (const p of currentPrices) {
          if (p.price > 0) {
            await supabase.from('ob_product_prices').upsert({
              company_id: selectedPriceCompany,
              product_name: selectedPriceProduct,
              portion_size: p.portion_size,
              price: p.price
            }, { onConflict: 'company_id, product_name, portion_size' });
          }
        }
        
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleProductPriceChange = (portion: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    setProductPrices(prev => {
      const exists = prev.find(p => p.product_name === selectedPriceProduct && p.company_id === selectedPriceCompany && p.portion_size === portion);
      if (exists) {
        return prev.map(p => p === exists ? { ...p, price: numValue } : p);
      } else {
        return [...prev, { company_id: selectedPriceCompany, product_name: selectedPriceProduct, portion_size: portion, price: numValue }];
      }
    });
  };
  
  // Also we need to get the display price
  const getDisplayPrice = (portion: number) => {
    const p = productPrices.find(p => p.product_name === selectedPriceProduct && p.company_id === selectedPriceCompany && p.portion_size === portion);
    return p ? p.price : '';
  };
`;

code = code.replace(/const handleSavePrices = async \(\) => \{[\s\S]*?setIsSaving\(false\);\n  \};/, saveFunctionReplacement);

// 5. Replace UI
const newPricesUI = `
                    ) : activeTab === 'prices' ? (
                      <div className="space-y-6 max-w-2xl">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
                          <div>
                            <h3 className="text-xl font-serif font-semibold text-[#05053D] mb-1">Prijzen & Deals Beheren</h3>
                            <p className="text-sm text-gray-500">Stel de prijzen in per product per portie, en pas eventueel specifieke deals per kantoor toe.</p>
                          </div>
                          <button onClick={handleSaveProductPrices} disabled={isSaving} className="bg-[#111827] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1f2937] transition-colors disabled:opacity-50 shrink-0">
                            {isSaving ? 'Bezig...' : 'Prijzen Opslaan'}
                          </button>
                        </div>
                        {saveSuccess && <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-6 text-sm flex items-center gap-2"><span>Prijzen succesvol opgeslagen!</span></div>}
                        
                        <div className="flex flex-col sm:flex-row gap-4 mb-6">
                           <div className="flex-1">
                             <label className="block text-sm font-semibold text-gray-700 mb-2">Product</label>
                             <select 
                               value={selectedPriceProduct}
                               onChange={(e) => setSelectedPriceProduct(e.target.value)}
                               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#151f33]"
                             >
                               {AVAILABLE_PRODUCTS.map(prod => (
                                 <option key={prod} value={prod}>{prod}</option>
                               ))}
                             </select>
                           </div>
                           <div className="flex-1">
                             <label className="block text-sm font-semibold text-gray-700 mb-2">Bedrijfsdeal (Optioneel)</label>
                             <select 
                               value={selectedPriceCompany || ''}
                               onChange={(e) => setSelectedPriceCompany(e.target.value === '' ? null : e.target.value)}
                               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#151f33]"
                             >
                               <option value="">Standaard (Geen deal)</option>
                               {customers.map(c => (
                                 <option key={c.id} value={c.id}>{c.name}</option>
                               ))}
                             </select>
                           </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                          <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                              <tr>
                                <th className="px-6 py-4 font-semibold text-gray-700">Portie Grootte</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 text-right">Prijs (€)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {PORTIONS.map(portion => (
                                <tr key={portion} className="hover:bg-gray-50/50 transition-colors">
                                  <td className="px-6 py-4 font-medium text-gray-900">{portion} stuks</td>
                                  <td className="px-6 py-4 text-right">
                                    <div className="relative inline-flex items-center justify-end w-32 ml-auto">
                                      <span className="absolute left-3 text-gray-500">€</span>
                                      <input 
                                        type="number" 
                                        min="0"
                                        step="0.01"
                                        value={getDisplayPrice(portion)}
                                        onChange={(e) => handleProductPriceChange(portion, e.target.value)}
                                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#151f33] focus:ring-1 focus:ring-[#151f33] text-right"
                                      />
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Laat het veld leeg als de portie niet beschikbaar is.</p>
                      </div>
`;
code = code.replace(/\) : activeTab === 'prices' \? \([\s\S]*?<\/table>\n\s*<\/div>\n\s*<\/div>/, newPricesUI.trim());


fs.writeFileSync('src/components/ModeratorPanel.tsx', code);
console.log("Patched ModeratorPanel.tsx");
