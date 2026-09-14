const fs = require('fs');
let code = fs.readFileSync('src/pages/GuestOrdering.tsx', 'utf8');

const fetchBlock = `        if (globalPrices) {
          const newPrices: Record<string, number> = {};
          const productNames = new Set<string>();
          globalPrices.forEach(gp => {
            newPrices[\`\${gp.product_name}_\${gp.portion_size}\`] = gp.price || gp.default_price;
            productNames.add(gp.product_name);
          });
          if (Object.keys(newPrices).length > 0) {
            setPrices(prev => ({ ...prev, ...newPrices }));
          }
        }
        
        const { data: dmData } = await supabase.from('ob_delivery_methods').select('*').eq('is_active', true).order('sort_order', { ascending: true });
        if (dmData && dmData.length > 0) {
          setDeliveryMethods(dmData);
          setSelectedDeliveryMethod(dmData[0]);
        }
`;

code = code.replace(/if \(globalPrices\) \{[\s\S]*?\}\n\s*\}/, fetchBlock);
fs.writeFileSync('src/pages/GuestOrdering.tsx', code);
