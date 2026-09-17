const fs = require('fs');

let code = fs.readFileSync('src/pages/GuestOrdering.tsx', 'utf8');
code = code.replace(
  'handlePortionRemove(infoModalProduct.name, size, currentVariant);',
  'handlePortionDeselect(infoModalProduct.name, size, currentVariant, e);'
);

fs.writeFileSync('src/pages/GuestOrdering.tsx', code);
