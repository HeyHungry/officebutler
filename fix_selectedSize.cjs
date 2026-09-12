const fs = require('fs');
let code = fs.readFileSync('src/pages/GuestOrdering.tsx', 'utf8');

code = code.replace(
  /selectedSize \? 'border-ob-blue bg-blue-50\/30 shadow-sm'/g,
  "Object.keys(prodSelections).length > 0 ? 'border-ob-blue bg-blue-50/30 shadow-sm'"
);

fs.writeFileSync('src/pages/GuestOrdering.tsx', code);
