import fs from 'fs';
let code = fs.readFileSync('src/pages/EmployeeOrdering.tsx', 'utf8');
code = code.replace(
  "{prices[size] ? `€${prices[size].toFixed(2)}` : '-'}",
  "{prices[`${selectedProduct}_${size}`] ? `€${prices[`${selectedProduct}_${size}`].toFixed(2)}` : '-'}"
);
fs.writeFileSync('src/pages/EmployeeOrdering.tsx', code);
