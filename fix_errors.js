import fs from 'fs';

function fixFile(file) {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replaceAll(
    "const { data: prods } = await supabase.from('ob_products').select('*');",
    "let prods = null; try { const { data } = await supabase.from('ob_products').select('*'); prods = data; } catch (e) { console.warn('No products table'); }"
  );
  
  // also for ModeratorPanel
  code = code.replaceAll(
    "const { data: prodData } = await supabase.from('ob_products').select('*');\n      if (prodData) { setDbProducts(prodData); if (prodData.length > 0 && selectedPriceProduct === AVAILABLE_PRODUCTS[0]) setSelectedPriceProduct(prodData[0].name); }",
    "let prodData = null; try { const { data } = await supabase.from('ob_products').select('*'); prodData = data; } catch(e) { console.warn('no table'); }\n      if (prodData) { setDbProducts(prodData); if (prodData.length > 0 && selectedPriceProduct === AVAILABLE_PRODUCTS[0]) setSelectedPriceProduct(prodData[0].name); }"
  );

  fs.writeFileSync(file, code);
}

['src/pages/GuestOrdering.tsx', 'src/pages/EmployeeOrdering.tsx', 'src/components/ModeratorPanel.tsx'].forEach(fixFile);

console.log("Fixed errors");
