const fs = require('fs');
let code = fs.readFileSync('src/components/MenuManager.tsx', 'utf8');

code = code.replace(
  /portions: portionsToSave/,
  'portions: portionsToSave,\n          sort_order: products.length'
);

fs.writeFileSync('src/components/MenuManager.tsx', code);
