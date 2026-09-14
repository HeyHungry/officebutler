const fs = require('fs');

function fixFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(
    /const prodSelections = selections\[product\] \|\| \{\};\n\s*return \(/g,
    `const prodSelections = selections[product] || {};\n                        const productSizes = item.portions || [];\n                        return (`
  );
  fs.writeFileSync(file, code);
}

fixFile('src/pages/GuestOrdering.tsx');
fixFile('src/pages/EmployeeOrdering.tsx');

