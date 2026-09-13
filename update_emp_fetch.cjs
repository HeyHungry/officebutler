const fs = require('fs');
let code = fs.readFileSync('src/pages/EmployeeOrdering.tsx', 'utf8');

const fetchBlock = `      // Fetch allowed delivery methods
      const { data: cdmData, error: cdmError } = await supabase.from('ob_company_delivery_methods').select('delivery_method_id').eq('company_id', compId);
      if (cdmError) console.error('Error fetching company delivery methods:', cdmError);
      
      if (cdmData && cdmData.length > 0) {
        const allowedIds = cdmData.map(a => a.delivery_method_id);
        const { data: dmData, error: dmError } = await supabase.from('ob_delivery_methods').select('*').in('id', allowedIds).eq('is_active', true).order('sort_order', { ascending: true });
        if (dmError) console.error('Error fetching delivery methods:', dmError);
        if (dmData && dmData.length > 0) {
          setDeliveryMethods(dmData);
          setSelectedDeliveryMethod(dmData[0]);
        }
      } else {
        // Fallback to defaults if none selected for company
        const { data: dmData, error: dmError } = await supabase.from('ob_delivery_methods').select('*').eq('is_active', true).order('sort_order', { ascending: true });
        if (dmError) console.error('Error fetching fallback delivery methods:', dmError);
        if (dmData && dmData.length > 0) {
          setDeliveryMethods(dmData);
          setSelectedDeliveryMethod(dmData[0]);
        }
      }
`;

code = code.replace(/\/\/ Fetch allowed delivery methods[\s\S]*?setSelectedDeliveryMethod\(dmData\[0\]\);\n\s*\}\n\s*\}/, fetchBlock);
fs.writeFileSync('src/pages/EmployeeOrdering.tsx', code);
