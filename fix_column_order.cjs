const fs = require('fs');
let code = fs.readFileSync('src/components/MenuManager.tsx', 'utf8');

const newTh = `
                <tr>
                  <th className="px-2 py-2 font-semibold text-gray-700 w-24">Acties</th>
                  <th className="px-2 py-2 font-semibold text-gray-700 w-1/3">Product</th>
                  <th className="px-2 py-2 font-semibold text-gray-700 w-1/6">Categorie</th>
                  <th className="px-2 py-2 font-semibold text-gray-700 ">Porties (stuks)</th>
                  <th className="px-2 py-2 font-semibold text-gray-700 w-1/6">Status</th>
                </tr>
`;

code = code.replace(/<tr>\s*<th className="px-2 py-2 font-semibold text-gray-700 w-24">Acties<\/th>[\s\S]*?<\/tr>/, newTh);

fs.writeFileSync('src/components/MenuManager.tsx', code);
