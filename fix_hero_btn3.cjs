const fs = require('fs');

let code = fs.readFileSync('src/components/Hero.tsx', 'utf8');
code = code.replace(
  /hover:shadow-\[0_0_25px_rgba\(255,255,255,0\.4\)\] hover:-translate-y-1/g,
  'hover:shadow-[0_0_20px_rgba(5,5,61,0.5)] hover:-translate-y-1'
);
fs.writeFileSync('src/components/Hero.tsx', code);

let navCode = fs.readFileSync('src/components/Navbar.tsx', 'utf8');
navCode = navCode.replace(
  /hover:shadow-\[0_0_20px_rgba\(255,255,255,0\.4\)\] hover:-translate-y-0\.5/g,
  'hover:shadow-[0_0_20px_rgba(5,5,61,0.4)] hover:-translate-y-0.5'
);
fs.writeFileSync('src/components/Navbar.tsx', navCode);

