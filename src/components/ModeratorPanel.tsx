import { useState, useEffect, FormEvent } from 'react';
import { supabase, SharedSettings, StoreSettings, ObCompany, ObPortionPrice } from '../lib/supabase';
import { LogIn, X, Lock, Store, Users, DollarSign, Building2, CheckCircle2, ChevronRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

type ModeratorPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  settings: SharedSettings;
  storeSettings?: StoreSettings;
  onSettingsUpdated: (settings: SharedSettings) => void;
  onStoreSettingsUpdated?: (settings: StoreSettings) => void;
};


const AVAILABLE_PRODUCTS = [
  'Snack Mix', 'Bitterballen', 'Vlammetjes', 'Frikandelletjes', 'Mini Kroketjes', 
  'Chicken Wings', 'Kipnuggets', 'Karaage Kip', 'Butterfly Gamba\'s',
  'Kaasstengels', 'Curry Samosas', 'Mini Loempia', 'Vegan Bitterballen'
];
const PORTIONS = [25, 50, 100, 150];

type ObProductPrice = {
  id?: string;
  company_id: string | null;
  product_name: string;
  portion_size: number;
  price: number;
};

const DAYS_OF_WEEK = [
  { id: '1', name: 'Maandag' },
  { id: '2', name: 'Dinsdag' },
  { id: '3', name: 'Woensdag' },
  { id: '4', name: 'Donderdag' },
  { id: '5', name: 'Vrijdag' },
  { id: '6', name: 'Zaterdag' },
  { id: '0', name: 'Zondag' }
];

type Tab = 'store' | 'registrations' | 'prices' | 'customers';

