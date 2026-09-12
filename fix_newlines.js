import fs from 'fs';

let code = fs.readFileSync('src/components/ModeratorPanel.tsx', 'utf8');
code = code.replace(
  '<th className="p-4 font-semibold whitespace-nowrap">Gewenste Levering</th>\\n                                    <th className="p-4 font-semibold text-right">Acties</th>',
  '<th className="p-4 font-semibold whitespace-nowrap">Gewenste Levering</th>\n                                    <th className="p-4 font-semibold text-right">Acties</th>'
);

fs.writeFileSync('src/components/ModeratorPanel.tsx', code);
