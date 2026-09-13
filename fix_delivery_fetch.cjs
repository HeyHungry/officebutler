const fs = require('fs');
let code = fs.readFileSync('src/components/DeliveryOptionsManager.tsx', 'utf8');

code = code.replace(/if \\(data\\) setMethods\\(data\\);/, "if (error) console.error('Supabase error:', error);\n      if (data) setMethods(data);");

fs.writeFileSync('src/components/DeliveryOptionsManager.tsx', code);
