const fs = require('fs');
let code = fs.readFileSync('src/pages/GuestOrdering.tsx', 'utf8');

const targetInfo = `<h4 className="font-bold text-gray-900 leading-tight flex flex-wrap items-center gap-2">{product}
{item.status && !['actief', 'inactief', 'verborgen', 'active', 'inactive', 'hidden'].includes((item.status || '').toLowerCase()) && (
<span className={\`px-2 py-1 rounded-full text-xs font-medium shrink-0 \${['uitverkocht', 'sold out', 'sold_out'].includes((item.status || '').toLowerCase()) ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}\`}>{item.status === 'new' ? 'Nieuw' : item.status === 'popular' ? 'Meest Gekozen' : item.status === 'sold_out' ? 'Uitverkocht' : item.status === 'coming_soon' ? 'Binnenkort' : item.status}</span>
)}</h4>
                              </div>`;

const newInfo = `<h4 className="font-bold text-gray-900 leading-tight flex flex-wrap items-center gap-2">{product}
{item.status && !['actief', 'inactief', 'verborgen', 'active', 'inactive', 'hidden'].includes((item.status || '').toLowerCase()) && (
<span className={\`px-2 py-1 rounded-full text-xs font-medium shrink-0 \${['uitverkocht', 'sold out', 'sold_out'].includes((item.status || '').toLowerCase()) ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}\`}>{item.status === 'new' ? 'Nieuw' : item.status === 'popular' ? 'Meest Gekozen' : item.status === 'sold_out' ? 'Uitverkocht' : item.status === 'coming_soon' ? 'Binnenkort' : item.status}</span>
)}</h4>
                              </div>
                              
                              {item.sauces && item.sauces.length > 0 && (
                                <p className="text-xs text-gray-500 mb-2 italic">Inclusief: {item.sauces.join(', ')}</p>
                              )}
                              {item.variants && item.variants.length > 0 && (
                                <div className="mb-3">
                                  <select 
                                    className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-ob-blue focus:ring focus:ring-ob-blue focus:ring-opacity-50 py-1.5 px-2 bg-gray-50 text-gray-700 font-medium"
                                    value={selectedVariants[product] || item.variants[0]}
                                    onChange={(e) => setSelectedVariants({...selectedVariants, [product]: e.target.value})}
                                  >
                                    {item.variants.map((v: string) => <option key={v} value={v}>{v}</option>)}
                                  </select>
                                </div>
                              )}`;

code = code.replace(targetInfo, newInfo);
fs.writeFileSync('src/pages/GuestOrdering.tsx', code);
