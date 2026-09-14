const fs = require('fs');
let code = fs.readFileSync('src/pages/GuestOrdering.tsx', 'utf8');

// 1. Add handlePortionDeselect
const addDeselectCode = `
  const handlePortionSelect = (product: string, size: number, variant: string = '') => {
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

code = code.replace(/const handlePortionSelect = \([^)]*\) => {[\s\S]*?};\n/m, addDeselectCode);

// 2. Add the minus button in the JSX
const buttonSearch = `                                      {countForCurrentSelection > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 bg-blue-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-sm border border-white">
                                          {countForCurrentSelection}
                                        </span>
                                      )}`;

const buttonReplace = `                                      {countForCurrentSelection > 0 && (
                                        <button 
                                          type="button"
                                          onClick={(e) => handlePortionDeselect(product, size, currentVariant, e)}
                                          className="absolute -top-2 -left-2 bg-red-500 text-white text-[12px] font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md border-2 border-white hover:bg-red-600 transition-colors z-10"
                                          title="Verwijder één"
                                        >
                                          -
                                        </button>
                                      )}
                                      {countForCurrentSelection > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[11px] font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md border-2 border-white">
                                          {countForCurrentSelection}
                                        </span>
                                      )}`;

code = code.replace(buttonSearch, buttonReplace);

// 3. Add scroll to top
code = code.replace(/export function GuestOrdering\(\) {/, `export function GuestOrdering() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
`);

fs.writeFileSync('src/pages/GuestOrdering.tsx', code);
