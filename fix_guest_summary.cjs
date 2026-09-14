const fs = require('fs');
let code = fs.readFileSync('src/pages/GuestOrdering.tsx', 'utf8');

const oldSummary = `<div className="flex flex-col gap-1">
                                    {Object.entries(prodSelections).map(([s, qty]) => (
                                      <span key={s} className="text-xs font-semibold text-ob-blue">{qty as number}x {s} st.</span>
                                    ))}
                                  </div>`;

const newSummary = `<div className="flex flex-col gap-1">
                                    {Object.entries(prodSelections).map(([s, qty]) => {
                                      const parts = s.split('_');
                                      const sizeNum = parts[0];
                                      const variant = parts[1] || '';
                                      return (
                                        <span key={s} className="text-xs font-semibold text-ob-blue">{qty as number}x {sizeNum} st. {variant && \`\${variant}\`}</span>
                                      );
                                    })}
                                  </div>`;

code = code.replace(oldSummary, newSummary);
fs.writeFileSync('src/pages/GuestOrdering.tsx', code);
