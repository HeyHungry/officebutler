const fs = require('fs');

function fixFile(file) {
  let code = fs.readFileSync(file, 'utf8');

  // For GuestOrdering line 175 where sizeNum is not defined:
  code = code.replace(/const surcharge = getVariantSurcharge\(prod, variant, sizeNum \|\| size\);/g, (match, offset, string) => {
     // if it's the one preceded by `const size = Number(parts[0]);`
     if (string.substring(offset - 100, offset).includes("const size = Number(parts[0]);")) {
         return "const surcharge = getVariantSurcharge(prod, variant, size);";
     } else {
         return "const surcharge = getVariantSurcharge(prod, variant, sizeNum);";
     }
  });

  fs.writeFileSync(file, code);
}

fixFile('src/pages/GuestOrdering.tsx');
fixFile('src/pages/EmployeeOrdering.tsx');
