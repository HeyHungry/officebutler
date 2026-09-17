const fs = require('fs');

let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

// Left container
code = code.replace(
  '<div className="flex items-center gap-6 shrink-0">',
  '<div className="flex items-center gap-6 shrink-0 lg:flex-1">'
);

// Right container
code = code.replace(
  '<div className="font-serif hidden lg:flex items-center gap-6 shrink-0">',
  '<div className="font-serif hidden lg:flex items-center justify-end gap-6 shrink-0 lg:flex-1">'
);

fs.writeFileSync('src/components/Navbar.tsx', code);
