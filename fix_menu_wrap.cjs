const fs = require('fs');
let code = fs.readFileSync('src/components/Menu.tsx', 'utf8');

code = code.replace(
  /flex items-center gap-2">/g,
  'flex flex-wrap items-center gap-2">'
);

fs.writeFileSync('src/components/Menu.tsx', code);
