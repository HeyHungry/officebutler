const fs = require('fs');

function fixFile(file) {
  if (!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');

  code = code.replace(
    /const prod = assortment\.find\(p => p\.name === productName\);/g,
    "const prod = dbProducts.find(p => p.name === productName);"
  );

  fs.writeFileSync(file, code);
}

fixFile('src/pages/GuestOrdering.tsx');
fixFile('src/pages/EmployeeOrdering.tsx');
