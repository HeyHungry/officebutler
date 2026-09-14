const fs = require('fs');

function updateFile(file) {
  let code = fs.readFileSync(file, 'utf8');

  // Update getVariantSurcharge function
  const oldFn = `  const getVariantSurcharge = (productName: string, variant: string) => {
    if (!variant) return 0;
    const prod = assortment.find(p => p.name === productName);
    if (!prod || !prod.variant_surcharges) return 0;
    return prod.variant_surcharges[variant] || 0;
  };`;
  const newFn = `  const getVariantSurcharge = (productName: string, variant: string, size: string | number) => {
    if (!variant) return 0;
    const prod = assortment.find(p => p.name === productName);
    if (!prod || !prod.variant_surcharges) return 0;
    return prod.variant_surcharges[\`\${variant}_\${size}\`] || prod.variant_surcharges[variant] || 0;
  };`;
  code = code.replace(oldFn, newFn);
  
  // Replace calls in submit calculation
  code = code.replace(/getVariantSurcharge\(prod, variant\)/g, "getVariantSurcharge(prod, variant, sizeNum || size)");
  
  // Replace calls in button render
  code = code.replace(/getVariantSurcharge\(product, currentVariant\)/g, "getVariantSurcharge(product, currentVariant, size)");

  fs.writeFileSync(file, code);
}

updateFile('src/pages/GuestOrdering.tsx');
updateFile('src/pages/EmployeeOrdering.tsx');

