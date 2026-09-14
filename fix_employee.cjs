const fs = require('fs');

let code = fs.readFileSync('src/pages/EmployeeOrdering.tsx', 'utf8');

const search = `                              <button
                                key={size}
                                type="button"
                                disabled={!hasPrice || ['uitverkocht', 'sold out', 'sold_out'].includes((item.status || '').toLowerCase())}
                                onClick={() => {
                                  setSelections(prev => {
                                    const prodSelections = prev[product] || {};
                                    const currentQty = prodSelections[size] || 0;
                                    return {
                                      ...prev,
                                      [product]: {
                                        ...prodSelections,
                                        [size]: currentQty + 1
                                      }
                                    };
                                  });
                                }}
                                className={\`flex-1 min-w-[80px] py-2 px-3 rounded-lg border text-center transition-all \${(!hasPrice || ['uitverkocht', 'sold out', 'sold_out'].includes((item.status || '').toLowerCase())) ? 'opacity-50 cursor-not-allowed border-gray-100 bg-gray-50' : isSizeSelected ? 'border-ob-blue bg-ob-blue text-white shadow-sm' : 'border-gray-200 hover:border-ob-blue hover:-translate-y-1 hover:shadow-md text-gray-700 bg-white transition-all'}\`}
                              >
                                <div className="font-bold">{isSizeSelected ? \`\${selections[product][size]}x \${size}\` : size}</div>
                                <div className={\`text-xs \${isSizeSelected ? 'text-blue-100' : 'text-gray-500'}\`}>
                                  {hasPrice ? \`€\${price.toFixed(2)}\` : '-'}
                                </div>
                              </button>`;

const replace = `                              <button
                                key={size}
                                type="button"
                                disabled={!hasPrice || ['uitverkocht', 'sold out', 'sold_out'].includes((item.status || '').toLowerCase())}
                                onClick={() => {
                                  setSelections(prev => {
                                    const prodSelections = prev[product] || {};
                                    const currentQty = prodSelections[size] || 0;
                                    return {
                                      ...prev,
                                      [product]: {
                                        ...prodSelections,
                                        [size]: currentQty + 1
                                      }
                                    };
                                  });
                                }}
                                className={\`relative flex-1 min-w-[80px] py-2 px-3 rounded-lg border text-center transition-all \${(!hasPrice || ['uitverkocht', 'sold out', 'sold_out'].includes((item.status || '').toLowerCase())) ? 'opacity-50 cursor-not-allowed border-gray-100 bg-gray-50' : isSizeSelected ? 'border-ob-blue bg-ob-blue text-white shadow-sm' : 'border-gray-200 hover:border-ob-blue hover:-translate-y-1 hover:shadow-md text-gray-700 bg-white transition-all'}\`}
                              >
                                {isSizeSelected && (
                                  <div 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      setSelections(prev => {
                                        const prodSelections = prev[product] || {};
                                        const currentQty = prodSelections[size] || 0;
                                        if (currentQty <= 1) {
                                          const newObj = { ...prodSelections };
                                          delete newObj[size];
                                          if (Object.keys(newObj).length === 0) {
                                            const newSelections = { ...prev };
                                            delete newSelections[product];
                                            return newSelections;
                                          }
                                          return { ...prev, [product]: newObj };
                                        }
                                        return {
                                          ...prev,
                                          [product]: {
                                            ...prodSelections,
                                            [size]: currentQty - 1
                                          }
                                        };
                                      });
                                    }}
                                    className="absolute -top-2 -left-2 bg-red-500 text-white text-[12px] font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md border-2 border-white hover:bg-red-600 transition-colors z-10"
                                    title="Verwijder één"
                                  >
                                    -
                                  </div>
                                )}
                                <div className="font-bold">{isSizeSelected ? \`\${selections[product][size]}x \${size}\` : size}</div>
                                <div className={\`text-xs \${isSizeSelected ? 'text-blue-100' : 'text-gray-500'}\`}>
                                  {hasPrice ? \`€\${price.toFixed(2)}\` : '-'}
                                </div>
                              </button>`;

code = code.replace(search, replace);
fs.writeFileSync('src/pages/EmployeeOrdering.tsx', code);

