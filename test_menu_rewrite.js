const fs = require('fs');
let code = fs.readFileSync('src/components/Menu.tsx', 'utf8');
console.log(code.substring(0, 500));
