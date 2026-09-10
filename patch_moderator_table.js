import fs from 'fs';

let code = fs.readFileSync('src/components/ModeratorPanel.tsx', 'utf8');

const targetGroupedOrders = `                        {(() => {
                          const groupedOrders = Object.values(orders.reduce((acc, order) => {`;

// We'll replace everything from {(() => { ... down to the end of the table. Let's just find the whole block to replace.

const findTableBlock = `                          const groupedOrders = Object.values(orders.reduce((acc, order) => {
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
                            <div className="w-full max-w-full overflow-auto custom-scrollbar bg-white border border-gray-200 rounded-xl max-h-[65vh]">
                              <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                  <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                                    <th className="p-4 font-semibold whitespace-nowrap">Datum (Besteld)</th>
                                    <th className="p-4 font-semibold">Bedrijf / Klant</th>
                                    <th className="p-4 font-semibold">Bestelling (Producten)</th>
                                    <th className="p-4 font-semibold text-right">Totaalprijs</th>
                                    <th className="p-4 font-semibold whitespace-nowrap">Gewenste Levering</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                  {groupedOrders.map((group: any) => {
                                    let displayName = group.company_name;
                                    if (displayName === 'Gast Bestelling') {
                                      const firstNote = group.items[0]?.notes || '';
                                      const nameMatch = firstNote.match(/Naam:\\s*(.+)/);
                                      if (nameMatch) {
                                        displayName = \`Gast: \${nameMatch[1].trim()}\`;
                                      }
                                    }
                                    return (
                                    <tr key={group.id} className="hover:bg-gray-50/50 align-top">
                                      <td className="p-4 text-sm text-gray-800 whitespace-nowrap">
                                        {new Date(group.created_at).toLocaleString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                      </td>
                                      <td className="p-4 text-sm text-gray-800 font-medium">
                                        {displayName}
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
                                  );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          );`;

const replacementBlock = `                          const groupedOrders = Object.values(orders.reduce((acc, order) => {
                            const dateKey = new Date(order.created_at).toISOString().slice(0, 16);
                            const key = \`\${order.company_id || 'gast'}_\${dateKey}_\${order.delivery_date}_\${order.delivery_time}\`;
                            
                            if (!acc[key]) {
                              let contactName = order.ob_companies?.name || 'Gast Bestelling';
                              let phone = order.phone || '';
                              let address = '';
                              
                              if (order.ob_company_addresses) {
                                address = order.ob_company_addresses.address_line;
                                if (order.ob_company_addresses.label) {
                                  address = \`\${order.ob_company_addresses.label} - \${address}\`;
                                }
                              }
                              
                              if (!order.company_id) {
                                // Extract guest info from notes
                                const notes = order.notes || '';
                                const nameMatch = notes.match(/Naam:\\s*(.+)/);
                                if (nameMatch) contactName = \`Gast: \${nameMatch[1].trim()}\`;
                                
                                const addressMatch = notes.match(/Bezorgadres:\\s*(.+)/);
                                if (addressMatch) address = addressMatch[1].trim();
                              }

                              acc[key] = {
                                id: key,
                                created_at: order.created_at,
                                company_name: contactName,
                                phone: phone,
                                address: address,
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
                            <div className="w-full max-w-full overflow-auto custom-scrollbar bg-white border border-gray-200 rounded-xl max-h-[65vh]">
                              <table className="w-full text-left border-collapse min-w-[1000px]">
                                <thead>
                                  <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                                    <th className="p-4 font-semibold whitespace-nowrap">Datum (Besteld)</th>
                                    <th className="p-4 font-semibold">Klant & Contact</th>
                                    <th className="p-4 font-semibold min-w-[200px]">Afleveradres</th>
                                    <th className="p-4 font-semibold min-w-[200px]">Bestelling (Producten)</th>
                                    <th className="p-4 font-semibold text-right">Totaalprijs</th>
                                    <th className="p-4 font-semibold whitespace-nowrap">Gewenste Levering</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                  {groupedOrders.map((group: any) => {
                                    return (
                                    <tr key={group.id} className="hover:bg-gray-50/50 align-top">
                                      <td className="p-4 text-sm text-gray-800 whitespace-nowrap">
                                        {new Date(group.created_at).toLocaleString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                      </td>
                                      <td className="p-4 text-sm text-gray-800">
                                        <div className="font-medium text-[#05053D]">{group.company_name}</div>
                                        {group.phone && <div className="text-gray-500 mt-1">{group.phone}</div>}
                                      </td>
                                      <td className="p-4 text-sm text-gray-700">
                                        {group.address ? (
                                          <div className="max-w-xs">{group.address}</div>
                                        ) : (
                                          <span className="text-gray-400 italic">Niet opgegeven</span>
                                        )}
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
                                  );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          );`;

code = code.replace(findTableBlock, replacementBlock);
fs.writeFileSync('src/components/ModeratorPanel.tsx', code);
console.log("Patched ModeratorPanel Table UI");
