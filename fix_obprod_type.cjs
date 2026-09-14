const fs = require('fs');
let code = fs.readFileSync('src/components/MenuManager.tsx', 'utf8');
code = code.replace("variants?: string[];", "variants?: string[];\n  variant_surcharges?: Record<string, number>;");
fs.writeFileSync('src/components/MenuManager.tsx', code);
