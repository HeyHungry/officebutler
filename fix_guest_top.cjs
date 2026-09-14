const fs = require('fs');
let code = fs.readFileSync('src/pages/GuestOrdering.tsx', 'utf8');

const newHeader = `
        <header className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-ob-blue mb-3">Eenmalig Bestellen</h1>
          <p className="text-gray-600">Selecteer uw favoriete snacks en vul uw factuur- en bezorggegevens in.</p>
        </header>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-3">
            <Info className="shrink-0 mt-0.5" size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {deliveryMethods.length > 0 && (
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-xl font-bold text-ob-blue flex items-center gap-2">
                  <Truck size={20} className="text-ob-accent" /> Kies je bezorgmethode
                </h2>
                <p className="text-gray-500 text-sm mt-1">Selecteer hoe je je bestelling wilt ontvangen of laten verzorgen.</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {deliveryMethods.map(method => (
                    <label key={method.id} className={\`flex flex-col p-4 border rounded-xl cursor-pointer transition-colors \${selectedDeliveryMethod?.id === method.id ? 'border-ob-blue bg-blue-50/30 ring-1 ring-ob-blue' : 'border-gray-200 hover:bg-gray-50'}\`}>
                      <div className="w-full h-32 rounded-lg overflow-hidden bg-gray-100 mb-4 shrink-0">
                        <img src={method.image_url} alt={method.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex items-start gap-3">
                        <input 
                          type="radio" 
                          name="delivery_method"
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
              </div>
            </section>
          )}

          {/* Assortment */}
`;

code = code.replace(/<header className="mb-10 text-center">[\s\S]*?\{\/\* Assortment \*\/\}/, newHeader);

// Ensure Truck icon is imported
if (!code.includes('Truck')) {
  code = code.replace(/import \{ ArrowLeft, CheckCircle2/, "import { ArrowLeft, CheckCircle2, Truck");
}

fs.writeFileSync('src/pages/GuestOrdering.tsx', code);