export function ModeratorPanel({ isOpen, onClose, settings, storeSettings, onSettingsUpdated, onStoreSettingsUpdated }: ModeratorPanelProps) {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [localSettings, setLocalSettings] = useState<SharedSettings>(settings);
  const [localStoreSettings, setLocalStoreSettings] = useState<StoreSettings | undefined>(storeSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New Tabs State
  const [activeTab, setActiveTab] = useState<Tab>('store');
  const [registrations, setRegistrations] = useState<ObCompany[]>([]);
  const [customers, setCustomers] = useState<ObCompany[]>([]);
  
  const [productPrices, setProductPrices] = useState<ObProductPrice[]>([]);
  const [selectedPriceProduct, setSelectedPriceProduct] = useState(AVAILABLE_PRODUCTS[0]);
  const [selectedPriceCompany, setSelectedPriceCompany] = useState<string | null>(null);

  const [impersonating, setImpersonating] = useState<ObCompany | null>(null);

  useEffect(() => {
    setLocalSettings(settings);
    setLocalStoreSettings(storeSettings);
  }, [settings, storeSettings]);

  useEffect(() => {
    const checkUser = async () => {
      if (isOpen && supabase) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setIsAuthenticated(true);
        }
      }
    };
    checkUser();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      fetchDashboardData();
    }
  }, [isOpen, isAuthenticated]);

  const fetchDashboardData = async () => {
    if (!supabase) {
      // Mock data for preview
      setRegistrations([{ id: 'mock-1', name: 'Test BV', address: 'Amsterdam', phone: '061234', billing_email: 'test@test.nl', is_approved: false, created_at: new Date().toISOString() }]);
      setCustomers([{ id: 'mock-2', name: 'Approved BV', address: 'Rotterdam', phone: '069876', billing_email: 'info@app.nl', is_approved: true, created_at: new Date().toISOString() }]);
      setProductPrices([]);
      return;
    }

    try {
      const { data: regData } = await supabase.from('ob_companies').select('*').eq('is_approved', false).order('created_at', { ascending: false });
      if (regData) setRegistrations(regData);

      const { data: custData } = await supabase.from('ob_companies').select('*').eq('is_approved', true).order('name', { ascending: true });
      if (custData) setCustomers(custData);

      
      const { data: priceData } = await supabase.from('ob_product_prices').select('*');
      if (priceData) setProductPrices(priceData);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (supabase) {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError('Ongeldige inloggegevens');
      } else {
        setIsAuthenticated(true);
        setEmail('');
        setPassword('');
      }
    } else {
      setError('Supabase configuratie ontbreekt (Preview Modus)');
      setTimeout(() => setIsAuthenticated(true), 500);
    }
    
    setIsLoading(false);
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setIsAuthenticated(false);
  };

  const handleSaveStoreSettings = async () => {
    if (!localStoreSettings) return;
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      if (supabase) {
        const { error: storeError } = await supabase
          .from('store_settings')
          .update({
            override_status: localStoreSettings.override_status,
            schedule: localStoreSettings.schedule
          })
          .eq('id', 1);

        if (storeError) throw storeError;
      }
      if (onStoreSettingsUpdated) {
        onStoreSettingsUpdated(localStoreSettings);
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setError('Er ging iets mis bij het opslaan.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleScheduleChange = (dayId: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
    if (!localStoreSettings) return;
    setLocalStoreSettings(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        schedule: {
          ...prev.schedule,
          [dayId]: {
            ...prev.schedule[dayId],
            [field]: value
          }
        }
      };
    });
  };

  const handleAcceptCompany = async (id: string) => {
    if (!supabase) {
      const comp = registrations.find(r => r.id === id);
      if (comp) {
        setRegistrations(registrations.filter(r => r.id !== id));
        setCustomers([...customers, { ...comp, is_approved: true }]);
      }
      return;
    }

    try {
      const { error } = await supabase.from('ob_companies').update({ is_approved: true }).eq('id', id);
      if (!error) {
        const comp = registrations.find(r => r.id === id);
        if (comp) {
          setRegistrations(registrations.filter(r => r.id !== id));
          setCustomers([...customers, { ...comp, is_approved: true }]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveProductPrices = async () => {
    setIsSaving(true);
    try {
      if (supabase) {
        for (const p of productPrices) {
          if (p.price > 0) {
            // First check if it exists
            const { data: existing } = await supabase.from('ob_product_prices')
              .select('id')
              .eq('product_name', p.product_name)
              .eq('portion_size', p.portion_size)
              .is('company_id', p.company_id || null)
              .maybeSingle();
              
            if (existing) {
              await supabase.from('ob_product_prices').update({ price: p.price }).eq('id', existing.id);
            } else {
              await supabase.from('ob_product_prices').insert({
                company_id: p.company_id,
                product_name: p.product_name,
                portion_size: p.portion_size,
                price: p.price
              });
            }
          }
        }
        
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleProductPriceChange = (portion: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    setProductPrices(prev => {
      const exists = prev.find(p => p.product_name === selectedPriceProduct && p.company_id === selectedPriceCompany && p.portion_size === portion);
      if (exists) {
        return prev.map(p => p === exists ? { ...p, price: numValue } : p);
      } else {
        return [...prev, { company_id: selectedPriceCompany, product_name: selectedPriceProduct, portion_size: portion, price: numValue }];
      }
    });
  };
  
  const getDisplayPrice = (portion: number) => {
    const p = productPrices.find(p => p.product_name === selectedPriceProduct && p.company_id === selectedPriceCompany && p.portion_size === portion);
    return p ? p.price : '';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d131f]/80 backdrop-blur-sm p-4 font-sans"
        >
          <motion.div 
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-white shadow-2xl w-full max-w-4xl h-[90vh] overflow-hidden flex flex-col rounded-lg"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 shrink-0 bg-white">
              <h2 className="text-2xl font-serif font-semibold text-[#05053D]">Moderator Paneel</h2>
              <div className="flex items-center gap-4">
                {isAuthenticated && (
                  <button onClick={handleLogout} className="text-sm font-semibold text-red-600 hover:text-red-800 transition-colors">
                    Uitloggen
                  </button>
                )}
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex flex-1 overflow-hidden">
              {!isAuthenticated ? (
                <div className="w-full flex items-center justify-center p-6 overflow-y-auto">
                  <form onSubmit={handleLogin} className="space-y-4 w-full max-w-sm">
                    <p className="text-gray-500 mb-4 text-sm">Log in met uw Supabase beheerdersaccount.</p>
                    <div>
                      <input type="email" placeholder="E-mailadres" value={email} onChange={(e) => setEmail(e.target.value)} required
                        className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:border-[#151f33] focus:ring-1 focus:ring-[#151f33] transition-all" />
                    </div>
                    <div>
                      <input type="password" placeholder="Wachtwoord" value={password} onChange={(e) => setPassword(e.target.value)} required
                        className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:border-[#151f33] focus:ring-1 focus:ring-[#151f33] transition-all mt-2" />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <button type="submit" disabled={isLoading} className="w-full bg-[#111827] text-white p-3 rounded hover:bg-[#1f2937] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-4">
                      <LogIn size={18} />
                      <span>{isLoading ? 'Laden...' : 'Inloggen'}</span>
                    </button>
                  </form>
                </div>
              ) : (
                <div className="flex w-full h-full flex-col md:flex-row">
                  
                  {/* Sidebar Navigation */}
                  <div className="w-full md:w-64 bg-gray-50 border-r border-gray-200 p-4 shrink-0 overflow-y-auto">
                    <nav className="space-y-2 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible pb-2 md:pb-0">
                      <button 
                        onClick={() => { setActiveTab('store'); setImpersonating(null); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors shrink-0 md:shrink ${activeTab === 'store' && !impersonating ? 'bg-[#151f33] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                      >
                        <Store size={18} /> Winkel Status
                      </button>
                      <button 
                        onClick={() => { setActiveTab('registrations'); setImpersonating(null); }}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors shrink-0 md:shrink ${activeTab === 'registrations' && !impersonating ? 'bg-[#151f33] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                      >
                        <div className="flex items-center gap-3">
                          <Building2 size={18} /> Aanmeldingen
                        </div>
                        {registrations.length > 0 && (
                          <span className="bg-red-500 text-white text-xs py-0.5 px-2 rounded-full font-bold">{registrations.length}</span>
                        )}
                      </button>
                      <button 
                        onClick={() => { setActiveTab('customers'); setImpersonating(null); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors shrink-0 md:shrink ${activeTab === 'customers' || impersonating ? 'bg-[#151f33] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                      >
                        <Users size={18} /> Klanten (Kantoren)
                      </button>
                      <button 
                        onClick={() => { setActiveTab('prices'); setImpersonating(null); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors shrink-0 md:shrink ${activeTab === 'prices' && !impersonating ? 'bg-[#151f33] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                      >
                        <DollarSign size={18} /> Portie Prijzen
                      </button>
                    </nav>
                  </div>

                  {/* Main Content Area */}
                  <div className="flex-1 overflow-y-auto bg-white p-6 md:p-8">
                    
                    {impersonating ? (
                      <div className="space-y-6">
                        <button onClick={() => setImpersonating(null)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#151f33] transition-colors mb-4">
                          <ArrowLeft size={16} /> Terug naar klantenlijst
                        </button>
                        
                        <div className="bg-[#f0f4f8] border border-[#d1e0ec] rounded-xl p-8 text-center space-y-4">
                          <div className="w-16 h-16 bg-[#151f33] text-white rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users size={32} />
                          </div>
                          <h3 className="text-2xl font-serif text-[#05053D]">Impersonatie: {impersonating.name}</h3>
                          <p className="text-gray-600 max-w-md mx-auto mb-4">
                            U heeft dit kantoor geselecteerd voor beheer. Open het Beheerder Dashboard om het assortiment, werknemers en instellingen aan te passen.
                          </p>
                          <div className="pt-4">
                            <button 
                              onClick={() => {
                                navigate(`/dashboard?companyId=${impersonating.id}`);
                                onClose();
                              }}
                              className="inline-flex items-center gap-2 px-6 py-3 bg-ob-blue text-white rounded-lg font-semibold hover:bg-ob-blue-dark transition-colors"
                            >
                              Open Beheer Dashboard
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : activeTab === 'store' && localStoreSettings ? (
                      <div className="space-y-10 max-w-2xl">
                        {/* Status Section */}
                        <section>
                          <h3 className="text-xl font-serif font-semibold text-[#05053D] mb-2">Winkel Status Beheren</h3>
                          <p className="text-sm text-gray-500 mb-4">Binnen de reguliere tijden gaat de winkel automatisch open ("AUTO"). Je kan dit manueel overschrijven voor de rest van de dag.</p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <button onClick={() => setLocalStoreSettings({...localStoreSettings, override_status: 'AUTO'})}
                              className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${localStoreSettings.override_status === 'AUTO' ? 'bg-[#111827] text-white border-[#111827] shadow-md' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'}`}>
                              <span className="font-semibold">Automatisch</span><span className={`text-xs ${localStoreSettings.override_status === 'AUTO' ? 'text-gray-300' : 'text-gray-500'}`}>Volgt de openingstijden</span>
                            </button>
                            <button onClick={() => setLocalStoreSettings({...localStoreSettings, override_status: 'OPEN'})}
                              className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${localStoreSettings.override_status === 'OPEN' ? 'bg-[#111827] text-white border-[#111827] shadow-md' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'}`}>
                              <div className="flex items-center gap-2">{localStoreSettings.override_status !== 'OPEN' && <Lock size={14} className="text-gray-400" />}<span className="font-semibold">Forceer Open</span></div>
                              <span className={`text-xs ${localStoreSettings.override_status === 'OPEN' ? 'text-gray-300' : 'text-gray-500'}`}>Blijft de rest van de dag open</span>
                            </button>
                            <button onClick={() => setLocalStoreSettings({...localStoreSettings, override_status: 'CLOSED'})}
                              className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${localStoreSettings.override_status === 'CLOSED' ? 'bg-[#111827] text-white border-[#111827] shadow-md' : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'}`}>
                              <div className="flex items-center gap-2">{localStoreSettings.override_status !== 'CLOSED' && <Lock size={14} className="text-gray-400" />}<span className="font-semibold">Forceer Dicht</span></div>
                              <span className={`text-xs ${localStoreSettings.override_status === 'CLOSED' ? 'text-gray-300' : 'text-gray-500'}`}>Blijft de rest van de dag dicht</span>
                            </button>
                          </div>
                        </section>

                        {/* Opening Hours Section */}
                        <section>
                          <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-serif font-semibold text-[#05053D]">Openingstijden Beheren</h3>
                            <button onClick={handleSaveStoreSettings} disabled={isSaving} className="bg-[#111827] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1f2937] transition-colors disabled:opacity-50">
                              {isSaving ? 'Bezig...' : 'Tijden Opslaan'}
                            </button>
                          </div>
                          {saveSuccess && <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-6 text-sm flex items-center gap-2"><span>Instellingen succesvol opgeslagen!</span></div>}
                          
                          <div className="space-y-3">
                            {DAYS_OF_WEEK.map((day) => {
                              const daySchedule = localStoreSettings.schedule[day.id] || { open: '00:00', close: '00:00', closed: false };
                              return (
                                <div key={day.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-100 gap-4">
                                  <div className="w-32 font-medium text-gray-700">{day.name}</div>
                                  <div className="flex items-center gap-3 flex-1">
                                    <div className="relative flex-1 max-w-[140px]">
                                      <input type="time" value={daySchedule.open} onChange={(e) => handleScheduleChange(day.id, 'open', e.target.value)} disabled={daySchedule.closed} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ob-blue disabled:opacity-50 disabled:bg-gray-50" />
                                    </div>
                                    <span className="text-gray-400">-</span>
                                    <div className="relative flex-1 max-w-[140px]">
                                      <input type="time" value={daySchedule.close} onChange={(e) => handleScheduleChange(day.id, 'close', e.target.value)} disabled={daySchedule.closed} className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ob-blue disabled:opacity-50 disabled:bg-gray-50" />
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2 w-28 shrink-0">
                                    <input type="checkbox" id={`closed-${day.id}`} checked={daySchedule.closed} onChange={(e) => handleScheduleChange(day.id, 'closed', e.target.checked)} className="w-4 h-4 text-[#151f33] rounded border-gray-300 focus:ring-[#151f33]" />
                                    <label htmlFor={`closed-${day.id}`} className="text-sm text-gray-600 select-none cursor-pointer">Gesloten</label>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </section>
                      </div>
                    ) : activeTab === 'registrations' ? (
                      <div className="space-y-6 max-w-4xl">
                        <div>
                          <h3 className="text-xl font-serif font-semibold text-[#05053D] mb-2">Aanmeldingen</h3>
                          <p className="text-sm text-gray-500 mb-6">Overzicht van kantoren die zich hebben ingeschreven en nog wachten op goedkeuring.</p>
                        </div>
                        {registrations.length === 0 ? (
                          <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-500">
                            Geen nieuwe aanmeldingen op dit moment.
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {registrations.map(reg => (
                              <div key={reg.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="space-y-1">
                                  <h4 className="font-semibold text-lg text-ob-text">{reg.name}</h4>
                                  <p className="text-sm text-gray-600 flex items-center gap-2">{reg.address}</p>
                                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                                    <span>✉️ {reg.billing_email}</span>
                                    <span>📞 {reg.phone}</span>
                                  </div>
                                </div>
                                <button 
                                  onClick={() => handleAcceptCompany(reg.id)}
                                  className="shrink-0 bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                >
                                  <CheckCircle2 size={18} /> Accepteren
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : activeTab === 'customers' ? (
                      <div className="space-y-6 max-w-4xl">
                        <div>
                          <h3 className="text-xl font-serif font-semibold text-[#05053D] mb-2">Klanten (Kantoren)</h3>
                          <p className="text-sm text-gray-500 mb-6">Overzicht van alle goedgekeurde kantoren. Klik op 'Beheren' om hun instellingen aan te passen.</p>
                        </div>
                        {customers.length === 0 ? (
                          <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-500">
                            Nog geen goedgekeurde kantoren.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {customers.map(cust => (
                              <div key={cust.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between gap-4 group hover:border-[#151f33] transition-colors">
                                <div>
                                  <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-semibold text-lg text-ob-text">{cust.name}</h4>
                                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">Actief</span>
                                  </div>
                                  <p className="text-sm text-gray-500">{cust.address}</p>
                                </div>
                                <button 
                                  onClick={() => setImpersonating(cust)}
                                  className="w-full bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg text-sm font-medium group-hover:bg-[#151f33] group-hover:text-white transition-colors flex items-center justify-center gap-2 mt-2"
                                >
                                  Beheren <ChevronRight size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : activeTab === 'prices' ? (
                      <div className="space-y-6 max-w-2xl">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
                          <div>
                            <h3 className="text-xl font-serif font-semibold text-[#05053D] mb-1">Prijzen & Deals Beheren</h3>
                            <p className="text-sm text-gray-500">Stel de prijzen in per product per portie, en pas eventueel specifieke deals per kantoor toe.</p>
                          </div>
                          <button onClick={handleSaveProductPrices} disabled={isSaving} className="bg-[#111827] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1f2937] transition-colors disabled:opacity-50 shrink-0">
                            {isSaving ? 'Bezig...' : 'Prijzen Opslaan'}
                          </button>
                        </div>
                        {saveSuccess && <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-6 text-sm flex items-center gap-2"><span>Prijzen succesvol opgeslagen!</span></div>}
                        
                        <div className="flex flex-col sm:flex-row gap-4 mb-6">
                           <div className="flex-1">
                             <label className="block text-sm font-semibold text-gray-700 mb-2">Product</label>
                             <select 
                               value={selectedPriceProduct}
                               onChange={(e) => setSelectedPriceProduct(e.target.value)}
                               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#151f33]"
                             >
                               {AVAILABLE_PRODUCTS.map(prod => (
                                 <option key={prod} value={prod}>{prod}</option>
                               ))}
                             </select>
                           </div>
                           <div className="flex-1">
                             <label className="block text-sm font-semibold text-gray-700 mb-2">Bedrijfsdeal (Optioneel)</label>
                             <select 
                               value={selectedPriceCompany || ''}
                               onChange={(e) => setSelectedPriceCompany(e.target.value === '' ? null : e.target.value)}
                               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#151f33]"
                             >
                               <option value="">Standaard (Geen deal)</option>
                               {customers.map(c => (
                                 <option key={c.id} value={c.id}>{c.name}</option>
                               ))}
                             </select>
                           </div>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                          <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200">
                              <tr>
                                <th className="px-6 py-4 font-semibold text-gray-700">Portie Grootte</th>
                                <th className="px-6 py-4 font-semibold text-gray-700 text-right">Prijs (€)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {PORTIONS.map(portion => (
                                <tr key={portion} className="hover:bg-gray-50/50 transition-colors">
                                  <td className="px-6 py-4 font-medium text-gray-900">{portion} stuks</td>
                                  <td className="px-6 py-4 text-right">
                                    <div className="relative inline-flex items-center justify-end w-32 ml-auto">
                                      <span className="absolute left-3 text-gray-500">€</span>
                                      <input 
                                        type="number" 
                                        min="0"
                                        step="0.01"
                                        value={getDisplayPrice(portion)}
                                        onChange={(e) => handleProductPriceChange(portion, e.target.value)}
                                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#151f33] focus:ring-1 focus:ring-[#151f33] text-right"
                                      />
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Laat het veld leeg als de portie niet beschikbaar is.</p>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
