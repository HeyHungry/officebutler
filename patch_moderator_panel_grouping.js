import fs from 'fs';

let code = fs.readFileSync('src/components/ModeratorPanel.tsx', 'utf8');

const targetTable = `                        {orders.length === 0 ? (
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
                        )}`;

const replacementTable = `                        {(() => {
                          const groupedOrders = Object.values(orders.reduce((acc, order) => {
                            const dateKey = new Date(order.created_at).toISOString().slice(0, 16);
                            const key = \`\${order.company_id || 'gast'}_\${dateKey}_\${order.delivery_date}_\${order.delivery_time}\`;
                            if (!acc[key]) {
                              acc[key] = {
                                id: key,
                                created_at: order.created_at,
                                company_name: order.ob_companies?.name || 'Gast Bestelling',
                                delivery_date: order.delivery_date,
                                delivery_time: order.delivery_time,
                                total_order_price: 0,
                                items: []
                              };
                            }
                            acc[key].items.push(order);
                            acc[key].total_order_price += Number(order.total_price || 0);
                            return acc;
                          }, {} as Record<string, any>)).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

                          if (groupedOrders.length === 0) {
                            return (
                              <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                                <ShoppingBag className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                                <p className="text-gray-500">Geen bestellingen gevonden.</p>
                              </div>
                            );
                          }

                          return (
                            <div className="w-full max-w-full overflow-x-auto bg-white border border-gray-200 rounded-xl">
                              <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                  <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-200">
                                    <th className="p-4 font-semibold whitespace-nowrap">Datum (Besteld)</th>
                                    <th className="p-4 font-semibold">Bedrijf / Klant</th>
                                    <th className="p-4 font-semibold">Bestelling (Producten)</th>
                                    <th className="p-4 font-semibold text-right">Totaalprijs</th>
                                    <th className="p-4 font-semibold whitespace-nowrap">Gewenste Levering</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                  {groupedOrders.map((group: any) => (
                                    <tr key={group.id} className="hover:bg-gray-50/50 align-top">
                                      <td className="p-4 text-sm text-gray-800 whitespace-nowrap">
                                        {new Date(group.created_at).toLocaleString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                      </td>
                                      <td className="p-4 text-sm text-gray-800 font-medium">
                                        {group.company_name}
                                      </td>
                                      <td className="p-4">
                                        <div className="space-y-2">
                                          {group.items.map((item: any, i: number) => (
                                            <div key={item.id || i} className="text-sm">
                                              <span className="font-semibold text-gray-800">{item.product_name}</span>{' '}
                                              <span className="text-gray-500">({item.portion_size} stuks)</span>
                                              <div className="text-xs text-gray-400">€{Number(item.price || 0).toFixed(2)} per stuk</div>
                                            </div>
                                          ))}
                                        </div>
                                      </td>
                                      <td className="p-4 text-sm text-gray-900 font-bold text-right align-bottom">
                                        €{group.total_order_price.toFixed(2)}
                                      </td>
                                      <td className="p-4 text-sm text-gray-600 whitespace-nowrap">
                                        {group.delivery_date ? new Date(group.delivery_date).toLocaleDateString('nl-NL') : 'Onbekend'}
                                        <br/>
                                        {group.delivery_time ? <span className="font-medium">{group.delivery_time}</span> : ''}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          );
                        })()}`;

code = code.replace(targetTable, replacementTable);
fs.writeFileSync('src/components/ModeratorPanel.tsx', code);
console.log("Patched ModeratorPanel grouping");
