const fs = require('fs');
let code = fs.readFileSync('src/components/MenuManager.tsx', 'utf8');

const targetStr = `  const categories = Array.from(new Set([...products.map(p => p.category), editForm.category])).filter(Boolean) as string[];
  if (categories.length === 0) categories.push('Snacks', 'Vega');`;

const newStr = `  const categories = Array.from(new Set([...products.map(p => p.category), editForm.category])).filter(Boolean) as string[];
  if (categories.length === 0) categories.push('Snacks', 'Vega');
  
  const allVariants = Array.from(new Set(products.flatMap(p => p.variants || []))).sort();
  const allSauces = Array.from(new Set(products.flatMap(p => p.sauces || []))).sort();`;

code = code.replace(targetStr, newStr);
fs.writeFileSync('src/components/MenuManager.tsx', code);
