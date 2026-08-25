import fs from 'fs';

// Helper to patch the HTML
function patchInvoice(content) {
  let modified = content.replace(
    /const \{ companyId, selections, prices, addressId, phone, notes, totalOrderPrice \} = req\.body;/,
    "const { companyId, selections, prices, addressId, phone, notes, totalOrderPrice, deliveryDate, deliveryTime } = req.body;"
  );

  const newDeliveryInfo = `
          <h3 style="margin-top: 0; color: #05053D;">Aflevergegevens</h3>
          <p style="margin: 5px 0; padding: 10px; background: #fff3e0; border-left: 4px solid #ff9800; border-radius: 4px; font-weight: bold; color: #e65100;">
            📅 Bezorgmoment: \${deliveryDate} om \${deliveryTime}
          </p>
          <p style="margin: 5px 0;"><strong>Locatie:</strong> \${address?.label} (\${address?.address_line})</p>
`;
  
  modified = modified.replace(
    /<h3 style="margin-top: 0; color: #05053D;">Aflevergegevens<\/h3>\s*<p style="margin: 5px 0;"><strong>Locatie:<\/strong> \$\{address\?\.label\} \(\$\{address\?\.address_line\}\)<\/p>/,
    newDeliveryInfo
  );

  return modified;
}

// Patch api/send-invoice.ts
let apiCode = fs.readFileSync('api/send-invoice.ts', 'utf8');
apiCode = patchInvoice(apiCode);
fs.writeFileSync('api/send-invoice.ts', apiCode);

// Patch server.ts
let serverCode = fs.readFileSync('server.ts', 'utf8');
serverCode = patchInvoice(serverCode);
fs.writeFileSync('server.ts', serverCode);
