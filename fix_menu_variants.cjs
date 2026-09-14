const fs = require('fs');

const file = 'src/components/Menu.tsx';
let code = fs.readFileSync(file, 'utf8');

const search = `                              <h4 className="font-serif text-lg text-ob-text group-hover:text-ob-accent transition-colors duration-300 font-medium font-serif flex flex-wrap items-center gap-2">
                                {item.name}
                                {item.status && !['actief', 'inactief', 'verborgen', 'active', 'inactive', 'hidden'].includes((item.status || '').toLowerCase()) && (
  <span className={\`px-2 py-1 rounded-full text-xs font-medium ml-2 shrink-0 \${['uitverkocht', 'sold out', 'sold_out'].includes((item.status || '').toLowerCase()) ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}\`}>{item.status === 'new' ? 'Nieuw' : item.status === 'popular' ? 'Meest Gekozen' : item.status === 'sold_out' ? 'Uitverkocht' : item.status === 'coming_soon' ? 'Binnenkort' : item.status}</span>
)}
                              </h4>
                            </div>`;

const replace = `                              <h4 className="font-serif text-lg text-ob-text group-hover:text-ob-accent transition-colors duration-300 font-medium font-serif flex flex-wrap items-center gap-2">
                                {item.name}
                                {item.status && !['actief', 'inactief', 'verborgen', 'active', 'inactive', 'hidden'].includes((item.status || '').toLowerCase()) && (
  <span className={\`px-2 py-1 rounded-full text-xs font-medium ml-2 shrink-0 \${['uitverkocht', 'sold out', 'sold_out'].includes((item.status || '').toLowerCase()) ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}\`}>{item.status === 'new' ? 'Nieuw' : item.status === 'popular' ? 'Meest Gekozen' : item.status === 'sold_out' ? 'Uitverkocht' : item.status === 'coming_soon' ? 'Binnenkort' : item.status}</span>
)}
                              </h4>
                              {(item.variants && item.variants.length > 0) && (
                                <p className="text-xs text-gray-500 mt-1 flex flex-wrap gap-1">
                                  <span className="font-semibold text-gray-700">Opties:</span> {item.variants.join(', ')}
                                </p>
                              )}
                              {(item.sauces && item.sauces.length > 0) && (
                                <p className="text-xs text-gray-500 mt-0.5 flex flex-wrap gap-1">
                                  <span className="font-semibold text-gray-700">Inclusief:</span> {item.sauces.join(', ')}
                                </p>
                              )}
                            </div>`;

code = code.replace(search, replace);
fs.writeFileSync(file, code);
