const fs = require('fs');

for (const file of ['src/pages/EmployeeOrdering.tsx', 'src/pages/GuestOrdering.tsx']) {
  let code = fs.readFileSync(file, 'utf8');
  // It seems \\n\\n was inserted literally as \n\n in the code, let's fix that string
  code = code.replace(/\\n\\n  const getVariantSurcharge/g, "\n\n  const getVariantSurcharge");
  fs.writeFileSync(file, code);
}
