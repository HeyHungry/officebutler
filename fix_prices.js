import fs from 'fs';
let code = fs.readFileSync('src/pages/GuestOrdering.tsx', 'utf8');

code = code.replace(
  'gp.default_price;',
  'gp.price || gp.default_price;' // just in case it's called either one
);

fs.writeFileSync('src/pages/GuestOrdering.tsx', code);
console.log("Fixed prices");
