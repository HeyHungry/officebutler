const fs = require('fs');

function fixFile(file) {
  let code = fs.readFileSync(file, 'utf8');

  const oldCode = `        // Save variant surcharges to ob_products
        if (selectedPriceProduct) {
           await supabase.from('ob_products')
             .update({ variant_surcharges: variantSurcharges })
             .eq('name', selectedPriceProduct);
             
           // Update local dbProducts state
           setDbProducts(prev => prev.map(p => p.name === selectedPriceProduct ? { ...p, variant_surcharges: variantSurcharges } : p));
        }`;

  const newCode = `        // Save variant surcharges to ob_products
        if (selectedPriceProduct) {
           const cleanSurcharges = {};
           for (const [k, v] of Object.entries(variantSurcharges)) {
             if (v !== undefined && v !== null && !isNaN(v)) {
               cleanSurcharges[k] = v;
             }
           }
           await supabase.from('ob_products')
             .update({ variant_surcharges: cleanSurcharges })
             .eq('name', selectedPriceProduct);
             
           // Update local dbProducts state
           setDbProducts(prev => prev.map(p => p.name === selectedPriceProduct ? { ...p, variant_surcharges: cleanSurcharges } : p));
           setVariantSurcharges(cleanSurcharges);
        }`;

  code = code.replace(oldCode, newCode);
  fs.writeFileSync(file, code);
}

fixFile('src/components/ModeratorPanel.tsx');
