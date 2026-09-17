const fs = require('fs');

let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

// Replace the specific storeSettings condition with false
code = code.replace(
  '{storeSettings && (\n            <div className="hidden sm:flex items-center gap-2 shrink-0">',
  '{false && storeSettings && (\n            <div className="hidden sm:flex items-center gap-2 shrink-0">'
);

code = code.replace(
  '{storeSettings && (\n              <div className="flex items-center justify-center gap-2 mb-8">',
  '{false && storeSettings && (\n              <div className="flex items-center justify-center gap-2 mb-8">'
);

fs.writeFileSync('src/components/Navbar.tsx', code);
