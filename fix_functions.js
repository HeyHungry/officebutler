import fs from 'fs';
let code = fs.readFileSync('src/components/ModeratorPanel.tsx', 'utf8');

// 1. Fix mock data
code = code.replace(/setPrices\(\[\s*\{\s*id:\s*1[\s\S]*?\]\);/g, "setProductPrices([]);");

// 2. Remove old handlePriceChange and handleSavePrices, replace with new ones
const newFunctions = `
  const handleSaveProductPrices = async () => {
    setIsSaving(true);
    try {
      if (supabase) {
        const currentPrices = productPrices.filter(p => p.product_name === selectedPriceProduct && p.company_id === selectedPriceCompany);
        
        for (const p of currentPrices) {
          if (p.price > 0) {
            await supabase.from('ob_product_prices').upsert({
              company_id: selectedPriceCompany,
              product_name: selectedPriceProduct,
              portion_size: p.portion_size,
              price: p.price
            }, { onConflict: 'company_id, product_name, portion_size' });
          }
        }
        
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleProductPriceChange = (portion: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    setProductPrices(prev => {
      const exists = prev.find(p => p.product_name === selectedPriceProduct && p.company_id === selectedPriceCompany && p.portion_size === portion);
      if (exists) {
        return prev.map(p => p === exists ? { ...p, price: numValue } : p);
      } else {
        return [...prev, { company_id: selectedPriceCompany, product_name: selectedPriceProduct, portion_size: portion, price: numValue }];
      }
    });
  };
  
  const getDisplayPrice = (portion: number) => {
    const p = productPrices.find(p => p.product_name === selectedPriceProduct && p.company_id === selectedPriceCompany && p.portion_size === portion);
    return p ? p.price : '';
  };
`;

code = code.replace(/const handlePriceChange = \([\s\S]*?setTimeout\(\(\) => setSaveSuccess\(false\), 3000\);\n    \} catch \(e\) \{\n      console\.error\(e\);\n    \} finally \{\n      setIsSaving\(false\);\n    \}\n  \};/, newFunctions.trim());

fs.writeFileSync('src/components/ModeratorPanel.tsx', code);
