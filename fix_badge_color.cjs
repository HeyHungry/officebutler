const fs = require('fs');

function fixFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  // Replace the specific background color for the selection circle
  code = code.replace(/bg-\[\#d4af37\] text-white text-\[10px\]/g, "bg-blue-500 text-white text-[10px]");
  fs.writeFileSync(file, code);
}

fixFile('src/pages/GuestOrdering.tsx');
fixFile('src/pages/EmployeeOrdering.tsx');

