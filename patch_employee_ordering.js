import fs from 'fs';
let code = fs.readFileSync('src/pages/EmployeeOrdering.tsx', 'utf8');

// 1. Add Icons
code = code.replace(/import \{ .* \} from 'lucide-react';/, (match) => {
  if (!match.includes('Clock')) {
    return match.replace('}', ', Clock, Calendar }');
  }
  return match;
});

// 2. Add State
const stateToAdd = `
  const [deliveryMode, setDeliveryMode] = useState<'zsm' | 'scheduled'>('zsm');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
`;
code = code.replace("const [notes, setNotes] = useState('');", "const [notes, setNotes] = useState('');" + stateToAdd);

// 3. Add to validation
code = code.replace(
  "if (Object.keys(selections).length === 0 || !selectedAddress || !phone) {",
  "if (Object.keys(selections).length === 0 || !selectedAddress || !phone || (deliveryMode === 'scheduled' && (!deliveryDate || !deliveryTime))) {"
);

// 4. Update the supabase insert call
const dbInsert = `
          return supabase.from('ob_orders').insert({
            company_id: companyId,
            user_id: userId,
            product_name: prod,
            portion_size: size,
            price: price,
            total_price: price,
            address_id: selectedAddress,
            phone: phone,
            notes: notes,
            delivery_date: deliveryMode === 'zsm' ? new Date().toISOString().split('T')[0] : deliveryDate,
            delivery_time: deliveryMode === 'zsm' ? 'Zo snel mogelijk' : deliveryTime
          });
`;
code = code.replace(/return supabase\.from\('ob_orders'\)\.insert\(\{[\s\S]*?\}\);/, dbInsert);

// 5. Update the fetch call body
const fetchBody = `
            body: JSON.stringify({
              companyId,
              selections,
              prices,
              addressId: selectedAddress,
              phone,
              notes,
              totalOrderPrice,
              deliveryDate: deliveryMode === 'zsm' ? new Date().toISOString().split('T')[0] : deliveryDate,
              deliveryTime: deliveryMode === 'zsm' ? 'Zo snel mogelijk' : deliveryTime
            })
`;
code = code.replace(/body: JSON\.stringify\(\{[\s\S]*?\}\)/, fetchBody);

// 6. Update the disabled condition on submit button
code = code.replace(
  "disabled={isSubmitting || Object.keys(selections).length === 0 || !selectedAddress || !phone}",
  "disabled={isSubmitting || Object.keys(selections).length === 0 || !selectedAddress || !phone || (deliveryMode === 'scheduled' && (!deliveryDate || !deliveryTime))}"
);

// 7. Add UI for delivery time
const deliveryUI = `
              {/* Delivery Time Selection */}
              <div className="border-b border-gray-100 pb-6 mb-6">
                <label className="block text-sm font-semibold text-ob-text mb-3 flex items-center gap-2">
                  <Clock size={16} className="text-gray-400" /> Bezorgmoment
                </label>
                
                <div className="flex gap-4 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="deliveryMode" 
                      value="zsm" 
                      checked={deliveryMode === 'zsm'} 
                      onChange={() => setDeliveryMode('zsm')}
                      className="text-ob-blue focus:ring-ob-blue"
                    />
                    <span className="text-sm font-medium">Zo snel mogelijk</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="deliveryMode" 
                      value="scheduled" 
                      checked={deliveryMode === 'scheduled'} 
                      onChange={() => setDeliveryMode('scheduled')}
                      className="text-ob-blue focus:ring-ob-blue"
                    />
                    <span className="text-sm font-medium">Kies datum & tijd</span>
                  </label>
                </div>

                {deliveryMode === 'scheduled' && (
                  <div className="grid grid-cols-2 gap-4 mt-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <Calendar size={14} /> Datum
                      </label>
                      <input 
                        type="date" 
                        min={new Date().toISOString().split('T')[0]}
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-ob-blue text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <Clock size={14} /> Tijd
                      </label>
                      <input 
                        type="time" 
                        value={deliveryTime}
                        onChange={(e) => setDeliveryTime(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-ob-blue text-sm"
                      />
                    </div>
                  </div>
                )}
              </div>
`;
code = code.replace("<div>\n                <label className=\"block text-sm font-semibold text-ob-text mb-2 flex items-center gap-2\">\n                  <Phone size={16} className=\"text-gray-400\" /> Telefoonnummer contactpersoon", deliveryUI + "              <div>\n                <label className=\"block text-sm font-semibold text-ob-text mb-2 flex items-center gap-2\">\n                  <Phone size={16} className=\"text-gray-400\" /> Telefoonnummer contactpersoon");

fs.writeFileSync('src/pages/EmployeeOrdering.tsx', code);
