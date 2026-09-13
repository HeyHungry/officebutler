const fs = require('fs');
let code = fs.readFileSync('src/pages/CompanyDashboard.tsx', 'utf8');

// Add Truck icon
code = code.replace(/import \{ CheckCircle2, UserPlus, Users, ListOrdered, Home, LogOut, Loader2, Save, Trash2, Edit2, Key, Link as LinkIcon \} from 'lucide-react';/, "import { CheckCircle2, UserPlus, Users, ListOrdered, Home, LogOut, Loader2, Save, Trash2, Edit2, Key, Link as LinkIcon, Truck } from 'lucide-react';");

// Add state for delivery methods
code = code.replace(/const \[selectedProducts, setSelectedProducts\] = useState<string\[\]>\(\[\]\);/, "const [selectedProducts, setSelectedProducts] = useState<string[]>([]);\n  const [allDeliveryMethods, setAllDeliveryMethods] = useState<any[]>([]);\n  const [selectedDeliveryMethods, setSelectedDeliveryMethods] = useState<string[]>([]);");

// Fetch delivery methods
const newFetch = `
        // Fetch assortment
        const { data: assortData } = await supabase.from('ob_company_assortment').select('product_name').eq('company_id', comp.id);
        if (assortData) setSelectedProducts(assortData.map((a: any) => a.product_name));

        // Fetch all active delivery methods
        const { data: dmData } = await supabase.from('ob_delivery_methods').select('*').eq('is_active', true).order('sort_order', { ascending: true });
        if (dmData) setAllDeliveryMethods(dmData);
        
        // Fetch selected delivery methods
        const { data: cdmData } = await supabase.from('ob_company_delivery_methods').select('delivery_method_id').eq('company_id', comp.id);
        if (cdmData) setSelectedDeliveryMethods(cdmData.map((a: any) => a.delivery_method_id));
`;
code = code.replace(/\/\/ Fetch assortment[\s\S]*?if \(assortData\) setSelectedProducts\(assortData\.map\(\(a: any\) => a\.product_name\)\);/, newFetch);

// Add Tab
const newTab = `
                <button onClick={() => setActiveTab('assortment')} className={\`w-full flex items-center gap-3 px-6 py-4 text-sm font-semibold transition-colors shrink-0 \${activeTab === 'assortment' ? 'bg-[#151f33] text-white border-l-4 border-white' : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'}\`}>
                  <ListOrdered size={20} />
                  <span>Assortiment</span>
                </button>
                <button onClick={() => setActiveTab('delivery')} className={\`w-full flex items-center gap-3 px-6 py-4 text-sm font-semibold transition-colors shrink-0 \${activeTab === 'delivery' ? 'bg-[#151f33] text-white border-l-4 border-white' : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'}\`}>
                  <Truck size={20} />
                  <span>Bezorgopties</span>
                </button>
`;
code = code.replace(/<button onClick=\{\(\) => setActiveTab\('assortment'\)\}[\s\S]*?<\/button>/, newTab);

// Add handlers and render block
const handlersAndRender = `
  const toggleDeliveryMethod = (id: string) => {
    if (selectedDeliveryMethods.includes(id)) {
      setSelectedDeliveryMethods(selectedDeliveryMethods.filter(m => m !== id));
    } else {
      setSelectedDeliveryMethods([...selectedDeliveryMethods, id]);
    }
  };

  const handleSaveDeliveryMethods = async () => {
    if (!company) return;
    setIsSaving(true);
    if (supabase) {
      await supabase.from('ob_company_delivery_methods').delete().eq('company_id', company.id);
      if (selectedDeliveryMethods.length > 0) {
        const inserts = selectedDeliveryMethods.map(id => ({ company_id: company.id, delivery_method_id: id }));
        await supabase.from('ob_company_delivery_methods').insert(inserts);
      }
      showSuccess();
    }
    setIsSaving(false);
  };

  const handleSaveAssortment = async () => {`;
code = code.replace(/const handleSaveAssortment = async \(\) => \{/, handlersAndRender);

const renderDeliveryTab = `
            {activeTab === 'delivery' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-serif font-bold text-[#05053D] mb-2">Bezorgopties Beheren</h2>
                    <p className="text-sm text-gray-500">Bepaal welke bezorgopties medewerkers kunnen kiezen bij hun bestelling.</p>
                  </div>
                  <button onClick={handleSaveDeliveryMethods} disabled={isSaving} className="flex items-center justify-center gap-2 bg-[#05053D] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#0a0a5c] transition-colors disabled:opacity-70 shrink-0">
                    {isSaving && <Loader2 size={16} className="animate-spin" />}
                    <Save size={18} /> Opties Opslaan
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  {allDeliveryMethods.map(method => (
                    <label key={method.id} className={\`flex flex-col gap-3 p-4 border rounded-xl cursor-pointer transition-colors \${selectedDeliveryMethods.includes(method.id) ? 'border-ob-blue bg-blue-50/30 ring-1 ring-ob-blue' : 'border-gray-200 bg-white hover:bg-gray-50'}\`}>
                      <div className="flex justify-between items-start">
                        <div className="w-full h-32 shrink-0 rounded-lg overflow-hidden bg-gray-100 mb-2">
                          <img src={method.image_url} alt={method.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                        <input 
                          type="checkbox" 
                          checked={selectedDeliveryMethods.includes(method.id)} 
                          onChange={() => toggleDeliveryMethod(method.id)}
                          className="w-5 h-5 ml-2 mt-1 rounded border-gray-300 text-ob-blue focus:ring-ob-blue shrink-0" 
                        />
                      </div>
                      <div className="flex-1">
                        <span className="font-medium text-gray-800 block text-lg">{method.name}</span>
                        <span className="text-sm text-gray-500 block mb-2">{method.description}</span>
                        <span className="font-semibold text-[#05053D]">€{Number(method.price).toFixed(2)}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'assortment' && (`;
code = code.replace(/\{activeTab === 'assortment' && \(/, renderDeliveryTab);

fs.writeFileSync('src/pages/CompanyDashboard.tsx', code);
