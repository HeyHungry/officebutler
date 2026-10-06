import { useState, useEffect, useRef, FormEvent } from 'react';
import { supabase, SharedSettings, StoreSettings, ObCompany, ObPortionPrice, formatStoreSchedule, DEFAULT_SECTION_ORDER, SECTION_METADATA, HomepageSectionKey } from '../lib/supabase';
import { LogIn, X, Lock, Store, Users, DollarSign, Building2, CheckCircle2, ChevronRight, ChevronLeft, ArrowLeft, ShoppingBag, Type, Truck, ArrowUp, ArrowDown, ArrowUpDown, Languages, Plus, Trash2, Search, Edit3, Save, Tag, Clock, Check, Filter, RotateCcw, Printer, FileText, Calendar, Mail, Send, Upload, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { MenuManager } from './MenuManager';
import { DeliveryOptionsManager } from './DeliveryOptionsManager';
import { DiscountCodesManager } from './DiscountCodesManager';
import { DeadlinesManager } from './DeadlinesManager';
import { InvoiceModal, MonthlyInvoiceData } from './InvoiceModal';
import { ModificationRulesConfig, CompanyCustomDeadlines, DEFAULT_DEADLINE_TIERS } from '../lib/orderDeadlines';
import { useLanguage } from '../contexts/LanguageContext';
import { FONT_OPTIONS } from '../lib/typography';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
  'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'
];

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

