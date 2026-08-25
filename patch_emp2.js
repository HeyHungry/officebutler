import fs from 'fs';
let code = fs.readFileSync('src/pages/EmployeeOrdering.tsx', 'utf8');

const target1 = `      setAssortment(['Bitterballen Deal', 'Vega Deal', 'Snack Mix']);`;
const replace1 = `      setAssortment(['Snack Mix', 'Bitterballen']);`;

const target2 = `      setPrices({ 
        'Bitterballen Deal_25': 25.50, 'Bitterballen Deal_50': 48.00,
        'Vega Deal_25': 26.50, 'Vega Deal_50': 49.00,
      });`;
const replace2 = `      setPrices({ 
        'Snack Mix_25': 24.00, 'Snack Mix_50': 45.00,
        'Bitterballen_25': 22.00, 'Bitterballen_50': 40.00,
      });`;

if (code.includes(target1)) code = code.replace(target1, replace1);
if (code.includes(target2)) code = code.replace(target2, replace2);

fs.writeFileSync('src/pages/EmployeeOrdering.tsx', code);
console.log("Patched emp2");
