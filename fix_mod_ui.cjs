const fs = require('fs');
let code = fs.readFileSync('src/components/ModeratorPanel.tsx', 'utf8');

const targetUI = `                        <p className="text-xs text-gray-400 mt-2">Laat het veld leeg als de portie niet beschikbaar is.</p>`;

const newUI = `                        <p className="text-xs text-gray-400 mt-2">Laat het veld leeg als de portie niet beschikbaar is.</p>

                        {(() => {
                           const prod = dbProducts.find(p => p.name === selectedPriceProduct);
                           if (prod && prod.variants && prod.variants.length > 0) {
                             return (
                               <div className="mt-8">
                                 <h4 className="text-sm font-semibold text-gray-700 mb-3">Extra kosten per variant (Optioneel)</h4>
                                 <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                   <table className="w-full text-left text-sm">
                                     <thead className="bg-gray-50 border-b border-gray-200">
                                       <tr>
                                         <th className="px-4 py-3 font-semibold text-gray-700">Variant</th>
                                         <th className="px-4 py-3 font-semibold text-gray-700 w-32 text-right">Extra Prijs (€)</th>
                                       </tr>
                                     </thead>
                                     <tbody className="divide-y divide-gray-100">
                                       {prod.variants.map((v: string) => (
                                         <tr key={v}>
                                           <td className="px-4 py-3 text-gray-700">{v}</td>
                                           <td className="px-4 py-2">
                                             <div className="flex items-center gap-2 justify-end">
                                               <span className="text-gray-500">€</span>
                                               <input
                                                 type="number"
                                                 step="0.01"
                                                 min="0"
                                                 className="w-20 px-2 py-1 border border-gray-300 rounded text-right focus:outline-none focus:border-[#151f33]"
                                                 value={variantSurcharges[v] !== undefined ? variantSurcharges[v] : ''}
                                                 onChange={(e) => {
                                                   const val = e.target.value;
                                                   setVariantSurcharges(prev => ({
                                                     ...prev,
                                                     [v]: val === '' ? undefined : parseFloat(val)
                                                   } as Record<string, number>));
                                                 }}
                                               />
                                             </div>
                                           </td>
                                         </tr>
                                       ))}
                                     </tbody>
                                   </table>
                                 </div>
                               </div>
                             );
                           }
                           return null;
                        })()}
`;

code = code.replace(targetUI, newUI);
fs.writeFileSync('src/components/ModeratorPanel.tsx', code);
