import { useState, useEffect, FormEvent } from 'react';
import { supabase, ObCompany } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Building, MapPin, Users, Package, Save, CheckCircle2, Plus, Trash2, Mail, Lock, UserPlus, Eye, EyeOff, ShoppingBag } from 'lucide-react';

type Tab = 'settings' | 'addresses' | 'employees' | 'assortment';

type Address = {
  id: string;
  label: string;
  address_line: string;
  instructions: string;
};

// Extracted from Menu.tsx
const AVAILABLE_PRODUCTS = [
  { name: 'Snack Mix', image: 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/img_0743d367c64afbf145e9c0fea03ba65553996e64ffef54a95252060ee7ac758c/responsive320' },
  { name: 'Bitterballen', image: 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/233e7d3e-19d8-4504-adf9-2100d5c71800/responsive640' },
  { name: 'Vlammetjes', image: 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/c3a12a9a-1fd9-4041-11a7-c2ba71d3c100/responsive960' },
  { name: 'Frikandelletjes', image: 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/089a0deb-f72e-46b4-cd48-de98d1f82a00/responsive640' },
  { name: 'Mini Kroketjes', image: 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/53ee579e-f63d-4c57-8f54-dae1e90a1c00/responsive640' },
  { name: 'Chicken Wings', image: 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/ee601f8d-efac-4ef4-2cee-c4c59c117200/responsive640' },
  { name: 'Kipnuggets', image: 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/b58dad40-1353-4159-e305-2669d75f6b00/responsive640' },
  { name: 'Karaage Kip', image: 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/img_5991de8e937102a4dd1ef314fb255423bf85586b62f82c8285e054e14615ce52/responsive640' },
  { name: 'Butterfly Gamba\'s', image: 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/8688dded-96d4-414f-e816-8553f5ec8000/responsive640' },
  { name: 'Kaasstengels', image: 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/img_8d2216804329784b49540823b54b47525bfcf318725033896b6fb9646d6cc0d1/responsive640' },
  { name: 'Curry Samosas', image: 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/ae28ddae-8a3f-4049-3527-09fa31308f00/responsive640' },
  { name: 'Mini Loempia', image: 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/9eab1d3b-96cc-449a-e6af-7a4ee6e66d00/responsive640' },
  { name: 'Vegan Bitterballen', image: 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/img_382e6f9d8eabd5d872ed938ed4c12f25c6696f38b8ab2d2791d968c2783fd954/responsive640' }
];

export function CompanyDashboard() {
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const impersonateId = searchParams.get("companyId");
  const [activeTab, setActiveTab] = useState<Tab>('settings');
  const [company, setCompany] = useState<ObCompany | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

  // Settings State
  const [billingEmail, setBillingEmail] = useState('');
  const [billingInfo, setBillingInfo] = useState('');
  const [spendLimit, setSpendLimit] = useState('');

  // Addresses State
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [newLabel, setNewLabel] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newInstructions, setNewInstructions] = useState('');

  // Employees State
  const [allowedDomain, setAllowedDomain] = useState('');
  const [newEmpEmail, setNewEmpEmail] = useState('');
  const [newEmpPassword, setNewEmpPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);

  // Assortment State
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  useEffect(() => {
    fetchCompanyData();
  }, []);

  const fetchCompanyData = async () => {
    if (!supabase) {
      // Mock Data for preview
      const mockComp: ObCompany = { id: 'mock', name: 'Mock BV', address: 'Straat 1', phone: '061234', billing_email: 'mock@mock.nl', billing_info: 'KVK: 12345678', allowed_email_domain: '@mock.nl', is_approved: true, created_at: new Date().toISOString() };
      setCompany(mockComp);
      setBillingEmail(mockComp.billing_email || '');
      setBillingInfo(mockComp.billing_info || '');
      setAllowedDomain(mockComp.allowed_email_domain || '');
      setAddresses([{ id: 'a1', label: 'Hoofdkantoor', address_line: 'Straat 1, Ams', instructions: 'Bellen bij receptie' }]);
      setSelectedProducts(['Snack Mix', 'Bitterballen']);
      setIsLoading(false);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      // Get profile to find company_id or admin role
      const { data: profile } = await supabase.from('ob_user_profiles').select('*').eq('id', session.user.id).maybeSingle();
      
      if (profile?.role === 'employee') {
        navigate('/order');
        return;
      }
      
      let targetCompanyId = profile?.company_id;
      if (profile?.role === 'admin' && impersonateId) {
        targetCompanyId = impersonateId;
      }

      let comp;
      if (targetCompanyId) {
        const { data: c } = await supabase.from('ob_companies').select('*').eq('id', targetCompanyId).single();
        comp = c;
      } else {
        // Fallback for older accounts that don't have a user profile yet
        const { data: c } = await supabase.from('ob_companies').select('*').eq('billing_email', session.user.email).maybeSingle();
        comp = c;
        if (comp) {
            // Auto-heal the profile
            await supabase.from('ob_user_profiles').upsert({ id: session.user.id, company_id: comp.id, role: 'office_manager' });
        }
      }

      if (!comp) {
        navigate('/'); // Not an office manager and no company ID to impersonate
        return;
      }

      setCompany(comp);
        setBillingEmail(comp.billing_email || '');
        setBillingInfo(comp.billing_info || '');
        setSpendLimit(comp.employee_spend_limit ? comp.employee_spend_limit.toString() : '');
        setAllowedDomain(comp.allowed_email_domain || '');
        
        // Fetch addresses
        const { data: addrData } = await supabase.from('ob_company_addresses').select('*').eq('company_id', comp.id);
        if (addrData) setAddresses(addrData);

        // Fetch assortment
        const { data: assortData } = await supabase.from('ob_company_assortment').select('product_name').eq('company_id', comp.id);
        if (assortData) setSelectedProducts(assortData.map((a: any) => a.product_name));

        // Fetch employees
        const { data: empData } = await supabase.from('ob_user_profiles').select('*').eq('company_id', comp.id).eq('role', 'employee');
        if (empData) setEmployees(empData);
    } catch (e) {
      console.error(e);
      setError('Fout bij het laden van gegevens.');
    } finally {
      setIsLoading(false);
    }
  };

  const showSuccess = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSaveSettings = async (e: FormEvent) => {
    e.preventDefault();
    if (!company) return;
    setIsSaving(true);
    
    if (supabase) {
      const { error } = await supabase.from('ob_companies').update({
        billing_email: billingEmail,
        billing_info: billingInfo,
        employee_spend_limit: spendLimit ? parseFloat(spendLimit) : null
      }).eq('id', company.id);
      
      if (!error) showSuccess();
    } else {
      showSuccess(); // Mock
    }
    setIsSaving(false);
  };

  const handleAddAddress = async (e: FormEvent) => {
    e.preventDefault();
    if (!company) return;
    setIsSaving(true);

    if (supabase) {
      const { data, error } = await supabase.from('ob_company_addresses').insert({
        company_id: company.id,
        label: newLabel,
        address_line: newAddress,
        instructions: newInstructions
      }).select().single();

      if (!error && data) {
        setAddresses([...addresses, data]);
        setNewLabel(''); setNewAddress(''); setNewInstructions('');
      }
    } else {
      // Mock
      setAddresses([...addresses, { id: Date.now().toString(), label: newLabel, address_line: newAddress, instructions: newInstructions }]);
      setNewLabel(''); setNewAddress(''); setNewInstructions('');
    }
    setIsSaving(false);
  };

  const handleDeleteAddress = async (id: string) => {
    if (supabase) {
      await supabase.from('ob_company_addresses').delete().eq('id', id);
    }
    setAddresses(addresses.filter(a => a.id !== id));
  };

  const handleSaveDomain = async (e: FormEvent) => {
    e.preventDefault();
    if (!company) return;
    setIsSaving(true);

    if (supabase) {
      const { error } = await supabase.from('ob_companies').update({
        allowed_email_domain: allowedDomain
      }).eq('id', company.id);
      if (!error) showSuccess();
    } else {
      showSuccess(); // Mock
    }
    setIsSaving(false);
  };

  const handleCreateEmployee = async (e: FormEvent) => {
    e.preventDefault();
    if (!company) return;
    setIsSaving(true);
    setError('');

    try {
      const res = await fetch('/api/create-employee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmpEmail, password: newEmpPassword, companyId: company.id })
      });
      
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Er is een fout opgetreden');
      }

      showSuccess();
      setNewEmpEmail('');
      setNewEmpPassword('');
      fetchCompanyData(); // refresh the employee list
    } catch (err: any) {
      setError(err.message);
    }

    setIsSaving(false);
  };

  const toggleProduct = (product: string) => {
    if (selectedProducts.includes(product)) {
      setSelectedProducts(selectedProducts.filter(p => p !== product));
    } else {
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  const handleSaveAssortment = async () => {
    if (!company) return;
    setIsSaving(true);

    if (supabase) {
      // Clear old assortment
      await supabase.from('ob_company_assortment').delete().eq('company_id', company.id);
      // Insert new assortment
      if (selectedProducts.length > 0) {
        const inserts = selectedProducts.map(p => ({ company_id: company.id, product_name: p }));
        await supabase.from('ob_company_assortment').insert(inserts);
      }
      showSuccess();
    } else {
      showSuccess(); // Mock
    }
    setIsSaving(false);
  };

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    navigate('/auth');
  };

  if (isLoading) {
    return <div className="min-h-screen bg-ob-cream pt-32 flex items-center justify-center font-serif">Laden...</div>;
  }

  if (!company) {
    return <div className="min-h-screen bg-ob-cream pt-32 flex items-center justify-center font-serif">Geen kantoor gevonden.</div>;
  }

  return (
    <div className="min-h-screen bg-[#f4f6f9] pt-24 pb-20 font-serif">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Header */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-ob-text">{company.name}</h1>
            <p className="text-gray-500">Office Beheerder Portaal</p>
          </div>
          <button onClick={handleLogout} className="text-sm font-semibold text-red-600 hover:text-red-800 transition-colors">
            Uitloggen
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <nav className="flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible">
                <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-6 py-4 text-sm font-semibold transition-colors shrink-0 ${activeTab === 'settings' ? 'bg-[#151f33] text-white border-l-4 border-white' : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'}`}>
                  <Building size={18} /> Bedrijfsinstellingen
                </button>
                <button onClick={() => setActiveTab('addresses')} className={`w-full flex items-center gap-3 px-6 py-4 text-sm font-semibold transition-colors shrink-0 ${activeTab === 'addresses' ? 'bg-[#151f33] text-white border-l-4 border-white' : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'}`}>
                  <MapPin size={18} /> Afleveradressen
                </button>
                <button onClick={() => setActiveTab('employees')} className={`w-full flex items-center gap-3 px-6 py-4 text-sm font-semibold transition-colors shrink-0 ${activeTab === 'employees' ? 'bg-[#151f33] text-white border-l-4 border-white' : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'}`}>
                  <Users size={18} /> Werknemers
                </button>
                <button onClick={() => setActiveTab('assortment')} className={`w-full flex items-center gap-3 px-6 py-4 text-sm font-semibold transition-colors shrink-0 ${activeTab === 'assortment' ? 'bg-[#151f33] text-white border-l-4 border-white' : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'}`}>
                  <Package size={18} /> Assortiment
                </button>
                <div className="md:mt-4 p-4 shrink-0 border-t border-gray-100">
                  <button onClick={() => navigate('/order')} className="w-full flex justify-center items-center gap-2 px-6 py-3 bg-ob-blue text-white text-sm font-semibold rounded-lg hover:bg-ob-blue-dark transition-colors">
                    <ShoppingBag size={18} /> Zelf Bestellen
                  </button>
                </div>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
            
            {/* Success Toast */}
            {saveSuccess && (
              <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-lg flex items-center gap-3 border border-green-200">
                <CheckCircle2 size={20} /> <span className="font-medium">Wijzigingen succesvol opgeslagen!</span>
              </div>
            )}

            {error && (
              <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
                {error}
              </div>
            )}

            {/* Tab: Settings */}
            {activeTab === 'settings' && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h2 className="text-xl font-bold text-ob-text mb-2">Bedrijfsinstellingen & Facturatie</h2>
                  <p className="text-gray-500 text-sm">Beheer hier de gegevens voor facturatie van de bedrijfsbestellingen.</p>
                </div>

                <form onSubmit={handleSaveSettings} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-ob-text mb-1.5">Factuur E-mailadres</label>
                    <input type="email" value={billingEmail} onChange={e => setBillingEmail(e.target.value)} required
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-ob-blue focus:ring-1 focus:ring-ob-blue" />
                    <p className="text-xs text-gray-500 mt-1">Hier worden alle wekelijkse of maandelijkse facturen naartoe gestuurd.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-ob-text mb-1.5">Factuur Gegevens (Optioneel)</label>
                    <textarea value={billingInfo} onChange={e => setBillingInfo(e.target.value)} rows={4}
                      placeholder="Bijv: KVK nummer, BTW nummer, of specifieke afdelingsreferenties..."
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-ob-blue focus:ring-1 focus:ring-ob-blue" />
                  </div>
                  

                  <div>
                    <label className="block text-sm font-semibold text-ob-text mb-1.5">Maximale bestelwaarde per medewerker (€)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={spendLimit}
                      onChange={e => setSpendLimit(e.target.value)}
                      placeholder="Bijv. 15.00 (Leeg = onbeperkt)"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-ob-blue focus:ring-1 focus:ring-ob-blue"
                    />
                    <p className="text-xs text-gray-500 mt-1">Laat dit veld leeg als er geen limiet is. Bestellingen boven dit bedrag worden geblokkeerd.</p>
                  </div>
                  <button type="submit" disabled={isSaving} className="bg-ob-blue text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-ob-blue-dark transition-colors flex items-center gap-2 disabled:opacity-50">
                    <Save size={18} /> Opslaan
                  </button>
                </form>
              </div>
            )}

            {/* Tab: Addresses */}
            {activeTab === 'addresses' && (
              <div className="space-y-8 max-w-3xl">
                <div>
                  <h2 className="text-xl font-bold text-ob-text mb-2">Afleveradressen</h2>
                  <p className="text-gray-500 text-sm">Voeg hier de specifieke afleverlocaties toe waaruit uw werknemers kunnen kiezen (bijv. "Hoofdkantoor", "4e verdieping").</p>
                </div>

                {/* Existing Addresses */}
                {addresses.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addresses.map(addr => (
                      <div key={addr.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50 flex flex-col justify-between">
                        <div className="mb-4">
                          <h4 className="font-bold text-ob-text">{addr.label}</h4>
                          <p className="text-sm text-gray-600 mt-1">{addr.address_line}</p>
                          {addr.instructions && <p className="text-xs text-gray-500 mt-2 italic bg-white p-2 rounded border border-gray-100">Instructies: {addr.instructions}</p>}
                        </div>
                        <button onClick={() => handleDeleteAddress(addr.id)} className="text-red-500 text-sm font-semibold hover:text-red-700 flex items-center gap-1 self-start">
                          <Trash2 size={16} /> Verwijderen
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Address */}
                <form onSubmit={handleAddAddress} className="bg-white border border-gray-200 p-6 rounded-xl space-y-4 shadow-sm">
                  <h3 className="font-bold text-ob-text border-b border-gray-100 pb-2">Nieuw adres toevoegen</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-ob-text mb-1.5">Label (Bijv: "Lokaal A")</label>
                      <input type="text" required value={newLabel} onChange={e => setNewLabel(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-ob-blue" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-ob-text mb-1.5">Straat + Huisnummer</label>
                      <input type="text" required value={newAddress} onChange={e => setNewAddress(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-ob-blue" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-ob-text mb-1.5">Extra Instructies (Optioneel)</label>
                    <input type="text" value={newInstructions} onChange={e => setNewInstructions(e.target.value)} placeholder="Bijv: Bellen bij de poort" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-ob-blue" />
                  </div>
                  
                  <button type="submit" disabled={isSaving} className="bg-ob-blue text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-ob-blue-dark transition-colors flex items-center gap-2 disabled:opacity-50">
                    <Plus size={18} /> Toevoegen
                  </button>
                </form>
              </div>
            )}

            {/* Tab: Employees */}
            {activeTab === 'employees' && (
              <div className="space-y-10 max-w-2xl">
                <div>
                  <h2 className="text-xl font-bold text-ob-text mb-2">Werknemers Toegang</h2>
                  <p className="text-gray-500 text-sm">Beheer hoe uw werknemers toegang krijgen tot het bestelportaal.</p>
                </div>

                {/* Whitelist Domain */}
                <form onSubmit={handleSaveDomain} className="bg-gray-50 border border-gray-200 p-6 rounded-xl space-y-4">
                  <div>
                    <h3 className="font-bold text-ob-text mb-1">E-mail Domein Whitelisten (Aanbevolen)</h3>
                    <p className="text-sm text-gray-500 mb-4">Sta iedereen met een e-mailadres dat eindigt op dit domein toe om zelf een account aan te maken en direct te bestellen op rekening van uw bedrijf.</p>
                  </div>
                  <div className="flex gap-4 items-end">
                    <div className="flex-1">
                      <label className="block text-sm font-semibold text-ob-text mb-1.5">Toegestaan Domein</label>
                      <input type="text" value={allowedDomain} onChange={e => setAllowedDomain(e.target.value)} placeholder="@bedrijf.nl" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-ob-blue focus:ring-1 focus:ring-ob-blue" />
                    </div>
                    
                  <button type="submit" disabled={isSaving} className="bg-ob-blue text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-ob-blue-dark transition-colors flex items-center gap-2 disabled:opacity-50">
                      Opslaan
                    </button>
                  </div>
                </form>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <span className="shrink-0 mx-4 text-gray-400 font-medium text-sm">OF MANUEEL AANMAKEN</span>
                  <div className="flex-grow border-t border-gray-300"></div>
                </div>

                {/* Manual Accounts */}
                <form onSubmit={handleCreateEmployee} className="bg-white border border-gray-200 p-6 rounded-xl space-y-4 shadow-sm">
                  <h3 className="font-bold text-ob-text">Specifiek Account Genereren</h3>
                  <p className="text-sm text-gray-500 mb-4">Maak direct een inlog aan voor een specifieke werknemer.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-ob-text mb-1.5">E-mailadres</label>
                      <div className="relative">
                        <input type="email" required value={newEmpEmail} onChange={e => setNewEmpEmail(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-ob-blue" />
                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-ob-text mb-1.5">Wachtwoord</label>
                      <div className="relative">
                        <input type={showPassword ? "text" : "password"} required value={newEmpPassword} onChange={e => setNewEmpPassword(e.target.value)} className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-ob-blue" />
                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none">
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <button type="submit" disabled={isSaving} className="bg-ob-blue text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-ob-blue-dark transition-colors flex items-center gap-2 disabled:opacity-50">
                    <UserPlus size={18} /> Aanmaken
                  </button>
                </form>

                {/* List of Employees */}
                <div className="mt-8 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="font-bold text-ob-text">Geregistreerde Werknemers</h3>
                  </div>
                  {employees.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      Er zijn nog geen werknemers accounts aangemaakt.
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-100">
                      {employees.map(emp => (
                        <li key={emp.id} className="p-4 px-6 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#151f33] text-white flex items-center justify-center font-bold">
                              {emp.first_name ? emp.first_name.charAt(0).toUpperCase() : <Users size={16} />}
                            </div>
                            <div>
                              <p className="font-medium text-ob-text">{emp.first_name || 'Geen e-mail opgeslagen'}</p>
                              <p className="text-xs text-gray-400">Account ID: {emp.id.substring(0, 8)}...</p>
                            </div>
                          </div>
                          <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">Werknemer</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Assortment */}
            {activeTab === 'assortment' && (
              <div className="space-y-6 max-w-4xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                  <div>
                    <h2 className="text-xl font-bold text-ob-text mb-1">Beschikbaar Assortiment</h2>
                    <p className="text-gray-500 text-sm">Vink aan welke producten uw werknemers mogen bestellen.</p>
                  </div>
                  <button onClick={handleSaveAssortment} disabled={isSaving} className="bg-ob-blue text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-ob-blue-dark transition-colors flex items-center gap-2 disabled:opacity-50 shrink-0">
                    <Save size={18} /> Assortiment Opslaan
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                  {AVAILABLE_PRODUCTS.map(product => (
                    <label key={product.name} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${selectedProducts.includes(product.name) ? 'border-ob-blue bg-blue-50/30 ring-1 ring-ob-blue' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                      <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1">
                        <span className="font-medium text-gray-800 block">{product.name}</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={selectedProducts.includes(product.name)}
                        onChange={() => toggleProduct(product.name)}
                        className="w-5 h-5 rounded border-gray-300 text-ob-blue focus:ring-ob-blue"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
