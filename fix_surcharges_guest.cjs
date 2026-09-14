const fs = require('fs');

function fixFile(file) {
  let code = fs.readFileSync(file, 'utf8');

  // Fix totalOrderPrice calculation blocks (they define sizeNum)
  code = code.replace(/const sizeNum = parts\[0\];\s*const variant = parts\[1\] \|\| '';\s*const basePrice = prices\[\`\$\{prod\}_\$\{sizeNum\}\`\] \|\| 0;\s*const surcharge = getVariantSurcharge\(prod, variant, size\);/g, 
  `const sizeNum = parts[0];
        const variant = parts[1] || '';
        const basePrice = prices[\`\${prod}_\${sizeNum}\`] || 0;
        const surcharge = getVariantSurcharge(prod, variant, sizeNum);`);

  fs.writeFileSync(file, code);
}

fixFile('src/pages/GuestOrdering.tsx');
