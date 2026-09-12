const fs = require('fs');
let code = fs.readFileSync('src/pages/GuestOrdering.tsx', 'utf8');

// 1. Change type of selections
code = code.replace(
  /const \[selections, setSelections\] = useState\<Record\<string, number\>\>\(\{\}\);/,
  "const [selections, setSelections] = useState<Record<string, Record<number, number>>>({});"
);

// 2. handlePortionSelect
const oldPortionSelect = `  const handlePortionSelect = (product: string, size: number) => {
    setSelections(prev => ({
      ...prev,
      [product]: size
    }));
  };`;

const newPortionSelect = `  const handlePortionSelect = (product: string, size: number) => {
    setSelections(prev => {
      const currentObj = prev[product] || {};
      const currentQty = currentObj[size] || 0;
      return {
        ...prev,
        [product]: {
          ...currentObj,
          [size]: currentQty + 1
        }
      };
    });
  };`;

code = code.replace(oldPortionSelect, newPortionSelect);

// 4. totalOrderPrice
const oldTotalOrderPrice = `const totalOrderPrice = Object.entries(selections).reduce((sum, [prod, size]) => sum + (prices[\`\${prod}_\${size}\`] || 0), 0);`;
const newTotalOrderPrice = `const totalOrderPrice = Object.entries(selections).reduce((sum, [prod, sizes]) => {
      let prodSum = 0;
      for (const [s, qty] of Object.entries(sizes as any)) {
        prodSum += (prices[\`\${prod}_\${s}\`] || 0) * (qty as number);
      }
      return sum + prodSum;
    }, 0);`;

code = code.replaceAll(oldTotalOrderPrice, newTotalOrderPrice);

// 5. orderPromises
const oldPromisesRegex = /const orderPromises = Object\.entries\(selections\)\.map\(\(\[prod, size\]\) => \{[\s\S]*?\}\);/;
const newPromises = `const orderPromises: any[] = [];
        Object.entries(selections).forEach(([prod, sizes]) => {
          Object.entries(sizes as any).forEach(([sizeStr, qty]) => {
            const size = Number(sizeStr);
            const price = prices[\`\${prod}_\${size}\`] || 0;
            for (let i = 0; i < (qty as number); i++) {
              orderPromises.push(supabase.from('ob_orders').insert({
                product_name: prod,
                portion_size: size,
                price: price,
                total_price: price,
                phone: phone,
                notes: fullNotes,
                delivery_date: deliveryMode === 'zsm' ? new Date().toISOString().split('T')[0] : deliveryDate,
                delivery_time: deliveryMode === 'zsm' ? 'Zo snel mogelijk' : deliveryTime
              }));
            }
          });
        });`;
code = code.replace(oldPromisesRegex, newPromises);

// 6. Fix "selectedSize = selections[product];"
code = code.replace(/const selectedSize = selections\[product\];/g, 'const prodSelections = selections[product] || {};');

// 7. Fix buttons highlighting
code = code.replace(/selectedSize === size \?/g, '(prodSelections[size] || 0) > 0 ?');
code = code.replace(/selectedSize === size/g, '(prodSelections[size] || 0) > 0');

// 8. Fix display of selected sizes
code = code.replace(
  /<span className="text-xs font-semibold text-ob-blue">Geselecteerd: \{selectedSize\} st\.<\/span>/g,
  `<div className="flex flex-col gap-1">
                                    {Object.entries(prodSelections).map(([s, qty]) => (
                                      <span key={s} className="text-xs font-semibold text-ob-blue">{qty as number}x {s} st.</span>
                                    ))}
                                  </div>`
);

// 9. Fix conditional render of footer
code = code.replace(/\{Object\.keys\(prodSelections\)\.length > 0 && \(/g, '{Object.keys(prodSelections).length > 0 && (');
// wait, the old was `{selectedSize && (`
code = code.replace(/\{selectedSize && \(/g, '{Object.keys(prodSelections).length > 0 && (');

// 10. Status badge wrap fix
code = code.replace(/flex items-center gap-2">\{product\}/g, 'flex flex-wrap items-center gap-2">{product}');

fs.writeFileSync('src/pages/GuestOrdering.tsx', code);
