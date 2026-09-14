const fs = require('fs');
let code = fs.readFileSync('src/components/ModeratorPanel.tsx', 'utf8');

// Add state
const targetState = `const [saveSuccess, setSaveSuccess] = useState(false);`;
const newState = `const [saveSuccess, setSaveSuccess] = useState(false);
  const [variantSurcharges, setVariantSurcharges] = useState<Record<string, number>>({});`;
code = code.replace(targetState, newState);

// Update useEffect that runs when selectedPriceProduct changes
const targetEffect = `  useEffect(() => {
    if (selectedPriceProduct && dbProducts.length > 0) {
      const prod = dbProducts.find(p => p.name === selectedPriceProduct);
      if (prod) {
        setSelectedProductSizes(prod.portions || []);
      }
    }
  }, [selectedPriceProduct, dbProducts]);`;

const newEffect = `  useEffect(() => {
    if (selectedPriceProduct && dbProducts.length > 0) {
      const prod = dbProducts.find(p => p.name === selectedPriceProduct);
      if (prod) {
        setSelectedProductSizes(prod.portions || []);
        setVariantSurcharges(prod.variant_surcharges || {});
      }
    }
  }, [selectedPriceProduct, dbProducts]);`;
code = code.replace(targetEffect, newEffect);

fs.writeFileSync('src/components/ModeratorPanel.tsx', code);
