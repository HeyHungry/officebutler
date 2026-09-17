const fs = require('fs');
let code = fs.readFileSync('src/components/Menu.tsx', 'utf8');

code = code.replace(
  'const isAMatch = a.toLowerCase() === category.title.toLowerCase();',
  'const isAMatch = a.trim().toLowerCase() === category.title.trim().toLowerCase();'
);
code = code.replace(
  'const isBMatch = b.toLowerCase() === category.title.toLowerCase();',
  'const isBMatch = b.trim().toLowerCase() === category.title.trim().toLowerCase();'
);

fs.writeFileSync('src/components/Menu.tsx', code);
