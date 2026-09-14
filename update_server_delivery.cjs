const fs = require('fs');

const file = 'server.ts';
let code = fs.readFileSync(file, 'utf8');

// Update Employee
const searchEmpBody = `const { companyId, selections, prices, orderLines, addressId, phone, notes, totalOrderPrice, deliveryDate, deliveryTime } = req.body;`;
const replaceEmpBody = `const { companyId, selections, prices, orderLines, addressId, phone, notes, totalOrderPrice, deliveryDate, deliveryTime, deliveryMethod, deliveryMethodPrice } = req.body;`;
code = code.replace(searchEmpBody, replaceEmpBody);

const searchEmpTotal = `              <tr>
                <td style="padding: 8px; font-weight: bold; text-align: right;">Totaal</td>
                <td style="padding: 8px; font-weight: bold; text-align: right;">€\${totalOrderPrice.toFixed(2)}</td>
              </tr>`;
const replaceEmpTotal = `              \${(deliveryMethod && deliveryMethodPrice > 0) ? \`<tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">Bezorging (\${deliveryMethod})</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">€\${Number(deliveryMethodPrice).toFixed(2)}</td>
              </tr>\` : ''}
              <tr>
                <td style="padding: 8px; font-weight: bold; text-align: right;">Totaal</td>
                <td style="padding: 8px; font-weight: bold; text-align: right;">€\${(totalOrderPrice + (Number(deliveryMethodPrice) || 0)).toFixed(2)}</td>
              </tr>`;
code = code.replace(searchEmpTotal, replaceEmpTotal);

// Update Guest
const searchGuestBody = `const { guestName, guestEmail, guestBillingInfo, guestAddress, phone, notes, selections, prices, orderLines, totalOrderPrice, deliveryDate, deliveryTime } = req.body;`;
const replaceGuestBody = `const { guestName, guestEmail, guestBillingInfo, guestAddress, phone, notes, selections, prices, orderLines, totalOrderPrice, deliveryDate, deliveryTime, deliveryMethod, deliveryMethodPrice } = req.body;`;
code = code.replace(searchGuestBody, replaceGuestBody);

const searchGuestTotal = `              <tr>
                <td style="padding: 8px; font-weight: bold; text-align: right;">Totaal</td>
                <td style="padding: 8px; font-weight: bold; text-align: right;">€\${totalOrderPrice.toFixed(2)}</td>
              </tr>`;
code = code.replace(searchGuestTotal, replaceEmpTotal);

fs.writeFileSync(file, code);
