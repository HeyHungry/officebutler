const fs = require('fs');

const empFile = 'src/pages/EmployeeOrdering.tsx';
let empCode = fs.readFileSync(empFile, 'utf8');

const searchDB = `        const orderPromises: any[] = [];
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

const replaceDB = `        const orderPromises: any[] = [];
        const orderLines: any[] = [];
        Object.entries(selections).forEach(([prod, sizes]) => {
          Object.entries(sizes as any).forEach(([sizeStr, qty]) => {
            const parts = String(sizeStr).split('_');
            const sizeNum = Number(parts[0]);
            const variant = parts[1] || '';
            const basePrice = prices[\`\${prod}_\${sizeNum}\`] || 0;
            const surcharge = getVariantSurcharge(prod, variant, sizeNum);
            const price = basePrice + surcharge;
            const finalProdName = variant ? \`\${prod} (\${variant})\` : prod;

            orderLines.push({
              product_name: finalProdName,
              portion_size: sizeNum,
              price: price,
              qty: qty as number,
              lineTotal: price * (qty as number)
            });
            
            for (let i = 0; i < (qty as number); i++) {
              orderPromises.push(supabase.from('ob_orders').insert({
                company_id: companyId,
                product_name: finalProdName,
                portion_size: sizeNum,
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

empCode = empCode.replace(searchDB, replaceDB);

const searchFetch = `            body: JSON.stringify({
              companyId,
              selections,
              prices,
              addressId: selectedAddress,
              phone,
              notes,
              totalOrderPrice,
              deliveryDate: deliveryMode === 'zsm' ? new Date().toISOString().split('T')[0] : deliveryDate,
              deliveryTime: deliveryMode === 'zsm' ? 'Zo snel mogelijk' : deliveryTime
            })`;

const replaceFetch = `            body: JSON.stringify({
              companyId,
              selections,
              prices,
              orderLines,
              addressId: selectedAddress,
              phone,
              notes,
              totalOrderPrice,
              deliveryDate: deliveryMode === 'zsm' ? new Date().toISOString().split('T')[0] : deliveryDate,
              deliveryTime: deliveryMode === 'zsm' ? 'Zo snel mogelijk' : deliveryTime
            })`;

empCode = empCode.replace(searchFetch, replaceFetch);
fs.writeFileSync(empFile, empCode);
