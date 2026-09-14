const fs = require('fs');

const guestFile = 'src/pages/GuestOrdering.tsx';
let guestCode = fs.readFileSync(guestFile, 'utf8');

// 1. Build orderLines instead of directly building orderPromises
const searchDB = `        const orderPromises: any[] = [];
        Object.entries(selections).forEach(([prod, sizes]) => {
          Object.entries(sizes as any).forEach(([sizeStr, qty]) => {
            const parts = sizeStr.split('_');
            const size = Number(parts[0]);
            const variant = parts[1] || '';
            const basePrice = prices[\`\${prod}_\${size}\`] || 0;
            const surcharge = getVariantSurcharge(prod, variant, size);
            const price = basePrice + surcharge;
            const finalProdName = variant ? \`\${prod} (\${variant})\` : prod;
            
            for (let i = 0; i < (qty as number); i++) {
              orderPromises.push(supabase.from('ob_orders').insert({
                product_name: finalProdName,
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
                product_name: finalProdName,
                portion_size: sizeNum,
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

guestCode = guestCode.replace(searchDB, replaceDB);

const searchFetch = `            body: JSON.stringify({
              guestName,
              guestEmail,
              guestBillingInfo,
              guestAddress,
              selections,
              prices,
              phone,
              notes,
              totalOrderPrice,
              deliveryDate: deliveryMode === 'zsm' ? new Date().toISOString().split('T')[0] : deliveryDate,
              deliveryTime: deliveryMode === 'zsm' ? 'Zo snel mogelijk' : deliveryTime
            })`;

const replaceFetch = `            body: JSON.stringify({
              guestName,
              guestEmail,
              guestBillingInfo,
              guestAddress,
              selections,
              prices,
              orderLines,
              phone,
              notes,
              totalOrderPrice,
              deliveryDate: deliveryMode === 'zsm' ? new Date().toISOString().split('T')[0] : deliveryDate,
              deliveryTime: deliveryMode === 'zsm' ? 'Zo snel mogelijk' : deliveryTime
            })`;

guestCode = guestCode.replace(searchFetch, replaceFetch);
fs.writeFileSync(guestFile, guestCode);
