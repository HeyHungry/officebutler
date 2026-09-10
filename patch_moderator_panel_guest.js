import fs from 'fs';

let code = fs.readFileSync('src/components/ModeratorPanel.tsx', 'utf8');

// 1. Add custom-scrollbar to the table wrapper
code = code.replace(
  'className="w-full max-w-full overflow-x-auto bg-white border border-gray-200 rounded-xl"',
  'className="w-full max-w-full overflow-x-auto custom-scrollbar bg-white border border-gray-200 rounded-xl"'
);

// 2. Parse the name from notes if it's a guest
const findGroupMap = `                                  {groupedOrders.map((group: any) => (`;
const replaceGroupMap = `                                  {groupedOrders.map((group: any) => {
                                    let displayName = group.company_name;
                                    if (displayName === 'Gast Bestelling') {
                                      const firstNote = group.items[0]?.notes || '';
                                      const nameMatch = firstNote.match(/Naam:\\s*(.+)/);
                                      if (nameMatch) {
                                        displayName = \`Gast: \${nameMatch[1].trim()}\`;
                                      }
                                    }
                                    return (`;

code = code.replace(findGroupMap, replaceGroupMap);

// Also need to close the curly brace at the end of the map function
const findCloseTr = `                                    </tr>
                                  ))}`;
const replaceCloseTr = `                                    </tr>
                                  );
                                  })}`;
code = code.replace(findCloseTr, replaceCloseTr);

// Update what's printed
code = code.replace(
  `{group.company_name}`,
  `{displayName}`
);

fs.writeFileSync('src/components/ModeratorPanel.tsx', code);
console.log("Patched ModeratorPanel for guest name and scrollbar");
