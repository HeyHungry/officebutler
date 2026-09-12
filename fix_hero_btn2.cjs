const fs = require('fs');
let code = fs.readFileSync('src/components/Hero.tsx', 'utf8');

code = code.replace(
  /hover:bg-gray-100 hover:-translate-y-1 hover:shadow-2xl/g,
  'hover:shadow-[0_0_25px_rgba(255,255,255,0.4)] hover:-translate-y-1'
);

fs.writeFileSync('src/components/Hero.tsx', code);

let navCode = fs.readFileSync('src/components/Navbar.tsx', 'utf8');
navCode = navCode.replace(
  /hover:bg-gray-100 hover:-translate-y-0\.5 hover:shadow-lg/g,
  'hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:-translate-y-0.5'
);
fs.writeFileSync('src/components/Navbar.tsx', navCode);

