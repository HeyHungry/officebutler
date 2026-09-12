const fs = require('fs');

function fix(file) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(/text-\[10px\] uppercase tracking-wider px-2 py-0\.5 rounded-full font-bold/g, 'px-2 py-1 rounded-full text-xs font-medium capitalize');
  fs.writeFileSync(file, code);
}

fix('src/components/Menu.tsx');
fix('src/pages/GuestOrdering.tsx');
fix('src/pages/EmployeeOrdering.tsx');
