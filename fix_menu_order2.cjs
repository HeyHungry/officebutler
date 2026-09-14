const fs = require('fs');
let code = fs.readFileSync('src/components/Menu.tsx', 'utf8');

code = code.replace(
  /\.order\('category', \{ ascending: true \}\)\.order\('sort_order', \{ ascending: true, nullsFirst: false \}\)\.order\('name', \{ ascending: true \}\)/,
  ".order('sort_order', { ascending: true, nullsFirst: false }).order('category', { ascending: true }).order('name', { ascending: true })"
);

fs.writeFileSync('src/components/Menu.tsx', code);
