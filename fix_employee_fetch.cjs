const fs = require('fs');
let code = fs.readFileSync('src/pages/EmployeeOrdering.tsx', 'utf8');

const fetchBlock = `        setPrices(pMap);
      }

      // Fetch allowed delivery methods
      const { data: cdmData } = await supabase.from('ob_company_delivery_methods').select('delivery_method_id').eq('company_id', compId);
      if (cdmData && cdmData.length > 0) {
        const allowedIds = cdmData.map(a => a.delivery_method_id);
        const { data: dmData } = await supabase.from('ob_delivery_methods').select('*').in('id', allowedIds).eq('is_active', true).order('sort_order', { ascending: true });
        if (dmData && dmData.length > 0) {
          setDeliveryMethods(dmData);
          setSelectedDeliveryMethod(dmData[0]);
        }
      } else {
        // Fallback to defaults if none selected for company
        const { data: dmData } = await supabase.from('ob_delivery_methods').select('*').eq('is_active', true).order('sort_order', { ascending: true });
        if (dmData && dmData.length > 0) {
          setDeliveryMethods(dmData);
          setSelectedDeliveryMethod(dmData[0]);
        }
      }
`;

code = code.replace(/setPrices\(pMap\);\n\s*\}/, fetchBlock);
fs.writeFileSync('src/pages/EmployeeOrdering.tsx', code);
