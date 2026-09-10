import fs from 'fs';
let code = fs.readFileSync('src/components/ModeratorPanel.tsx', 'utf8');

// 1. Update Tab type
code = code.replace(
  "type Tab = 'store' | 'registrations' | 'prices' | 'customers';",
  "type Tab = 'store' | 'registrations' | 'prices' | 'customers' | 'orders';"
);

// 2. Add orders state
code = code.replace(
  "const [productPrices, setProductPrices] = useState<any[]>([]);",
  "const [productPrices, setProductPrices] = useState<any[]>([]);\n  const [orders, setOrders] = useState<any[]>([]);"
);

// 3. Fetch orders
code = code.replace(
  "if (priceData) setProductPrices(priceData);",
  `if (priceData) setProductPrices(priceData);
      
      const { data: orderData } = await supabase.from('ob_orders').select('*, ob_companies(name)').order('created_at', { ascending: false });
      if (orderData) setOrders(orderData);`
);

// 4. Add the tab button
code = code.replace(
  `<button onClick={() => { setActiveTab('prices');`,
  `<button onClick={() => { setActiveTab('orders'); setImpersonating(false); setImpersonateCompany(null); }}
                        className={\`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors shrink-0 md:shrink \${activeTab === 'orders' && !impersonating ? 'bg-[#151f33] text-white' : 'text-gray-600 hover:bg-gray-100'}\`}>
                        <ShoppingBag size={18} />
                        <span>Bestellingen</span>
                      </button>
                      <button onClick={() => { setActiveTab('prices');`
);

// 5. Add the tab content
const tabContent = `
                    ) : activeTab === 'orders' ? (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-[#05053D]">Alle Bestellingen</h3>
                            <p className="text-sm text-gray-500">Overzicht van alle geplaatste bestellingen (inclusief gasten).</p>
                          </div>
                          <div className="text-sm text-gray-500 font-medium">{orders.length} bestellingen totaal</div>
                        </div>

                        {orders.length === 0 ? (
                          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                            <ShoppingBag className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                            <p className="text-gray-500">Geen bestellingen gevonden.</p>
                          </div>
                        ) : (
                          <div className="bg-white border border-gray-200 rounded-xl overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                              <thead>
                                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-200">
                                  <th className="p-4 font-semibold">Datum (Besteld)</th>
                                  <th className="p-4 font-semibold">Bedrijf / Klant</th>
                                  <th className="p-4 font-semibold">Product & Aantal</th>
                                  <th className="p-4 font-semibold">Prijs</th>
                                  <th className="p-4 font-semibold">Totaalprijs</th>
                                  <th className="p-4 font-semibold">Gewenste Levering</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {orders.map((order, i) => (
                                  <tr key={order.id || i} className="hover:bg-gray-50/50">
                                    <td className="p-4 text-sm text-gray-800 whitespace-nowrap">{new Date(order.created_at).toLocaleString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                                    <td className="p-4 text-sm text-gray-800 font-medium">
                                      {order.ob_companies?.name || 'Gast Bestelling'}
                                    </td>
                                    <td className="p-4 text-sm text-gray-800">
                                      <span className="font-semibold">{order.product_name}</span> <span className="text-gray-500">({order.portion_size} stuks)</span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">€{Number(order.price || 0).toFixed(2)}</td>
                                    <td className="p-4 text-sm text-gray-800 font-bold">€{Number(order.total_price || 0).toFixed(2)}</td>
                                    <td className="p-4 text-sm text-gray-600 whitespace-nowrap">
                                      {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString('nl-NL') : 'Onbekend'}{order.delivery_time ? \` - \${order.delivery_time}\` : ''}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
`;

code = code.replace(
  `) : activeTab === 'prices' ? (`,
  tabContent + "\n                    ) : activeTab === 'prices' ? ("
);

fs.writeFileSync('src/components/ModeratorPanel.tsx', code);
console.log("Patched ModeratorPanel.tsx");
