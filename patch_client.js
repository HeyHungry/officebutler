import fs from 'fs';
let code = fs.readFileSync('src/pages/EmployeeOrdering.tsx', 'utf8');

const apiCall = `
        const results = await Promise.all(orderPromises);
        const errors = results.filter(r => r.error);
        if (errors.length > 0) throw errors[0].error;

        // Try to send the invoice email
        try {
          await fetch('/api/send-invoice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              companyId,
              selections,
              prices,
              addressId: selectedAddress,
              phone,
              notes,
              totalOrderPrice
            })
          });
        } catch (emailErr) {
          console.error("Kon email niet verzenden:", emailErr);
          // We still show success to the user since the DB insert worked
        }

        setOrderSuccess(true);
`;

code = code.replace(
  /const results = await Promise\.all\(orderPromises\);\n        const errors = results\.filter\(r => r\.error\);\n        if \(errors\.length > 0\) throw errors\[0\]\.error;\n\n        setOrderSuccess\(true\);/g, 
  apiCall
);

fs.writeFileSync('src/pages/EmployeeOrdering.tsx', code);
