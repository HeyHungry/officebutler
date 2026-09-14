const fs = require('fs');
let code = fs.readFileSync('src/pages/GuestOrdering.tsx', 'utf8');

// Find start of handlePortionSelect
const startIndex = code.indexOf('const handlePortionSelect');
const endIndex = code.indexOf('const handleRemove');

const correctCode = `const handlePortionSelect = (product: string, size: number, variant: string = '') => {
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
  };

  const handlePortionDeselect = (product: string, size: number, variant: string = '', e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setSelections(prev => {
      const currentObj = prev[product] || {};
      const key = variant ? \`\${size}_\${variant}\` : \`\${size}\`;
      const currentQty = currentObj[key] || 0;
      
      if (currentQty <= 1) {
        const newObj = { ...currentObj };
        delete newObj[key];
        if (Object.keys(newObj).length === 0) {
          const newSelections = { ...prev };
          delete newSelections[product];
          return newSelections;
        }
        return { ...prev, [product]: newObj };
      }
      return {
        ...prev,
        [product]: {
          ...currentObj,
          [key]: currentQty - 1
        }
      };
    });
  };

  `;

code = code.substring(0, startIndex) + correctCode + code.substring(endIndex);
fs.writeFileSync('src/pages/GuestOrdering.tsx', code);
