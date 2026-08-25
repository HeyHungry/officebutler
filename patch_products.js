import fs from 'fs';
let files = ['src/pages/CompanyDashboard.tsx', 'src/pages/EmployeeOrdering.tsx'];

files.forEach(file => {
  let code = fs.readFileSync(file, 'utf8');
  const lines = code.split('\n');
  const filtered = lines.filter(line => !line.includes('Deal\', image:') && !line.includes('Deal\': \'https:'));
  fs.writeFileSync(file, filtered.join('\n'));
});

// For GuestOrdering it's already removed via patch_guest_deals.js but there's hardcoded prices
let guestCode = fs.readFileSync('src/pages/GuestOrdering.tsx', 'utf8');
const pricesTarget = `    'Bitterballen Deal_25': 25.50, 'Bitterballen Deal_50': 48.00,
    'Dutch Classic Deal_25': 24.50, 'Dutch Classic Deal_50': 46.00,
    'Deluxe Deal_25': 29.50, 'Deluxe Deal_50': 55.00,
    'Chicken Deal_25': 27.50, 'Chicken Deal_50': 52.00,
    'Vega Deal_25': 26.50, 'Vega Deal_50': 49.00,
    
    'Snack Mix_25': 24.00, 'Snack Mix_50': 45.00,`;

const pricesReplacement = `    'Snack Mix_25': 24.00, 'Snack Mix_50': 45.00,`;

if (guestCode.includes(pricesTarget)) {
  guestCode = guestCode.replace(pricesTarget, pricesReplacement);
}

// And the initial state for GuestOrdering:
const assortTarget = `  const [assortment, setAssortment] = useState<string[]>(['Bitterballen Deal', 'Vega Deal', 'Snack Mix']);`;
const assortReplacement = `  const [assortment, setAssortment] = useState<string[]>(['Snack Mix', 'Bitterballen']);`;
if (guestCode.includes(assortTarget)) {
  guestCode = guestCode.replace(assortTarget, assortReplacement);
}

fs.writeFileSync('src/pages/GuestOrdering.tsx', guestCode);
console.log("Patched products");
