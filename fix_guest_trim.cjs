const fs = require('fs');
let code = fs.readFileSync('src/pages/GuestOrdering.tsx', 'utf8');

code = code.replace(
  'item.variants.find(v => v.toLowerCase() === category.title.toLowerCase())',
  'item.variants.find(v => v.trim().toLowerCase() === category.title.trim().toLowerCase())'
);
code = code.replace(
  'infoModalProduct.variants.find((v: string) => v.toLowerCase() === modalCategory.toLowerCase())',
  'infoModalProduct.variants.find((v: string) => v.trim().toLowerCase() === modalCategory.trim().toLowerCase())'
);

fs.writeFileSync('src/pages/GuestOrdering.tsx', code);
