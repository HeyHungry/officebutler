import fs from 'fs';

let code = fs.readFileSync('src/components/ModeratorPanel.tsx', 'utf8');

// The handleResendInvoice might have been added inside the return block or not at the right scope.
// Let's first completely remove any handleResendInvoice function that's in the wrong place, and then add it properly near the top of the component.

// 1. Check if the function exists
if (!code.includes('const handleResendInvoice = async (group: any) => {')) {
  // Add it correctly
  const func = `
  const handleResendInvoice = async (group: any) => {
    try {
      setResendingInvoice(group.id);
      
      const payload = {
        customerName: group.company_name,
        items: group.items.map((i: any) => ({
          name: i.product_name,
          size: i.portion_size,
          price: Number(i.price)
        })),
        totalPrice: group.total_order_price,
        deliveryDate: group.delivery_date ? new Date(group.delivery_date).toLocaleDateString('nl-NL') : 'Onbekend',
        deliveryTime: group.delivery_time || '',
        address: group.address || '',
        phone: group.phone || '',
        notes: group.items[0]?.notes || ''
      };

      const res = await fetch('/api/resend-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const resData = await res.json();
      if (!res.ok || !resData.success) {
        throw new Error(resData.error || resData.message || 'Fout bij herverzenden');
      }
      
      alert('Factuur is succesvol opnieuw verzonden!');
    } catch (err: any) {
      console.error(err);
      alert('Fout bij herverzenden: ' + err.message);
    } finally {
      setResendingInvoice(null);
    }
  };
`;
  
  // Find a good place to insert it, like after useEffect or other states
  code = code.replace(
    '  useEffect(() => {\n    loadData();\n  }, []);',
    '  useEffect(() => {\n    loadData();\n  }, []);\n' + func
  );
  
  fs.writeFileSync('src/components/ModeratorPanel.tsx', code);
  console.log("Patched handleResendInvoice successfully.");
} else {
  console.log("Function handleResendInvoice already exists, let's see where it is.");
}
