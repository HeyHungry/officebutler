const fs = require('fs');

function fixFile(file) {
  let code = fs.readFileSync(file, 'utf8');

  const insertAfter = `  useEffect(() => {
    setLocalSettings(settings);
    setLocalStoreSettings(storeSettings);
  }, [settings, storeSettings]);`;

  const newCode = `  useEffect(() => {
    setLocalSettings(settings);
    setLocalStoreSettings(storeSettings);
  }, [settings, storeSettings]);

  useEffect(() => {
    if (dbProducts.length > 0 && selectedPriceProduct) {
      const prod = dbProducts.find(p => p.name === selectedPriceProduct);
      if (prod && prod.variant_surcharges) {
        setVariantSurcharges(prod.variant_surcharges);
      } else {
        setVariantSurcharges({});
      }
    }
  }, [dbProducts, selectedPriceProduct]);`;

  code = code.replace(insertAfter, newCode);
  fs.writeFileSync(file, code);
}

fixFile('src/components/ModeratorPanel.tsx');

