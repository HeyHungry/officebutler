import fs from 'fs';
let code = fs.readFileSync('src/pages/CompanyDashboard.tsx', 'utf8');

// 1. Add 'orders' to Tab type
code = code.replace(
  "type Tab = 'settings' | 'addresses' | 'employees' | 'assortment';",
  "type Tab = 'settings' | 'addresses' | 'employees' | 'assortment' | 'orders';"
);

// 2. Add orders state
code = code.replace(
  "const [employees, setEmployees] = useState<any[]>([]);",
  "const [employees, setEmployees] = useState<any[]>([]);\n  const [orders, setOrders] = useState<any[]>([]);"
);

// 3. Fetch orders
code = code.replace(
  "if (empData) setEmployees(empData);",
  `if (empData) setEmployees(empData);
        
        // Fetch orders
        const { data: orderData } = await supabase.from('ob_orders').select('*').eq('company_id', comp.id).order('created_at', { ascending: false });
        if (orderData) setOrders(orderData);`
);

// 4. Add the tab button
code = code.replace(
  `<button onClick={() => setActiveTab('assortment')}`,
  `<button onClick={() => setActiveTab('orders')} className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors \${activeTab === 'orders' ? 'bg-blue-50 text-ob-blue' : 'text-gray-600 hover:bg-gray-50'}\`}>
                    <ShoppingBag size={20} />
                    <span>Bestelgeschiedenis</span>
                  </button>
                  <button onClick={() => setActiveTab('assortment')}`
);

// 5. Add the tab content
const tabContent = `
            {/* Tab: Orders */}
            {activeTab === 'orders' && (
              <div className="space-y-6 max-w-5xl">
                <div>
                  <h2 className="text-xl font-bold text-ob-text mb-2">Bestelgeschiedenis</h2>
                  <p className="text-gray-500 text-sm">Een overzicht van alle geplaatste bestellingen door u of uw werknemers.</p>
                </div>
                
                {orders.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <ShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">Geen bestellingen gevonden</h3>
                    <p className="text-gray-500 text-sm">Er zijn nog geen bestellingen geplaatst door dit bedrijf.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
                          <th className="p-4 font-semibold">Datum (Besteld)</th>
                          <th className="p-4 font-semibold">Product</th>
                          <th className="p-4 font-semibold">Aantal</th>
                          <th className="p-4 font-semibold">Prijs</th>
                          <th className="p-4 font-semibold">Totaalprijs</th>
                          <th className="p-4 font-semibold">Gewenste Levering</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {orders.map((order, i) => (
                          <tr key={order.id || i} className="hover:bg-gray-50/50">
                            <td className="p-4 text-sm text-gray-800">{new Date(order.created_at).toLocaleString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                            <td className="p-4 text-sm text-gray-800 font-medium">{order.product_name}</td>
                            <td className="p-4 text-sm text-gray-600">{order.portion_size} stuks</td>
                            <td className="p-4 text-sm text-gray-600">€{Number(order.price || 0).toFixed(2)}</td>
                            <td className="p-4 text-sm text-gray-800 font-semibold">€{Number(order.total_price || 0).toFixed(2)}</td>
                            <td className="p-4 text-sm text-gray-600">
                              {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString('nl-NL') : 'Onbekend'}{order.delivery_time ? \` - \${order.delivery_time}\` : ''}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
`;

code = code.replace(
  `{/* Tab: Assortment */}`,
  tabContent + "\n\n            {/* Tab: Assortment */}"
);

fs.writeFileSync('src/pages/CompanyDashboard.tsx', code);
console.log("Patched CompanyDashboard.tsx");
