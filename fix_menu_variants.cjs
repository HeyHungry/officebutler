const fs = require('fs');

let code = fs.readFileSync('src/components/Menu.tsx', 'utf8');

const search = `                              {(item.variants && item.variants.length > 0) && (
                                <p className="text-xs text-gray-500 mt-1 flex flex-wrap gap-1">
                                  <span className="font-semibold text-gray-700">Opties:</span> {item.variants.join(', ')}
                                </p>
                              )}`;

const replace = `                              {(item.variants && item.variants.length > 0) && (
                                <p className="text-xs text-gray-500 mt-1 flex flex-wrap gap-1">
                                  <span className="font-semibold text-gray-700">Opties:</span> {(() => {
                                    const sortedVariants = [...item.variants].sort((a, b) => {
                                      const isAMatch = a.toLowerCase() === category.title.toLowerCase();
                                      const isBMatch = b.toLowerCase() === category.title.toLowerCase();
                                      if (isAMatch && !isBMatch) return -1;
                                      if (!isAMatch && isBMatch) return 1;
                                      return 0;
                                    });
                                    return sortedVariants.join(', ');
                                  })()}
                                </p>
                              )}`;

code = code.replace(search, replace);
fs.writeFileSync('src/components/Menu.tsx', code);
