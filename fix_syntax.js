import fs from 'fs';
let code = fs.readFileSync('src/components/ModeratorPanel.tsx', 'utf8');
code = code.replace("      if (priceData) setProductPrices(priceData);\n        ]);\n      }", "      if (priceData) setProductPrices(priceData);");
fs.writeFileSync('src/components/ModeratorPanel.tsx', code);