type Tab = 'store' | 'deadlines' | 'content' | 'registrations' | 'prices' | 'customers' | 'orders' | 'menu' | 'delivery' | 'translations' | 'discounts';

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
  const [variantFullPrices, setVariantFullPrices] = useState<Record<string, number | string>>({});
  const lastLoadedProductRef = useRef<string>('');
  const lastLoadedCompanyRef = useRef<string | null>(null);

  // New Tabs State
  const [activeTab, setActiveTab] = useState<Tab>('store');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [registrations, setRegistrations] = useState<ObCompany[]>([]);
  const [customers, setCustomers] = useState<ObCompany[]>([]);
  const [selectedCompanyForDeadlines, setSelectedCompanyForDeadlines] = useState<ObCompany | null>(null);
  
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [productPrices, setProductPrices] = useState<ObProductPrice[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedPriceProduct, setSelectedPriceProduct] = useState(AVAILABLE_PRODUCTS[0]);
  const [selectedPriceCompany, setSelectedPriceCompany] = useState<string | null>(null);

  const [impersonating, setImpersonating] = useState<ObCompany | null>(null);
  const [resendingInvoice, setResendingInvoice] = useState<string | null>(null);
  const [orderCompanyFilter, setOrderCompanyFilter] = useState<string>('ALL');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('ALL');
  const [updatingDeliveryStatus, setUpdatingDeliveryStatus] = useState<string | null>(null);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<any | null>(null);
  const [selectedMonthlyInvoiceData, setSelectedMonthlyInvoiceData] = useState<MonthlyInvoiceData | null>(null);
  const [invoiceModalInitialShowEmail, setInvoiceModalInitialShowEmail] = useState<boolean>(false);
  const [isMonthlySelectorOpen, setIsMonthlySelectorOpen] = useState(false);
  const [monthlySelectedCompanyId, setMonthlySelectedCompanyId] = useState<string>('');
  const [monthlySelectedMonth, setMonthlySelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [monthlySelectedYear, setMonthlySelectedYear] = useState<number>(new Date().getFullYear());
  const [monthlyOnlyDelivered, setMonthlyOnlyDelivered] = useState<boolean>(true);

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

  const getFontValue = (key: string): string => {
    return (localStoreSettings?.page_content as any)?.[`${key}_font`] || 'auto';
  };

  const setFontValue = (key: string, fontKey: string) => {
    if (!localStoreSettings) return;
    setLocalStoreSettings({
      ...localStoreSettings,
      page_content: {
        ...localStoreSettings.page_content,
        [`${key}_font`]: fontKey
      }
    });
  };

  const renderFontSelect = (key: string) => (
    <select
      className="w-28 sm:w-40 h-fit px-2 py-2 border border-gray-300 rounded-md text-xs bg-white text-gray-700 focus:outline-none focus:border-ob-blue shrink-0 cursor-pointer shadow-2xs"
      title="Lettertype & stijl"
      value={getFontValue(key)}
      onChange={e => setFontValue(key, e.target.value)}
    >
      {FONT_OPTIONS.map(opt => (
        <option key={opt.id} value={opt.id}>{opt.label}</option>
      ))}
    </select>
  );

  useEffect(() => {
    setLocalSettings(settings);
    setLocalStoreSettings(storeSettings);
  }, [settings, storeSettings]);

  useEffect(() => {
    if (dbProducts.length > 0 && selectedPriceProduct) {
      const cleanSelected = selectedPriceProduct.trim().toLowerCase();
      const currentCompanyKey = selectedPriceCompany || null;
      const productChanged = lastLoadedProductRef.current !== cleanSelected || lastLoadedCompanyRef.current !== currentCompanyKey;

      const prod = dbProducts.find(p => (p.name || '').trim().toLowerCase() === cleanSelected);
      if (prod) {
        const surcharges = prod.variant_surcharges || {};
        setVariantSurcharges(surcharges);

        if (productChanged || Object.keys(variantFullPrices).length === 0) {
          lastLoadedProductRef.current = cleanSelected;
          lastLoadedCompanyRef.current = currentCompanyKey;

          const initialFullPrices: Record<string, number | string> = {};
          const portionsToUse = prod.portions && prod.portions.length > 0 ? prod.portions : PORTIONS;
          (prod.variants || []).forEach((v: string) => {
            portionsToUse.forEach((size: number) => {
              const key = `${v}_${size}`;
              
              let basePrice = 0;
              const compP = selectedPriceCompany ? productPrices.find(p => 
                (p.product_name || '').trim().toLowerCase() === cleanSelected && 
                p.company_id === selectedPriceCompany && 
                Number(p.portion_size) === Number(size)
              ) : null;
              if (compP && compP.price > 0) {
                basePrice = Number(compP.price);
              } else {
                const defP = productPrices.find(p => 
                  (p.product_name || '').trim().toLowerCase() === cleanSelected && 
                  !p.company_id && 
                  Number(p.portion_size) === Number(size)
                );
                if (defP && defP.price > 0) basePrice = Number(defP.price);
              }

              const surchargeVal = surcharges[key] !== undefined ? surcharges[key] : (surcharges[v] !== undefined ? surcharges[v] : undefined);
              if (surchargeVal !== undefined && surchargeVal !== null && !isNaN(Number(surchargeVal))) {
                initialFullPrices[key] = (Math.round((basePrice + Number(surchargeVal)) * 100) / 100).toFixed(2);
              } else if (basePrice > 0) {
                initialFullPrices[key] = basePrice.toFixed(2);
              }
            });
          });
          setVariantFullPrices(initialFullPrices);
        }
      } else {
        setVariantSurcharges({});
        setVariantFullPrices({});
      }
    }
  }, [dbProducts, selectedPriceProduct, selectedPriceCompany, productPrices]);

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

  const handleToggleDeliveryStatus = async (group: any, newStatus: 'delivered' | 'pending') => {
    if (!supabase) return;
    setUpdatingDeliveryStatus(group.id);
    const itemIds = (group.items || []).map((i: any) => i.id).filter(Boolean);
    const deliveredAt = newStatus === 'delivered' ? new Date().toISOString() : null;

    try {
      // 1. Update in ob_orders in Supabase
      if (itemIds.length > 0) {
        try {
          const { error: dbErr } = await supabase
            .from('ob_orders')
            .update({ 
              delivery_status: newStatus,
              delivered_at: deliveredAt
            })
            .in('id', itemIds);
          if (dbErr) {
            console.warn("Notice: ob_orders delivery_status update:", dbErr.message);
          }
        } catch (dbErr) {
          console.warn("Could not update ob_orders.delivery_status directly:", dbErr);
        }
      }

      // 2. Fallback in store_settings.page_content.delivered_orders for 100% resilience
      try {
        const { data: storeData } = await supabase.from('store_settings').select('page_content').eq('id', 1).maybeSingle();
        const currentContent = storeData?.page_content || {};
        const deliveredOrdersMap = { ...(currentContent.delivered_orders || {}) };
        if (newStatus === 'delivered') {
          deliveredOrdersMap[group.id] = { delivered_at: deliveredAt, status: 'delivered' };
        } else {
          delete deliveredOrdersMap[group.id];
        }
        await supabase.from('store_settings').update({
          page_content: {
            ...currentContent,
            delivered_orders: deliveredOrdersMap
          }
        }).eq('id', 1);

        if (localStoreSettings) {
          setLocalStoreSettings({
            ...localStoreSettings,
            page_content: {
              ...localStoreSettings.page_content,
              delivered_orders: deliveredOrdersMap
            }
          });
        }
      } catch (storeErr) {
        console.warn("Could not sync delivered status to store_settings fallback:", storeErr);
      }

      // 3. Update local state
      setOrders(prevOrders => prevOrders.map(o => {
        if (itemIds.includes(o.id)) {
          return {
            ...o,
            delivery_status: newStatus,
            delivered_at: deliveredAt
          };
        }
        return o;
      }));
    } catch (err: any) {
      console.error("Fout bij bijwerken leveringsstatus:", err);
      alert("Fout bij bijwerken status: " + err.message);
    } finally {
      setUpdatingDeliveryStatus(null);
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
      if (custData) {
        const compDeadlines = localStoreSettings?.page_content?.company_deadlines || {};
        const enriched = custData.map((c: any) => ({
          ...c,
          custom_deadlines: c.custom_deadlines || compDeadlines[c.id] || null
        }));
        setCustomers(enriched);
      }

      
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

  const handleSaveGlobalDeadlines = async (rules: ModificationRulesConfig) => {
    if (!localStoreSettings) return;
    const updatedPC = {
      ...localStoreSettings.page_content,
      modification_rules: rules,
      min_order_modify_hours: rules.tiers?.[0]?.deadlines?.cancel ?? localStoreSettings.page_content?.min_order_modify_hours ?? 2
    };

    const updatedSettings: StoreSettings = {
      ...localStoreSettings,
      page_content: updatedPC
    };

    setLocalStoreSettings(updatedSettings);

    if (supabase) {
      await supabase
        .from('store_settings')
        .update({ page_content: updatedPC })
        .eq('id', 1);
    }

    if (onStoreSettingsUpdated) {
      onStoreSettingsUpdated(updatedSettings);
    }
  };

  const handleSaveCompanyDeadlines = async (companyId: string, customDeadlines: CompanyCustomDeadlines) => {
    // 1. Update company in database if column exists
    if (supabase) {
      try {
        const { error: compError } = await supabase
          .from('ob_companies')
          .update({ custom_deadlines: customDeadlines })
          .eq('id', companyId);

        if (compError) {
          console.warn("Could not save to ob_companies.custom_deadlines (table column may need SQL migration):", compError);
        }
      } catch (err) {
        console.warn("Error updating custom_deadlines on ob_companies:", err);
      }
    }

    // 2. Also save to store_settings.page_content.company_deadlines as 100% resilient fallback
    if (localStoreSettings) {
      const existingCompDeadlines = localStoreSettings.page_content?.company_deadlines || {};
      const updatedPC = {
        ...localStoreSettings.page_content,
        company_deadlines: {
          ...existingCompDeadlines,
          [companyId]: customDeadlines
        }
      };
      const updatedSettings: StoreSettings = {
        ...localStoreSettings,
        page_content: updatedPC
      };
      setLocalStoreSettings(updatedSettings);

      if (supabase) {
        await supabase
          .from('store_settings')
          .update({ page_content: updatedPC })
          .eq('id', 1);
      }

      if (onStoreSettingsUpdated) {
        onStoreSettingsUpdated(updatedSettings);
      }
    }

    // 3. Update local customers state
    setCustomers(prev => prev.map(c => c.id === companyId ? { ...c, custom_deadlines: customDeadlines } : c));
    if (selectedCompanyForDeadlines && selectedCompanyForDeadlines.id === companyId) {
      setSelectedCompanyForDeadlines(prev => prev ? { ...prev, custom_deadlines: customDeadlines } : null);
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
      return Array.from(new Set([...valid, ...DEFAULT_SECTION_ORDER]));
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
      if (supabase && selectedPriceProduct) {
        const cleanProductName = selectedPriceProduct.trim();
        const selectedProdObj = dbProducts.find(p => (p.name || '').trim().toLowerCase() === cleanProductName.toLowerCase());
        const portionsToUse = selectedProdObj?.portions && selectedProdObj.portions.length > 0 ? selectedProdObj.portions : PORTIONS;

        // 1. Delete existing prices for this product and company deal to avoid duplicates
        const productNamesToDelete = [cleanProductName];
        if (selectedProdObj?.name && selectedProdObj.name !== cleanProductName) {
          productNamesToDelete.push(selectedProdObj.name);
        }

        let delQuery = supabase
          .from('ob_product_prices')
          .delete()
          .in('product_name', productNamesToDelete);
          
        if (selectedPriceCompany) {
          delQuery = delQuery.eq('company_id', selectedPriceCompany);
        } else {
          delQuery = delQuery.is('company_id', null);
        }
        await delQuery;

        // 2. Insert new prices for all portions that have a price > 0
        const rowsToInsert = portionsToUse
          .map((portion: number) => {
            const p = productPrices.find(
              x => (x.product_name || '').trim().toLowerCase() === cleanProductName.toLowerCase() &&
                   (x.company_id || null) === (selectedPriceCompany || null) &&
                   Number(x.portion_size) === Number(portion)
            );
            return p && Number(p.price) > 0 ? {
              company_id: selectedPriceCompany || null,
              product_name: cleanProductName,
              portion_size: portion,
              price: Number(p.price)
            } : null;
          })
          .filter(Boolean);

        if (rowsToInsert.length > 0) {
          const { error: insErr } = await supabase.from('ob_product_prices').insert(rowsToInsert);
          if (insErr) throw insErr;
        }

        // 3. Save variant surcharges to ob_products (omgerekend vanuit de ingevulde hele prijs per portie)
        if (selectedProdObj) {
          const cleanSurcharges: Record<string, number> = {};

          if (selectedProdObj.variants && selectedProdObj.variants.length > 0) {
            selectedProdObj.variants.forEach((v: string) => {
              portionsToUse.forEach((portion: number) => {
                const key = `${v}_${portion}`;

                // Base price that was saved for this portion
                const matchingRow = rowsToInsert.find((r: any) => Number(r.portion_size) === Number(portion));
                let savedBasePrice = matchingRow ? Number(matchingRow.price) : 0;
                if (!savedBasePrice) {
                  const defP = productPrices.find(p => 
                    (p.product_name || '').trim().toLowerCase() === cleanProductName.toLowerCase() && 
                    !p.company_id && 
                    Number(p.portion_size) === Number(portion)
                  );
                  if (defP && defP.price > 0) savedBasePrice = Number(defP.price);
                }

                const enteredVal = variantFullPrices[key];
                if (enteredVal !== undefined && enteredVal !== '' && !isNaN(Number(enteredVal))) {
                  const fullPriceNum = Number(enteredVal);
                  // Extra kosten (toeslag) is het verschil tussen de ingevulde hele prijs en de basisprijs
                  const surcharge = Math.round((fullPriceNum - savedBasePrice) * 100) / 100;
                  cleanSurcharges[key] = surcharge;
                } else if (variantSurcharges[key] !== undefined && !isNaN(Number(variantSurcharges[key]))) {
                  cleanSurcharges[key] = Number(variantSurcharges[key]);
                }
              });
            });
          }

          // Save by ID to ensure it updates the exact row regardless of whitespace in name
          const { error: updErr } = await supabase.from('ob_products')
            .update({ variant_surcharges: cleanSurcharges })
            .eq('id', selectedProdObj.id);

          if (updErr) {
            console.error('Error updating variant_surcharges by id:', updErr);
            // Fallback by name
            await supabase.from('ob_products')
              .update({ variant_surcharges: cleanSurcharges })
              .eq('name', selectedProdObj.name);
          }

          // Update local dbProducts state
          setDbProducts(prev => prev.map(p => (p.id === selectedProdObj.id || (p.name || '').trim().toLowerCase() === cleanProductName.toLowerCase()) ? { ...p, variant_surcharges: cleanSurcharges } : p));
          setVariantSurcharges(cleanSurcharges);
        }

        // 4. Refresh local productPrices from database
        const { data: refreshedPrices } = await supabase.from('ob_product_prices').select('*');
        if (refreshedPrices) {
          setProductPrices(refreshedPrices);
        }
        
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.error('Error saving prices:', e);
      alert('Er ging iets mis bij het opslaan van de prijzen.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleProductPriceChange = (portion: number, value: string) => {
    const numValue = parseFloat(value) || 0;
    const cleanCurrentProd = selectedPriceProduct.trim().toLowerCase();
    setProductPrices(prev => {
      const existsIndex = prev.findIndex(p => 
        (p.product_name || '').trim().toLowerCase() === cleanCurrentProd && 
        (p.company_id || null) === (selectedPriceCompany || null) && 
        Number(p.portion_size) === Number(portion)
      );
      if (existsIndex >= 0) {
        const next = [...prev];
        next[existsIndex] = { ...next[existsIndex], price: numValue };
        return next;
      } else {
        return [...prev, { 
          company_id: selectedPriceCompany, 
          product_name: selectedPriceProduct.trim(), 
          portion_size: portion, 
          price: numValue 
        }];
      }
    });
  };
  
  const getDisplayPrice = (portion: number) => {
    const cleanCurrentProd = selectedPriceProduct.trim().toLowerCase();
    const p = productPrices.find(p => 
      (p.product_name || '').trim().toLowerCase() === cleanCurrentProd && 
      (p.company_id || null) === (selectedPriceCompany || null) && 
      Number(p.portion_size) === Number(portion)
    );
    return p && p.price > 0 ? p.price : '';
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
                        onClick={() => { setActiveTab('store'); setImpersonating(null); setSelectedCompanyForDeadlines(null); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors shrink-0 md:shrink ${activeTab === 'store' && !impersonating && !selectedCompanyForDeadlines ? 'bg-[#5170ff] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                      >
                        <Store size={18} className={activeTab === 'store' && !impersonating && !selectedCompanyForDeadlines ? 'text-white' : 'text-[#5170ff]'} /> {!isSidebarCollapsed && <span>Winkel Status</span>}
                      </button>
                      <button 
                        onClick={() => { setActiveTab('deadlines'); setImpersonating(null); setSelectedCompanyForDeadlines(null); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors shrink-0 md:shrink ${activeTab === 'deadlines' && !impersonating && !selectedCompanyForDeadlines ? 'bg-[#5170ff] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                      >
                        <Clock size={18} className={activeTab === 'deadlines' && !impersonating && !selectedCompanyForDeadlines ? 'text-white' : 'text-[#5170ff]'} /> {!isSidebarCollapsed && <span>Wijzigingstermijnen</span>}
                      </button>
                      <button 
                        onClick={() => { setActiveTab('content'); setImpersonating(null); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors shrink-0 md:shrink ${activeTab === 'content' && !impersonating ? 'bg-[#5170ff] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                      >
                        <Type size={18} className={activeTab === 'content' && !impersonating ? 'text-white' : 'text-[#5170ff]'} /> {!isSidebarCollapsed && <span>Website Teksten</span>}
                      </button>
                      <button 
                        onClick={() => { setActiveTab('registrations'); setImpersonating(null); }}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors shrink-0 md:shrink ${activeTab === 'registrations' && !impersonating ? 'bg-[#5170ff] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                      >
                        <div className="flex items-center gap-3">
                          <Building2 size={18} className={activeTab === 'registrations' && !impersonating ? 'text-white' : 'text-[#5170ff]'} /> {!isSidebarCollapsed && <span>Aanmeldingen</span>}
                        </div>
                        {registrations.length > 0 && (
                          <span className="bg-red-500 text-white text-xs py-0.5 px-2 rounded-full font-bold">{registrations.length}</span>
                        )}
                      </button>
                      <button 
                        onClick={() => { setActiveTab('customers'); setImpersonating(null); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors shrink-0 md:shrink ${activeTab === 'customers' || impersonating ? 'bg-[#5170ff] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                      >
                        <Users size={18} className={activeTab === 'customers' || impersonating ? 'text-white' : 'text-[#5170ff]'} /> {!isSidebarCollapsed && <span>Klanten (Kantoren)</span>}
                      </button>
                      <button onClick={() => { setActiveTab('orders'); setImpersonating(null); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors shrink-0 md:shrink ${activeTab === 'orders' && !impersonating ? 'bg-[#5170ff] text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                        <ShoppingBag size={18} className={activeTab === 'orders' && !impersonating ? 'text-white' : 'text-[#5170ff]'} />
                        <span>{!isSidebarCollapsed && <span>Bestellingen</span>}</span>
                      </button>
                      <button 
                        onClick={() => { setActiveTab('prices'); setImpersonating(null); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors shrink-0 md:shrink ${activeTab === 'prices' && !impersonating ? 'bg-[#5170ff] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                      >
                        <DollarSign size={18} className={activeTab === 'prices' && !impersonating ? 'text-white' : 'text-[#5170ff]'} /> {!isSidebarCollapsed && <span>Portie Prijzen</span>}
                      </button>
                      <button 
                        onClick={() => { setActiveTab('menu'); setImpersonating(null); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors shrink-0 md:shrink ${activeTab === 'menu' && !impersonating ? 'bg-[#5170ff] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                      >
                        <svg className={activeTab === 'menu' && !impersonating ? 'text-white' : 'text-[#5170ff]'} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m8 17 4 4 4-4"/></svg>
                        <span>{!isSidebarCollapsed && <span>Menu & Producten</span>}</span>
                      </button>
                      <button
                        onClick={() => { setActiveTab('delivery'); setImpersonating(null); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors shrink-0 md:shrink ${activeTab === 'delivery' && !impersonating ? 'bg-[#5170ff] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                      >
                        <Truck size={18} className={activeTab === 'delivery' && !impersonating ? 'text-white' : 'text-[#5170ff]'} />
                        <span>{!isSidebarCollapsed && <span>Bezorgopties</span>}</span>
                      </button>
                      <button
                        onClick={() => { setActiveTab('discounts'); setImpersonating(null); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors shrink-0 md:shrink ${activeTab === 'discounts' && !impersonating ? 'bg-[#5170ff] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                      >
                        <Tag size={18} className={activeTab === 'discounts' && !impersonating ? 'text-white' : 'text-[#5170ff]'} />
                        <span>{!isSidebarCollapsed && <span>Kortingscodes</span>}</span>
                      </button>
                      <button
                        onClick={() => { setActiveTab('translations'); setImpersonating(null); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors shrink-0 md:shrink ${activeTab === 'translations' && !impersonating ? 'bg-[#5170ff] text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                      >
                        <Languages size={18} className={activeTab === 'translations' && !impersonating ? 'text-white' : 'text-[#5170ff]'} />
                        <span>{!isSidebarCollapsed && <span>Vertalingen (EN)</span>}</span>
                      </button>
                    </nav>
                  </div>

                  {/* Main Content Area */}
                  <div className="flex-1 overflow-y-auto bg-white p-6 md:p-8">
                    
                    {selectedCompanyForDeadlines ? (
                      <div className="space-y-6">
                        <button 
                          onClick={() => setSelectedCompanyForDeadlines(null)} 
                          className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#151f33] transition-colors mb-2 cursor-pointer"
                        >
                          <ArrowLeft size={16} /> Terug naar klantenoverzicht
                        </button>
                        <DeadlinesManager
                          company={selectedCompanyForDeadlines}
                          globalRules={localStoreSettings?.page_content?.modification_rules}
                          onSaveCompanyRules={handleSaveCompanyDeadlines}
                          onCloseCompanyModal={() => setSelectedCompanyForDeadlines(null)}
                        />
                      </div>
                    ) : impersonating ? (
                      <div className="space-y-6">
                        <button onClick={() => setImpersonating(null)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#151f33] transition-colors mb-4">
                          <ArrowLeft size={16} /> Terug naar klantenlijst
                        </button>
                        
                        <div className="bg-[#f0f4f8] border border-[#d1e0ec] rounded-xl p-8 text-center space-y-4">
                          <div className="w-16 h-16 bg-[#5170ff] text-white rounded-full flex items-center justify-center mx-auto mb-4">
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
                              className="inline-flex items-center gap-2 px-6 py-3 bg-[#5170ff] text-white rounded-lg font-semibold hover:bg-[#4060ee] transition-colors shadow-sm"
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
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${contentEditLang === 'en' ? 'bg-[#5170ff] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
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
                                    key={`section-item-${sectionKey}-${index}`}
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
                          
                          {/* HEADER & NAVIGATIE */}
                          <div className="bg-white p-6 rounded-xl border shadow-sm mb-6 space-y-4">
                            <h4 className="font-bold text-ob-blue mb-4 border-b pb-2">Header & Navigatieknoppen</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                  <span>Knop 'BESTEL NU' (Header)</span>
                                  <span className="text-[10px] text-gray-400 font-normal">Lettertype & Schaal</span>
                                </label>
                                <div className="flex flex-wrap sm:flex-nowrap gap-2">
                                  <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm font-medium"
                                    placeholder={getContentPlaceholder('nav_btn_order', 'BESTEL NU')}
                                    value={getContentValue('nav_btn_order')}
                                    onChange={e => setContentValue('nav_btn_order', e.target.value)} />
                                  {renderFontSelect('nav_btn_order')}
                                  <input type="text" placeholder="%" className="w-20 px-3 py-2 border rounded-md text-sm"
                                    value={localStoreSettings.page_content?.nav_btn_order_size || ''}
                                    onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, nav_btn_order_size: e.target.value}} as any)} />
                                </div>
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                  <span>Knop 'Inloggen' (Header)</span>
                                  <span className="text-[10px] text-gray-400 font-normal">Lettertype & Schaal</span>
                                </label>
                                <div className="flex flex-wrap sm:flex-nowrap gap-2">
                                  <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm font-medium"
                                    placeholder={getContentPlaceholder('nav_btn_login', 'Inloggen')}
                                    value={getContentValue('nav_btn_login')}
                                    onChange={e => setContentValue('nav_btn_login', e.target.value)} />
                                  {renderFontSelect('nav_btn_login')}
                                  <input type="text" placeholder="%" className="w-20 px-3 py-2 border rounded-md text-sm"
                                    value={localStoreSettings.page_content?.nav_btn_login_size || ''}
                                    onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, nav_btn_login_size: e.target.value}} as any)} />
                                </div>
                              </div>

                              <div className="md:col-span-2 border-t pt-3">
                                <label className="block text-xs font-semibold text-gray-700 mb-2 flex justify-between">
                                  <span>Navigatiemenu Links (Standaardstijl voor alle menu links)</span>
                                  <span className="text-[10px] text-gray-400 font-normal">Standaard Lettertype & Schaal</span>
                                </label>
                                <div className="flex flex-wrap sm:flex-nowrap gap-2 mb-4">
                                  <div className="flex-1 px-3 py-2 bg-gray-50 border rounded-md text-xs text-gray-500 flex items-center">
                                    Overkoepelende stijl voor alle links in de header
                                  </div>
                                  {renderFontSelect('nav_links')}
                                  <input type="text" placeholder="%" className="w-20 px-3 py-2 border rounded-md text-sm"
                                    value={localStoreSettings.page_content?.nav_links_size || ''}
                                    onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, nav_links_size: e.target.value}} as any)} />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-gray-50/70 p-3 rounded-lg border">
                                  <div>
                                    <label className="block text-[11px] font-medium text-gray-600 mb-1 flex justify-between">
                                      <span>Link 1 Tekst</span>
                                      <span className="text-[10px] text-gray-400">Lettertype & Schaal</span>
                                    </label>
                                    <div className="flex gap-2">
                                      <input type="text" className="flex-1 px-3 py-1.5 border rounded-md text-xs bg-white"
                                        placeholder={getContentPlaceholder('nav_link_how', 'Hoe het werkt')}
                                        value={getContentValue('nav_link_how')}
                                        onChange={e => setContentValue('nav_link_how', e.target.value)} />
                                      {renderFontSelect('nav_link_how')}
                                      <input type="text" placeholder="%" className="w-16 px-2 py-1.5 border rounded-md text-xs bg-white"
                                        value={localStoreSettings.page_content?.nav_link_how_size || ''}
                                        onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, nav_link_how_size: e.target.value}} as any)} />
                                    </div>
                                  </div>

                                  <div>
                                    <label className="block text-[11px] font-medium text-gray-600 mb-1 flex justify-between">
                                      <span>Link 2 Tekst</span>
                                      <span className="text-[10px] text-gray-400">Lettertype & Schaal</span>
                                    </label>
                                    <div className="flex gap-2">
                                      <input type="text" className="flex-1 px-3 py-1.5 border rounded-md text-xs bg-white"
                                        placeholder={getContentPlaceholder('nav_link_menu', 'Assortiment')}
                                        value={getContentValue('nav_link_menu')}
                                        onChange={e => setContentValue('nav_link_menu', e.target.value)} />
                                      {renderFontSelect('nav_link_menu')}
                                      <input type="text" placeholder="%" className="w-16 px-2 py-1.5 border rounded-md text-xs bg-white"
                                        value={localStoreSettings.page_content?.nav_link_menu_size || ''}
                                        onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, nav_link_menu_size: e.target.value}} as any)} />
                                    </div>
                                  </div>

                                  <div>
                                    <label className="block text-[11px] font-medium text-gray-600 mb-1 flex justify-between">
                                      <span>Link 3 Tekst</span>
                                      <span className="text-[10px] text-gray-400">Lettertype & Schaal</span>
                                    </label>
                                    <div className="flex gap-2">
                                      <input type="text" className="flex-1 px-3 py-1.5 border rounded-md text-xs bg-white"
                                        placeholder={getContentPlaceholder('nav_link_business', 'Voor Bedrijven')}
                                        value={getContentValue('nav_link_business')}
                                        onChange={e => setContentValue('nav_link_business', e.target.value)} />
                                      {renderFontSelect('nav_link_business')}
                                      <input type="text" placeholder="%" className="w-16 px-2 py-1.5 border rounded-md text-xs bg-white"
                                        value={localStoreSettings.page_content?.nav_link_business_size || ''}
                                        onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, nav_link_business_size: e.target.value}} as any)} />
                                    </div>
                                  </div>

                                  <div>
                                    <label className="block text-[11px] font-medium text-gray-600 mb-1 flex justify-between">
                                      <span>Link 4 Tekst</span>
                                      <span className="text-[10px] text-gray-400">Lettertype & Schaal</span>
                                    </label>
                                    <div className="flex gap-2">
                                      <input type="text" className="flex-1 px-3 py-1.5 border rounded-md text-xs bg-white"
                                        placeholder={getContentPlaceholder('nav_link_contact', 'Contact')}
                                        value={getContentValue('nav_link_contact')}
                                        onChange={e => setContentValue('nav_link_contact', e.target.value)} />
                                      {renderFontSelect('nav_link_contact')}
                                      <input type="text" placeholder="%" className="w-16 px-2 py-1.5 border rounded-md text-xs bg-white"
                                        value={localStoreSettings.page_content?.nav_link_contact_size || ''}
                                        onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, nav_link_contact_size: e.target.value}} as any)} />
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* HERO */}
                          <div className="bg-white p-6 rounded-xl border shadow-sm mb-6 space-y-4">
                            <h4 className="font-bold text-ob-blue mb-4 border-b pb-2">Sectie 1: Hoofdscherm (Hero)</h4>
                            <div className="grid grid-cols-1 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                  <span>Pre-titel (kleine tekst bovenaan)</span>
                                  <span className="text-[10px] text-gray-400 font-normal">Lettertype & Schaal</span>
                                </label>
                                <div className="flex flex-wrap sm:flex-nowrap gap-2">
                                  <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                    placeholder={getContentPlaceholder('hero_pre_title', 'Exclusief in Amsterdam')}
                                    value={getContentValue('hero_pre_title')}
                                    onChange={e => setContentValue('hero_pre_title', e.target.value)} />
                                  {renderFontSelect('hero_pre_title')}
                                  <input type="text" className="w-20 h-fit px-3 py-2 border rounded-md text-sm" placeholder="%"
                                    value={localStoreSettings.page_content?.hero_pre_title_size || ''}
                                    onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, hero_pre_title_size: e.target.value}} as any)} />
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                  <span>Hoofdtitel</span>
                                  <span className="text-[10px] text-gray-400 font-normal">Lettertype & Schaal</span>
                                </label>
                                <div className="flex flex-wrap sm:flex-nowrap gap-2">
                                  <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                    placeholder={getContentPlaceholder('hero_title', 'De Zakelijke Borrelservice van Mokum')}
                                    value={getContentValue('hero_title')}
                                    onChange={e => setContentValue('hero_title', e.target.value)} />
                                  {renderFontSelect('hero_title')}
                                  <input type="text" className="w-20 h-fit px-3 py-2 border rounded-md text-sm" placeholder="%"
                                    value={localStoreSettings.page_content?.hero_title_size || ''}
                                    onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, hero_title_size: e.target.value}} as any)} />
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                  <span>Ondertitel</span>
                                  <span className="text-[10px] text-gray-400 font-normal">Lettertype & Schaal</span>
                                </label>
                                <div className="flex flex-wrap sm:flex-nowrap gap-2">
                                  <textarea rows={2} className="flex-1 px-3 py-2 border rounded-md text-sm"
                                    placeholder={getContentPlaceholder('hero_subtitle', 'Onze butlers leveren de lekkerste snacks voor jouw kantoorborrel.')}
                                    value={getContentValue('hero_subtitle')}
                                    onChange={e => setContentValue('hero_subtitle', e.target.value)} />
                                  {renderFontSelect('hero_subtitle')}
                                  <input type="text" className="w-20 h-fit px-3 py-2 border rounded-md text-sm" placeholder="%"
                                    value={localStoreSettings.page_content?.hero_subtitle_size || ''}
                                    onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, hero_subtitle_size: e.target.value}} as any)} />
                                </div>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                    <span>Knop Bestel Nu</span>
                                    <span className="text-[10px] text-gray-400 font-normal">Lettertype & Schaal</span>
                                  </label>
                                  <div className="flex flex-wrap sm:flex-nowrap gap-2">
                                    <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                      placeholder={getContentPlaceholder('hero_btn_order', 'Direct Bestellen')}
                                      value={getContentValue('hero_btn_order')}
                                      onChange={e => setContentValue('hero_btn_order', e.target.value)} />
                                    {renderFontSelect('hero_btn_order')}
                                    <input type="text" className="w-20 px-3 py-2 border rounded-md text-sm" placeholder="%"
                                      value={localStoreSettings.page_content?.hero_btn_order_size || ''}
                                      onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, hero_btn_order_size: e.target.value}} as any)} />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                    <span>Knop Bekijk Aanbod</span>
                                    <span className="text-[10px] text-gray-400 font-normal">Lettertype & Schaal</span>
                                  </label>
                                  <div className="flex flex-wrap sm:flex-nowrap gap-2">
                                    <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                      placeholder={getContentPlaceholder('hero_btn_offer', 'Offerte Aanvragen')}
                                      value={getContentValue('hero_btn_offer')}
                                      onChange={e => setContentValue('hero_btn_offer', e.target.value)} />
                                    {renderFontSelect('hero_btn_offer')}
                                    <input type="text" className="w-20 px-3 py-2 border rounded-md text-sm" placeholder="%"
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
                                  <span className="text-[10px] text-gray-400 font-normal">Lettertype & Schaal</span>
                                </label>
                                <div className="flex flex-wrap sm:flex-nowrap gap-2">
                                  <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                    placeholder={getContentPlaceholder('how_title', 'Hoe werkt de Office Butler?')}
                                    value={getContentValue('how_title')}
                                    onChange={e => setContentValue('how_title', e.target.value)} />
                                  {renderFontSelect('how_title')}
                                  <input type="text" className="w-20 h-fit px-3 py-2 border rounded-md text-sm" placeholder="%"
                                    value={localStoreSettings.page_content?.how_title_size || ''}
                                    onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, how_title_size: e.target.value}} as any)} />
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                  <span>Ondertitel</span>
                                  <span className="text-[10px] text-gray-400 font-normal">Lettertype & Schaal</span>
                                </label>
                                <div className="flex flex-wrap sm:flex-nowrap gap-2">
                                  <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                    placeholder={getContentPlaceholder('how_subtitle', 'In 3 simpele stappen jouw kantoorborrel geregeld.')}
                                    value={getContentValue('how_subtitle')}
                                    onChange={e => setContentValue('how_subtitle', e.target.value)} />
                                  {renderFontSelect('how_subtitle')}
                                  <input type="text" className="w-20 h-fit px-3 py-2 border rounded-md text-sm" placeholder="%"
                                    value={localStoreSettings.page_content?.how_subtitle_size || ''}
                                    onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, how_subtitle_size: e.target.value}} as any)} />
                                </div>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <label className="block text-xs font-medium text-gray-700">Stap 1: Titel</label>
                                  {renderFontSelect('how_step1_title')}
                                </div>
                                <input type="text" className="w-full px-3 py-2 border rounded-md text-sm mb-2"
                                  placeholder={getContentPlaceholder('how_step1_title', 'Selecteer gewenste snacks')}
                                  value={getContentValue('how_step1_title')}
                                  onChange={e => setContentValue('how_step1_title', e.target.value)} />
                                <div className="flex items-center justify-between mb-1">
                                  <label className="block text-xs font-medium text-gray-700">Stap 1: Beschrijving</label>
                                  {renderFontSelect('how_step1_desc')}
                                </div>
                                <textarea rows={2} className="w-full px-3 py-2 border rounded-md text-sm"
                                  placeholder={getContentPlaceholder('how_step1_desc', 'Stel de ideale bittergarnituur samen voor het team.')}
                                  value={getContentValue('how_step1_desc')}
                                  onChange={e => setContentValue('how_step1_desc', e.target.value)} />
                              </div>
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <label className="block text-xs font-medium text-gray-700">Stap 2: Titel</label>
                                  {renderFontSelect('how_step2_title')}
                                </div>
                                <input type="text" className="w-full px-3 py-2 border rounded-md text-sm mb-2"
                                  placeholder={getContentPlaceholder('how_step2_title', 'Perfecte bezorgmoment')}
                                  value={getContentValue('how_step2_title')}
                                  onChange={e => setContentValue('how_step2_title', e.target.value)} />
                                <div className="flex items-center justify-between mb-1">
                                  <label className="block text-xs font-medium text-gray-700">Stap 2: Beschrijving</label>
                                  {renderFontSelect('how_step2_desc')}
                                </div>
                                <textarea rows={2} className="w-full px-3 py-2 border rounded-md text-sm"
                                  placeholder={getContentPlaceholder('how_step2_desc', 'Bestel voor directe levering of plan vooruit.')}
                                  value={getContentValue('how_step2_desc')}
                                  onChange={e => setContentValue('how_step2_desc', e.target.value)} />
                              </div>
                              <div>
                                <div className="flex items-center justify-between mb-1">
                                  <label className="block text-xs font-medium text-gray-700">Stap 3: Titel</label>
                                  {renderFontSelect('how_step3_title')}
                                </div>
                                <input type="text" className="w-full px-3 py-2 border rounded-md text-sm mb-2"
                                  placeholder={getContentPlaceholder('how_step3_title', 'Uitpakken en uitserveren')}
                                  value={getContentValue('how_step3_title')}
                                  onChange={e => setContentValue('how_step3_title', e.target.value)} />
                                <div className="flex items-center justify-between mb-1">
                                  <label className="block text-xs font-medium text-gray-700">Stap 3: Beschrijving</label>
                                  {renderFontSelect('how_step3_desc')}
                                </div>
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
                                  <span className="text-[10px] text-gray-400 font-normal">Lettertype & Schaal</span>
                                </label>
                                <div className="flex flex-wrap sm:flex-nowrap gap-2">
                                  <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                    placeholder={getContentPlaceholder('assortments_title', 'Onze Butler Service')}
                                    value={getContentValue('assortments_title')}
                                    onChange={e => setContentValue('assortments_title', e.target.value)} />
                                  {renderFontSelect('assortments_title')}
                                  <input type="text" className="w-20 h-fit px-3 py-2 border rounded-md text-sm" placeholder="%"
                                    value={localStoreSettings.page_content?.assortments_title_size || ''}
                                    onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, assortments_title_size: e.target.value}} as any)} />
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                  <span>Sectie Ondertitel</span>
                                  <span className="text-[10px] text-gray-400 font-normal">Lettertype & Schaal</span>
                                </label>
                                <div className="flex flex-wrap sm:flex-nowrap gap-2">
                                  <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                    placeholder={getContentPlaceholder('assortments_subtitle', 'Kies de service die het beste bij de kantoorborrel past.')}
                                    value={getContentValue('assortments_subtitle')}
                                    onChange={e => setContentValue('assortments_subtitle', e.target.value)} />
                                  {renderFontSelect('assortments_subtitle')}
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
                                    <span className="text-[10px] text-gray-400 font-normal">Lettertype & Schaal</span>
                                  </label>
                                  <div className="flex flex-wrap sm:flex-nowrap gap-2">
                                    <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                      placeholder={getContentPlaceholder('assort_snacks_title', 'Titel Pakket 1')}
                                      value={getContentValue('assort_snacks_title')}
                                      onChange={e => setContentValue('assort_snacks_title', e.target.value)} />
                                    {renderFontSelect('assort_snacks_title')}
                                    <input type="text" placeholder="%" className="w-20 px-3 py-2 border rounded-md text-sm"
                                      value={localStoreSettings.page_content?.assort_snacks_title_size || ''}
                                      onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, assort_snacks_title_size: e.target.value}} as any)} />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                    <span>Ondertitel</span>
                                    <span className="text-[10px] text-gray-400 font-normal">Lettertype & Schaal</span>
                                  </label>
                                  <div className="flex flex-wrap sm:flex-nowrap gap-2">
                                    <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                      placeholder={getContentPlaceholder('assort_snacks_subtitle', 'Ondertitel Pakket 1')}
                                      value={getContentValue('assort_snacks_subtitle')}
                                      onChange={e => setContentValue('assort_snacks_subtitle', e.target.value)} />
                                    {renderFontSelect('assort_snacks_subtitle')}
                                    <input type="text" placeholder="%" className="w-20 px-3 py-2 border rounded-md text-sm"
                                      value={localStoreSettings.page_content?.assort_snacks_subtitle_size || ''}
                                      onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, assort_snacks_subtitle_size: e.target.value}} as any)} />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                    <span>Bullet 1</span>
                                    <span className="text-[10px] text-gray-400 font-normal">Lettertype & Schaal</span>
                                  </label>
                                  <div className="flex flex-wrap sm:flex-nowrap gap-2">
                                    <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                      placeholder={getContentPlaceholder('assort_snacks_item1', 'Bullet 1')}
                                      value={getContentValue('assort_snacks_item1')}
                                      onChange={e => setContentValue('assort_snacks_item1', e.target.value)} />
                                    {renderFontSelect('assort_snacks_item1')}
                                    <input type="text" placeholder="%" className="w-20 px-3 py-2 border rounded-md text-sm"
                                      value={localStoreSettings.page_content?.assort_snacks_item1_size || ''}
                                      onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, assort_snacks_item1_size: e.target.value}} as any)} />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                    <span>Bullet 2</span>
                                    <span className="text-[10px] text-gray-400 font-normal">Lettertype & Schaal</span>
                                  </label>
                                  <div className="flex flex-wrap sm:flex-nowrap gap-2">
                                    <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                      placeholder={getContentPlaceholder('assort_snacks_item2', 'Bullet 2')}
                                      value={getContentValue('assort_snacks_item2')}
                                      onChange={e => setContentValue('assort_snacks_item2', e.target.value)} />
                                    {renderFontSelect('assort_snacks_item2')}
                                    <input type="text" placeholder="%" className="w-20 px-3 py-2 border rounded-md text-sm"
                                      value={localStoreSettings.page_content?.assort_snacks_item2_size || ''}
                                      onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, assort_snacks_item2_size: e.target.value}} as any)} />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                    <span>Bullet 3</span>
                                    <span className="text-[10px] text-gray-400 font-normal">Lettertype & Schaal</span>
                                  </label>
                                  <div className="flex flex-wrap sm:flex-nowrap gap-2">
                                    <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                      placeholder={getContentPlaceholder('assort_snacks_item3', 'Bullet 3')}
                                      value={getContentValue('assort_snacks_item3')}
                                      onChange={e => setContentValue('assort_snacks_item3', e.target.value)} />
                                    {renderFontSelect('assort_snacks_item3')}
                                    <input type="text" placeholder="%" className="w-20 px-3 py-2 border rounded-md text-sm"
                                      value={localStoreSettings.page_content?.assort_snacks_item3_size || ''}
                                      onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, assort_snacks_item3_size: e.target.value}} as any)} />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                    <span>Bullet 4</span>
                                    <span className="text-[10px] text-gray-400 font-normal">Lettertype & Schaal</span>
                                  </label>
                                  <div className="flex flex-wrap sm:flex-nowrap gap-2">
                                    <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                      placeholder={getContentPlaceholder('assort_snacks_item4', 'Bullet 4')}
                                      value={getContentValue('assort_snacks_item4')}
                                      onChange={e => setContentValue('assort_snacks_item4', e.target.value)} />
                                    {renderFontSelect('assort_snacks_item4')}
                                    <input type="text" placeholder="%" className="w-20 px-3 py-2 border rounded-md text-sm"
                                      value={localStoreSettings.page_content?.assort_snacks_item4_size || ''}
                                      onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, assort_snacks_item4_size: e.target.value}} as any)} />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                    <span>Knop Tekst</span>
                                    <span className="text-[10px] text-gray-400 font-normal">Lettertype & Schaal</span>
                                  </label>
                                  <div className="flex flex-wrap sm:flex-nowrap gap-2">
                                    <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm font-medium"
                                      placeholder={getContentPlaceholder('assort_snacks_btn', 'Knop Tekst')}
                                      value={getContentValue('assort_snacks_btn')}
                                      onChange={e => setContentValue('assort_snacks_btn', e.target.value)} />
                                    {renderFontSelect('assort_snacks_btn')}
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
                                    <span className="text-[10px] text-gray-400 font-normal">Lettertype & Schaal</span>
                                  </label>
                                  <div className="flex flex-wrap sm:flex-nowrap gap-2">
                                    <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                      placeholder={getContentPlaceholder('assort_complete_badge', 'bijv. Meest Gekozen')}
                                      value={getContentValue('assort_complete_badge')}
                                      onChange={e => setContentValue('assort_complete_badge', e.target.value)} />
                                    {renderFontSelect('assort_complete_badge')}
                                    <input type="text" placeholder="%" className="w-20 px-3 py-2 border rounded-md text-sm"
                                      value={localStoreSettings.page_content?.assort_complete_badge_size || ''}
                                      onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, assort_complete_badge_size: e.target.value}} as any)} />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                    <span>Titel (bijv. Uitpakken & uitserveren)</span>
                                    <span className="text-[10px] text-gray-400 font-normal">Lettertype & Schaal</span>
                                  </label>
                                  <div className="flex flex-wrap sm:flex-nowrap gap-2">
                                    <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                      placeholder={getContentPlaceholder('assort_complete_title', 'Titel Pakket 2')}
                                      value={getContentValue('assort_complete_title')}
                                      onChange={e => setContentValue('assort_complete_title', e.target.value)} />
                                    {renderFontSelect('assort_complete_title')}
                                    <input type="text" placeholder="%" className="w-20 px-3 py-2 border rounded-md text-sm"
                                      value={localStoreSettings.page_content?.assort_complete_title_size || ''}
                                      onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, assort_complete_title_size: e.target.value}} as any)} />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                    <span>Ondertitel</span>
                                    <span className="text-[10px] text-gray-400 font-normal">Lettertype & Schaal</span>
                                  </label>
                                  <div className="flex flex-wrap sm:flex-nowrap gap-2">
                                    <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                      placeholder={getContentPlaceholder('assort_complete_subtitle', 'Ondertitel Pakket 2')}
                                      value={getContentValue('assort_complete_subtitle')}
                                      onChange={e => setContentValue('assort_complete_subtitle', e.target.value)} />
                                    {renderFontSelect('assort_complete_subtitle')}
                                    <input type="text" placeholder="%" className="w-20 px-3 py-2 border rounded-md text-sm"
                                      value={localStoreSettings.page_content?.assort_complete_subtitle_size || ''}
                                      onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, assort_complete_subtitle_size: e.target.value}} as any)} />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                    <span>Bullet 1</span>
                                    <span className="text-[10px] text-gray-400 font-normal">Lettertype & Schaal</span>
                                  </label>
                                  <div className="flex flex-wrap sm:flex-nowrap gap-2">
                                    <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                      placeholder={getContentPlaceholder('assort_complete_item1', 'Bullet 1')}
                                      value={getContentValue('assort_complete_item1')}
                                      onChange={e => setContentValue('assort_complete_item1', e.target.value)} />
                                    {renderFontSelect('assort_complete_item1')}
                                    <input type="text" placeholder="%" className="w-20 px-3 py-2 border rounded-md text-sm"
                                      value={localStoreSettings.page_content?.assort_complete_item1_size || ''}
                                      onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, assort_complete_item1_size: e.target.value}} as any)} />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                    <span>Bullet 2</span>
                                    <span className="text-[10px] text-gray-400 font-normal">Lettertype & Schaal</span>
                                  </label>
                                  <div className="flex flex-wrap sm:flex-nowrap gap-2">
                                    <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                      placeholder={getContentPlaceholder('assort_complete_item2', 'Bullet 2')}
                                      value={getContentValue('assort_complete_item2')}
                                      onChange={e => setContentValue('assort_complete_item2', e.target.value)} />
                                    {renderFontSelect('assort_complete_item2')}
                                    <input type="text" placeholder="%" className="w-20 px-3 py-2 border rounded-md text-sm"
                                      value={localStoreSettings.page_content?.assort_complete_item2_size || ''}
                                      onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, assort_complete_item2_size: e.target.value}} as any)} />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                    <span>Bullet 3</span>
                                    <span className="text-[10px] text-gray-400 font-normal">Lettertype & Schaal</span>
                                  </label>
                                  <div className="flex flex-wrap sm:flex-nowrap gap-2">
                                    <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                      placeholder={getContentPlaceholder('assort_complete_item3', 'Bullet 3')}
                                      value={getContentValue('assort_complete_item3')}
                                      onChange={e => setContentValue('assort_complete_item3', e.target.value)} />
                                    {renderFontSelect('assort_complete_item3')}
                                    <input type="text" placeholder="%" className="w-20 px-3 py-2 border rounded-md text-sm"
                                      value={localStoreSettings.page_content?.assort_complete_item3_size || ''}
                                      onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, assort_complete_item3_size: e.target.value}} as any)} />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                    <span>Bullet 4</span>
                                    <span className="text-[10px] text-gray-400 font-normal">Lettertype & Schaal</span>
                                  </label>
                                  <div className="flex flex-wrap sm:flex-nowrap gap-2">
                                    <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                      placeholder={getContentPlaceholder('assort_complete_item4', 'Bullet 4')}
                                      value={getContentValue('assort_complete_item4')}
                                      onChange={e => setContentValue('assort_complete_item4', e.target.value)} />
                                    {renderFontSelect('assort_complete_item4')}
                                    <input type="text" placeholder="%" className="w-20 px-3 py-2 border rounded-md text-sm"
                                      value={localStoreSettings.page_content?.assort_complete_item4_size || ''}
                                      onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, assort_complete_item4_size: e.target.value}} as any)} />
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                    <span>Knop Tekst</span>
                                    <span className="text-[10px] text-gray-400 font-normal">Lettertype & Schaal</span>
                                  </label>
                                  <div className="flex flex-wrap sm:flex-nowrap gap-2">
                                    <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm font-medium"
                                      placeholder={getContentPlaceholder('assort_complete_btn', 'Knop Tekst')}
                                      value={getContentValue('assort_complete_btn')}
                                      onChange={e => setContentValue('assort_complete_btn', e.target.value)} />
                                    {renderFontSelect('assort_complete_btn')}
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
                                  <span className="text-[10px] text-gray-400 font-normal">Lettertype & Schaal</span>
                                </label>
                                <div className="flex flex-wrap sm:flex-nowrap gap-2">
                                  <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                    placeholder={getContentPlaceholder('menu_title', 'Onze Selectie')}
                                    value={getContentValue('menu_title')}
                                    onChange={e => setContentValue('menu_title', e.target.value)} />
                                  {renderFontSelect('menu_title')}
                                  <input type="text" className="w-20 h-fit px-3 py-2 border rounded-md text-sm" placeholder="%"
                                    value={localStoreSettings.page_content?.menu_title_size || ''}
                                    onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, menu_title_size: e.target.value}} as any)} />
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                  <span>Knop (Volledig menu)</span>
                                  <span className="text-[10px] text-gray-400 font-normal">Lettertype & Schaal</span>
                                </label>
                                <div className="flex flex-wrap sm:flex-nowrap gap-2">
                                  <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                    placeholder={getContentPlaceholder('menu_btn', 'Bekijk volledig menu')}
                                    value={getContentValue('menu_btn')}
                                    onChange={e => setContentValue('menu_btn', e.target.value)} />
                                  {renderFontSelect('menu_btn')}
                                  <input type="text" className="w-20 h-fit px-3 py-2 border rounded-md text-sm" placeholder="%"
                                    value={localStoreSettings.page_content?.menu_btn_size || ''}
                                    onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, menu_btn_size: e.target.value}} as any)} />
                                </div>
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                  <span>Ondertitel</span>
                                  <span className="text-[10px] text-gray-400 font-normal">Lettertype & Schaal</span>
                                </label>
                                <div className="flex flex-wrap sm:flex-nowrap gap-2">
                                  <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                    placeholder={getContentPlaceholder('menu_subtitle', 'Hoogwaardige snacks, vers bereid in de Mokum Local Kitchen.')}
                                    value={getContentValue('menu_subtitle')}
                                    onChange={e => setContentValue('menu_subtitle', e.target.value)} />
                                  {renderFontSelect('menu_subtitle')}
                                  <input type="text" className="w-20 h-fit px-3 py-2 border rounded-md text-sm" placeholder="%"
                                    value={localStoreSettings.page_content?.menu_subtitle_size || ''}
                                    onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, menu_subtitle_size: e.target.value}} as any)} />
                                </div>
                              </div>

                              <div className="border-t pt-3">
                                <label className="block text-xs font-semibold text-gray-700 mb-1 flex justify-between">
                                  <span>Categorie Titels (bijv. Bittergarnituur, Platters, Sauzen)</span>
                                  <span className="text-[10px] text-gray-400 font-normal">Lettertype & Schaal</span>
                                </label>
                                <div className="flex flex-wrap sm:flex-nowrap gap-2">
                                  <div className="flex-1 px-3 py-2 bg-gray-50 border rounded-md text-xs text-gray-600 flex items-center">
                                    Lettertype voor alle menucategorie koppen
                                  </div>
                                  {renderFontSelect('menu_category_title')}
                                  <input type="text" className="w-20 h-fit px-3 py-2 border rounded-md text-sm" placeholder="%"
                                    value={localStoreSettings.page_content?.menu_category_title_size || ''}
                                    onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, menu_category_title_size: e.target.value}} as any)} />
                                </div>
                              </div>

                              <div className="border-t pt-3">
                                <label className="block text-xs font-semibold text-gray-700 mb-1 flex justify-between">
                                  <span>Product / Gerecht Titels (bijv. Bitterballen, Mini Kroket)</span>
                                  <span className="text-[10px] text-gray-400 font-normal">Lettertype & Schaal</span>
                                </label>
                                <div className="flex flex-wrap sm:flex-nowrap gap-2">
                                  <div className="flex-1 px-3 py-2 bg-gray-50 border rounded-md text-xs text-gray-600 flex items-center">
                                    Lettertype voor alle individuele items
                                  </div>
                                  {renderFontSelect('menu_item_title')}
                                  <input type="text" className="w-20 h-fit px-3 py-2 border rounded-md text-sm" placeholder="%"
                                    value={localStoreSettings.page_content?.menu_item_title_size || ''}
                                    onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, menu_item_title_size: e.target.value}} as any)} />
                                </div>
                              </div>

                              <div className="md:col-span-2 border-t pt-3">
                                <label className="block text-xs font-semibold text-gray-700 mb-1 flex justify-between">
                                  <span>Categorie Beschrijvingen (subtekst onder categorie titel)</span>
                                  <span className="text-[10px] text-gray-400 font-normal">Lettertype & Schaal</span>
                                </label>
                                <div className="flex flex-wrap sm:flex-nowrap gap-2">
                                  <div className="flex-1 px-3 py-2 bg-gray-50 border rounded-md text-xs text-gray-600 flex items-center">
                                    Lettertype voor beschrijvingen onder categoriekoppen
                                  </div>
                                  {renderFontSelect('menu_category_desc')}
                                  <input type="text" className="w-20 h-fit px-3 py-2 border rounded-md text-sm" placeholder="%"
                                    value={localStoreSettings.page_content?.menu_category_desc_size || ''}
                                    onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, menu_category_desc_size: e.target.value}} as any)} />
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
                                  <span className="text-[10px] text-gray-400 font-normal">Lettertype & Schaal</span>
                                </label>
                                <div className="flex flex-wrap sm:flex-nowrap gap-2">
                                  <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                    placeholder={getContentPlaceholder('business_title', 'Vaste Klant Worden')}
                                    value={getContentValue('business_title')}
                                    onChange={e => setContentValue('business_title', e.target.value)} />
                                  {renderFontSelect('business_title')}
                                  <input type="text" className="w-20 h-fit px-3 py-2 border rounded-md text-sm" placeholder="%"
                                    value={localStoreSettings.page_content?.business_title_size || ''}
                                    onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, business_title_size: e.target.value}} as any)} />
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                  <span>Knop Tekst (bijv. Kantoor Inschrijven)</span>
                                  <span className="text-[10px] text-gray-400 font-normal">Lettertype & Schaal</span>
                                </label>
                                <div className="flex flex-wrap sm:flex-nowrap gap-2">
                                  <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                    placeholder={getContentPlaceholder('business_btn', 'Kantoor Inschrijven')}
                                    value={getContentValue('business_btn')}
                                    onChange={e => setContentValue('business_btn', e.target.value)} />
                                  {renderFontSelect('business_btn')}
                                  <input type="text" className="w-20 h-fit px-3 py-2 border rounded-md text-sm" placeholder="%"
                                    value={localStoreSettings.page_content?.business_btn_size || ''}
                                    onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, business_btn_size: e.target.value}} as any)} />
                                </div>
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                  <span>Ondertitel</span>
                                  <span className="text-[10px] text-gray-400 font-normal">Lettertype & Schaal</span>
                                </label>
                                <div className="flex flex-wrap sm:flex-nowrap gap-2">
                                  <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                    placeholder={getContentPlaceholder('business_subtitle', 'Een vaste partner voor uw kantoor.')}
                                    value={getContentValue('business_subtitle')}
                                    onChange={e => setContentValue('business_subtitle', e.target.value)} />
                                  {renderFontSelect('business_subtitle')}
                                  <input type="text" className="w-20 h-fit px-3 py-2 border rounded-md text-sm" placeholder="%"
                                    value={localStoreSettings.page_content?.business_subtitle_size || ''}
                                    onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, business_subtitle_size: e.target.value}} as any)} />
                                </div>
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                  <span>Beschrijvingstekst</span>
                                  <span className="text-[10px] text-gray-400 font-normal">Lettertype & Schaal</span>
                                </label>
                                <div className="flex flex-wrap sm:flex-nowrap gap-2">
                                  <textarea rows={3} className="flex-1 px-3 py-2 border rounded-md text-sm"
                                    placeholder={getContentPlaceholder('business_desc', 'Organiseert u regelmatig kantoorborrels of evenementen? Meld uw bedrijf aan bij Office Butler. Wij creëren een gepersonaliseerde bestelomgeving exclusief voor uw medewerkers.')}
                                    value={getContentValue('business_desc')}
                                    onChange={e => setContentValue('business_desc', e.target.value)} />
                                  {renderFontSelect('business_desc')}
                                  <input type="text" className="w-20 h-fit px-3 py-2 border rounded-md text-sm" placeholder="%"
                                    value={localStoreSettings.page_content?.business_desc_size || ''}
                                    onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, business_desc_size: e.target.value}} as any)} />
                                </div>
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                  <span>Titel Aanmeldformulier</span>
                                  <span className="text-[10px] text-gray-400 font-normal">Lettertype & Schaal</span>
                                </label>
                                <div className="flex flex-wrap sm:flex-nowrap gap-2">
                                  <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                    placeholder={getContentPlaceholder('business_form_title', 'Bedrijf Aanmelden')}
                                    value={getContentValue('business_form_title')}
                                    onChange={e => setContentValue('business_form_title', e.target.value)} />
                                  {renderFontSelect('business_form_title')}
                                  <input type="text" className="w-20 h-fit px-3 py-2 border rounded-md text-sm" placeholder="%"
                                    value={localStoreSettings.page_content?.business_form_title_size || ''}
                                    onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, business_form_title_size: e.target.value}} as any)} />
                                </div>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4 pt-3 border-t">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                  <span>Bullet 1</span>
                                  <span className="text-[10px] text-gray-400 font-normal">Lettertype & Schaal</span>
                                </label>
                                <div className="flex flex-wrap sm:flex-nowrap gap-2">
                                  <input type="text" className="flex-1 min-w-0 px-3 py-2 border rounded-md text-sm"
                                    placeholder={getContentPlaceholder('business_point1', 'Een eigen, unieke URL (bijv. officebutler.nl/uw-bedrijf)')}
                                    value={getContentValue('business_point1')}
                                    onChange={e => setContentValue('business_point1', e.target.value)} />
                                  {renderFontSelect('business_point1')}
                                  <input type="text" className="w-20 h-fit px-3 py-2 border rounded-md text-sm" placeholder="%"
                                    value={localStoreSettings.page_content?.business_point1_size || ''}
                                    onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, business_point1_size: e.target.value}} as any)} />
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                  <span>Bullet 2</span>
                                  <span className="text-[10px] text-gray-400 font-normal">Lettertype & Schaal</span>
                                </label>
                                <div className="flex flex-wrap sm:flex-nowrap gap-2">
                                  <input type="text" className="flex-1 min-w-0 px-3 py-2 border rounded-md text-sm"
                                    placeholder={getContentPlaceholder('business_point2', 'Gepersonaliseerd assortiment naar wens')}
                                    value={getContentValue('business_point2')}
                                    onChange={e => setContentValue('business_point2', e.target.value)} />
                                  {renderFontSelect('business_point2')}
                                  <input type="text" className="w-20 h-fit px-3 py-2 border rounded-md text-sm" placeholder="%"
                                    value={localStoreSettings.page_content?.business_point2_size || ''}
                                    onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, business_point2_size: e.target.value}} as any)} />
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                  <span>Bullet 3</span>
                                  <span className="text-[10px] text-gray-400 font-normal">Lettertype & Schaal</span>
                                </label>
                                <div className="flex flex-wrap sm:flex-nowrap gap-2">
                                  <input type="text" className="flex-1 min-w-0 px-3 py-2 border rounded-md text-sm"
                                    placeholder={getContentPlaceholder('business_point3', 'Optie tot betalen op factuur')}
                                    value={getContentValue('business_point3')}
                                    onChange={e => setContentValue('business_point3', e.target.value)} />
                                  {renderFontSelect('business_point3')}
                                  <input type="text" className="w-20 h-fit px-3 py-2 border rounded-md text-sm" placeholder="%"
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
                                  <span className="text-[10px] text-gray-400 font-normal">Lettertype & Schaal</span>
                                </label>
                                <div className="flex flex-wrap sm:flex-nowrap gap-2">
                                  <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                    placeholder={getContentPlaceholder('contact_title', 'Contact & Informatie')}
                                    value={getContentValue('contact_title')}
                                    onChange={e => setContentValue('contact_title', e.target.value)} />
                                  {renderFontSelect('contact_title')}
                                  <input type="text" className="w-20 h-fit px-3 py-2 border rounded-md text-sm" placeholder="%"
                                    value={localStoreSettings.page_content?.contact_title_size || ''}
                                    onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, contact_title_size: e.target.value}} as any)} />
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                  <span>Titel FAQ Sectie</span>
                                  <span className="text-[10px] text-gray-400 font-normal">Lettertype & Schaal</span>
                                </label>
                                <div className="flex flex-wrap sm:flex-nowrap gap-2">
                                  <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm"
                                    placeholder={getContentPlaceholder('faq_title', 'Veelgestelde Vragen')}
                                    value={getContentValue('faq_title')}
                                    onChange={e => setContentValue('faq_title', e.target.value)} />
                                  {renderFontSelect('faq_title')}
                                  <input type="text" className="w-20 h-fit px-3 py-2 border rounded-md text-sm" placeholder="%"
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
                                    <span className="text-[10px] text-gray-400 font-normal">Lettertype & Schaal</span>
                                  </label>
                                  <div className="flex flex-wrap sm:flex-nowrap gap-2">
                                    <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm bg-white"
                                      placeholder={getContentPlaceholder('faq_q1', 'Bezorgen jullie ook buiten Amsterdam?')}
                                      value={getContentValue('faq_q1')}
                                      onChange={e => setContentValue('faq_q1', e.target.value)} />
                                    {renderFontSelect('faq_q1')}
                                    <input type="text" className="w-20 px-3 py-2 border rounded-md text-sm bg-white" placeholder="%"
                                      value={localStoreSettings.page_content?.faq_q1_size || ''}
                                      onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, faq_q1_size: e.target.value}} as any)} />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                    <span>Antwoord 1</span>
                                    <span className="text-[10px] text-gray-400 font-normal">Lettertype & Schaal</span>
                                  </label>
                                  <div className="flex flex-wrap sm:flex-nowrap gap-2">
                                    <textarea rows={2} className="flex-1 px-3 py-2 border rounded-md text-sm bg-white"
                                      placeholder={getContentPlaceholder('faq_a1', 'Momenteel bezorgen wij met Office Butler uitsluitend op kantoren binnen de ring van Amsterdam om de kwaliteit en temperatuur van onze snacks te garanderen.')}
                                      value={getContentValue('faq_a1')}
                                      onChange={e => setContentValue('faq_a1', e.target.value)} />
                                    {renderFontSelect('faq_a1')}
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
                                    <span className="text-[10px] text-gray-400 font-normal">Lettertype & Schaal</span>
                                  </label>
                                  <div className="flex flex-wrap sm:flex-nowrap gap-2">
                                    <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm bg-white"
                                      placeholder={getContentPlaceholder('faq_q2', 'Wat is het verschil met Canal Butler?')}
                                      value={getContentValue('faq_q2')}
                                      onChange={e => setContentValue('faq_q2', e.target.value)} />
                                    {renderFontSelect('faq_q2')}
                                    <input type="text" className="w-20 px-3 py-2 border rounded-md text-sm bg-white" placeholder="%"
                                      value={localStoreSettings.page_content?.faq_q2_size || ''}
                                      onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, faq_q2_size: e.target.value}} as any)} />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                    <span>Antwoord 2</span>
                                    <span className="text-[10px] text-gray-400 font-normal">Lettertype & Schaal</span>
                                  </label>
                                  <div className="flex flex-wrap sm:flex-nowrap gap-2">
                                    <textarea rows={2} className="flex-1 px-3 py-2 border rounded-md text-sm bg-white"
                                      placeholder={getContentPlaceholder('faq_a2', 'Office Butler is het B2B zusterbedrijf van Canal Butler. We maken gebruik van dezelfde keuken (Mokum Local Kitchen) en bieden dezelfde premium kwaliteit, maar dan specifiek afgestemd op levering op kantoor in plaats van op de grachten.')}
                                      value={getContentValue('faq_a2')}
                                      onChange={e => setContentValue('faq_a2', e.target.value)} />
                                    {renderFontSelect('faq_a2')}
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
                                    <span className="text-[10px] text-gray-400 font-normal">Lettertype & Schaal</span>
                                  </label>
                                  <div className="flex flex-wrap sm:flex-nowrap gap-2">
                                    <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm bg-white"
                                      placeholder={getContentPlaceholder('faq_q3', 'Hoe ver van tevoren moet ik bestellen?')}
                                      value={getContentValue('faq_q3')}
                                      onChange={e => setContentValue('faq_q3', e.target.value)} />
                                    {renderFontSelect('faq_q3')}
                                    <input type="text" className="w-20 px-3 py-2 border rounded-md text-sm bg-white" placeholder="%"
                                      value={localStoreSettings.page_content?.faq_q3_size || ''}
                                      onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, faq_q3_size: e.target.value}} as any)} />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                    <span>Antwoord 3</span>
                                    <span className="text-[10px] text-gray-400 font-normal">Lettertype & Schaal</span>
                                  </label>
                                  <div className="flex flex-wrap sm:flex-nowrap gap-2">
                                    <textarea rows={2} className="flex-1 px-3 py-2 border rounded-md text-sm bg-white"
                                      placeholder={getContentPlaceholder('faq_a3', 'Voor reguliere bestellingen vragen wij u minimaal 2 uur van tevoren te bestellen. Voor grote groepen (>30 personen) of een compleet assortiment horen wij dit graag minimaal 24 uur van tevoren.')}
                                      value={getContentValue('faq_a3')}
                                      onChange={e => setContentValue('faq_a3', e.target.value)} />
                                    {renderFontSelect('faq_a3')}
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
                                    <span className="text-[10px] text-gray-400 font-normal">Lettertype & Schaal</span>
                                  </label>
                                  <div className="flex flex-wrap sm:flex-nowrap gap-2">
                                    <input type="text" className="flex-1 px-3 py-2 border rounded-md text-sm bg-white"
                                      placeholder={getContentPlaceholder('faq_q4', 'Extra vraag toevoegen...')}
                                      value={getContentValue('faq_q4')}
                                      onChange={e => setContentValue('faq_q4', e.target.value)} />
                                    {renderFontSelect('faq_q4')}
                                    <input type="text" className="w-20 px-3 py-2 border rounded-md text-sm bg-white" placeholder="%"
                                      value={localStoreSettings.page_content?.faq_q4_size || ''}
                                      onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, faq_q4_size: e.target.value}} as any)} />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1 flex justify-between">
                                    <span>Antwoord 4 (Optioneel)</span>
                                    <span className="text-[10px] text-gray-400 font-normal">Lettertype & Schaal</span>
                                  </label>
                                  <div className="flex flex-wrap sm:flex-nowrap gap-2">
                                    <textarea rows={2} className="flex-1 px-3 py-2 border rounded-md text-sm bg-white"
                                      placeholder={getContentPlaceholder('faq_a4', 'Antwoord op vraag 4...')}
                                      value={getContentValue('faq_a4')}
                                      onChange={e => setContentValue('faq_a4', e.target.value)} />
                                    {renderFontSelect('faq_a4')}
                                    <input type="text" className="w-20 h-fit px-3 py-2 border rounded-md text-sm bg-white" placeholder="%"
                                      value={localStoreSettings.page_content?.faq_a4_size || ''}
                                      onChange={e => setLocalStoreSettings({...localStoreSettings, page_content: {...localStoreSettings.page_content, faq_a4_size: e.target.value}} as any)} />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* BESTELKEUZE POP-UP (MODAL) */}
                          <div className="bg-white p-6 rounded-xl border shadow-sm mb-6 space-y-4">
                            <div className="border-b pb-3">
                              <h4 className="font-bold text-ob-blue text-base flex items-center gap-2">
                                <span>🛒 Bestelkeuze Pop-up (Hoe wilt u bestellen modal)</span>
                              </h4>
                              <p className="text-xs text-gray-500 mt-0.5">
                                Pas de titels, knoppen en toelichtingen aan van de pop-up die verschijnt wanneer bezoekers op 'Bestellen' klikken.
                              </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Titel Stap 1 (Keuze modal)</label>
                                <input type="text" className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                                  placeholder={getContentPlaceholder('modal_step1_title', 'Hoe wilt u bestellen?')}
                                  value={getContentValue('modal_step1_title')}
                                  onChange={e => setContentValue('modal_step1_title', e.target.value)} />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Titel Stap 2 (Keuze account / gast)</label>
                                <input type="text" className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                                  placeholder={getContentPlaceholder('modal_step2_title', 'Maak uw keuze')}
                                  value={getContentValue('modal_step2_title')}
                                  onChange={e => setContentValue('modal_step2_title', e.target.value)} />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Knop 'Word vaste klant' Titel</label>
                                <input type="text" className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                                  placeholder={getContentPlaceholder('modal_business_title', 'Word vaste klant')}
                                  value={getContentValue('modal_business_title')}
                                  onChange={e => setContentValue('modal_business_title', e.target.value)} />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Knop 'Word vaste klant' Ondertitel</label>
                                <input type="text" className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                                  placeholder={getContentPlaceholder('modal_business_subtitle', 'Meld uw bedrijf aan voor een vaste bestelomgeving')}
                                  value={getContentValue('modal_business_subtitle')}
                                  onChange={e => setContentValue('modal_business_subtitle', e.target.value)} />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Knop 'Bestel vooraf' Titel</label>
                                <input type="text" className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                                  placeholder={getContentPlaceholder('modal_preorder_title', 'Bestel vooraf')}
                                  value={getContentValue('modal_preorder_title')}
                                  onChange={e => setContentValue('modal_preorder_title', e.target.value)} />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Knop 'Bestel vooraf' Ondertitel</label>
                                <input type="text" className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                                  placeholder={getContentPlaceholder('modal_preorder_subtitle', 'Plan uw bestelling voor een later moment')}
                                  value={getContentValue('modal_preorder_subtitle')}
                                  onChange={e => setContentValue('modal_preorder_subtitle', e.target.value)} />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Knop 'Bestel direct' Titel</label>
                                <input type="text" className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                                  placeholder={getContentPlaceholder('modal_direct_title', 'Bestel direct')}
                                  value={getContentValue('modal_direct_title')}
                                  onChange={e => setContentValue('modal_direct_title', e.target.value)} />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Knop 'Bestel direct' Ondertitel</label>
                                <input type="text" className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                                  placeholder={getContentPlaceholder('modal_direct_subtitle', 'Ontvang uw bestelling zo snel mogelijk')}
                                  value={getContentValue('modal_direct_subtitle')}
                                  onChange={e => setContentValue('modal_direct_subtitle', e.target.value)} />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Knop 'Inloggen' Titel</label>
                                <input type="text" className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                                  placeholder={getContentPlaceholder('modal_login_title', 'Inloggen')}
                                  value={getContentValue('modal_login_title')}
                                  onChange={e => setContentValue('modal_login_title', e.target.value)} />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Knop 'Inloggen' Ondertitel</label>
                                <input type="text" className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                                  placeholder={getContentPlaceholder('modal_login_subtitle', 'Voor bestaande zakelijke klanten en medewerkers')}
                                  value={getContentValue('modal_login_subtitle')}
                                  onChange={e => setContentValue('modal_login_subtitle', e.target.value)} />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Knop 'Eenmalig / Particulier' Titel</label>
                                <input type="text" className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                                  placeholder={getContentPlaceholder('modal_guest_title', 'Eenmalig / Particulier bestellen')}
                                  value={getContentValue('modal_guest_title')}
                                  onChange={e => setContentValue('modal_guest_title', e.target.value)} />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Knop 'Eenmalig / Particulier' Ondertitel</label>
                                <input type="text" className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                                  placeholder={getContentPlaceholder('modal_guest_subtitle', 'Snel bestellen zonder account')}
                                  value={getContentValue('modal_guest_subtitle')}
                                  onChange={e => setContentValue('modal_guest_subtitle', e.target.value)} />
                              </div>
                            </div>
                          </div>

                          {/* BESTELPROCES, MELDINGEN & BEVESTIGINGEN */}
                          <div className="bg-white p-6 rounded-xl border shadow-sm mb-6 space-y-6">
                            <div className="border-b pb-3">
                              <h4 className="font-bold text-ob-blue text-base flex items-center gap-2">
                                <span>✉️ Bestelproces, Meldingen & Bevestigingsschermen</span>
                              </h4>
                              <p className="text-xs text-gray-500 mt-0.5">
                                Beheer alle teksten, successchermen, foutmeldingen en knoppen van zowel de eenmalige (gast) als de zakelijke bestelomgeving.
                              </p>
                            </div>

                            {/* EENMALIG / GAST BESTELLEN */}
                            <div className="space-y-4">
                              <h5 className="font-bold text-xs uppercase tracking-wider text-ob-blue bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                                🛍️ Eenmalig Bestellen (Gast)
                              </h5>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Paginatitel (Header)</label>
                                  <input type="text" className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                                    placeholder={getContentPlaceholder('guest_order_title', 'Eenmalig Bestellen')}
                                    value={getContentValue('guest_order_title')}
                                    onChange={e => setContentValue('guest_order_title', e.target.value)} />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Bestelknop tekst</label>
                                  <input type="text" className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                                    placeholder={getContentPlaceholder('guest_btn_submit', 'Bestelling Plaatsen')}
                                    value={getContentValue('guest_btn_submit')}
                                    onChange={e => setContentValue('guest_btn_submit', e.target.value)} />
                                </div>
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Paginatoespraak / Subtitel</label>
                                <input type="text" className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                                  placeholder={getContentPlaceholder('guest_order_subtitle', 'Selecteer uw favoriete snacks en vul uw factuur- en bezorggegevens in.')}
                                  value={getContentValue('guest_order_subtitle')}
                                  onChange={e => setContentValue('guest_order_subtitle', e.target.value)} />
                              </div>

                              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                                <span className="font-semibold text-xs text-gray-800 block">✅ Successcherm na afronden (Gast)</span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Succes Titel</label>
                                    <input type="text" className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                                      placeholder={getContentPlaceholder('guest_success_title', 'Bestelling Ontvangen!')}
                                      value={getContentValue('guest_success_title')}
                                      onChange={e => setContentValue('guest_success_title', e.target.value)} />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Knop 'Terug naar home'</label>
                                    <input type="text" className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                                      placeholder={getContentPlaceholder('guest_success_button', 'Terug naar home')}
                                      value={getContentValue('guest_success_button')}
                                      onChange={e => setContentValue('guest_success_button', e.target.value)} />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">
                                    Succes Bericht <span className="text-[11px] text-gray-400 font-normal">(tip: gebruik {'{guestName}'} om de naam van de klant in te voegen)</span>
                                  </label>
                                  <textarea rows={2} className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                                    placeholder={getContentPlaceholder('guest_success_message', 'Bedankt voor uw bestelling, {guestName}. We hebben uw aanvraag goed ontvangen.')}
                                    value={getContentValue('guest_success_message')}
                                    onChange={e => setContentValue('guest_success_message', e.target.value)} />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Factuurmededeling</label>
                                  <input type="text" className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                                    placeholder={getContentPlaceholder('guest_invoice_notice', 'De factuur is verstuurd naar uw e-mail.')}
                                    value={getContentValue('guest_invoice_notice')}
                                    onChange={e => setContentValue('guest_invoice_notice', e.target.value)} />
                                </div>
                              </div>
                            </div>

                            {/* ZAKELIJK / MEDEWERKER BESTELLEN */}
                            <div className="space-y-4 pt-4 border-t">
                              <h5 className="font-bold text-xs uppercase tracking-wider text-ob-blue bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                                🏢 Zakelijke Bestelomgeving (Medewerkers)
                              </h5>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Paginatitel (Header)</label>
                                  <input type="text" className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                                    placeholder={getContentPlaceholder('emp_order_title', 'Nieuwe Bestelling')}
                                    value={getContentValue('emp_order_title')}
                                    onChange={e => setContentValue('emp_order_title', e.target.value)} />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Bestelknop tekst</label>
                                  <input type="text" className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                                    placeholder={getContentPlaceholder('emp_btn_submit', 'Bestelling Plaatsen')}
                                    value={getContentValue('emp_btn_submit')}
                                    onChange={e => setContentValue('emp_btn_submit', e.target.value)} />
                                </div>
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Paginatoespraak / Subtitel <span className="text-[11px] text-gray-400 font-normal">(tip: gebruik {'{companyName}'} voor de bedrijfsnaam)</span>
                                </label>
                                <input type="text" className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                                  placeholder={getContentPlaceholder('emp_order_subtitle', 'Bestel via het account van {companyName}')}
                                  value={getContentValue('emp_order_subtitle')}
                                  onChange={e => setContentValue('emp_order_subtitle', e.target.value)} />
                              </div>

                              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                                <span className="font-semibold text-xs text-gray-800 block">✅ Successcherm na afronden (Zakelijk)</span>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Succes Titel</label>
                                    <input type="text" className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                                      placeholder={getContentPlaceholder('emp_success_title', 'Bestelling Geplaatst!')}
                                      value={getContentValue('emp_success_title')}
                                      onChange={e => setContentValue('emp_success_title', e.target.value)} />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Knop naar Dashboard</label>
                                    <input type="text" className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                                      placeholder={getContentPlaceholder('emp_btn_dashboard', 'Ga naar Bedrijfsdashboard')}
                                      value={getContentValue('emp_btn_dashboard')}
                                      onChange={e => setContentValue('emp_btn_dashboard', e.target.value)} />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Knop Nieuwe Bestelling</label>
                                    <input type="text" className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                                      placeholder={getContentPlaceholder('emp_btn_new', 'Nieuwe Bestelling Plaatsen')}
                                      value={getContentValue('emp_btn_new')}
                                      onChange={e => setContentValue('emp_btn_new', e.target.value)} />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Succes Bericht</label>
                                  <textarea rows={2} className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                                    placeholder={getContentPlaceholder('emp_success_message', 'Uw kantoorborrel is succesvol besteld en zal op de gekozen afleverlocatie worden bezorgd.')}
                                    value={getContentValue('emp_success_message')}
                                    onChange={e => setContentValue('emp_success_message', e.target.value)} />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Wijzigen / Annuleren tip Titel</label>
                                    <input type="text" className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                                      placeholder={getContentPlaceholder('emp_modify_title', 'Bestelling wijzigen of annuleren?')}
                                      value={getContentValue('emp_modify_title')}
                                      onChange={e => setContentValue('emp_modify_title', e.target.value)} />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Wijzigen / Annuleren tip Tekst</label>
                                    <input type="text" className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                                      placeholder={getContentPlaceholder('emp_success_notice', 'U kunt deze bestelling te allen tijde inzien, aanpassen of annuleren via uw Bedrijfsdashboard.')}
                                      value={getContentValue('emp_success_notice')}
                                      onChange={e => setContentValue('emp_success_notice', e.target.value)} />
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* SYSTEEMMELDINGEN & FOUTBERICHTEN */}
                            <div className="space-y-4 pt-4 border-t">
                              <h5 className="font-bold text-xs uppercase tracking-wider text-ob-blue bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                                ⚠️ Foutmeldingen & Systeemberichten
                              </h5>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Fout: Verplichte velden niet ingevuld (Gast)</label>
                                  <input type="text" className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                                    placeholder={getContentPlaceholder('guest_error_required', 'Vul a.u.b. alle verplichte velden in en selecteer minimaal één product.')}
                                    value={getContentValue('guest_error_required')}
                                    onChange={e => setContentValue('guest_error_required', e.target.value)} />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Fout: Verplichte velden niet ingevuld (Zakelijk)</label>
                                  <input type="text" className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                                    placeholder={getContentPlaceholder('emp_error_required', 'Selecteer a.u.b. minimaal één product en vul uw contactgegevens in.')}
                                    value={getContentValue('emp_error_required')}
                                    onChange={e => setContentValue('emp_error_required', e.target.value)} />
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Algemene foutmelding bij plaatsen</label>
                                  <input type="text" className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                                    placeholder={getContentPlaceholder('guest_error_general', 'Er ging iets mis bij het plaatsen van de bestelling.')}
                                    value={getContentValue('guest_error_general')}
                                    onChange={e => setContentValue('guest_error_general', e.target.value)} />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Knopstatus tijdens verzenden</label>
                                  <input type="text" className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                                    placeholder={getContentPlaceholder('btn_submitting', 'Bezig met plaatsen...')}
                                    value={getContentValue('btn_submitting')}
                                    onChange={e => setContentValue('btn_submitting', e.target.value)} />
                                </div>
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                  Melding bij vertraging in e-mailsysteem
                                </label>
                                <textarea rows={2} className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                                  placeholder={getContentPlaceholder('delivery_delay_notice', 'Op dit moment is er een lichte vertraging in ons e-mailsysteem. Uw bestelling is veilig in goede banen, maar de bevestigingsmail volgt mogelijk iets later.')}
                                  value={getContentValue('delivery_delay_notice')}
                                  onChange={e => setContentValue('delivery_delay_notice', e.target.value)} />
                              </div>
                            </div>
                          </div>

                          {/* FACTUURINSTELLINGEN (Mokum Local Kitchen) */}
                          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs mt-6">
                            <h4 className="font-bold text-base text-[#05053D] mb-2 flex items-center gap-2">
                              <Building2 className="text-[#b58b4c]" size={20} />
                              <span>Factuurgegevens & Bedrijfsinformatie (Mokum Local Kitchen)</span>
                            </h4>
                            <p className="text-xs text-gray-500 mb-6">
                              Deze officiële gegevens verschijnen op alle gegenereerde facturen en PDF downloads voor bestellingen.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                  Merknaam op factuur (prominent)
                                </label>
                                <input
                                  type="text"
                                  className="w-full px-3 py-2 border rounded-md text-sm bg-white font-bold text-[#05053D]"
                                  placeholder={getContentPlaceholder('invoice_brand_name', 'Office Butler')}
                                  value={getContentValue('invoice_brand_name')}
                                  onChange={e => setContentValue('invoice_brand_name', e.target.value)}
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                  Juridische Bedrijfsnaam / Keuken
                                </label>
                                <input
                                  type="text"
                                  className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                                  placeholder={getContentPlaceholder('invoice_company_name', 'Mokum Local Kitchen')}
                                  value={getContentValue('invoice_company_name')}
                                  onChange={e => setContentValue('invoice_company_name', e.target.value)}
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                  KVK nummer
                                </label>
                                <input
                                  type="text"
                                  className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                                  placeholder={getContentPlaceholder('invoice_kvk', '99852667')}
                                  value={getContentValue('invoice_kvk')}
                                  onChange={e => setContentValue('invoice_kvk', e.target.value)}
                                />
                              </div>

                              {/* Factuur Logo Aanpassen & Live Preview */}
                              <div className="sm:col-span-2 md:col-span-3 bg-gray-50/80 p-4 rounded-xl border border-gray-200 mt-1">
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                                  <div className="flex items-center gap-4">
                                    {/* Live Preview Box with matching contour */}
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-xs bg-[#151f33] flex items-center justify-center shrink-0">
                                      <img
                                        src={getContentValue('invoice_logo_url') || 'https://i.imgur.com/ymXR7tL.png'}
                                        alt="Factuur Logo Preview"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = 'https://i.imgur.com/ymXR7tL.png';
                                        }}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-bold text-gray-900 mb-0.5 flex items-center gap-1.5">
                                        <ImageIcon size={14} className="text-[#b58b4c]" />
                                        <span>Factuur Logo Afbeelding</span>
                                      </label>
                                      <p className="text-[11px] text-gray-500 mb-2">
                                        Dit logo wordt weergegeven op alle facturen, verzamelfacturen en factuur e-mails.
                                      </p>
                                      <div className="flex flex-wrap items-center gap-2">
                                        {/* File upload from device */}
                                        <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 hover:border-gray-400 text-gray-700 text-xs font-medium rounded-lg shadow-2xs hover:bg-gray-50 transition-colors">
                                          <Upload size={14} className="text-[#b58b4c]" />
                                          <span>Upload vanaf computer</span>
                                          <input
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                              const file = e.target.files?.[0];
                                              if (file) {
                                                const reader = new FileReader();
                                                reader.onload = (event) => {
                                                  const result = event.target?.result as string;
                                                  if (result) {
                                                    setContentValue('invoice_logo_url', result);
                                                  }
                                                };
                                                reader.readAsDataURL(file);
                                              }
                                            }}
                                          />
                                        </label>

                                        {/* Quick Reset to Default Office Butler Logo */}
                                        <button
                                          type="button"
                                          onClick={() => setContentValue('invoice_logo_url', 'https://i.imgur.com/ymXR7tL.png')}
                                          className="px-2.5 py-1.5 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-200/60 rounded-lg border border-gray-200 transition-colors"
                                          title="Herstel naar standaard Office Butler logo"
                                        >
                                          Standaard Office Butler
                                        </button>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Direct URL input */}
                                  <div className="w-full md:w-80">
                                    <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                                      Of voer een directe Afbeeldings-URL in:
                                    </label>
                                    <input
                                      type="text"
                                      className="w-full px-3 py-1.5 border rounded-md text-xs bg-white font-mono"
                                      placeholder="https://i.imgur.com/ymXR7tL.png"
                                      value={getContentValue('invoice_logo_url')}
                                      onChange={e => setContentValue('invoice_logo_url', e.target.value)}
                                    />
                                  </div>
                                </div>
                              </div>

                              <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                  BTW-identificatienummer
                                </label>
                                <input
                                  type="text"
                                  className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                                  placeholder={getContentPlaceholder('invoice_vat_number', 'NL868877037B01')}
                                  value={getContentValue('invoice_vat_number')}
                                  onChange={e => setContentValue('invoice_vat_number', e.target.value)}
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                  IBAN Rekeningnummer
                                </label>
                                <input
                                  type="text"
                                  className="w-full px-3 py-2 border rounded-md text-sm bg-white font-mono"
                                  placeholder={getContentPlaceholder('invoice_iban', 'NL16ABNA0153600063')}
                                  value={getContentValue('invoice_iban')}
                                  onChange={e => setContentValue('invoice_iban', e.target.value)}
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                  BIC / SWIFT
                                </label>
                                <input
                                  type="text"
                                  className="w-full px-3 py-2 border rounded-md text-sm bg-white font-mono"
                                  placeholder={getContentPlaceholder('invoice_bic', 'ABNANL2A')}
                                  value={getContentValue('invoice_bic')}
                                  onChange={e => setContentValue('invoice_bic', e.target.value)}
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                  E-mailadres voor facturen
                                </label>
                                <input
                                  type="email"
                                  className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                                  placeholder={getContentPlaceholder('invoice_email', 'info@office-butler.com')}
                                  value={getContentValue('invoice_email')}
                                  onChange={e => setContentValue('invoice_email', e.target.value)}
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                  Vestigingsadres
                                </label>
                                <input
                                  type="text"
                                  className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                                  placeholder={getContentPlaceholder('invoice_address', 'Muiderstraat 18-s, 1011 RB Amsterdam')}
                                  value={getContentValue('invoice_address')}
                                  onChange={e => setContentValue('invoice_address', e.target.value)}
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-1">
                                  Standaard Betaaltermijn (dagen)
                                </label>
                                <input
                                  type="number"
                                  className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                                  placeholder={getContentPlaceholder('invoice_payment_terms_days', '14')}
                                  value={getContentValue('invoice_payment_terms_days')}
                                  onChange={e => setContentValue('invoice_payment_terms_days', e.target.value)}
                                />
                              </div>
                            </div>
                          </div>

                          {/* GEAUTOMATISEERDE E-MAILS & SJABLONEN */}
                          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-xs mb-8 space-y-6">
                            <div className="border-b pb-4">
                              <h4 className="font-bold text-[#05053D] text-base flex items-center gap-2">
                                <Mail className="text-[#b58b4c]" size={20} />
                                <span>Geautomatiseerde E-mails & Sjablonen (Onderwerpen & Teksten)</span>
                              </h4>
                              <p className="text-xs text-gray-500 mt-1">
                                Pas hier de onderwerpen en teksten aan van alle geautomatiseerde e-mails die verstuurd worden via Resend (zoals facturen, maandfacturen, orderbevestigingen en wijzigingen).
                              </p>
                              
                              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 flex flex-wrap items-center gap-2">
                                <span className="font-bold">Beschikbare dynamische tags:</span>
                                <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 font-mono text-[11px] text-blue-800">{'{klantnaam}'}</code>
                                <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 font-mono text-[11px] text-blue-800">{'{bedrijfsnaam}'}</code>
                                <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 font-mono text-[11px] text-blue-800">{'{factuurnummer}'}</code>
                                <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 font-mono text-[11px] text-blue-800">{'{maand}'}</code>
                                <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 font-mono text-[11px] text-blue-800">{'{betaaltermijn}'}</code>
                                <code className="bg-white px-1.5 py-0.5 rounded border border-blue-200 font-mono text-[11px] text-blue-800">{'{email}'}</code>
                              </div>
                            </div>

                            <div className="space-y-6 divide-y divide-gray-100">
                              {/* 1. Factuur e-mail (Losse bestelling) */}
                              <div className="space-y-3 pt-2">
                                <h5 className="font-semibold text-sm text-[#05053D] flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                                  1. Factuur e-mail (Losse bestelling - verstuurd vanuit Dashboard)
                                </h5>
                                <div className="grid grid-cols-1 gap-3">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Onderwerp Factuur e-mail
                                    </label>
                                    <input
                                      type="text"
                                      className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                                      placeholder={getContentPlaceholder('email_invoice_subject', 'Factuur {factuurnummer} - {klantnaam} (Mokum Local Kitchen)')}
                                      value={getContentValue('email_invoice_subject')}
                                      onChange={e => setContentValue('email_invoice_subject', e.target.value)}
                                    />
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Inleidende tekst (bovenaan factuur e-mail)
                                      </label>
                                      <textarea
                                        rows={3}
                                        className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                                        placeholder={getContentPlaceholder('email_invoice_intro', 'Beste {klantnaam},\n\nHartelijk dank voor uw bestelling. Hieronder vindt u de factuurspecificatie met alle details en betaalgegevens.')}
                                        value={getContentValue('email_invoice_intro')}
                                        onChange={e => setContentValue('email_invoice_intro', e.target.value)}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Afsluitende tekst / Betaalinstructie
                                      </label>
                                      <textarea
                                        rows={3}
                                        className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                                        placeholder={getContentPlaceholder('email_invoice_outro', 'Wij verzoeken u vriendelijk het totaalbedrag binnen {betaaltermijn} dagen over te maken naar ons rekeningnummer onder vermelding van factuurnummer {factuurnummer}.\n\nHeeft u vragen over deze factuur? Neem gerust contact met ons op via {email}.')}
                                        value={getContentValue('email_invoice_outro')}
                                        onChange={e => setContentValue('email_invoice_outro', e.target.value)}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* 2. Maand- / Verzamelfactuur e-mail */}
                              <div className="space-y-3 pt-6">
                                <h5 className="font-semibold text-sm text-[#05053D] flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-[#b58b4c]"></span>
                                  2. Maand- / Verzamelfactuur e-mail (Verstuurd vanuit Dashboard)
                                </h5>
                                <div className="grid grid-cols-1 gap-3">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Onderwerp Maandfactuur e-mail
                                    </label>
                                    <input
                                      type="text"
                                      className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                                      placeholder={getContentPlaceholder('email_monthly_invoice_subject', 'Verzamelfactuur {maand} - {factuurnummer} - {bedrijfsnaam}')}
                                      value={getContentValue('email_monthly_invoice_subject')}
                                      onChange={e => setContentValue('email_monthly_invoice_subject', e.target.value)}
                                    />
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Inleidende tekst Verzamelfactuur
                                      </label>
                                      <textarea
                                        rows={3}
                                        className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                                        placeholder={getContentPlaceholder('email_monthly_intro', 'Beste {klantnaam},\n\nHierbij ontvangt u de officiële verzamelfactuur voor alle geleverde cateringopdrachten in {maand}. In onderstaand overzicht vindt u de specificatie per leverdatum.')}
                                        value={getContentValue('email_monthly_intro')}
                                        onChange={e => setContentValue('email_monthly_intro', e.target.value)}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-xs font-medium text-gray-700 mb-1">
                                        Afsluitende tekst Verzamelfactuur
                                      </label>
                                      <textarea
                                        rows={3}
                                        className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                                        placeholder={getContentPlaceholder('email_monthly_outro', 'Wij verzoeken u vriendelijk het openstaande bedrag binnen {betaaltermijn} dagen over te maken.\n\nHartelijk dank voor de fijne samenwerking deze maand!')}
                                        value={getContentValue('email_monthly_outro')}
                                        onChange={e => setContentValue('email_monthly_outro', e.target.value)}
                                      />
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* 3. Automatische Orderbevestiging Klant */}
                              <div className="space-y-3 pt-6">
                                <h5 className="font-semibold text-sm text-[#05053D] flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                                  3. Automatische Orderbevestiging Klant (Bij plaatsen van een order op de website)
                                </h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Onderwerp Orderbevestiging
                                    </label>
                                    <input
                                      type="text"
                                      className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                                      placeholder={getContentPlaceholder('email_order_confirm_subject', 'Bevestiging Bestelling & Factuur - {bedrijfsnaam}')}
                                      value={getContentValue('email_order_confirm_subject')}
                                      onChange={e => setContentValue('email_order_confirm_subject', e.target.value)}
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                      Inleidende tekst Orderbevestiging
                                    </label>
                                    <textarea
                                      rows={2}
                                      className="w-full px-3 py-2 border rounded-md text-sm bg-white"
                                      placeholder={getContentPlaceholder('email_order_confirm_intro', 'Beste {klantnaam},\n\nBedankt voor uw bestelling via Office Butler. Hieronder vindt u het overzicht van uw bestelling en afleverdetails.')}
                                      value={getContentValue('email_order_confirm_intro')}
                                      onChange={e => setContentValue('email_order_confirm_intro', e.target.value)}
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* 4. Bestelling Gewijzigd & Geannuleerd */}
                              <div className="space-y-3 pt-6">
                                <h5 className="font-semibold text-sm text-[#05053D] flex items-center gap-2">
                                  <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                                  4. Wijziging- & Annuleringse-mails (Orderbeheer)
                                </h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div className="space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="font-semibold text-xs text-gray-800">Bestelling Gewijzigd e-mail</div>
                                    <div>
                                      <label className="block text-[11px] font-medium text-gray-600 mb-1">Onderwerp</label>
                                      <input
                                        type="text"
                                        className="w-full px-2.5 py-1.5 border rounded text-xs bg-white"
                                        placeholder={getContentPlaceholder('email_order_modify_subject', '✏️ Bestelling Gewijzigd - {bedrijfsnaam}')}
                                        value={getContentValue('email_order_modify_subject')}
                                        onChange={e => setContentValue('email_order_modify_subject', e.target.value)}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[11px] font-medium text-gray-600 mb-1">Inleidende tekst</label>
                                      <textarea
                                        rows={2}
                                        className="w-full px-2.5 py-1.5 border rounded text-xs bg-white"
                                        placeholder={getContentPlaceholder('email_order_modify_intro', 'Beste {klantnaam},\n\nUw bestelling is succesvol gewijzigd. Hieronder vindt u het actuele overzicht van de gewijzigde producten.')}
                                        value={getContentValue('email_order_modify_intro')}
                                        onChange={e => setContentValue('email_order_modify_intro', e.target.value)}
                                      />
                                    </div>
                                  </div>

                                  <div className="space-y-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="font-semibold text-xs text-gray-800">Bestelling Geannuleerd e-mail</div>
                                    <div>
                                      <label className="block text-[11px] font-medium text-gray-600 mb-1">Onderwerp</label>
                                      <input
                                        type="text"
                                        className="w-full px-2.5 py-1.5 border rounded text-xs bg-white"
                                        placeholder={getContentPlaceholder('email_order_cancel_subject', '❌ Bestelling Geannuleerd - {bedrijfsnaam}')}
                                        value={getContentValue('email_order_cancel_subject')}
                                        onChange={e => setContentValue('email_order_cancel_subject', e.target.value)}
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[11px] font-medium text-gray-600 mb-1">Inleidende tekst</label>
                                      <textarea
                                        rows={2}
                                        className="w-full px-2.5 py-1.5 border rounded text-xs bg-white"
                                        placeholder={getContentPlaceholder('email_order_cancel_intro', 'Beste {klantnaam},\n\nDe onderstaande bestelling is succesvol geannuleerd. Er wordt geen bereiding of bezorging meer uitgevoerd.')}
                                        value={getContentValue('email_order_cancel_intro')}
                                        onChange={e => setContentValue('email_order_cancel_intro', e.target.value)}
                                      />
                                    </div>
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
                                {SUGGESTED_TRANSLATION_TERMS.slice(0, 4).map((s, idx) => (
                                  <button
                                    key={`sug-top-${s.term}-${idx}`}
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
                                        {SUGGESTED_TRANSLATION_TERMS.map((s, idx) => (
                                          <button
                                            key={`sug-empty-${s.term}-${idx}`}
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
                                  {entries.map(([dutchTerm, engVal], idx) => (
                                    <div
                                      key={`custom-trans-${dutchTerm}-${idx}`}
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

                    ) : activeTab === 'deadlines' ? (
                      <DeadlinesManager
                        globalRules={localStoreSettings?.page_content?.modification_rules}
                        onSaveGlobalRules={handleSaveGlobalDeadlines}
                      />

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
                            {DAYS_OF_WEEK.map((day, idx) => {
                              const daySchedule = localStoreSettings.schedule[day.id] || { open: '00:00', close: '00:00', closed: false };
                              return (
                                <div key={`day-sched-${day.id || idx}-${idx}`} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50/50 rounded-xl border border-gray-100 gap-4">
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

                        {/* Order Modification Cutoff / Wijzigingstermijnen Snelle Toegang */}
                        <section className="bg-gradient-to-br from-blue-50/80 to-indigo-50/50 p-6 rounded-2xl border border-blue-200/80 shadow-xs">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <h3 className="text-lg font-serif font-bold text-[#05053D] flex items-center gap-2">
                                <Clock className="text-ob-blue" size={20} /> Bestelling Wijzigingstermijnen & Deadlines
                              </h3>
                              <p className="text-xs text-gray-600 mt-1 max-w-xl">
                                U kunt nu voor <strong>5 verschillende bestellingsgroottes</strong> (tot €100, tot €250, tot €500, tot €1.000 en &gt;€1.000) afzonderlijk de termijnen instellen voor annuleren, locatie wijzigen, tijdstip wijzigen, producten toevoegen of verwijderen.
                              </p>
                            </div>
                            <button 
                              type="button"
                              onClick={() => { setActiveTab('deadlines'); setImpersonating(null); setSelectedCompanyForDeadlines(null); }}
                              className="bg-[#5170ff] text-white px-4 py-2.5 rounded-lg text-xs font-bold hover:bg-blue-600 transition-colors shrink-0 flex items-center gap-2 cursor-pointer shadow-xs"
                            >
                              <Clock size={15} /> Naar Wijzigingstermijnen Tab
                            </button>
                          </div>
                          
                          <div className="mt-4 pt-3 border-t border-blue-200/60 flex items-center gap-2 text-xs text-blue-900">
                            <span>💡 Tip: U kunt deze regels ook <strong>per bedrijf individueel aanpassen</strong> in het tabblad "Klanten (Kantoren)".</span>
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
                            {registrations.map((reg, regIdx) => (
                              <div key={`reg-${reg.id || regIdx}-${regIdx}`} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
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
                            {customers.map((cust, custIdx) => (
                              <div key={`cust-${cust.id || custIdx}-${custIdx}`} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between gap-4 group hover:border-[#151f33] transition-colors">
                                <div>
                                  <div className="flex items-start justify-between mb-2">
                                    <h4 className="font-semibold text-lg text-ob-text">{cust.name}</h4>
                                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">Actief</span>
                                  </div>
                                  <p className="text-sm text-gray-500">{cust.address}</p>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <button 
                                    onClick={() => setImpersonating(cust)}
                                    className="flex-1 bg-gray-100 text-gray-700 px-3.5 py-2.5 rounded-lg text-xs font-semibold group-hover:bg-[#151f33] group-hover:text-white transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                                  >
                                    Beheren <ChevronRight size={14} />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedCompanyForDeadlines(cust)}
                                    className={`px-3 py-2.5 rounded-lg text-xs font-semibold border transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 ${
                                      cust.custom_deadlines?.use_custom
                                        ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                                    }`}
                                    title="Wijzigingstermijnen & deadlines voor dit bedrijf aanpassen"
                                  >
                                    <Clock size={13} className={cust.custom_deadlines?.use_custom ? "text-amber-600" : "text-gray-400"} />
                                    <span>{cust.custom_deadlines?.use_custom ? 'Aangepast' : 'Termijnen'}</span>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    
                    ) : activeTab === 'orders' ? (
                      <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <h3 className="text-xl font-bold text-[#05053D]">Alle {!isSidebarCollapsed && <span>Bestellingen</span>}</h3>
                            <p className="text-sm text-gray-500">Overzicht van alle geplaatste bestellingen (inclusief gasten).</p>
                          </div>
                          <div className="text-sm text-gray-500 font-medium">{orders.length} bestellingen totaal</div>
                        </div>

                        {(() => {
                          const deliveredOrdersMap = localStoreSettings?.page_content?.delivered_orders || {};

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
                                company_id: order.company_id || null,
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

                          // Extract unique companies for dropdown filter
                          const companyMap = new Map<string, string>();
                          (customers || []).forEach((c: any) => {
                            if (c.id && c.name) companyMap.set(c.id, c.name);
                          });
                          (orders || []).forEach((o: any) => {
                            if (o.company_id && o.ob_companies?.name) {
                              companyMap.set(o.company_id, o.ob_companies.name);
                            }
                          });
                          const filterCompanyList = Array.from(companyMap.entries())
                            .map(([id, name]) => ({ id, name }))
                            .sort((a, b) => a.name.localeCompare(b.name));

                          // Apply company and status filters
                          const filteredOrders = groupedOrders.filter((group: any) => {
                            // Filter by company
                            if (orderCompanyFilter === 'GUEST') {
                              if (group.company_id) return false;
                            } else if (orderCompanyFilter !== 'ALL') {
                              if (group.company_id !== orderCompanyFilter) return false;
                            }

                            // Filter by delivery status
                            const isDelivered = group.items.some((i: any) => i.delivery_status === 'delivered') || Boolean(deliveredOrdersMap[group.id]);
                            if (orderStatusFilter === 'delivered' && !isDelivered) return false;
                            if (orderStatusFilter === 'pending' && isDelivered) return false;

                            return true;
                          });

                          return (
                            <div className="space-y-4">
                              {/* Bedrijf & Status Filter balk */}
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
                                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 whitespace-nowrap">
                                    <Building2 className="w-4 h-4 text-[#05053D]" />
                                    <span>Filter op bedrijf:</span>
                                  </div>
                                  <select
                                    value={orderCompanyFilter}
                                    onChange={(e) => setOrderCompanyFilter(e.target.value)}
                                    className="w-full sm:max-w-xs px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-800 font-medium focus:ring-2 focus:ring-[#05053D] focus:border-[#05053D] outline-none"
                                  >
                                    <option value="ALL">🏢 Alle bedrijven & Gasten ({groupedOrders.length})</option>
                                    <option value="GUEST">👤 Alleen Gastbestellingen</option>
                                    {filterCompanyList.length > 0 && (
                                      <optgroup label="Geregistreerde bedrijven">
                                        {filterCompanyList.map((c, idx) => (
                                          <option key={`company-filter-${c.id || idx}-${idx}`} value={c.id}>
                                            {c.name}
                                          </option>
                                        ))}
                                      </optgroup>
                                    )}
                                  </select>

                                  <div className="flex items-center gap-1.5 pt-1 sm:pt-0">
                                    <span className="text-xs text-gray-500 font-medium whitespace-nowrap">Status:</span>
                                    <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5 text-xs">
                                      <button
                                        type="button"
                                        onClick={() => setOrderStatusFilter('ALL')}
                                        className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                                          orderStatusFilter === 'ALL' ? 'bg-white text-gray-900 shadow-sm font-semibold' : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                      >
                                        Alle
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setOrderStatusFilter('pending')}
                                        className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                                          orderStatusFilter === 'pending' ? 'bg-amber-100 text-amber-900 font-semibold shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                      >
                                        Openstaand
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setOrderStatusFilter('delivered')}
                                        className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                                          orderStatusFilter === 'delivered' ? 'bg-emerald-100 text-emerald-900 font-semibold shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                      >
                                        Voltooid
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                 <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5 text-xs text-gray-500">
                                  {/* Maandfactuur Genereren Knop */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (orderCompanyFilter !== 'ALL' && orderCompanyFilter !== 'GUEST') {
                                        setMonthlySelectedCompanyId(orderCompanyFilter);
                                      } else if (filterCompanyList.length > 0) {
                                        setMonthlySelectedCompanyId(filterCompanyList[0].id);
                                      }
                                      setIsMonthlySelectorOpen(true);
                                    }}
                                    className="px-3.5 py-1.5 bg-[#5170ff] hover:bg-blue-600 text-white font-medium rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
                                    title="Genereer een verzamelfactuur / maandfactuur over alle afgeronde bestellingen van een gekozen maand"
                                  >
                                    <Calendar className="w-3.5 h-3.5 text-[#b58b4c]" />
                                    <span>Maandfactuur Maken</span>
                                  </button>

                                  <div className="flex items-center gap-1.5">
                                    <span>Weergave: <strong className="text-gray-800">{filteredOrders.length}</strong> van {groupedOrders.length}</span>
                                    {(orderCompanyFilter !== 'ALL' || orderStatusFilter !== 'ALL') && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setOrderCompanyFilter('ALL');
                                          setOrderStatusFilter('ALL');
                                        }}
                                        className="ml-1 text-blue-600 hover:text-blue-800 font-medium underline"
                                      >
                                        Wissen
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {filteredOrders.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                                  <ShoppingBag className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                                  <p className="text-gray-500 font-medium">Geen bestellingen gevonden voor de geselecteerde filters.</p>
                                  {(orderCompanyFilter !== 'ALL' || orderStatusFilter !== 'ALL') && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setOrderCompanyFilter('ALL');
                                        setOrderStatusFilter('ALL');
                                      }}
                                      className="mt-3 text-xs font-semibold text-[#05053D] hover:underline"
                                    >
                                      Alle filters wissen
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <div className="w-full max-w-full overflow-auto custom-scrollbar bg-white border border-gray-200 rounded-xl max-h-[65vh] shadow-sm">
                                  <table className="w-full text-left border-collapse min-w-[1050px]">
                                    <thead>
                                      <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                                        <th className="p-4 font-semibold whitespace-nowrap">Datum (Besteld)</th>
                                        <th className="p-4 font-semibold">Klant & Contact</th>
                                        <th className="p-4 font-semibold min-w-[180px]">Afleveradres</th>
                                        <th className="p-4 font-semibold min-w-[200px]">Bestelling (Producten)</th>
                                        <th className="p-4 font-semibold text-right">Totaalprijs</th>
                                        <th className="p-4 font-semibold whitespace-nowrap">Gewenste Levering</th>
                                        <th className="p-4 font-semibold text-center whitespace-nowrap">Status</th>
                                        <th className="p-4 font-semibold text-right whitespace-nowrap">Acties</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                      {filteredOrders.map((group: any, groupIndex: number) => {
                                        const isDelivered = group.items.some((i: any) => i.delivery_status === 'delivered') || Boolean(deliveredOrdersMap[group.id]);
                                        const deliveredAt = group.items.find((i: any) => i.delivered_at)?.delivered_at || deliveredOrdersMap[group.id]?.delivered_at;

                                        return (
                                          <tr key={`order-row-${group.id || groupIndex}-${groupIndex}`} className={`hover:bg-gray-50/60 align-top transition-colors ${isDelivered ? 'bg-emerald-50/15' : ''}`}>
                                            <td className="p-4 text-sm text-gray-800 whitespace-nowrap">
                                              {new Date(group.created_at).toLocaleString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="p-4 text-sm text-gray-800">
                                              <div className="font-semibold text-[#05053D]">{group.company_name}</div>
                                              {group.items?.some((i: any) => i.status === 'cancelled') && (
                                                <span className="inline-block px-2 py-0.5 mt-1 rounded text-[11px] font-bold bg-red-100 text-red-700">
                                                  Geannuleerd
                                                </span>
                                              )}
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
                                                  <div key={`order-item-${group.id || groupIndex}-${item.id || i}-${i}`} className="text-sm">
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
                                            <td className="p-4 text-center whitespace-nowrap align-middle">
                                              {isDelivered ? (
                                                <div className="inline-flex flex-col items-center">
                                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                                    Voltooid & Afgeleverd
                                                  </span>
                                                  {deliveredAt && (
                                                    <span className="text-[10px] text-gray-400 mt-1">
                                                      {new Date(deliveredAt).toLocaleString('nl-NL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                  )}
                                                </div>
                                              ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                                                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                                                  Openstaand
                                                </span>
                                              )}
                                            </td>
                                            <td className="p-4 align-middle text-right whitespace-nowrap">
                                              <div className="flex items-center justify-end gap-2">
                                                {/* Factuur genereren / Downloaden knop (Mokum Local Kitchen) */}
                                                <button
                                                  type="button"
                                                  onClick={() => setSelectedInvoiceOrder(group)}
                                                  className={`text-xs px-2.5 py-1.5 font-medium rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-xs ${
                                                    isDelivered
                                                      ? 'bg-[#5170ff] hover:bg-blue-600 text-white border border-[#5170ff]'
                                                      : 'bg-white hover:bg-gray-100 text-[#05053D] border border-gray-300'
                                                  }`}
                                                  title="Factuur genereren, inzien of downloaden / printen als PDF"
                                                >
                                                  <Printer className={`w-3.5 h-3.5 ${isDelivered ? 'text-[#b58b4c]' : 'text-gray-600'}`} />
                                                  <span>Factuur / PDF</span>
                                                </button>

                                                {/* Factuur rechtstreeks mailen naar klant via Resend */}
                                                <button
                                                  type="button"
                                                  onClick={() => {
                                                    setSelectedInvoiceOrder(group);
                                                    setInvoiceModalInitialShowEmail(true);
                                                  }}
                                                  className="text-xs px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-medium rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-2xs"
                                                  title="Factuur met één klik rechtstreeks mailen naar de klant via Resend"
                                                >
                                                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                                                  <span>Mail Factuur</span>
                                                </button>

                                                {isDelivered ? (
                                                  <button
                                                    type="button"
                                                    onClick={() => handleToggleDeliveryStatus(group, 'pending')}
                                                    disabled={updatingDeliveryStatus === group.id}
                                                    className="text-xs px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-medium rounded-lg transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
                                                    title="Status herstellen naar Openstaand"
                                                  >
                                                    {updatingDeliveryStatus === group.id ? (
                                                      <span className="w-3.5 h-3.5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin inline-block"></span>
                                                    ) : (
                                                      <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                                                    )}
                                                    <span>Herstel</span>
                                                  </button>
                                                ) : (
                                                  <button
                                                    type="button"
                                                    onClick={() => handleToggleDeliveryStatus(group, 'delivered')}
                                                    disabled={updatingDeliveryStatus === group.id}
                                                    className="text-xs px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors inline-flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                                                    title="Markeer als Voltooid en afgeleverd"
                                                  >
                                                    {updatingDeliveryStatus === group.id ? (
                                                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block"></span>
                                                    ) : (
                                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                                    )}
                                                    <span>Markeer afgeleverd</span>
                                                  </button>
                                                )}

                                                <button 
                                                  type="button"
                                                  onClick={() => handleResendInvoice(group)}
                                                  disabled={resendingInvoice === group.id}
                                                  className="text-xs px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
                                                  title="Stuur factuur/bevestiging opnieuw naar ons toe"
                                                >
                                                  {resendingInvoice === group.id ? (
                                                    <span className="w-3.5 h-3.5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin inline-block"></span>
                                                  ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M2.13 15.57a9 9 0 1 0 3.87-11.45L2 6"/></svg>
                                                  )}
                                                  <span>Opnieuw sturen</span>
                                                </button>
                                              </div>
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              )}

                              {/* Maand- / Verzamelfactuur Kiezer Modal */}
                              {isMonthlySelectorOpen && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
                                  <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden my-auto border border-gray-200">
                                    {/* Header */}
                                    <div className="flex items-center justify-between px-6 py-4 bg-[#05053D] text-white border-b border-gray-800">
                                      <div className="flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-[#b58b4c]" />
                                        <h3 className="font-bold text-base">Maand- / Verzamelfactuur Genereren</h3>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => setIsMonthlySelectorOpen(false)}
                                        className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                                      >
                                        <X className="w-5 h-5" />
                                      </button>
                                    </div>

                                    <div className="p-6 space-y-5">
                                      <p className="text-xs text-gray-500 leading-relaxed">
                                        Kies een bedrijf en maand om alle afgeronde bestellingen samen te voegen op één officiële verzamelfactuur van Mokum Local Kitchen (inclusief eigen factuurnummer en BTW 9% specificatie).
                                      </p>

                                      {/* Bedrijf Selecteren */}
                                      <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                          Selecteer Bedrijf
                                        </label>
                                        <select
                                          value={monthlySelectedCompanyId}
                                          onChange={(e) => setMonthlySelectedCompanyId(e.target.value)}
                                          className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-800 font-medium focus:ring-2 focus:ring-[#05053D] outline-none"
                                        >
                                          {filterCompanyList.length === 0 && (
                                            <option value="">Geen geregistreerde bedrijven gevonden</option>
                                          )}
                                          {filterCompanyList.map((c, idx) => (
                                            <option key={`monthly-comp-${c.id || idx}-${idx}`} value={c.id}>
                                              {c.name}
                                            </option>
                                          ))}
                                        </select>
                                      </div>

                                      {/* Maand & Jaar */}
                                      <div className="grid grid-cols-2 gap-3">
                                        <div>
                                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                            Maand
                                          </label>
                                          <select
                                            value={monthlySelectedMonth}
                                            onChange={(e) => setMonthlySelectedMonth(Number(e.target.value))}
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-800 font-medium focus:ring-2 focus:ring-[#05053D] outline-none"
                                          >
                                            {MONTH_NAMES.map((name, idx) => (
                                              <option key={`month-opt-${name}-${idx}`} value={idx + 1}>
                                                {name}
                                              </option>
                                            ))}
                                          </select>
                                        </div>

                                        <div>
                                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                            Jaar
                                          </label>
                                          <select
                                            value={monthlySelectedYear}
                                            onChange={(e) => setMonthlySelectedYear(Number(e.target.value))}
                                            className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-800 font-medium focus:ring-2 focus:ring-[#05053D] outline-none"
                                          >
                                            {[2024, 2025, 2026, 2027].map((yr) => (
                                              <option key={`yr-opt-${yr}`} value={yr}>
                                                {yr}
                                              </option>
                                            ))}
                                          </select>
                                        </div>
                                      </div>

                                      {/* Alleen Afgeleverd Filter */}
                                      <div className="flex items-center gap-2 pt-1">
                                        <input
                                          type="checkbox"
                                          id="chkMonthlyOnlyDelivered"
                                          checked={monthlyOnlyDelivered}
                                          onChange={(e) => setMonthlyOnlyDelivered(e.target.checked)}
                                          className="w-4 h-4 rounded text-[#05053D] focus:ring-[#05053D] border-gray-300"
                                        />
                                        <label htmlFor="chkMonthlyOnlyDelivered" className="text-xs font-medium text-gray-700 cursor-pointer">
                                          Alleen afgeronde / voltooide bestellingen meenemen (status: Voltooid & Afgeleverd)
                                        </label>
                                      </div>

                                      {/* Overzicht van gevonden bestellingen */}
                                      {(() => {
                                        const matching: any[] = groupedOrders.filter((group: any) => {
                                          if (group.company_id !== monthlySelectedCompanyId) return false;
                                          const d = group.delivery_date ? new Date(group.delivery_date) : new Date(group.created_at);
                                          if (d.getFullYear() !== monthlySelectedYear) return false;
                                          if (d.getMonth() + 1 !== monthlySelectedMonth) return false;
                                          if (monthlyOnlyDelivered) {
                                            const isDeliv = group.items.some((i: any) => i.delivery_status === 'delivered') || Boolean(deliveredOrdersMap[group.id]);
                                            if (!isDeliv) return false;
                                          }
                                          return true;
                                        });

                                        const totalMonthlyAmount: number = matching.reduce((sum: number, g: any): number => {
                                          const disc = g.discount && Number(g.discount.amount) > 0 ? Number(g.discount.amount) : 0;
                                          return sum + Math.max(0, Number(g.total_order_price || 0) - disc);
                                        }, 0);

                                        return (
                                          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                                            <div className="flex items-center justify-between">
                                              <span className="text-xs font-bold text-gray-700">
                                                Gevonden bestellingen in {MONTH_NAMES[monthlySelectedMonth - 1]} {monthlySelectedYear}:
                                              </span>
                                              <span className={`text-xs px-2 py-0.5 rounded font-bold ${matching.length > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'}`}>
                                                {matching.length} bestelling{matching.length === 1 ? '' : 'en'}
                                              </span>
                                            </div>

                                            {matching.length > 0 ? (
                                              <div className="max-h-44 overflow-y-auto divide-y divide-gray-200 text-xs bg-white rounded-lg border border-gray-200 p-2">
                                                {matching.map((ord: any, ordIdx: number) => {
                                                  const dStr = ord.delivery_date 
                                                    ? new Date(ord.delivery_date).toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit' }) 
                                                    : new Date(ord.created_at).toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit' });
                                                  const disc = ord.discount && Number(ord.discount.amount) > 0 ? Number(ord.discount.amount) : 0;
                                                  const net = Math.max(0, Number(ord.total_order_price || 0) - disc);
                                                  return (
                                                    <div key={`matching-order-${ord.id || ordIdx}-${ordIdx}`} className="py-2 px-1 flex items-center justify-between gap-2">
                                                      <div>
                                                        <span className="font-semibold text-gray-900">{dStr}</span>{' '}
                                                        <span className="text-gray-500">({ord.delivery_time || '16:00'})</span>
                                                        <div className="text-[11px] text-gray-600 truncate max-w-xs">
                                                          {ord.items?.map((i: any) => `${i.product_name} (${i.portion_size}st)`).join(', ')}
                                                        </div>
                                                      </div>
                                                      <span className="font-bold text-gray-900 shrink-0">€{net.toFixed(2)}</span>
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            ) : (
                                              <div className="text-center py-4 text-xs text-gray-500 bg-white rounded-lg border border-dashed border-gray-300">
                                                Geen bestellingen gevonden voor dit bedrijf in {MONTH_NAMES[monthlySelectedMonth - 1]} {monthlySelectedYear}.
                                              </div>
                                            )}

                                            <div className="flex justify-between items-center pt-2 border-t border-gray-200 text-xs font-bold text-gray-900">
                                              <span>Totaalbedrag verzamelfactuur:</span>
                                              <span className="text-sm text-emerald-800">€{totalMonthlyAmount.toFixed(2)}</span>
                                            </div>

                                            {/* Actieknoppen */}
                                            <div className="flex items-center justify-end gap-3 pt-3">
                                              <button
                                                type="button"
                                                onClick={() => setIsMonthlySelectorOpen(false)}
                                                className="px-4 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                                              >
                                                Annuleren
                                              </button>

                                              <button
                                                type="button"
                                                disabled={matching.length === 0}
                                                onClick={() => {
                                                  const comp = customers.find((c: any) => c.id === monthlySelectedCompanyId) || 
                                                    { id: monthlySelectedCompanyId, name: (matching[0] as any)?.company_name || 'Bedrijf' };
                                                  setSelectedMonthlyInvoiceData({
                                                    company: comp,
                                                    month: monthlySelectedMonth,
                                                    year: monthlySelectedYear,
                                                    monthName: `${MONTH_NAMES[monthlySelectedMonth - 1]} ${monthlySelectedYear}`,
                                                    orders: matching,
                                                  });
                                                  setIsMonthlySelectorOpen(false);
                                                }}
                                                className="px-4 py-2 bg-[#5170ff] hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
                                              >
                                                <Printer className="w-3.5 h-3.5 text-[#b58b4c]" />
                                                <span>Verzamelfactuur Openen & Downloaden</span>
                                              </button>
                                            </div>
                                          </div>
                                        );
                                      })()}
                                    </div>
                                  </div>
                                </div>
                              )}
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
                               {dbProducts.length > 0 ? (
                                 Array.from(new Set(dbProducts.map(p => (p.name || '').trim()))).filter(Boolean).map((prodName, idx) => (
                                   <option key={`price-prod-${prodName}-${idx}`} value={prodName}>{prodName}</option>
                                 ))
                               ) : AVAILABLE_PRODUCTS.map((prod, idx) => (
                                 <option key={`price-avail-${prod.trim()}-${idx}`} value={prod.trim()}>{prod.trim()}</option>
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
                               {customers.map((c, idx) => (
                                 <option key={`price-cust-${c.id || idx}-${idx}`} value={c.id}>{c.name}</option>
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
                                const cleanSelected = selectedPriceProduct.trim().toLowerCase();
                                const selectedProdObj = dbProducts.find(p => (p.name || '').trim().toLowerCase() === cleanSelected);
                                const portionsToUse = selectedProdObj?.portions && selectedProdObj.portions.length > 0 ? selectedProdObj.portions : PORTIONS;
                                return (
                                  <tbody className="divide-y divide-gray-100">
                                    {portionsToUse.map((portion: number, portionIdx: number) => (
                                      <tr key={`portion-row-${portion}-${portionIdx}`} className="hover:bg-gray-50/50 transition-colors">
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
                           const cleanSelected = selectedPriceProduct.trim().toLowerCase();
                           const prod = dbProducts.find(p => (p.name || '').trim().toLowerCase() === cleanSelected);
                           if (prod && prod.variants && prod.variants.length > 0) {
                             const portionsToUse = prod.portions && prod.portions.length > 0 ? prod.portions : PORTIONS;
                             return (
                               <div className="mt-8">
                                 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                                   <div>
                                     <h4 className="text-sm font-semibold text-gray-700">Prijzen per variant (Totaalbedrag per portie)</h4>
                                     <p className="text-xs text-gray-500">Vul hier per variant de complete portieprijs in. De eventuele meerprijs t.o.v. de basisprijs wordt automatisch berekend en bewaard.</p>
                                   </div>
                                 </div>
                                 <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto shadow-sm">
                                   <table className="w-full text-left text-sm">
                                     <thead className="bg-gray-50 border-b border-gray-200">
                                       <tr>
                                         <th className="px-4 py-3 font-semibold text-gray-700">Variant</th>
                                         {portionsToUse.map((size: number, sizeIdx: number) => {
                                            const baseP = getDisplayPrice(size);
                                            return (
                                              <th key={`hdr-size-${size}-${sizeIdx}`} className="px-4 py-3 font-semibold text-gray-700 text-right min-w-[140px]">
                                                <div>{size} st.</div>
                                                <div className="text-[11px] font-normal text-gray-500">
                                                  Basisprijs: {baseP !== '' ? `€${Number(baseP).toFixed(2)}` : 'N.v.t.'}
                                                </div>
                                              </th>
                                            );
                                         })}
                                       </tr>
                                     </thead>
                                     <tbody className="divide-y divide-gray-100">
                                       {prod.variants.map((v: string, vIdx: number) => (
                                         <tr key={`var-row-${v}-${vIdx}`} className="hover:bg-gray-50/50 transition-colors">
                                           <td className="px-4 py-3 text-gray-800 font-medium">{v}</td>
                                           {portionsToUse.map((size: number, sIdx: number) => {
                                              const key = `${v}_${size}`;
                                              const baseP = Number(getDisplayPrice(size)) || 0;
                                              const currentVal = variantFullPrices[key] !== undefined ? variantFullPrices[key] : '';
                                              const numVal = typeof currentVal === 'number' ? currentVal : parseFloat(String(currentVal));
                                              const diff = (!isNaN(numVal) && baseP > 0) ? Math.round((numVal - baseP) * 100) / 100 : null;

                                              return (
                                                <td key={`var-cell-${v}-${size}-${sIdx}`} className="px-4 py-2.5 text-right">
                                                  <div className="flex flex-col items-end gap-1">
                                                    <div className="flex items-center gap-1 justify-end">
                                                      <span className="text-gray-500 text-xs">€</span>
                                                      <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        placeholder={baseP > 0 ? baseP.toFixed(2) : '0.00'}
                                                        className="w-24 px-2 py-1.5 border border-gray-300 rounded-lg text-right focus:outline-none focus:border-[#151f33] focus:ring-1 focus:ring-[#151f33] text-sm font-semibold"
                                                        value={currentVal}
                                                        onChange={(e) => {
                                                          const val = e.target.value;
                                                          setVariantFullPrices(prev => ({
                                                            ...prev,
                                                            [key]: val
                                                          }));
                                                        }}
                                                      />
                                                    </div>
                                                    {diff !== null && (
                                                      <span className={`text-[11px] font-medium ${diff > 0 ? 'text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded' : diff < 0 ? 'text-green-700 bg-green-50 px-1.5 py-0.5 rounded' : 'text-gray-400'}`}>
                                                        {diff > 0 ? `+€${diff.toFixed(2)} toeslag` : diff < 0 ? `-€${Math.abs(diff).toFixed(2)} korting` : 'Gelijk aan basis'}
                                                      </span>
                                                    )}
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

      {/* Factuur Modal (Mokum Local Kitchen - Single of Maandfactuur) */}
      {(selectedInvoiceOrder || selectedMonthlyInvoiceData) && (
        <InvoiceModal
          isOpen={Boolean(selectedInvoiceOrder || selectedMonthlyInvoiceData)}
          onClose={() => {
            setSelectedInvoiceOrder(null);
            setSelectedMonthlyInvoiceData(null);
            setInvoiceModalInitialShowEmail(false);
          }}
          orderGroup={selectedInvoiceOrder}
          monthlyData={selectedMonthlyInvoiceData}
          initialShowEmail={invoiceModalInitialShowEmail}
          customerCompany={
            selectedInvoiceOrder?.company_id 
              ? customers.find((c: any) => c.id === selectedInvoiceOrder.company_id) 
              : selectedMonthlyInvoiceData?.company
          }
          storeSettings={localStoreSettings}
        />
      )}
    </AnimatePresence>
  );
}
