import fs from 'fs';
let code = fs.readFileSync('src/components/ModeratorPanel.tsx', 'utf8');

const lines = code.split('\n');
const filtered = lines.filter(line => !line.includes('Bitterballen Deal\', \'Dutch Classic Deal\', \'Deluxe Deal\', \'Chicken Deal\', \'Vega Deal\','));
fs.writeFileSync('src/components/ModeratorPanel.tsx', filtered.join('\n'));
console.log("Patched ModeratorPanel.tsx");
