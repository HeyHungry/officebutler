import { useState, useEffect, FormEvent } from 'react';
import { supabase, SharedSettings, StoreSettings, ObCompany, ObPortionPrice, formatStoreSchedule, DEFAULT_SECTION_ORDER, SECTION_METADATA, HomepageSectionKey } from '../lib/supabase';
import { LogIn, X, Lock, Store, Users, DollarSign, Building2, CheckCircle2, ChevronRight, ChevronLeft, ArrowLeft, ShoppingBag, Type, Truck, ArrowUp, ArrowDown, ArrowUpDown, Languages, Plus, Trash2, Search, Edit3, Save, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { MenuManager } from './MenuManager';
import { DeliveryOptionsManager } from './DeliveryOptionsManager';
import { DiscountCodesManager } from './DiscountCodesManager';
import { useLanguage } from '../contexts/LanguageContext';

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

type Tab = 'store' | 'content' | 'registrations' | 'prices' | 'customers' | 'orders' | 'menu' | 'delivery' | 'translations' | 'discounts';

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
  const [variantSurcharges, setVariantSurcharges] = useState<Record<string, number>>({});

  // New Tabs State
  const [activeTab, setActiveTab] = useState<Tab>('store');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [registrations, setRegistrations] = useState<ObCompany[]>([]);
  const [customers, setCustomers] = useState<ObCompany[]>([]);
  
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [productPrices, setProductPrices] = useState<ObProductPrice[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedPriceProduct, setSelectedPriceProduct] = useState(AVAILABLE_PRODUCTS[0]);
  const [selectedPriceCompany, setSelectedPriceCompany] = useState<string | null>(null);

  const [impersonating, setImpersonating] = useState<ObCompany | null>(null);
  const [resendingInvoice, setResendingInvoice] = useState<string | null>(null);

  const { t } = useLanguage();
  const [contentEditLang, setContentEditLang] = useState<'nl' | 'en'>('nl');
  const [newTransTerm, setNewTransTerm] = useState('');
  const [newTransTranslation, setNewTransTranslation] = useState('');
  const [translationSearch, setTranslationSearch] = useState('');
  const [editingCustomKey, setEditingCustomKey] = useState<string | null>(null);
  const [editingCustomVal, setEditingCustomVal] = useState<string>('');

  const SUGGESTED_TRANSLATION_TERMS = [
    { term: 'Mini Kroket', defaultEn: 'Mini Dutch Croquettes (Crispy)', category: 'Product' },
    { term: 'Bitterballen', defaultEn: 'Crispy Dutch Meatballs (Bitterballen)', category: 'Product' },
    { term: 'Broodje Kroket', defaultEn: 'Dutch Beef Croquette Roll', category: 'Product' },
    { term: 'Broodje Kaasoufle', defaultEn: 'Dutch Cheese Soufflé Roll', category: 'Product' },
    { term: 'Frikandelletjes', defaultEn: 'Mini Dutch Frikandellen', category: 'Product' },
    { term: 'Vlammetjes', defaultEn: 'Spicy Beef Pastries (Vlammetjes)', category: 'Product' },
    { term: 'Karaage Kip', defaultEn: 'Japanese Karaage Crispy Chicken', category: 'Product' },
    { term: "Butterfly Gamba's", defaultEn: 'Crispy Butterfly King Prawns', category: 'Product' },
    { term: 'Kaasstengels', defaultEn: 'Crispy Cheese Sticks', category: 'Product' },
    { term: 'Cornichons', defaultEn: 'Mini Pickles (Cornichons)', category: 'Product' },
    { term: 'Amsterdamse Mix', defaultEn: 'Amsterdam Pickled Mix (Onions & Gherkins)', category: 'Product' },
    { term: 'Samosas Curry', defaultEn: 'Crispy Curry Samosas', category: 'Product' },
    { term: 'broodjes', defaultEn: 'Warm Rolls & Sandwiches', category: 'Categorie' },
    { term: 'Snacks', defaultEn: 'Hot Snacks & Bites', category: 'Categorie' },
    { term: 'Borrelhapjes', defaultEn: 'Snacks & Bites', category: 'Categorie' },
    { term: 'Sausjes', defaultEn: 'Sauces & Dips', category: 'Categorie' },
    { term: 'Tafel Zuur', defaultEn: 'Table Pickles', category: 'Categorie' },
    { term: 'Vega', defaultEn: 'Vegetarian', category: 'Categorie' },
    { term: 'Dranken', defaultEn: 'Drinks & Beverages', category: 'Categorie' },
    { term: 'Klassiekers', defaultEn: 'Classics', category: 'Categorie' },
    { term: 'Gamba & Kip', defaultEn: 'Prawns & Chicken', category: 'Categorie' },
    { term: 'Overig', defaultEn: 'Other', category: 'Categorie' },
  ];

  const getContentValue = (key: string): string => {
    if (!localStoreSettings?.page_content) return '';
    if (contentEditLang === 'en') {
      return (localStoreSettings.page_content as any)[`${key}_en`] || '';
    }
    return (localStoreSettings.page_content as any)[key] || '';
  };

  const setContentValue = (key: string, value: string) => {
    if (!localStoreSettings) return;
    const targetKey = contentEditLang === 'en' ? `${key}_en` : key;
    setLocalStoreSettings({
      ...localStoreSettings,
      page_content: {
        ...localStoreSettings.page_content,
        [targetKey]: value
      }
    });
  };

  const getContentPlaceholder = (key: string, fallbackDefault: string): string => {
    if (contentEditLang === 'en') {
      const dutchVal = (localStoreSettings?.page_content as any)?.[key] || fallbackDefault;
      const translated = t(dutchVal);
      return `Standaard: "${translated}"`;
    }
    return fallbackDefault;
  };

  useEffect(() => {
    setLocalSettings(settings);
    setLocalStoreSettings(storeSettings);
  }, [settings, storeSettings]);

  useEffect(() => {
    if (dbProducts.length > 0 && selectedPriceProduct) {
      const prod = dbProducts.find(p => p.name === selectedPriceProduct);
      if (prod && prod.variant_surcharges) {
        setVariantSurcharges(prod.variant_surcharges);
      } else {
        setVariantSurcharges({});
      }
    }
  }, [dbProducts, selectedPriceProduct]);

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
  }, [isOpen, isAuthenticated, activeTab]);

  const handleResendInvoice = async (group: any) => {
    try {
      setResendingInvoice(group.id);
      
      const discountedTotal = (group.discount && group.discount.amount > 0)
        ? Math.max(0, group.total_order_price - group.discount.amount)
        : group.total_order_price;

      const payload = {
        customerName: group.company_name,
        items: group.items.map((i: any) => ({
          name: i.product_name,
          size: i.portion_size,
          price: Number(i.price)
        })),
        totalPrice: discountedTotal,
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
      let prodData = null; try { const { data } = await supabase.from('ob_products').select('*').order('sort_order', { ascending: true, nullsFirst: false }); prodData = data; } catch(e) { console.warn('no table'); }
      if (prodData) { setDbProducts(prodData); if (prodData.length > 0 && selectedPriceProduct === AVAILABLE_PRODUCTS[0]) setSelectedPriceProduct(prodData[0].name); }
      if (priceData) setProductPrices(priceData);
      
      const { data: orderData } = await supabase.from('ob_orders').select('*, ob_companies(name), ob_company_addresses(*)').order('created_at', { ascending: false });
      if (orderData) setOrders(orderData);
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
            schedule: localStoreSettings.schedule,
            page_content: localStoreSettings.page_content
          })
          .eq('id', 1);

        if (storeError) throw storeError;

        // Also synchronize shared_settings.opening_hours
        const scheduleLines = formatStoreSchedule(localStoreSettings.schedule);
        const hoursSummary = localStoreSettings.page_content?.opening_hours_custom?.trim() || scheduleLines.join(' | ');
        if (hoursSummary) {
          await supabase
            .from('shared_settings')
            .update({ opening_hours: hoursSummary })
            .eq('id', 1);

          if (onSettingsUpdated) {
            onSettingsUpdated({ ...settings, opening_hours: hoursSummary });
          }
        }
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

  const currentSectionOrder: HomepageSectionKey[] = (() => {
    const saved = localStoreSettings?.page_content?.section_order;
    if (Array.isArray(saved) && saved.length > 0) {
      const valid = saved.filter(k => DEFAULT_SECTION_ORDER.includes(k as HomepageSectionKey)) as HomepageSectionKey[];
      const missing = DEFAULT_SECTION_ORDER.filter(k => !valid.includes(k));
      return [...valid, ...missing];
    }
    return [...DEFAULT_SECTION_ORDER];
  })();

  const moveSection = (index: number, direction: 'up' | 'down') => {
    if (!localStoreSettings) return;
    const newOrder = [...currentSectionOrder];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIndex];
    newOrder[targetIndex] = temp;

    setLocalStoreSettings({
      ...localStoreSettings,
      page_content: {
        ...localStoreSettings.page_content,
        section_order: newOrder
      }
    });
  };

  const handleResetSectionOrder = () => {
    if (!localStoreSettings) return;
    setLocalStoreSettings({
      ...localStoreSettings,
      page_content: {
        ...localStoreSettings.page_content,
        section_order: [...DEFAULT_SECTION_ORDER]
      }
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

        // Save variant surcharges to ob_products
        if (selectedPriceProduct) {
           const cleanSurcharges: Record<string, number> = {};
           for (const [k, v] of Object.entries(variantSurcharges)) {
             if (v !== undefined && v !== null && !isNaN(v as any)) {
               cleanSurcharges[k] = Number(v);
             }
           }
           await supabase.from('ob_products')
             .update({ variant_surcharges: cleanSurcharges })
             .eq('name', selectedPriceProduct);
             
           // Update local dbProducts state
           setDbProducts(prev => prev.map(p => p.name === selectedPriceProduct ? { ...p, variant_surcharges: cleanSurcharges } : p));
           setVariantSurcharges(cleanSurcharges);
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d131f]/80 backdrop-blur-sm p-0 font-sans"
        >
          <motion.div 
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-white w-full h-full max-w-none rounded-none overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200 shrink-0 bg-white">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
                >
                  {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
                <h2 className="text-2xl font-serif font-semibold text-[#05053D]">Moderator Paneel</h2>
              </div>
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
                  <div className={`w-full ${isSidebarCollapsed ? "md:w-20" : "md:w-64"} bg-gray-50 border-r border-gray-200 p-4 shrink-0 overflow-y-auto transition-all duration-300`}>
                    <nav className="space-y-2 flex flex-row md:flex-col overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 items-start">
                      <button 
                        onClick={() => { setActiveTab('store'); setImpersonating(null); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors shrink-0 md:shrink ${activeTab === 'store' && !impersonating ? 'bg-[#151f33] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                      >
                        <Store size={18} /> {!isSidebarCollapsed && <span>Winkel Status</span>}
                      </button>
                      <button 
                        onClick={() => { setActiveTab('content'); setImpersonating(null); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors shrink-0 md:shrink ${activeTab === 'content' && !impersonating ? 'bg-[#151f33] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                      >
                        <Type size={18} /> {!isSidebarCollapsed && <span>Website Teksten</span>}
                      </button>
                      <button 
                        onClick={() => { setActiveTab('registrations'); setImpersonating(null); }}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors shrink-0 md:shrink ${activeTab === 'registrations' && !impersonating ? 'bg-[#151f33] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                      >
                        <div className="flex items-center gap-3">
                          <Building2 size={18} /> {!isSidebarCollapsed && <span>Aanmeldingen</span>}
                        </div>
                        {registrations.length > 0 && (
                          <span className="bg-red-500 text-white text-xs py-0.5 px-2 rounded-full font-bold">{registrations.length}</span>
                        )}
                      </button>
                      <button 
                        onClick={() => { setActiveTab('customers'); setImpersonating(null); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors shrink-0 md:shrink ${activeTab === 'customers' || impersonating ? 'bg-[#151f33] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                      >
                        <Users size={18} /> {!isSidebarCollapsed && <span>Klanten (Kantoren)</span>}
                      </button>
                      <button onClick={() => { setActiveTab('orders'); setImpersonating(null); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors shrink-0 md:shrink ${activeTab === 'orders' && !impersonating ? 'bg-[#151f33] text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                        <ShoppingBag size={18} />
                        <span>{!isSidebarCollapsed && <span>Bestellingen</span>}</span>
                      </button>
                      <button 
                        onClick={() => { setActiveTab('prices'); setImpersonating(null); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors shrink-0 md:shrink ${activeTab === 'prices' && !impersonating ? 'bg-[#151f33] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                      >
                        <DollarSign size={18} /> {!isSidebarCollapsed && <span>Portie Prijzen</span>}
                      </button>
                      <button 
                        onClick={() => { setActiveTab('menu'); setImpersonating(null); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors shrink-0 md:shrink ${activeTab === 'menu' && !impersonating ? 'bg-[#151f33] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m8 17 4 4 4-4"/></svg>
                        <span>{!isSidebarCollapsed && <span>Menu & Producten</span>}</span>
                      </button>
                      <button
                        onClick={() => { setActiveTab('delivery'); setImpersonating(null); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors shrink-0 md:shrink ${activeTab === 'delivery' && !impersonating ? 'bg-[#151f33] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                      >
                        <Truck size={18} />
                        <span>{!isSidebarCollapsed && <span>Bezorgopties</span>}</span>
                      </button>
                      <button
                        onClick={() => { setActiveTab('discounts'); setImpersonating(null); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors shrink-0 md:shrink ${activeTab === 'discounts' && !impersonating ? 'bg-[#151f33] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                      >
                        <Tag size={18} />
                        <span>{!isSidebarCollapsed && <span>Kortingscodes</span>}</span>
                      </button>
                      <button
                        onClick={() => { setActiveTab('translations'); setImpersonating(null); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors shrink-0 md:shrink ${activeTab === 'translations' && !impersonating ? 'bg-[#151f33] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                      >
                        <Languages size={18} />
                        <span>{!isSidebarCollapsed && <span>Vertalingen (EN)</span>}</span>
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
                                                            ) : activeTab === 'content' && localStoreSettings ? (
                      <div className="space-y-8 animate-in fade-in duration-300">
                        <section>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4 mb-6">
                            <div>
                              <h3 className="text-xl font-serif font-semibold text-[#05053D] flex items-center gap-2">
                                {!isSidebarCollapsed && <span>Website Teksten</span>} Beheren
                              </h3>
                              <p className="text-xs text-gray-500 mt-1">
                                Bewerk hier de teksten van de website. Schakel tussen <strong>Nederlands</strong> en <strong>Engels</strong> om handmatige vertalingen in te stellen.
                              </p>
                            </div>
                            
                            <div className="flex items-center gap-1.5 bg-gray-100 p-1.5 rounded-xl border border-gray-200 self-start sm:self-auto shadow-2xs">
                              <button
                                type="button"
                                onClick={() => setContentEditLang('nl')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${contentEditLang === 'nl' ? 'bg-white text-ob-blue shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                              >
                                <span className="text-base">🇳🇱</span> Nederlands
                              </button>
                              <button
                                type="button"
                                onClick={() => setContentEditLang('en')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${contentEditLang === 'en' ? 'bg-[#05053D] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                              >
                                <span className="text-base">🇬🇧</span> Engels (English)
                              </button>
                            </div>
                          </div>

                          {contentEditLang === 'en' && (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3 text-sm text-blue-900">
                              <div className="p-1.5 bg-blue-100 rounded-lg text-blue-700 shrink-0 font-bold text-xs uppercase">EN</div>
                              <div>
                                <p className="font-semibold text-xs sm:text-sm">U bewerkt nu de Engelse teksten (English Translation Mode)</p>
                                <p className="text-xs text-blue-700 mt-0.5">
                                  Laat een veld leeg om de automatische vertaling te gebruiken (zie placeholder), of vul een eigen tekst in om deze handmatig te overschrijven.
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {/* SECTIE VOLGORDE BEHEREN */}
                          <div className="bg-white p-6 rounded-xl border-2 border-ob-blue/20 shadow-sm mb-8 space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                              <div>
                                <h4 className="font-bold text-ob-blue text-base flex items-center gap-2">
                                  <ArrowUpDown size={18} className="text-ob-accent" />
                                  Sectie Volgorde (Indeling van de Website)
                                </h4>
                                <p className="text-xs text-gray-500 mt-1">
                                  Verschuif hier de volgorde van de verschillende secties op de homepage. Bepaal zelf welke sectie bovenaan staat!
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={handleResetSectionOrder}
                                className="text-xs text-gray-500 hover:text-ob-blue underline self-start sm:self-auto cursor-pointer"
                              >
                                Standaard volgorde herstellen
                              </button>
                            </div>

                            <div className="space-y-2">
                              {currentSectionOrder.map((sectionKey, index) => {
                                const meta = SECTION_METADATA[sectionKey] || { name: sectionKey, description: '' };
                                const pc = localStoreSettings?.page_content as any;

                                const isEn = contentEditLang === 'en';
                                const getField = (key: string) => {
                                  if (isEn && pc?.[`${key}_en`]?.trim()) {
                                    return pc[`${key}_en`].trim();
                                  }
                                  return pc?.[key]?.trim() || '';
                                };

                                let dynamicTitle = '';
                                switch (sectionKey) {
                                  case 'hero':
                                    dynamicTitle = getField('hero_title');
                                    break;
                                  case 'how_it_works':
                                    dynamicTitle = getField('how_title');
                                    break;
                                  case 'menu':
                                    dynamicTitle = getField('menu_title');
                                    break;
                                  case 'business':
                                    dynamicTitle = getField('business_title');
                                    break;
                                  case 'assortments':
                                    dynamicTitle = getField('assortments_title');
                                    break;
                                  case 'contact':
                                    dynamicTitle = getField('contact_title');
                                    break;
                                }

                                const cleanTitle = dynamicTitle.replace(/<[^>]*>?/gm, '').trim();
                                const displayTitle = cleanTitle || meta.name;
                                const hasCustomTitle = Boolean(cleanTitle && cleanTitle.toLowerCase() !== meta.name.toLowerCase());

                                return (
                                  <div
                                    key={sectionKey}
                                    className="flex items-center justify-between p-3.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors"
                                  >
                                    <div className="flex items-center gap-3">
                                      <span className="w-7 h-7 flex items-center justify-center rounded-full bg-[#05053D] text-white text-xs font-bold shrink-0">
                                        {index + 1}
                                      </span>
                                      <div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="font-semibold text-sm text-gray-900">{displayTitle}</span>
                                          {hasCustomTitle && (
                                            <span className="text-[10px] font-medium px-2 py-0.5 bg-gray-200 text-gray-600 rounded">
                                              {meta.name}
                                            </span>
                                          )}
                                        </div>
                                        <span className="text-xs text-gray-500 block">{meta.description}</span>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <button
                                        type="button"
                                        disabled={index === 0}
                                        onClick={() => moveSection(index, 'up')}
                                        className="p-1.5 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs"
                                        title="Omhoog verplaatsen"
                                      >
                                        <ArrowUp size={16} />
                                      </button>
                                      <button
                                        type="button"
                                        disabled={index === currentSectionOrder.length - 1}
                                        onClick={() => moveSection(index, 'down')}
                                        className="p-1.5 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-2xs"
                                        title="Omlaag verplaatsen"
                                      >
                                        <ArrowDown size={16} />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          
                          {/* HERO */}
                          <div className="bg-white p-6 rounded-xl border shadow-sm mb-6 space-y-4">
                            <h4 className="font-bold text-ob-blue mb-4 border-b pb-2">Sectie 1: Hoofdscherm (Hero)</h4>
                            <div className="grid grid-cols-1 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                  <span>Pre-titel (kleine tekst bovenaan)</span>
                                  <span className="text-[10px] text-gray-400 font-normal">Schaal (bijv. 120%)</span>
                                </label>
                                <div className="flex gap-2">
                                  <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                    placeholder={getContentPlaceholder('hero_pre_title', 'Exclusief in Amsterdam')}
                                    value={getContentValue('hero_pre_title')}
                                    onChange={e => setContentValue('hero_pre_title', e.target.value)} />
                                  <input type="text" className="w-24 h-fit px-3 py-2 border rounded-md text-sm" placeholder="%"
                                    value={localStoreSettings.page_content?.hero_pre_title_size || ''}
                                    onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, hero_pre_title_size: e.target.value}} as any)} />
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                  <span>Hoofdtitel</span>
                                  <span className="text-[10px] text-gray-400 font-normal">Schaal (bijv. 120%)</span>
                                </label>
                                <div className="flex gap-2">
                                  <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                    placeholder={getContentPlaceholder('hero_title', 'De Zakelijke Borrelservice van Mokum')}
                                    value={getContentValue('hero_title')}
                                    onChange={e => setContentValue('hero_title', e.target.value)} />
                                  <input type="text" className="w-24 h-fit px-3 py-2 border rounded-md text-sm" placeholder="%"
                                    value={localStoreSettings.page_content?.hero_title_size || ''}
                                    onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, hero_title_size: e.target.value}} as any)} />
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                  <span>Ondertitel</span>
                                  <span className="text-[10px] text-gray-400 font-normal">Schaal (bijv. 120%)</span>
                                </label>
                                <div className="flex gap-2">
                                  <textarea rows={2} className="flex-1 px-3 py-2 border rounded-md text-sm"
                                    placeholder={getContentPlaceholder('hero_subtitle', 'Onze butlers leveren de lekkerste snacks voor jouw kantoorborrel.')}
                                    value={getContentValue('hero_subtitle')}
                                    onChange={e => setContentValue('hero_subtitle', e.target.value)} />
                                  <input type="text" className="w-24 h-fit px-3 py-2 border rounded-md text-sm" placeholder="%"
                                    value={localStoreSettings.page_content?.hero_subtitle_size || ''}
                                    onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, hero_subtitle_size: e.target.value}} as any)} />
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                    <span>Knop Bestel Nu</span>
                                    <span className="text-[10px] text-gray-400 font-normal">Schaal (bijv. 120%)</span>
                                  </label>
                                  <div className="flex gap-2">
                                    <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                      placeholder={getContentPlaceholder('hero_btn_order', 'Direct Bestellen')}
                                      value={getContentValue('hero_btn_order')}
                                      onChange={e => setContentValue('hero_btn_order', e.target.value)} />
                                    <input type="text" className="w-24 px-3 py-2 border rounded-md text-sm" placeholder="%"
                                      value={localStoreSettings.page_content?.hero_btn_order_size || ''}
                                      onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, hero_btn_order_size: e.target.value}} as any)} />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                    <span>Knop Bekijk Aanbod</span>
                                    <span className="text-[10px] text-gray-400 font-normal">Schaal (bijv. 120%)</span>
                                  </label>
                                  <div className="flex gap-2">
                                    <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                      placeholder={getContentPlaceholder('hero_btn_offer', 'Offerte Aanvragen')}
                                      value={getContentValue('hero_btn_offer')}
                                      onChange={e => setContentValue('hero_btn_offer', e.target.value)} />
                                    <input type="text" className="w-24 px-3 py-2 border rounded-md text-sm" placeholder="%"
                                      value={localStoreSettings.page_content?.hero_btn_offer_size || ''}
                                      onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, hero_btn_offer_size: e.target.value}} as any)} />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* HOW IT WORKS */}
                          <div className="bg-white p-6 rounded-xl border shadow-sm mb-6 space-y-4">
                            <h4 className="font-bold text-ob-blue mb-4 border-b pb-2">Sectie 2: Hoe Werkt Office Butler</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                  <span>Titel</span>
                                  <span className="text-[10px] text-gray-400 font-normal">Schaal (bijv. 120%)</span>
                                </label>
                                <div className="flex gap-2">
                                  <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                    placeholder={getContentPlaceholder('how_title', 'Hoe werkt de Office Butler?')}
                                    value={getContentValue('how_title')}
                                    onChange={e => setContentValue('how_title', e.target.value)} />
                                  <input type="text" className="w-24 h-fit px-3 py-2 border rounded-md text-sm" placeholder="%"
                                    value={localStoreSettings.page_content?.how_title_size || ''}
                                    onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, how_title_size: e.target.value}} as any)} />
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                  <span>Ondertitel</span>
                                  <span className="text-[10px] text-gray-400 font-normal">Schaal (bijv. 120%)</span>
                                </label>
                                <div className="flex gap-2">
                                  <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                    placeholder={getContentPlaceholder('how_subtitle', 'In 3 simpele stappen jouw kantoorborrel geregeld.')}
                                    value={getContentValue('how_subtitle')}
                                    onChange={e => setContentValue('how_subtitle', e.target.value)} />
                                  <input type="text" className="w-24 h-fit px-3 py-2 border rounded-md text-sm" placeholder="%"
                                    value={localStoreSettings.page_content?.how_subtitle_size || ''}
                                    onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, how_subtitle_size: e.target.value}} as any)} />
                                </div>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Stap 1: Titel</label>
                                <input type="text" className="w-full px-3 py-2 border rounded-md text-sm mb-2"
                                  placeholder={getContentPlaceholder('how_step1_title', 'Selecteer gewenste snacks')}
                                  value={getContentValue('how_step1_title')}
                                  onChange={e => setContentValue('how_step1_title', e.target.value)} />
                                <label className="block text-xs font-medium text-gray-700 mb-1">Stap 1: Beschrijving</label>
                                <textarea rows={2} className="w-full px-3 py-2 border rounded-md text-sm"
                                  placeholder={getContentPlaceholder('how_step1_desc', 'Stel de ideale bittergarnituur samen voor het team.')}
                                  value={getContentValue('how_step1_desc')}
                                  onChange={e => setContentValue('how_step1_desc', e.target.value)} />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Stap 2: Titel</label>
                                <input type="text" className="w-full px-3 py-2 border rounded-md text-sm mb-2"
                                  placeholder={getContentPlaceholder('how_step2_title', 'Perfecte bezorgmoment')}
                                  value={getContentValue('how_step2_title')}
                                  onChange={e => setContentValue('how_step2_title', e.target.value)} />
                                <label className="block text-xs font-medium text-gray-700 mb-1">Stap 2: Beschrijving</label>
                                <textarea rows={2} className="w-full px-3 py-2 border rounded-md text-sm"
                                  placeholder={getContentPlaceholder('how_step2_desc', 'Bestel voor directe levering of plan vooruit.')}
                                  value={getContentValue('how_step2_desc')}
                                  onChange={e => setContentValue('how_step2_desc', e.target.value)} />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Stap 3: Titel</label>
                                <input type="text" className="w-full px-3 py-2 border rounded-md text-sm mb-2"
                                  placeholder={getContentPlaceholder('how_step3_title', 'Uitpakken en uitserveren')}
                                  value={getContentValue('how_step3_title')}
                                  onChange={e => setContentValue('how_step3_title', e.target.value)} />
                                <label className="block text-xs font-medium text-gray-700 mb-1">Stap 3: Beschrijving</label>
                                <textarea rows={2} className="w-full px-3 py-2 border rounded-md text-sm"
                                  placeholder={getContentPlaceholder('how_step3_desc', 'Warm en direct serveerklaar bezorgd.')}
                                  value={getContentValue('how_step3_desc')}
                                  onChange={e => setContentValue('how_step3_desc', e.target.value)} />
                              </div>
                            </div>
                          </div>

                          {/* ASSORTMENTS / BUTLER SERVICE */}
                          <div className="bg-white p-6 rounded-xl border shadow-sm mb-6 space-y-4">
                            <h4 className="font-bold text-ob-blue mb-4 border-b pb-2">Sectie 3: Onze Butler Service (Assortimenten / Pakketten)</h4>
                            
                            {/* Algemene sectietitel & ondertitel */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                  <span>Sectie Titel</span>
                                  <span className="text-[10px] text-gray-400 font-normal">Schaal (bijv. 120%)</span>
                                </label>
                                <div className="flex gap-2">
                                  <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                    placeholder={getContentPlaceholder('assortments_title', 'Onze Butler Service')}
                                    value={getContentValue('assortments_title')}
                                    onChange={e => setContentValue('assortments_title', e.target.value)} />
                                  <input type="text" className="w-20 h-fit px-3 py-2 border rounded-md text-sm" placeholder="%"
                                    value={localStoreSettings.page_content?.assortments_title_size || ''}
                                    onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, assortments_title_size: e.target.value}} as any)} />
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                  <span>Sectie Ondertitel</span>
                                  <span className="text-[10px] text-gray-400 font-normal">Schaal (bijv. 120%)</span>
                                </label>
                                <div className="flex gap-2">
                                  <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                    placeholder={getContentPlaceholder('assortments_subtitle', 'Kies de service die het beste bij de kantoorborrel past.')}
                                    value={getContentValue('assortments_subtitle')}
                                    onChange={e => setContentValue('assortments_subtitle', e.target.value)} />
                                  <input type="text" className="w-20 h-fit px-3 py-2 border rounded-md text-sm" placeholder="%"
                                    value={localStoreSettings.page_content?.assortments_subtitle_size || ''}
                                    onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, assortments_subtitle_size: e.target.value}} as any)} />
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                              {/* Pakket 1 (Links) */}
                              <div className="space-y-3 bg-gray-50/70 p-4 rounded-lg border border-gray-200">
                                <h5 className="font-semibold text-sm text-ob-blue border-b pb-1">Pakket 1 (Links - Wit)</h5>
                                
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                    <span>Titel (bijv. Bezorgen)</span>
                                    <span className="text-[10px] text-gray-400 font-normal">Schaal %</span>
                                  </label>
                                  <div className="flex gap-2">
                                    <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                      placeholder={getContentPlaceholder('assort_snacks_title', 'Titel Pakket 1')}
                                      value={getContentValue('assort_snacks_title')}
                                      onChange={e => setContentValue('assort_snacks_title', e.target.value)} />
                                    <input type="text" placeholder="%" className="w-20 px-3 py-2 border rounded-md text-sm"
                                      value={localStoreSettings.page_content?.assort_snacks_title_size || ''}
                                      onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, assort_snacks_title_size: e.target.value}} as any)} />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                    <span>Ondertitel</span>
                                    <span className="text-[10px] text-gray-400 font-normal">Schaal %</span>
                                  </label>
                                  <div className="flex gap-2">
                                    <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                      placeholder={getContentPlaceholder('assort_snacks_subtitle', 'Ondertitel Pakket 1')}
                                      value={getContentValue('assort_snacks_subtitle')}
                                      onChange={e => setContentValue('assort_snacks_subtitle', e.target.value)} />
                                    <input type="text" placeholder="%" className="w-20 px-3 py-2 border rounded-md text-sm"
                                      value={localStoreSettings.page_content?.assort_snacks_subtitle_size || ''}
                                      onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, assort_snacks_subtitle_size: e.target.value}} as any)} />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                    <span>Bullet 1</span>
                                    <span className="text-[10px] text-gray-400 font-normal">Schaal %</span>
                                  </label>
                                  <div className="flex gap-2">
                                    <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                      placeholder={getContentPlaceholder('assort_snacks_item1', 'Bullet 1')}
                                      value={getContentValue('assort_snacks_item1')}
                                      onChange={e => setContentValue('assort_snacks_item1', e.target.value)} />
                                    <input type="text" placeholder="%" className="w-20 px-3 py-2 border rounded-md text-sm"
                                      value={localStoreSettings.page_content?.assort_snacks_item1_size || ''}
                                      onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, assort_snacks_item1_size: e.target.value}} as any)} />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                    <span>Bullet 2</span>
                                    <span className="text-[10px] text-gray-400 font-normal">Schaal %</span>
                                  </label>
                                  <div className="flex gap-2">
                                    <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                      placeholder={getContentPlaceholder('assort_snacks_item2', 'Bullet 2')}
                                      value={getContentValue('assort_snacks_item2')}
                                      onChange={e => setContentValue('assort_snacks_item2', e.target.value)} />
                                    <input type="text" placeholder="%" className="w-20 px-3 py-2 border rounded-md text-sm"
                                      value={localStoreSettings.page_content?.assort_snacks_item2_size || ''}
                                      onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, assort_snacks_item2_size: e.target.value}} as any)} />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                    <span>Bullet 3</span>
                                    <span className="text-[10px] text-gray-400 font-normal">Schaal %</span>
                                  </label>
                                  <div className="flex gap-2">
                                    <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                      placeholder={getContentPlaceholder('assort_snacks_item3', 'Bullet 3')}
                                      value={getContentValue('assort_snacks_item3')}
                                      onChange={e => setContentValue('assort_snacks_item3', e.target.value)} />
                                    <input type="text" placeholder="%" className="w-20 px-3 py-2 border rounded-md text-sm"
                                      value={localStoreSettings.page_content?.assort_snacks_item3_size || ''}
                                      onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, assort_snacks_item3_size: e.target.value}} as any)} />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                    <span>Bullet 4</span>
                                    <span className="text-[10px] text-gray-400 font-normal">Schaal %</span>
                                  </label>
                                  <div className="flex gap-2">
                                    <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                      placeholder={getContentPlaceholder('assort_snacks_item4', 'Bullet 4')}
                                      value={getContentValue('assort_snacks_item4')}
                                      onChange={e => setContentValue('assort_snacks_item4', e.target.value)} />
                                    <input type="text" placeholder="%" className="w-20 px-3 py-2 border rounded-md text-sm"
                                      value={localStoreSettings.page_content?.assort_snacks_item4_size || ''}
                                      onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, assort_snacks_item4_size: e.target.value}} as any)} />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                    <span>Knop Tekst</span>
                                    <span className="text-[10px] text-gray-400 font-normal">Schaal %</span>
                                  </label>
                                  <div className="flex gap-2">
                                    <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm font-medium"
                                      placeholder={getContentPlaceholder('assort_snacks_btn', 'Knop Tekst')}
                                      value={getContentValue('assort_snacks_btn')}
                                      onChange={e => setContentValue('assort_snacks_btn', e.target.value)} />
                                    <input type="text" placeholder="%" className="w-20 px-3 py-2 border rounded-md text-sm"
                                      value={localStoreSettings.page_content?.assort_snacks_btn_size || ''}
                                      onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, assort_snacks_btn_size: e.target.value}} as any)} />
                                  </div>
                                </div>
                              </div>

                              {/* Pakket 2 (Rechts) */}
                              <div className="space-y-3 bg-gray-50/70 p-4 rounded-lg border border-gray-200">
                                <h5 className="font-semibold text-sm text-ob-blue border-b pb-1">Pakket 2 (Rechts - Donker)</h5>

                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                    <span>Badge / Label (bovenkant rechts)</span>
                                    <span className="text-[10px] text-gray-400 font-normal">Schaal %</span>
                                  </label>
                                  <div className="flex gap-2">
                                    <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                      placeholder={getContentPlaceholder('assort_complete_badge', 'bijv. Meest Gekozen')}
                                      value={getContentValue('assort_complete_badge')}
                                      onChange={e => setContentValue('assort_complete_badge', e.target.value)} />
                                    <input type="text" placeholder="%" className="w-20 px-3 py-2 border rounded-md text-sm"
                                      value={localStoreSettings.page_content?.assort_complete_badge_size || ''}
                                      onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, assort_complete_badge_size: e.target.value}} as any)} />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                    <span>Titel (bijv. Uitpakken & uitserveren)</span>
                                    <span className="text-[10px] text-gray-400 font-normal">Schaal %</span>
                                  </label>
                                  <div className="flex gap-2">
                                    <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                      placeholder={getContentPlaceholder('assort_complete_title', 'Titel Pakket 2')}
                                      value={getContentValue('assort_complete_title')}
                                      onChange={e => setContentValue('assort_complete_title', e.target.value)} />
                                    <input type="text" placeholder="%" className="w-20 px-3 py-2 border rounded-md text-sm"
                                      value={localStoreSettings.page_content?.assort_complete_title_size || ''}
                                      onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, assort_complete_title_size: e.target.value}} as any)} />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                    <span>Ondertitel</span>
                                    <span className="text-[10px] text-gray-400 font-normal">Schaal %</span>
                                  </label>
                                  <div className="flex gap-2">
                                    <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                      placeholder={getContentPlaceholder('assort_complete_subtitle', 'Ondertitel Pakket 2')}
                                      value={getContentValue('assort_complete_subtitle')}
                                      onChange={e => setContentValue('assort_complete_subtitle', e.target.value)} />
                                    <input type="text" placeholder="%" className="w-20 px-3 py-2 border rounded-md text-sm"
                                      value={localStoreSettings.page_content?.assort_complete_subtitle_size || ''}
                                      onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, assort_complete_subtitle_size: e.target.value}} as any)} />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                    <span>Bullet 1</span>
                                    <span className="text-[10px] text-gray-400 font-normal">Schaal %</span>
                                  </label>
                                  <div className="flex gap-2">
                                    <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                      placeholder={getContentPlaceholder('assort_complete_item1', 'Bullet 1')}
                                      value={getContentValue('assort_complete_item1')}
                                      onChange={e => setContentValue('assort_complete_item1', e.target.value)} />
                                    <input type="text" placeholder="%" className="w-20 px-3 py-2 border rounded-md text-sm"
                                      value={localStoreSettings.page_content?.assort_complete_item1_size || ''}
                                      onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, assort_complete_item1_size: e.target.value}} as any)} />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                    <span>Bullet 2</span>
                                    <span className="text-[10px] text-gray-400 font-normal">Schaal %</span>
                                  </label>
                                  <div className="flex gap-2">
                                    <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                      placeholder={getContentPlaceholder('assort_complete_item2', 'Bullet 2')}
                                      value={getContentValue('assort_complete_item2')}
                                      onChange={e => setContentValue('assort_complete_item2', e.target.value)} />
                                    <input type="text" placeholder="%" className="w-20 px-3 py-2 border rounded-md text-sm"
                                      value={localStoreSettings.page_content?.assort_complete_item2_size || ''}
                                      onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, assort_complete_item2_size: e.target.value}} as any)} />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                    <span>Bullet 3</span>
                                    <span className="text-[10px] text-gray-400 font-normal">Schaal %</span>
                                  </label>
                                  <div className="flex gap-2">
                                    <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                      placeholder={getContentPlaceholder('assort_complete_item3', 'Bullet 3')}
                                      value={getContentValue('assort_complete_item3')}
                                      onChange={e => setContentValue('assort_complete_item3', e.target.value)} />
                                    <input type="text" placeholder="%" className="w-20 px-3 py-2 border rounded-md text-sm"
                                      value={localStoreSettings.page_content?.assort_complete_item3_size || ''}
                                      onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, assort_complete_item3_size: e.target.value}} as any)} />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                    <span>Bullet 4</span>
                                    <span className="text-[10px] text-gray-400 font-normal">Schaal %</span>
                                  </label>
                                  <div className="flex gap-2">
                                    <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                      placeholder={getContentPlaceholder('assort_complete_item4', 'Bullet 4')}
                                      value={getContentValue('assort_complete_item4')}
                                      onChange={e => setContentValue('assort_complete_item4', e.target.value)} />
                                    <input type="text" placeholder="%" className="w-20 px-3 py-2 border rounded-md text-sm"
                                      value={localStoreSettings.page_content?.assort_complete_item4_size || ''}
                                      onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, assort_complete_item4_size: e.target.value}} as any)} />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                    <span>Knop Tekst</span>
                                    <span className="text-[10px] text-gray-400 font-normal">Schaal %</span>
                                  </label>
                                  <div className="flex gap-2">
                                    <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm font-medium"
                                      placeholder={getContentPlaceholder('assort_complete_btn', 'Knop Tekst')}
                                      value={getContentValue('assort_complete_btn')}
                                      onChange={e => setContentValue('assort_complete_btn', e.target.value)} />
                                    <input type="text" placeholder="%" className="w-20 px-3 py-2 border rounded-md text-sm"
                                      value={localStoreSettings.page_content?.assort_complete_btn_size || ''}
                                      onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, assort_complete_btn_size: e.target.value}} as any)} />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* MENU */}
                          <div className="bg-white p-6 rounded-xl border shadow-sm mb-6 space-y-4">
                            <h4 className="font-bold text-ob-blue mb-4 border-b pb-2">Sectie: Onze Selectie (Menu)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                  <span>Titel (bijv. Onze Selectie)</span>
                                  <span className="text-[10px] text-gray-400 font-normal">Schaal (bijv. 120%)</span>
                                </label>
                                <div className="flex gap-2">
                                  <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                    placeholder={getContentPlaceholder('menu_title', 'Onze Selectie')}
                                    value={getContentValue('menu_title')}
                                    onChange={e => setContentValue('menu_title', e.target.value)} />
                                  <input type="text" className="w-24 h-fit px-3 py-2 border rounded-md text-sm" placeholder="%"
                                    value={localStoreSettings.page_content?.menu_title_size || ''}
                                    onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, menu_title_size: e.target.value}} as any)} />
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                  <span>Knop (Volledig menu)</span>
                                  <span className="text-[10px] text-gray-400 font-normal">Schaal (bijv. 120%)</span>
                                </label>
                                <div className="flex gap-2">
                                  <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                    placeholder={getContentPlaceholder('menu_btn', 'Bekijk volledig menu')}
                                    value={getContentValue('menu_btn')}
                                    onChange={e => setContentValue('menu_btn', e.target.value)} />
                                  <input type="text" className="w-24 h-fit px-3 py-2 border rounded-md text-sm" placeholder="%"
                                    value={localStoreSettings.page_content?.menu_btn_size || ''}
                                    onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, menu_btn_size: e.target.value}} as any)} />
                                </div>
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                  <span>Ondertitel</span>
                                  <span className="text-[10px] text-gray-400 font-normal">Schaal (bijv. 120%)</span>
                                </label>
                                <div className="flex gap-2">
                                  <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                    placeholder={getContentPlaceholder('menu_subtitle', 'Hoogwaardige snacks, vers bereid in de Mokum Local Kitchen.')}
                                    value={getContentValue('menu_subtitle')}
                                    onChange={e => setContentValue('menu_subtitle', e.target.value)} />
                                  <input type="text" className="w-24 h-fit px-3 py-2 border rounded-md text-sm" placeholder="%"
                                    value={localStoreSettings.page_content?.menu_subtitle_size || ''}
                                    onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, menu_subtitle_size: e.target.value}} as any)} />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* BUSINESS */}
                          <div className="bg-white p-6 rounded-xl border shadow-sm mb-6 space-y-4">
                            <h4 className="font-bold text-ob-blue mb-4 border-b pb-2">Sectie: Vaste Klant Worden (Voor Bedrijven)</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                  <span>Titel (bijv. Vaste Klant Worden)</span>
                                  <span className="text-[10px] text-gray-400 font-normal">Schaal (bijv. 120%)</span>
                                </label>
                                <div className="flex gap-2">
                                  <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                    placeholder={getContentPlaceholder('business_title', 'Vaste Klant Worden')}
                                    value={getContentValue('business_title')}
                                    onChange={e => setContentValue('business_title', e.target.value)} />
                                  <input type="text" className="w-24 h-fit px-3 py-2 border rounded-md text-sm" placeholder="%"
                                    value={localStoreSettings.page_content?.business_title_size || ''}
                                    onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, business_title_size: e.target.value}} as any)} />
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                  <span>Knop Tekst (bijv. Kantoor Inschrijven)</span>
                                  <span className="text-[10px] text-gray-400 font-normal">Schaal (bijv. 120%)</span>
                                </label>
                                <div className="flex gap-2">
                                  <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                    placeholder={getContentPlaceholder('business_btn', 'Kantoor Inschrijven')}
                                    value={getContentValue('business_btn')}
                                    onChange={e => setContentValue('business_btn', e.target.value)} />
                                  <input type="text" className="w-24 h-fit px-3 py-2 border rounded-md text-sm" placeholder="%"
                                    value={localStoreSettings.page_content?.business_btn_size || ''}
                                    onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, business_btn_size: e.target.value}} as any)} />
                                </div>
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                  <span>Ondertitel</span>
                                  <span className="text-[10px] text-gray-400 font-normal">Schaal (bijv. 120%)</span>
                                </label>
                                <div className="flex gap-2">
                                  <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                    placeholder={getContentPlaceholder('business_subtitle', 'Een vaste partner voor uw kantoor.')}
                                    value={getContentValue('business_subtitle')}
                                    onChange={e => setContentValue('business_subtitle', e.target.value)} />
                                  <input type="text" className="w-24 h-fit px-3 py-2 border rounded-md text-sm" placeholder="%"
                                    value={localStoreSettings.page_content?.business_subtitle_size || ''}
                                    onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, business_subtitle_size: e.target.value}} as any)} />
                                </div>
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                  <span>Beschrijvingstekst</span>
                                  <span className="text-[10px] text-gray-400 font-normal">Schaal (bijv. 120%)</span>
                                </label>
                                <div className="flex gap-2">
                                  <textarea rows={3} className="flex-1 px-3 py-2 border rounded-md text-sm"
                                    placeholder={getContentPlaceholder('business_desc', 'Organiseert u regelmatig kantoorborrels of evenementen? Meld uw bedrijf aan bij Office Butler. Wij creëren een gepersonaliseerde bestelomgeving exclusief voor uw medewerkers.')}
                                    value={getContentValue('business_desc')}
                                    onChange={e => setContentValue('business_desc', e.target.value)} />
                                  <input type="text" className="w-24 h-fit px-3 py-2 border rounded-md text-sm" placeholder="%"
                                    value={localStoreSettings.page_content?.business_desc_size || ''}
                                    onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, business_desc_size: e.target.value}} as any)} />
                                </div>
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  <span>Titel Aanmeldformulier</span>
                                </label>
                                <input type="text" className="w-full px-3 py-2 border rounded-md text-sm"
                                  placeholder={getContentPlaceholder('business_form_title', 'Bedrijf Aanmelden')}
                                  value={getContentValue('business_form_title')}
                                  onChange={e => setContentValue('business_form_title', e.target.value)} />
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                  <span>Bullet 1</span>
                                  <span className="text-[10px] text-gray-400 font-normal">Schaal (bijv. 120%)</span>
                                </label>
                                <div className="flex gap-2">
                                  <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                    placeholder={getContentPlaceholder('business_point1', 'Een eigen, unieke URL (bijv. officebutler.nl/uw-bedrijf)')}
                                    value={getContentValue('business_point1')}
                                    onChange={e => setContentValue('business_point1', e.target.value)} />
                                  <input type="text" className="w-24 h-fit px-3 py-2 border rounded-md text-sm" placeholder="%"
                                    value={localStoreSettings.page_content?.business_point1_size || ''}
                                    onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, business_point1_size: e.target.value}} as any)} />
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                  <span>Bullet 2</span>
                                  <span className="text-[10px] text-gray-400 font-normal">Schaal (bijv. 120%)</span>
                                </label>
                                <div className="flex gap-2">
                                  <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                    placeholder={getContentPlaceholder('business_point2', 'Gepersonaliseerd assortiment naar wens')}
                                    value={getContentValue('business_point2')}
                                    onChange={e => setContentValue('business_point2', e.target.value)} />
                                  <input type="text" className="w-24 h-fit px-3 py-2 border rounded-md text-sm" placeholder="%"
                                    value={localStoreSettings.page_content?.business_point2_size || ''}
                                    onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, business_point2_size: e.target.value}} as any)} />
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                  <span>Bullet 3</span>
                                  <span className="text-[10px] text-gray-400 font-normal">Schaal (bijv. 120%)</span>
                                </label>
                                <div className="flex gap-2">
                                  <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                    placeholder={getContentPlaceholder('business_point3', 'Optie tot betalen op factuur')}
                                    value={getContentValue('business_point3')}
                                    onChange={e => setContentValue('business_point3', e.target.value)} />
                                  <input type="text" className="w-24 h-fit px-3 py-2 border rounded-md text-sm" placeholder="%"
                                    value={localStoreSettings.page_content?.business_point3_size || ''}
                                    onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, business_point3_size: e.target.value}} as any)} />
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* CONTACT */}
                          <div className="bg-white p-6 rounded-xl border shadow-sm mb-6 space-y-6">
                            <h4 className="font-bold text-ob-blue mb-4 border-b pb-2">Sectie: Contact & FAQ</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                  <span>Titel Contact Sectie</span>
                                  <span className="text-[10px] text-gray-400 font-normal">Schaal (bijv. 120%)</span>
                                </label>
                                <div className="flex gap-2">
                                  <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                    placeholder={getContentPlaceholder('contact_title', 'Contact & Informatie')}
                                    value={getContentValue('contact_title')}
                                    onChange={e => setContentValue('contact_title', e.target.value)} />
                                  <input type="text" className="w-24 h-fit px-3 py-2 border rounded-md text-sm" placeholder="%"
                                    value={localStoreSettings.page_content?.contact_title_size || ''}
                                    onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, contact_title_size: e.target.value}} as any)} />
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                  <span>Titel FAQ Sectie</span>
                                  <span className="text-[10px] text-gray-400 font-normal">Schaal (bijv. 120%)</span>
                                </label>
                                <div className="flex gap-2">
                                  <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                    placeholder={getContentPlaceholder('faq_title', 'Veelgestelde Vragen')}
                                    value={getContentValue('faq_title')}
                                    onChange={e => setContentValue('faq_title', e.target.value)} />
                                  <input type="text" className="w-24 h-fit px-3 py-2 border rounded-md text-sm" placeholder="%"
                                    value={localStoreSettings.page_content?.faq_title_size || ''}
                                    onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, faq_title_size: e.target.value}} as any)} />
                                </div>
                              </div>
                            </div>

                            <div className="border-t pt-4">
                              <h5 className="font-semibold text-xs text-gray-500 uppercase tracking-wider mb-4">Veelgestelde Vragen (FAQ Items)</h5>
                              
                              {/* FAQ ITEM 1 */}
                              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4 space-y-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                    <span>Vraag 1</span>
                                    <span className="text-[10px] text-gray-400 font-normal">Schaal %</span>
                                  </label>
                                  <div className="flex gap-2">
                                    <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm bg-white"
                                      placeholder={getContentPlaceholder('faq_q1', 'Bezorgen jullie ook buiten Amsterdam?')}
                                      value={getContentValue('faq_q1')}
                                      onChange={e => setContentValue('faq_q1', e.target.value)} />
                                    <input type="text" className="w-20 px-3 py-2 border rounded-md text-sm bg-white" placeholder="%"
                                      value={localStoreSettings.page_content?.faq_q1_size || ''}
                                      onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, faq_q1_size: e.target.value}} as any)} />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                    <span>Antwoord 1</span>
                                    <span className="text-[10px] text-gray-400 font-normal">Schaal %</span>
                                  </label>
                                  <div className="flex gap-2">
                                    <textarea rows={2} className="flex-1 px-3 py-2 border rounded-md text-sm bg-white"
                                      placeholder={getContentPlaceholder('faq_a1', 'Momenteel bezorgen wij met Office Butler uitsluitend op kantoren binnen de ring van Amsterdam om de kwaliteit en temperatuur van onze snacks te garanderen.')}
                                      value={getContentValue('faq_a1')}
                                      onChange={e => setContentValue('faq_a1', e.target.value)} />
                                    <input type="text" className="w-20 h-fit px-3 py-2 border rounded-md text-sm bg-white" placeholder="%"
                                      value={localStoreSettings.page_content?.faq_a1_size || ''}
                                      onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, faq_a1_size: e.target.value}} as any)} />
                                  </div>
                                </div>
                              </div>

                              {/* FAQ ITEM 2 */}
                              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4 space-y-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                    <span>Vraag 2</span>
                                    <span className="text-[10px] text-gray-400 font-normal">Schaal %</span>
                                  </label>
                                  <div className="flex gap-2">
                                    <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm bg-white"
                                      placeholder={getContentPlaceholder('faq_q2', 'Wat is het verschil met Canal Butler?')}
                                      value={getContentValue('faq_q2')}
                                      onChange={e => setContentValue('faq_q2', e.target.value)} />
                                    <input type="text" className="w-20 px-3 py-2 border rounded-md text-sm bg-white" placeholder="%"
                                      value={localStoreSettings.page_content?.faq_q2_size || ''}
                                      onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, faq_q2_size: e.target.value}} as any)} />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                    <span>Antwoord 2</span>
                                    <span className="text-[10px] text-gray-400 font-normal">Schaal %</span>
                                  </label>
                                  <div className="flex gap-2">
                                    <textarea rows={2} className="flex-1 px-3 py-2 border rounded-md text-sm bg-white"
                                      placeholder={getContentPlaceholder('faq_a2', 'Office Butler is het B2B zusterbedrijf van Canal Butler. We maken gebruik van dezelfde keuken (Mokum Local Kitchen) en bieden dezelfde premium kwaliteit, maar dan specifiek afgestemd op levering op kantoor in plaats van op de grachten.')}
                                      value={getContentValue('faq_a2')}
                                      onChange={e => setContentValue('faq_a2', e.target.value)} />
                                    <input type="text" className="w-20 h-fit px-3 py-2 border rounded-md text-sm bg-white" placeholder="%"
                                      value={localStoreSettings.page_content?.faq_a2_size || ''}
                                      onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, faq_a2_size: e.target.value}} as any)} />
                                  </div>
                                </div>
                              </div>

                              {/* FAQ ITEM 3 */}
                              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4 space-y-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                    <span>Vraag 3</span>
                                    <span className="text-[10px] text-gray-400 font-normal">Schaal %</span>
                                  </label>
                                  <div className="flex gap-2">
                                    <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm bg-white"
                                      placeholder={getContentPlaceholder('faq_q3', 'Hoe ver van tevoren moet ik bestellen?')}
                                      value={getContentValue('faq_q3')}
                                      onChange={e => setContentValue('faq_q3', e.target.value)} />
                                    <input type="text" className="w-20 px-3 py-2 border rounded-md text-sm bg-white" placeholder="%"
                                      value={localStoreSettings.page_content?.faq_q3_size || ''}
                                      onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, faq_q3_size: e.target.value}} as any)} />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                    <span>Antwoord 3</span>
                                    <span className="text-[10px] text-gray-400 font-normal">Schaal %</span>
                                  </label>
                                  <div className="flex gap-2">
                                    <textarea rows={2} className="flex-1 px-3 py-2 border rounded-md text-sm bg-white"
                                      placeholder={getContentPlaceholder('faq_a3', 'Voor reguliere bestellingen vragen wij u minimaal 2 uur van tevoren te bestellen. Voor grote groepen (>30 personen) of een compleet assortiment horen wij dit graag minimaal 24 uur van tevoren.')}
                                      value={getContentValue('faq_a3')}
                                      onChange={e => setContentValue('faq_a3', e.target.value)} />
                                    <input type="text" className="w-20 h-fit px-3 py-2 border rounded-md text-sm bg-white" placeholder="%"
                                      value={localStoreSettings.page_content?.faq_a3_size || ''}
                                      onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, faq_a3_size: e.target.value}} as any)} />
                                  </div>
                                </div>
                              </div>

                              {/* FAQ ITEM 4 (OPTIONEEL) */}
                              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                    <span>Vraag 4 (Optioneel)</span>
                                    <span className="text-[10px] text-gray-400 font-normal">Schaal %</span>
                                  </label>
                                  <div className="flex gap-2">
                                    <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm bg-white"
                                      placeholder={getContentPlaceholder('faq_q4', 'Extra vraag toevoegen...')}
                                      value={getContentValue('faq_q4')}
                                      onChange={e => setContentValue('faq_q4', e.target.value)} />
                                    <input type="text" className="w-20 px-3 py-2 border rounded-md text-sm bg-white" placeholder="%"
                                      value={localStoreSettings.page_content?.faq_q4_size || ''}
                                      onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, faq_q4_size: e.target.value}} as any)} />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                    <span>Antwoord 4 (Optioneel)</span>
                                    <span className="text-[10px] text-gray-400 font-normal">Schaal %</span>
                                  </label>
                                  <div className="flex gap-2">
                                    <textarea rows={2} className="flex-1 px-3 py-2 border rounded-md text-sm bg-white"
                                      placeholder={getContentPlaceholder('faq_a4', 'Antwoord op vraag 4...')}
                                      value={getContentValue('faq_a4')}
                                      onChange={e => setContentValue('faq_a4', e.target.value)} />
                                    <input type="text" className="w-20 h-fit px-3 py-2 border rounded-md text-sm bg-white" placeholder="%"
                                      value={localStoreSettings.page_content?.faq_a4_size || ''}
                                      onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, faq_a4_size: e.target.value}} as any)} />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-8 flex justify-end">
                            <button onClick={handleSaveStoreSettings} disabled={isSaving} className="bg-[#111827] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#1f2937] transition-colors disabled:opacity-50">
                              {isSaving ? 'Opslaan...' : 'Teksten Opslaan'}
                            </button>
                          </div>
                        </section>
                      </div>

                    ) : activeTab === 'translations' && localStoreSettings ? (
                      <div className="space-y-8 animate-in fade-in duration-300">
                        <section>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4 mb-6">
                            <div>
                              <h3 className="text-xl font-serif font-semibold text-[#05053D] flex items-center gap-2">
                                <Languages className="text-amber-500" size={24} />
                                <span>Engelse Vertalingen Beheren</span>
                              </h3>
                              <p className="text-xs text-gray-500 mt-1">
                                Beheer en overschrijf hier handmatig de Engelse teksten voor producten (zoals <em>mini kroket</em>), categorieën en losse zinnen. Handmatige invoer heeft altijd voorrang op automatische vertalingen.
                              </p>
                            </div>
                            <button
                              onClick={handleSaveStoreSettings}
                              disabled={isSaving}
                              className="bg-[#111827] text-white px-5 py-2.5 rounded-lg text-xs font-bold hover:bg-[#1f2937] transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm cursor-pointer self-start sm:self-auto"
                            >
                              <Save size={15} />
                              {isSaving ? 'Opslaan...' : 'Vertalingen Opslaan'}
                            </button>
                          </div>

                          {/* Kaart voor nieuwe term toevoegen */}
                          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs mb-8">
                            <h4 className="font-bold text-sm text-[#05053D] mb-3 flex items-center gap-2">
                              <span>Nieuwe Term of Correctie Toevoegen</span>
                            </h4>
                            <p className="text-xs text-gray-500 mb-4">
                              Voer het Nederlandse woord of de zin in zoals deze op de website staat, en geef de gewenste Engelse vertaling op.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                              <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                  Nederlandse term (exacte tekst)
                                </label>
                                <input
                                  type="text"
                                  placeholder="bijv. Mini kroket of Bitterballen"
                                  value={newTransTerm}
                                  onChange={e => setNewTransTerm(e.target.value)}
                                  className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                  Engelse vertaling (English)
                                </label>
                                <input
                                  type="text"
                                  placeholder="bijv. Mini Dutch croquette of Dutch beef croquettes"
                                  value={newTransTranslation}
                                  onChange={e => setNewTransTranslation(e.target.value)}
                                  className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                              <button
                                type="button"
                                onClick={() => {
                                  if (!newTransTerm.trim() || !newTransTranslation.trim()) return;
                                  const currentCustom = { ...(localStoreSettings.page_content?.custom_translations || {}) };
                                  currentCustom[newTransTerm.trim()] = newTransTranslation.trim();
                                  setLocalStoreSettings({
                                    ...localStoreSettings,
                                    page_content: {
                                      ...localStoreSettings.page_content,
                                      custom_translations: currentCustom,
                                    },
                                  } as any);
                                  setNewTransTerm('');
                                  setNewTransTranslation('');
                                }}
                                disabled={!newTransTerm.trim() || !newTransTranslation.trim()}
                                className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer shadow-2xs"
                              >
                                <Plus size={15} /> Toevoegen aan Woordenlijst
                              </button>

                              {/* Suggesties */}
                              <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
                                <span className="font-semibold text-[11px] text-gray-400">Suggesties:</span>
                                {SUGGESTED_TRANSLATION_TERMS.slice(0, 4).map(s => (
                                  <button
                                    key={s.term}
                                    type="button"
                                    onClick={() => {
                                      setNewTransTerm(s.term);
                                      setNewTransTranslation(s.defaultEn);
                                    }}
                                    className="px-2 py-0.5 rounded bg-gray-100 hover:bg-amber-100 hover:text-amber-900 text-gray-700 text-[11px] transition-colors cursor-pointer border border-gray-200"
                                  >
                                    + {s.term}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Overzicht van ingestelde vertalingen */}
                          <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
                            <div className="p-4 sm:p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50/50">
                              <div>
                                <h4 className="font-bold text-sm text-[#05053D]">
                                  Ingestelde Handmatige Vertalingen ({Object.keys(localStoreSettings.page_content?.custom_translations || {}).length})
                                </h4>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  Hieronder ziet u alle termen die handmatig worden vertaald. U kunt ze direct wijzigen of verwijderen.
                                </p>
                              </div>

                              <div className="relative w-full sm:w-64">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                  type="text"
                                  placeholder="Filter vertalingen..."
                                  value={translationSearch}
                                  onChange={e => setTranslationSearch(e.target.value)}
                                  className="w-full pl-8 pr-3 py-1.5 text-xs border rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                                />
                              </div>
                            </div>

                            {(() => {
                              const customTranslations = localStoreSettings.page_content?.custom_translations || {};
                              const entries = Object.entries(customTranslations).filter(([key, val]) => {
                                if (!translationSearch) return true;
                                const q = translationSearch.toLowerCase();
                                return key.toLowerCase().includes(q) || String(val).toLowerCase().includes(q);
                              });

                              if (entries.length === 0) {
                                return (
                                  <div className="p-10 text-center text-gray-500">
                                    <Languages className="mx-auto text-gray-300 mb-2" size={32} />
                                    <p className="text-sm font-semibold text-gray-700">
                                      {translationSearch ? 'Geen vertalingen gevonden met deze zoekterm' : 'Nog geen handmatige vertalingen ingesteld'}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                                      {translationSearch
                                        ? 'Probeer een andere term te zoeken of voeg deze hierboven toe.'
                                        : 'Voeg hierboven een term toe, zoals "Mini kroket" of klik op een van de suggesties om te beginnen.'}
                                    </p>
                                    {!translationSearch && (
                                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                                        {SUGGESTED_TRANSLATION_TERMS.map(s => (
                                          <button
                                            key={s.term}
                                            type="button"
                                            onClick={() => {
                                              const current = { ...(localStoreSettings.page_content?.custom_translations || {}) };
                                              current[s.term] = s.defaultEn;
                                              setLocalStoreSettings({
                                                ...localStoreSettings,
                                                page_content: {
                                                  ...localStoreSettings.page_content,
                                                  custom_translations: current,
                                                },
                                              } as any);
                                            }}
                                            className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs hover:bg-amber-100 transition-colors cursor-pointer"
                                          >
                                            + Voeg {s.term} toe ({s.defaultEn})
                                          </button>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                );
                              }

                              return (
                                <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                                  {entries.map(([dutchTerm, engVal]) => (
                                    <div
                                      key={dutchTerm}
                                      className="p-3 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-amber-50/30 transition-colors"
                                    >
                                      <div className="flex-1 min-w-0 pr-4">
                                        <div className="flex items-center gap-2">
                                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider bg-gray-100 px-1.5 py-0.5 rounded">NL</span>
                                          <span className="text-sm font-semibold text-gray-900 truncate">{dutchTerm}</span>
                                        </div>
                                      </div>

                                      <div className="flex-1 min-w-0 flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-1.5 py-0.5 rounded">EN</span>
                                        <input
                                          type="text"
                                          value={String(engVal)}
                                          onChange={e => {
                                            const updated = { ...(localStoreSettings.page_content?.custom_translations || {}) };
                                            updated[dutchTerm] = e.target.value;
                                            setLocalStoreSettings({
                                              ...localStoreSettings,
                                              page_content: {
                                                ...localStoreSettings.page_content,
                                                custom_translations: updated,
                                              },
                                            } as any);
                                          }}
                                          className="flex-1 px-2.5 py-1 text-xs border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                                        />
                                        <button
                                          type="button"
                                          title="Verwijder vertaling"
                                          onClick={() => {
                                            const updated = { ...(localStoreSettings.page_content?.custom_translations || {}) };
                                            delete updated[dutchTerm];
                                            setLocalStoreSettings({
                                              ...localStoreSettings,
                                              page_content: {
                                                ...localStoreSettings.page_content,
                                                custom_translations: updated,
                                              },
                                            } as any);
                                          }}
                                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                        >
                                          <Trash2 size={15} />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              );
                            })()}
                          </div>

                          {/* Extra info over SQL & opslag */}
                          <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-600">
                            <p className="font-semibold text-slate-800 mb-1 flex items-center gap-1.5">
                              <span>ℹ️ Hoe worden deze vertalingen opgeslagen?</span>
                            </p>
                            <p>
                              Alle vertalingen worden automatisch opgeslagen in de bestaande <code>store_settings</code> tabel in Supabase onder de kolom <code>page_content.custom_translations</code>. Er is dus geen SQL-migratie of nieuwe tabel vereist; zodra u op <strong>"Vertalingen Opslaan"</strong> klikt, staan de vertalingen direct veilig in Supabase en worden ze direct zichtbaar op de website wanneer een bezoeker naar het Engels schakelt.
                            </p>
                          </div>

                          <div className="mt-6 flex justify-end">
                            <button
                              onClick={handleSaveStoreSettings}
                              disabled={isSaving}
                              className="bg-[#111827] text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-[#1f2937] transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-sm"
                            >
                              <Save size={16} />
                              {isSaving ? 'Opslaan...' : 'Vertalingen Opslaan'}
                            </button>
                          </div>
                        </section>
                      </div>

                    ) : activeTab === 'store' && localStoreSettings ? (
                      <div className="space-y-10 max-w-2xl">
                        {/* Status Section */}
                        <section>
                          <h3 className="text-xl font-serif font-semibold text-[#05053D] mb-2">{!isSidebarCollapsed && <span>Winkel Status</span>} Beheren</h3>
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
                            <div>
                              <h3 className="text-xl font-serif font-semibold text-[#05053D]">Openingstijden Beheren</h3>
                              <p className="text-xs text-gray-500 mt-0.5">Stel hier de openingstijden per dag in. Deze worden direct op de website onderaan getoond.</p>
                            </div>
                            <button onClick={handleSaveStoreSettings} disabled={isSaving} className="bg-[#111827] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1f2937] transition-colors disabled:opacity-50">
                              {isSaving ? 'Bezig...' : 'Tijden Opslaan'}
                            </button>
                          </div>
                          {saveSuccess && <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-6 text-sm flex items-center gap-2"><span>Instellingen succesvol opgeslagen!</span></div>}

                          {/* Live preview banner */}
                          <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-lg mb-4 text-xs text-ob-blue flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <span className="font-bold block mb-0.5">Huidige weergave onderaan de website:</span>
                              <span className="font-medium text-gray-800">
                                {localStoreSettings.page_content?.opening_hours_custom?.trim() || formatStoreSchedule(localStoreSettings.schedule).join(' • ') || 'Nog geen tijden ingesteld'}
                              </span>
                            </div>
                          </div>

                          {/* Optional custom override */}
                          <div className="mb-5 bg-gray-50/60 p-3.5 rounded-lg border border-gray-200">
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Aangepaste tekst (optioneel — laat leeg om automatisch de dagen hieronder te groeperen):
                            </label>
                            <input 
                              type="text" 
                              placeholder="bijv. Ma - Vr: 15:00 - 21:00 (of laat leeg voor automatische weergave)" 
                              className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                              value={localStoreSettings.page_content?.opening_hours_custom || ''}
                              onChange={e => setLocalStoreSettings({
                                ...localStoreSettings,
                                page_content: { ...localStoreSettings.page_content, opening_hours_custom: e.target.value }
                              } as any)}
                            />
                          </div>
                          
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
                      <div className="space-y-6 w-full max-w-7xl">
                        <div>
                          <h3 className="text-xl font-serif font-semibold text-[#05053D] mb-2">{!isSidebarCollapsed && <span>Aanmeldingen</span>}</h3>
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
                      <div className="space-y-6 w-full max-w-7xl">
                        <div>
                          <h3 className="text-xl font-serif font-semibold text-[#05053D] mb-2">{!isSidebarCollapsed && <span>Klanten (Kantoren)</span>}</h3>
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
                    
                    ) : activeTab === 'orders' ? (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-[#05053D]">Alle {!isSidebarCollapsed && <span>Bestellingen</span>}</h3>
                            <p className="text-sm text-gray-500">Overzicht van alle geplaatste bestellingen (inclusief gasten).</p>
                          </div>
                          <div className="text-sm text-gray-500 font-medium">{orders.length} bestellingen totaal</div>
                        </div>

                        {(() => {
                          const groupedOrders = Object.values(orders.reduce((acc, order) => {
                            const dateKey = new Date(order.created_at).toISOString().slice(0, 16);
                            const key = `${order.company_id || 'gast'}_${dateKey}_${order.delivery_date}_${order.delivery_time}`;
                            
                            if (!acc[key]) {
                              let contactName = order.ob_companies?.name || 'Gast Bestelling';
                              let phone = order.phone || '';
                              let address = '';
                              
                              if (order.ob_company_addresses) {
                                address = order.ob_company_addresses.address_line;
                                if (order.ob_company_addresses.label) {
                                  address = `${order.ob_company_addresses.label} - ${address}`;
                                }
                              }
                              
                              let discountInfo: { code: string; label: string; amount: number } | null = null;
                              if (!order.company_id) {
                                // Extract guest info from notes
                                const notes = order.notes || '';
                                const nameMatch = notes.match(/Naam:\s*(.+)/);
                                if (nameMatch) contactName = `Gast: ${nameMatch[1].trim()}`;
                                
                                const addressMatch = notes.match(/Bezorgadres:\s*(.+)/);
                                if (addressMatch) address = addressMatch[1].trim();

                                // Extract discount info from notes if present
                                // Format: Kortingscode: CODE (X% korting, -€Y.YY) or Kortingscode: CODE (Gratis product: ...)
                                const discountMatch = notes.match(/Kortingscode:\s*([A-Za-z0-9_-]+)\s*\(([^)]+)\)/);
                                if (discountMatch) {
                                  const code = discountMatch[1].trim();
                                  const details = discountMatch[2].trim();
                                  const euroMatch = details.match(/-€([0-9]+(?:\.[0-9]+)?)/);
                                  const discAmt = euroMatch ? parseFloat(euroMatch[1]) : 0;
                                  discountInfo = {
                                    code,
                                    label: details,
                                    amount: discAmt
                                  };
                                }
                              }

                              acc[key] = {
                                id: key,
                                created_at: order.created_at,
                                company_name: contactName,
                                phone: phone,
                                address: address,
                                delivery_date: order.delivery_date,
                                delivery_time: order.delivery_time,
                                total_order_price: 0,
                                discount: discountInfo,
                                items: []
                              };
                            }
                            acc[key].items.push(order);
                            acc[key].total_order_price += Number(order.total_price || 0);
                            return acc;
                          }, {} as Record<string, any>)).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

                          if (groupedOrders.length === 0) {
                            return (
                              <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                                <ShoppingBag className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                                <p className="text-gray-500">Geen bestellingen gevonden.</p>
                              </div>
                            );
                          }

                          return (
                            <div className="w-full max-w-full overflow-auto custom-scrollbar bg-white border border-gray-200 rounded-xl max-h-[65vh]">
                              <table className="w-full text-left border-collapse min-w-[1000px]">
                                <thead>
                                  <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                                    <th className="p-4 font-semibold whitespace-nowrap">Datum (Besteld)</th>
                                    <th className="p-4 font-semibold">Klant & Contact</th>
                                    <th className="p-4 font-semibold min-w-[200px]">Afleveradres</th>
                                    <th className="p-4 font-semibold min-w-[200px]">Bestelling (Producten)</th>
                                    <th className="p-4 font-semibold text-right">Totaalprijs</th>
                                    <th className="p-4 font-semibold whitespace-nowrap">Gewenste Levering</th>
                                    <th className="p-4 font-semibold text-right">Acties</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                  {groupedOrders.map((group: any) => {
                                    return (
                                    <tr key={group.id} className="hover:bg-gray-50/50 align-top">
                                      <td className="p-4 text-sm text-gray-800 whitespace-nowrap">
                                        {new Date(group.created_at).toLocaleString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                      </td>
                                      <td className="p-4 text-sm text-gray-800">
                                        <div className="font-medium text-[#05053D]">{group.company_name}</div>
                                        {group.phone && <div className="text-gray-500 mt-1">{group.phone}</div>}
                                      </td>
                                      <td className="p-4 text-sm text-gray-700">
                                        {group.address ? (
                                          <div className="max-w-xs">{group.address}</div>
                                        ) : (
                                          <span className="text-gray-400 italic">Niet opgegeven</span>
                                        )}
                                      </td>
                                      <td className="p-4">
                                        <div className="space-y-2">
                                          {group.items.map((item: any, i: number) => (
                                            <div key={item.id || i} className="text-sm">
                                              <span className="font-semibold text-gray-800">{item.product_name}</span>{' '}
                                              <span className="text-gray-500">({item.portion_size} stuks)</span>
                                              <div className="text-xs text-gray-400">€{Number(item.price || 0).toFixed(2)} per stuk</div>
                                            </div>
                                          ))}
                                        </div>
                                      </td>
                                      <td className="p-4 text-sm text-right align-bottom">
                                        {group.discount && group.discount.amount > 0 ? (
                                          <div>
                                            <span className="text-xs text-gray-400 line-through block">
                                              €{group.total_order_price.toFixed(2)}
                                            </span>
                                            <div className="text-sm font-bold text-emerald-700">
                                              €{Math.max(0, group.total_order_price - group.discount.amount).toFixed(2)}
                                            </div>
                                            <span className="inline-block text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded mt-0.5">
                                              {group.discount.code} (-€{group.discount.amount.toFixed(2)})
                                            </span>
                                          </div>
                                        ) : group.discount && group.discount.code ? (
                                          <div>
                                            <div className="text-sm font-bold text-gray-900">
                                              €{group.total_order_price.toFixed(2)}
                                            </div>
                                            <span className="inline-block text-[11px] font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded mt-0.5">
                                              🎁 {group.discount.code} (Gratis product)
                                            </span>
                                          </div>
                                        ) : (
                                          <div className="font-bold text-gray-900">
                                            €{group.total_order_price.toFixed(2)}
                                          </div>
                                        )}
                                      </td>
                                      <td className="p-4 text-sm text-gray-600 whitespace-nowrap">
                                        {group.delivery_date ? new Date(group.delivery_date).toLocaleDateString('nl-NL') : 'Onbekend'}
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
                                    </tr>
                                  );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          );
                        })()}
                      </div>

                    ) : activeTab === 'prices' ? (
                      <div className="space-y-6 w-full max-w-6xl">
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
                               {dbProducts.length > 0 ? dbProducts.map(prod => (
                                 <option key={prod.name} value={prod.name}>{prod.name}</option>
                               )) : AVAILABLE_PRODUCTS.map(prod => (
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
                            {(() => {
                                const selectedProdObj = dbProducts.find(p => p.name === selectedPriceProduct);
                                const portionsToUse = selectedProdObj?.portions && selectedProdObj.portions.length > 0 ? selectedProdObj.portions : PORTIONS;
                                return (
                                  <tbody className="divide-y divide-gray-100">
                                    {portionsToUse.map((portion: number) => (
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
                                );
                              })()}
                          </table>
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Laat het veld leeg als de portie niet beschikbaar is.</p>

                        {(() => {
                           const prod = dbProducts.find(p => p.name === selectedPriceProduct);
                           if (prod && prod.variants && prod.variants.length > 0) {
                             return (
                               <div className="mt-8">
                                 <h4 className="text-sm font-semibold text-gray-700 mb-3">Extra kosten per variant (Optioneel)</h4>
                                 <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                   <table className="w-full text-left text-sm">
                                     <thead className="bg-gray-50 border-b border-gray-200">
                                       <tr>
                                         <th className="px-4 py-3 font-semibold text-gray-700">Variant</th>
                                         {(prod.portions || []).map((size: number) => (
                                            <th key={size} className="px-4 py-3 font-semibold text-gray-700 text-right w-32">{size} st.</th>
                                         ))}
                                       </tr>
                                     </thead>
                                     <tbody className="divide-y divide-gray-100">
                                       {prod.variants.map((v: string) => (
                                         <tr key={v}>
                                           <td className="px-4 py-3 text-gray-700">{v}</td>
                                           {(prod.portions || []).map((size: number) => {
                                              const key = `${v}_${size}`;
                                              return (
                                                <td key={size} className="px-4 py-2">
                                                  <div className="flex items-center gap-1 justify-end">
                                                    <span className="text-gray-500">€</span>
                                                    <input
                                                      type="number"
                                                      step="0.01"
                                                      min="0"
                                                      className="w-16 px-2 py-1 border border-gray-300 rounded text-right focus:outline-none focus:border-[#151f33]"
                                                      value={variantSurcharges[key] !== undefined ? variantSurcharges[key] : (variantSurcharges[v] !== undefined ? variantSurcharges[v] : '')}
                                                      onChange={(e) => {
                                                        const val = e.target.value;
                                                        setVariantSurcharges(prev => ({
                                                          ...prev,
                                                          [key]: val === '' ? undefined : parseFloat(val)
                                                        } as Record<string, number>));
                                                      }}
                                                    />
                                                  </div>
                                                </td>
                                              );
                                           })}
                                         </tr>
                                       ))}
                                     </tbody>
                                   </table>
                                 </div>
                               </div>
                             );
                           }
                           return null;
                        })()}

                      </div>
                                        ) : activeTab === 'menu' ? (
                      <MenuManager />
                    ) : activeTab === 'delivery' ? (
                      <DeliveryOptionsManager />
                    ) : activeTab === 'discounts' ? (
                      <DiscountCodesManager
                        storeSettings={localStoreSettings}
                        onStoreSettingsUpdated={(newSettings) => {
                          setLocalStoreSettings(newSettings);
                          if (onStoreSettingsUpdated) {
                            onStoreSettingsUpdated(newSettings);
                          }
                        }}
                        dbProducts={dbProducts}
                      />
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
