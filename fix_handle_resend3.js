import fs from 'fs';

let code = fs.readFileSync('src/components/ModeratorPanel.tsx', 'utf8');

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

code = code.replace(
  '  useEffect(() => {\n    if (isOpen && isAuthenticated) {\n      fetchDashboardData();\n    }\n  }, [isOpen, isAuthenticated]);',
  '  useEffect(() => {\n    if (isOpen && isAuthenticated) {\n      fetchDashboardData();\n    }\n  }, [isOpen, isAuthenticated]);\n' + func
);

fs.writeFileSync('src/components/ModeratorPanel.tsx', code);
console.log("Added handleResendInvoice for real.");
