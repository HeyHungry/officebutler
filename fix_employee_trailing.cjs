const fs = require('fs');
let code = fs.readFileSync('src/pages/EmployeeOrdering.tsx', 'utf8');

// The block to remove:
const trailingBlock = ` else {
        // Fallback to defaults if none selected for company
        const { data: dmData } = await supabase.from('ob_delivery_methods').select('*').eq('is_active', true).order('sort_order', { ascending: true });
        if (dmData && dmData.length > 0) {
          setDeliveryMethods(dmData);
          setSelectedDeliveryMethod(dmData[0]);
        }
      }`;

code = code.replace(trailingBlock, "");
fs.writeFileSync('src/pages/EmployeeOrdering.tsx', code);
