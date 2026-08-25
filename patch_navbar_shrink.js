import fs from 'fs';
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

code = code.replace(
  '<div className="hidden sm:flex items-center gap-2">',
  '<div className="hidden sm:flex items-center gap-2 shrink-0">'
);

code = code.replace(
  '<div className="flex items-center gap-6">',
  '<div className="flex items-center gap-6 shrink-0">'
);

fs.writeFileSync('src/components/Navbar.tsx', code);
