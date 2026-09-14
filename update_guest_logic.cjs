const fs = require('fs');
let code = fs.readFileSync('src/pages/GuestOrdering.tsx', 'utf8');

// 1. selections state
code = code.replace(/const \[selections, setSelections\] = useState<Record<string, Record<number, number>>>\(\{\}\);/, "const [selections, setSelections] = useState<Record<string, Record<string, number>>>({});");

// 2. handlePortionSelect
const oldSelect = `const handlePortionSelect = (product: string, size: number) => {
    setSelections(prev => {
      const currentObj = prev[product] || {};
      const currentQty = currentObj[size] || 0;
      return {
        ...prev,
        [product]: {
          ...currentObj,
          [size]: currentQty + 1
        }
      };
    });
  };`;
const newSelect = `const handlePortionSelect = (product: string, size: number, variant: string = '') => {
    setSelections(prev => {
      const currentObj = prev[product] || {};
      const key = variant ? \`\${size}_\${variant}\` : \`\${size}\`;
      const currentQty = currentObj[key] || 0;
      return {
        ...prev,
        [product]: {
          ...currentObj,
          [key]: currentQty + 1
        }
      };
    });
  };`;
code = code.replace(oldSelect, newSelect);

// 3. price calc 1 (submit)
code = code.replace(/prodSum \+= \(prices\[\`\$\{prod\}_\$\{s\}\`\] \|\| 0\) \* \(qty as number\);/g, "const sizeNum = s.split('_')[0];\n        prodSum += (prices[`${prod}_${sizeNum}`] || 0) * (qty as number);");

// 4. submit loop
const oldLoop = `Object.entries(sizes as any).forEach(([sizeStr, qty]) => {
            const size = Number(sizeStr);
            const price = prices[\`\${prod}_\${size}\`] || 0;
            
            for (let i = 0; i < (qty as number); i++) {
              orderPromises.push(supabase.from('ob_orders').insert({
                product_name: prod,`;
const newLoop = `Object.entries(sizes as any).forEach(([sizeStr, qty]) => {
            const parts = sizeStr.split('_');
            const size = Number(parts[0]);
            const variant = parts[1] || '';
            const price = prices[\`\${prod}_\${size}\`] || 0;
            const finalProdName = variant ? \`\${prod} (\${variant})\` : prod;
            
            for (let i = 0; i < (qty as number); i++) {
              orderPromises.push(supabase.from('ob_orders').insert({
                product_name: finalProdName,`;
code = code.replace(oldLoop, newLoop);

fs.writeFileSync('src/pages/GuestOrdering.tsx', code);
