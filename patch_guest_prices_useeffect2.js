import fs from 'fs';
let code = fs.readFileSync('src/pages/GuestOrdering.tsx', 'utf8');

const target = `          setPrices(newPrices);
          setAssortment(Array.from(productNames));`;

const replacement = `          // We merge the fetched prices with the hardcoded ones so we don't lose the hardcoded ones if the DB is empty
          if (Object.keys(newPrices).length > 0) {
            setPrices(prev => ({ ...prev, ...newPrices }));
          }`;

if (code.includes(target)) {
  code = code.replace(target, replacement);
  fs.writeFileSync('src/pages/GuestOrdering.tsx', code);
  console.log("Patched successfully");
} else {
  console.log("Target not found!");
}
