const fs = require('fs');
let code = fs.readFileSync('src/pages/EmployeeOrdering.tsx', 'utf8');

// 1. Change type of selections
code = code.replace(
  /const \[selections, setSelections\] = useState\<Record\<string, number\>\>\(\{\}\);/,
  "const [selections, setSelections] = useState<Record<string, Record<number, number>>>({});"
);

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
                company_id: companyId,
                product_name: prod,
                portion_size: size,
                price: price,
                total_price: price,
                delivery_address_id: addressId,
                phone: phone,
                notes: notes,
                delivery_date: deliveryMode === 'zsm' ? new Date().toISOString().split('T')[0] : deliveryDate,
                delivery_time: deliveryMode === 'zsm' ? 'Zo snel mogelijk' : deliveryTime
              }));
            }
          });
        });`;
code = code.replace(oldPromisesRegex, newPromises);

// 6. fix button selections logic
// old:
/*
                                  setSelections(prev => {
                                    const next = { ...prev };
                                    if (next[product] === size) delete next[product];
                                    else next[product] = size;
                                    return next;
                                  });
*/
const oldBtnSelect = /setSelections\(\s*prev\s*=>\s*\{[\s\S]*?return next;\s*\}\);/;
const newBtnSelect = `setSelections(prev => {
                                    const prodSelections = prev[product] || {};
                                    const currentQty = prodSelections[size] || 0;
                                    return {
                                      ...prev,
                                      [product]: {
                                        ...prodSelections,
                                        [size]: currentQty + 1
                                      }
                                    };
                                  });`;
code = code.replace(oldBtnSelect, newBtnSelect);

// 7. Fix highlighting
code = code.replace(/const isSelected = selections\[product\] !== undefined;/g, 'const isSelected = Object.keys(selections[product] || {}).length > 0;');
code = code.replace(/const isSizeSelected = selections\[product\] === size;/g, 'const isSizeSelected = (selections[product]?.[size] || 0) > 0;');

// 8. Add wissen button or text next to the product title since EmployeeOrdering might not have one.
// Let's check EmployeeOrdering layout. I'll just change the wrapper class.

// 9. Status badge wrap fix
code = code.replace(/flex flex-col md:flex-row md:items-center gap-4/g, 'flex flex-col md:flex-row md:items-start gap-4');
code = code.replace(/flex items-center gap-4 md:w-1\/3/g, 'flex items-start gap-4 md:w-1/3');
code = code.replace(/flex flex-col">/g, 'flex flex-col flex-wrap">');

fs.writeFileSync('src/pages/EmployeeOrdering.tsx', code);
