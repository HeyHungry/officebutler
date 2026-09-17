const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const target = `      } else {
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

const replacement = `      } else {
        for (const [prod, sizes] of Object.entries(selections)) {
          for (const [sizeStr, qty] of Object.entries(sizes as any)) {
            const parts = String(sizeStr).split('_');
            const size = Number(parts[0]);
            const variant = parts[1] || '';
            const finalProd = variant ? \`\${prod} (\${variant})\` : prod;
            const price = prices[\`\${prod}_\${sizeStr}\`] || prices[\`\${prod}_\${size}\`] || 0;
            const lineTotal = price * (qty as number);
            itemsHtml += \`<tr>
              <td style="padding: 8px; border-bottom: 1px solid #eee;">\${qty}x \${finalProd} (\${size} stuks)</td>
              <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">€\${lineTotal.toFixed(2)}</td>
            </tr>\`;
          }
        }
      }`;

code = code.split(target).join(replacement);
fs.writeFileSync('server.ts', code);
