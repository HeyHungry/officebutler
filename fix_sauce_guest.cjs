const fs = require('fs');
const guestFile = 'src/pages/GuestOrdering.tsx';
let guestCode = fs.readFileSync(guestFile, 'utf8');

const guestSearch = `            const surcharge = getVariantSurcharge(prod, variant, sizeNum);
            const price = basePrice + surcharge;
            const finalProdName = variant ? \`\${prod} (\${variant})\` : prod;
            
            orderLines.push({`;

const guestReplace = `            const surcharge = getVariantSurcharge(prod, variant, sizeNum);
            const price = basePrice + surcharge;
            let finalProdName = variant ? \`\${prod} (\${variant})\` : prod;
            const dbProduct = dbProducts.find(p => p.name === prod);
            if (dbProduct && dbProduct.sauces && dbProduct.sauces.length > 0) {
              finalProdName += \` [+ \${dbProduct.sauces.join(', ')}]\`;
            }
            
            orderLines.push({`;
guestCode = guestCode.replace(guestSearch, guestReplace);
fs.writeFileSync(guestFile, guestCode);
