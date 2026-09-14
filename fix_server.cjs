const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

// For employee
const searchEmpBody = `const { companyId, selections, prices, addressId, phone, notes, totalOrderPrice, deliveryDate, deliveryTime } = req.body;`;
const replaceEmpBody = `const { companyId, selections, prices, orderLines, addressId, phone, notes, totalOrderPrice, deliveryDate, deliveryTime } = req.body;`;
code = code.replace(searchEmpBody, replaceEmpBody);

const searchEmpItems = `      let itemsHtml = '';
      for (const [prod, sizes] of Object.entries(selections)) {
        for (const [sizeStr, qty] of Object.entries(sizes as any)) {
          const size = Number(sizeStr);
          const price = prices[\`\${prod}_\${size}\`] || 0;
          const lineTotal = price * (qty as number);
          itemsHtml += \`<tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">\${qty}x \${prod} (\${size} stuks)</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">€\${lineTotal.toFixed(2)}</td>
          </tr>\`;
        }
      }`;

const replaceEmpItems = `      let itemsHtml = '';
      if (orderLines && Array.isArray(orderLines)) {
        for (const line of orderLines) {
          itemsHtml += \`<tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">\${line.qty}x \${line.product_name} (\${line.portion_size} stuks)</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">€\${line.lineTotal.toFixed(2)}</td>
          </tr>\`;
        }
      } else {
        for (const [prod, sizes] of Object.entries(selections)) {
          for (const [sizeStr, qty] of Object.entries(sizes as any)) {
            const size = Number(sizeStr);
            const price = prices[\`\${prod}_\${size}\`] || 0;
            const lineTotal = price * (qty as number);
            itemsHtml += \`<tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">\${qty}x \${prod} (\${size} stuks)</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">€\${lineTotal.toFixed(2)}</td>
            </tr>\`;
          }
        }
      }`;
code = code.replace(searchEmpItems, replaceEmpItems);


// For guest
const searchGuestBody = `const { guestName, guestEmail, guestBillingInfo, guestAddress, phone, notes, selections, prices, totalOrderPrice, deliveryDate, deliveryTime } = req.body;`;
const replaceGuestBody = `const { guestName, guestEmail, guestBillingInfo, guestAddress, phone, notes, selections, prices, orderLines, totalOrderPrice, deliveryDate, deliveryTime } = req.body;`;
code = code.replace(searchGuestBody, replaceGuestBody);

const searchGuestItems = `      let itemsHtml = '';
      for (const [prod, sizes] of Object.entries(selections)) {
        for (const [sizeStr, qty] of Object.entries(sizes as any)) {
          const size = Number(sizeStr);
          const price = prices[\`\${prod}_\${size}\`] || 0;
          const lineTotal = price * (qty as number);
          itemsHtml += \`<tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">\${qty}x \${prod} (\${size} stuks)</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">€\${lineTotal.toFixed(2)}</td>
          </tr>\`;
        }
      }`;

const replaceGuestItems = `      let itemsHtml = '';
      if (orderLines && Array.isArray(orderLines)) {
        for (const line of orderLines) {
          itemsHtml += \`<tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">\${line.qty}x \${line.product_name} (\${line.portion_size} stuks)</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">€\${line.lineTotal.toFixed(2)}</td>
          </tr>\`;
        }
      } else {
        for (const [prod, sizes] of Object.entries(selections)) {
          for (const [sizeStr, qty] of Object.entries(sizes as any)) {
            const size = Number(sizeStr);
            const price = prices[\`\${prod}_\${size}\`] || 0;
            const lineTotal = price * (qty as number);
            itemsHtml += \`<tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">\${qty}x \${prod} (\${size} stuks)</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">€\${lineTotal.toFixed(2)}</td>
            </tr>\`;
          }
        }
      }`;

code = code.replace(searchGuestItems, replaceGuestItems);

fs.writeFileSync('server.ts', code);
