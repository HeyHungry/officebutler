const fs = require('fs');
let code = fs.readFileSync('src/pages/EmployeeOrdering.tsx', 'utf8');

const newHeader = `
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {deliveryMethods.length > 0 && (
            <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-ob-text flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-ob-blue text-white flex items-center justify-center text-sm"><Truck size={16} /></span> 
                  Kies je bezorgmethode
                </h2>
                <p className="text-gray-500 mt-2 ml-10">Selecteer hoe je je bestelling wilt ontvangen of laten verzorgen.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {deliveryMethods.map(method => (
                  <label key={method.id} className={\`flex flex-col p-4 border rounded-xl cursor-pointer transition-colors \${selectedDeliveryMethod?.id === method.id ? 'border-ob-blue bg-blue-50/30 ring-1 ring-ob-blue' : 'border-gray-200 hover:bg-gray-50'}\`}>
                    <div className="w-full h-32 rounded-lg overflow-hidden bg-gray-100 mb-4 shrink-0">
                      <img src={method.image_url} alt={method.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex items-start gap-3">
                      <input 
                        type="radio" 
                        name="delivery_method_emp"
                        checked={selectedDeliveryMethod?.id === method.id}
                        onChange={() => setSelectedDeliveryMethod(method)}
                        className="w-5 h-5 mt-0.5 rounded-full border-gray-300 text-ob-blue focus:ring-ob-blue shrink-0" 
                      />
                      <div>
                        <span className="font-semibold text-gray-900 block text-lg">{method.name}</span>
                        <span className="text-xs text-gray-500 block mb-2">{method.description}</span>
                        <span className="font-bold text-[#05053D] block">
                          {method.price === 0 ? 'Gratis' : \`+ €\${Number(method.price).toFixed(2)}\`}
                        </span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </section>
          )}

          {/* Step 1: Producten & Porties */}
`;

code = code.replace(/<form onSubmit=\{handleSubmit\} className="space-y-8">[\s\S]*?\{\/\* Step 1: Producten & Porties \*\/\}/, newHeader);

// Ensure Truck icon is imported
if (!code.includes('Truck')) {
  code = code.replace(/import \{ CheckCircle2, ArrowRight, Loader2/, "import { CheckCircle2, ArrowRight, Loader2, Truck");
}

fs.writeFileSync('src/pages/EmployeeOrdering.tsx', code);
