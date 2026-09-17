const fs = require('fs');

let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

code = code.replace(
  '<a href="#" className="font-serif flex items-center justify-center overflow-hidden h-12 md:h-16 w-auto">',
  '<a href="/" className="font-serif flex items-center justify-center overflow-hidden h-12 md:h-16 w-auto">'
);

fs.writeFileSync('src/components/Navbar.tsx', code);
