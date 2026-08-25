import fs from 'fs';
let code = fs.readFileSync('src/pages/GuestOrdering.tsx', 'utf8');

code = code.replace(
  /setPrices\(newPrices\);[\s\S]*?setAssortment\(Array\.from\(productNames\)\);/,
  "setPrices(prev => ({ ...prev, ...newPrices }));\n          // setAssortment(Array.from(productNames));"
);

// wait, let's be more precise
