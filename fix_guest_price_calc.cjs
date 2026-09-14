const fs = require('fs');
let code = fs.readFileSync('src/pages/GuestOrdering.tsx', 'utf8');

const getSurchargeFn = `  const getVariantSurcharge = (productName: string, variant: string) => {
    if (!variant) return 0;
    const prod = assortment.find(p => p.name === productName);
    if (!prod || !prod.variant_surcharges) return 0;
    return prod.variant_surcharges[variant] || 0;
  };`;

// Insert after fetchAssortment effect
const insertPoint = `  }, []);`;
code = code.replace(insertPoint, insertPoint + "\\n\\n" + getSurchargeFn);

// 1. Submit price calc
const oldSubmitCalc = `      for (const [s, qty] of Object.entries(sizes as any)) {
        const sizeNum = s.split('_')[0];
        prodSum += (prices[\`\${prod}_\${sizeNum}\`] || 0) * (qty as number);
      }`;
const newSubmitCalc = `      for (const [s, qty] of Object.entries(sizes as any)) {
        const parts = s.split('_');
        const sizeNum = parts[0];
        const variant = parts[1] || '';
        const basePrice = prices[\`\${prod}_\${sizeNum}\`] || 0;
        const surcharge = getVariantSurcharge(prod, variant);
        prodSum += (basePrice + surcharge) * (qty as number);
      }`;
code = code.replace(oldSubmitCalc, newSubmitCalc);

// 2. Submit Loop price
const oldLoopPrice = `            const variant = parts[1] || '';
            const price = prices[\`\${prod}_\${size}\`] || 0;
            const finalProdName = variant ? \`\${prod} (\${variant})\` : prod;`;
const newLoopPrice = `            const variant = parts[1] || '';
            const basePrice = prices[\`\${prod}_\${size}\`] || 0;
            const surcharge = getVariantSurcharge(prod, variant);
            const price = basePrice + surcharge;
            const finalProdName = variant ? \`\${prod} (\${variant})\` : prod;`;
code = code.replace(oldLoopPrice, newLoopPrice);

// 3. UI price calc
const oldUICalc = `      for (const [s, qty] of Object.entries(sizes as any)) {
        const sizeNum = s.split('_')[0];
        prodSum += (prices[\`\${prod}_\${sizeNum}\`] || 0) * (qty as number);
      }`;
code = code.replace(oldUICalc, newSubmitCalc);

// 4. Update the portion button text and disabled state based on variant surcharge
const oldButtonDisabled = `disabled={prices[product + '_' + size] === undefined || ['uitverkocht', 'sold out', 'sold_out'].includes((item.status || '').toLowerCase())}`;
// We can't simply replace global here safely because it's multiline. Let's do it manually.

fs.writeFileSync('src/pages/GuestOrdering.tsx', code);
