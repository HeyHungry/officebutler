const fs = require('fs');
const empFile = 'src/pages/EmployeeOrdering.tsx';
let empCode = fs.readFileSync(empFile, 'utf8');

const empSearch = `            const surcharge = getVariantSurcharge(prod, variant, sizeNum);
            const price = basePrice + surcharge;
            const finalProdName = variant ? \`\${prod} (\${variant})\` : prod;

            orderLines.push({`;

const empReplace = `            const surcharge = getVariantSurcharge(prod, variant, sizeNum);
            const price = basePrice + surcharge;
            let finalProdName = variant ? \`\${prod} (\${variant})\` : prod;
            const dbProduct = dbProducts.find(p => p.name === prod);
            if (dbProduct && dbProduct.sauces && dbProduct.sauces.length > 0) {
              finalProdName += \` [+ \${dbProduct.sauces.join(', ')}]\`;
            }

            orderLines.push({`;
empCode = empCode.replace(empSearch, empReplace);
fs.writeFileSync(empFile, empCode);
