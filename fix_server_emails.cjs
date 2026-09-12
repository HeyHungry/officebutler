const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const oldInvoiceItems = `      let itemsHtml = Object.entries(selections).map(([prod, size]) => {
        const price = prices[\`\${prod}_\${size}\`] || 0;
        return \`<tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">\${prod} (\${size} stuks)</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">€\${price.toFixed(2)}</td>
        </tr>\`;
      }).join('');`;

const newInvoiceItems = `      let itemsHtml = '';
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

code = code.replace(oldInvoiceItems, newInvoiceItems);


const oldGuestItems = `      let itemsHtml = Object.entries(selections).map(([prod, size]: any) => {
        const price = prices[\`\${prod}_\${size}\`] || 0;
        return \`<tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">\${prod} (\${size} stuks)</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">€\${price.toFixed(2)}</td>
        </tr>\`;
      }).join('');`;

const newGuestItems = `      let itemsHtml = '';
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

code = code.replace(oldGuestItems, newGuestItems);

fs.writeFileSync('server.ts', code);
