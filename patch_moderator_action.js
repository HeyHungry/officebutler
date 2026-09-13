import fs from 'fs';

let code = fs.readFileSync('src/components/ModeratorPanel.tsx', 'utf8');

// 1. Add Acties column header
code = code.replace(
  '<th className="p-4 font-semibold whitespace-nowrap">Gewenste Levering</th>',
  '<th className="p-4 font-semibold whitespace-nowrap">Gewenste Levering</th>\\n                                    <th className="p-4 font-semibold text-right">Acties</th>'
);

// 2. We need a state to track loading state for resend buttons
if (!code.includes('const [resendingInvoice, setResendingInvoice] = useState<string | null>(null);')) {
  code = code.replace(
    'const [impersonating, setImpersonating] = useState<any>(null);',
    'const [impersonating, setImpersonating] = useState<any>(null);\\n  const [resendingInvoice, setResendingInvoice] = useState<string | null>(null);'
  );
}

// 3. Add the handleResend function
if (!code.includes('const handleResendInvoice = async')) {
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
    'const impersonateStore = (store: any) => {',
    func + '\\n  const impersonateStore = (store: any) => {'
  );
}

// 4. Add the button in the table body
const findTableTd = `                                        {group.delivery_date ? new Date(group.delivery_date).toLocaleDateString('nl-NL') : 'Onbekend'}
                                        <br/>
                                        {group.delivery_time ? <span className="font-medium">{group.delivery_time}</span> : ''}
                                      </td>
                                    </tr>`;

const replaceTableTd = `                                        {group.delivery_date ? new Date(group.delivery_date).toLocaleDateString('nl-NL') : 'Onbekend'}
                                        <br/>
                                        {group.delivery_time ? <span className="font-medium">{group.delivery_time}</span> : ''}
                                      </td>
                                      <td className="p-4 align-middle text-right">
                                        <button 
                                          onClick={() => handleResendInvoice(group)}
                                          disabled={resendingInvoice === group.id}
                                          className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
                                          title="Stuur factuur/bevestiging opnieuw naar ons toe"
                                        >
                                          {resendingInvoice === group.id ? (
                                            <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin inline-block"></span>
                                          ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M2.13 15.57a9 9 0 1 0 3.87-11.45L2 6"/></svg>
                                          )}
                                          Opnieuw sturen
                                        </button>
                                      </td>
                                    </tr>`;

code = code.replace(findTableTd, replaceTableTd);

fs.writeFileSync('src/components/ModeratorPanel.tsx', code);
console.log("Patched ModeratorPanel for Resend Action");
