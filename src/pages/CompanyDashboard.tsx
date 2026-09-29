import { useState, useEffect, FormEvent } from 'react';
import { supabase, ObCompany } from '../lib/supabase';
import { 
  getAllOrderActionsStatus, 
  getApplicableTier, 
  DEFAULT_MODIFICATION_RULES, 
  ModificationRulesConfig,
  DEADLINE_ACTION_LABELS
} from '../lib/orderDeadlines';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Building, MapPin, Users, Package, Save, CheckCircle2, Plus, Trash2, Mail, Lock, UserPlus, Eye, EyeOff, ShoppingBag, ListOrdered, Truck, Loader2, Edit2, XCircle, AlertTriangle, Calendar, Clock, X, Phone } from 'lucide-react';

type Tab = 'settings' | 'addresses' | 'employees' | 'assortment' | 'orders';

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
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  // Assortment State
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [allDeliveryMethods, setAllDeliveryMethods] = useState<any[]>([]);
  const [selectedDeliveryMethods, setSelectedDeliveryMethods] = useState<string[]>([]);

  // Order Management State (Wijzigen & Annuleren)
  const [selectedOrderForCancel, setSelectedOrderForCancel] = useState<any | null>(null);
  const [selectedOrderForModify, setSelectedOrderForModify] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [modifyDate, setModifyDate] = useState('');
  const [modifyTime, setModifyTime] = useState('');
  const [modifyNotes, setModifyNotes] = useState('');
  const [modifyPhone, setModifyPhone] = useState('');
  const [isModifying, setIsModifying] = useState(false);
  const [orderActionMessage, setOrderActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [minOrderModifyHours, setMinOrderModifyHours] = useState<number>(2);
  const [storeDeadlinesConfig, setStoreDeadlinesConfig] = useState<ModificationRulesConfig | null>(null);
  const [priceMap, setPriceMap] = useState<Record<string, number>>({});
  const [modifyItems, setModifyItems] = useState<any[]>([]);
  const [modifyAddressId, setModifyAddressId] = useState<string>('');
  const [addProdName, setAddProdName] = useState<string>('');
  const [addVariant, setAddVariant] = useState<string>('');
  const [addPortion, setAddPortion] = useState<number>(25);

  const getEffectiveDeadlines = () => {
    if (company?.custom_deadlines?.use_custom && company.custom_deadlines.tiers && company.custom_deadlines.tiers.length > 0) {
      return {
        enabled: true,
        tiers: company.custom_deadlines.tiers
      };
    }
    return storeDeadlinesConfig || DEFAULT_MODIFICATION_RULES;
  };

  const getOrderActions = (group: any) => {
    const rules = getEffectiveDeadlines();
    const totalAmount = group?.total_order_price || 0;
    return getAllOrderActionsStatus(
      group?.delivery_date,
      group?.delivery_time,
      totalAmount,
      rules,
      minOrderModifyHours
    );
  };

  const canModifyOrder = (deliveryDate?: string, deliveryTime?: string, totalAmount: number = 0) => {
    const rules = getEffectiveDeadlines();
    const actions = getAllOrderActionsStatus(deliveryDate, deliveryTime, totalAmount, rules, minOrderModifyHours);
    return actions.change_time.allowed || actions.change_location.allowed || actions.add_products.allowed || actions.remove_products.allowed;
  };

  const getItemPrice = (prodName: string, portion: number, variant?: string) => {
    const clean = (prodName || '').trim();
    let basePrice = priceMap[`${clean}_${portion}`] || priceMap[`${prodName}_${portion}`] || 0;
    const prodObj = dbProducts.find((p: any) => p.name === prodName || p.name?.trim() === clean);
    if (basePrice === 0 && prodObj?.base_prices && prodObj.base_prices[portion]) {
      basePrice = Number(prodObj.base_prices[portion]) || 0;
    }
    let surcharge = 0;
    if (prodObj && variant && prodObj.variant_surcharges) {
      surcharge = Number(prodObj.variant_surcharges[`${variant}_${portion}`]) || 0;
    }
    return basePrice + surcharge;
  };

  const handleAddProduct = () => {
    if (!addProdName) return;
    const finalName = addVariant ? `${addProdName} (${addVariant})` : addProdName;
    const price = getItemPrice(addProdName, addPortion, addVariant);

    setModifyItems(prev => [
      ...prev,
      {
        id: 'new_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        product_name: finalName,
        portion_size: addPortion,
        price: price,
        total_price: price,
        is_new: true
      }
    ]);

    setAddProdName('');
    setAddVariant('');
  };

  const handleRemoveModifyItem = (idxToRemove: number) => {
    if (modifyItems.length <= 1) {
      alert("Een bestelling moet minimaal 1 product of bezorgoptie bevatten. Als u de hele bestelling wilt annuleren, gebruik dan de knop 'Annuleren'.");
      return;
    }
    setModifyItems(prev => prev.filter((_, idx) => idx !== idxToRemove));
  };

  const openCancelModal = (group: any) => {
    const actions = getOrderActions(group);
    if (!actions.cancel.allowed) {
      setOrderActionMessage({
        type: 'error',
        text: actions.cancel.message || `Deze bestelling kan niet meer worden geannuleerd omdat het bezorgmoment korter dan ${actions.cancel.requiredHours} uur van tevoren is wegens voorbereidingstijd in de keuken.`
      });
      return;
    }
    setSelectedOrderForCancel(group);
    setCancelReason('');
    setOrderActionMessage(null);
  };

  const openModifyModal = (group: any) => {
    const actions = getOrderActions(group);
    const anyAllowed = actions.change_time.allowed || actions.change_location.allowed || actions.add_products.allowed || actions.remove_products.allowed;
    if (!anyAllowed) {
      setOrderActionMessage({
        type: 'error',
        text: `Deze bestelling kan niet meer worden gewijzigd omdat alle wijzigingstermijnen voor dit bestelbedrag zijn verstreken.`
      });
      return;
    }
    setSelectedOrderForModify(group);
    setModifyDate(group.delivery_date || new Date().toISOString().split('T')[0]);
    setModifyTime(group.delivery_time && !group.delivery_time.includes('snel') ? group.delivery_time : '12:00');
    setModifyAddressId(group.items[0]?.address_id || (addresses.length > 0 ? addresses[0].id : ''));
    setModifyNotes(group.notes || '');
    setModifyPhone(group.phone || '');
    setModifyItems(group.items.map((it: any) => ({ ...it })));
    setAddProdName('');
    setAddVariant('');
    setAddPortion(25);
    setOrderActionMessage(null);
  };

  const handleCancelOrder = async () => {
    if (!selectedOrderForCancel) return;
    const actions = getOrderActions(selectedOrderForCancel);
    if (!actions.cancel.allowed) {
      setOrderActionMessage({
        type: 'error',
        text: actions.cancel.message || `Bestelling kan niet meer worden geannuleerd binnen ${actions.cancel.requiredHours} uur voor levering.`
      });
      return;
    }
    setIsCancelling(true);
    setOrderActionMessage(null);
    try {
      const orderIds = selectedOrderForCancel.items.map((i: any) => i.id);
      let biteberryOrderId = null;
      for (const item of selectedOrderForCancel.items) {
        if (item.extra_notes) {
          try {
            const parsed = JSON.parse(item.extra_notes);
            if (parsed.biteberry_order_id) {
              biteberryOrderId = parsed.biteberry_order_id;
              break;
            }
          } catch (e) {}
        }
      }

      const res = await fetch('/api/orders/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderIds,
          reason: cancelReason,
          customerEmail: company?.billing_email,
          customerName: company?.name,
          companyName: company?.name,
          companyId: company?.id,
          deliveryDate: selectedOrderForCancel.delivery_date,
          deliveryTime: selectedOrderForCancel.delivery_time,
          items: selectedOrderForCancel.items,
          totalPrice: selectedOrderForCancel.total_order_price,
          biteberryOrderId
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Fout bij annuleren');

      // Update local state immediately
      setOrders(prev => prev.map(o => orderIds.includes(o.id) ? { ...o, status: 'cancelled' } : o));
      setOrderActionMessage({
        type: 'success',
        text: 'Bestelling is succesvol geannuleerd. Dit is direct doorgegeven aan Biteberry en per e-mail bevestigd.'
      });
      setSelectedOrderForCancel(null);
      setCancelReason('');
    } catch (err: any) {
      console.error(err);
      setOrderActionMessage({
        type: 'error',
        text: err.message || 'Er ging iets mis bij het annuleren van de bestelling.'
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleModifyOrder = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForModify) return;
    if (modifyItems.length === 0) {
      alert("Een bestelling moet minimaal 1 product bevatten.");
      return;
    }

    const actions = getOrderActions(selectedOrderForModify);

    // Controleer tijdstipwijziging
    const isDateTimeChanged = modifyDate !== selectedOrderForModify.delivery_date || modifyTime !== selectedOrderForModify.delivery_time;
    if (isDateTimeChanged && !actions.change_time.allowed) {
      setOrderActionMessage({
        type: 'error',
        text: actions.change_time.message || `Het bezorgmoment kan niet meer worden gewijzigd (minimaal ${actions.change_time.requiredHours} uur voorbereidingstijd vereist).`
      });
      return;
    }

    // Controleer locatiewijziging
    const oldAddressId = selectedOrderForModify.items[0]?.address_id;
    const isLocationChanged = Boolean(modifyAddressId && oldAddressId && modifyAddressId !== oldAddressId);
    if (isLocationChanged && !actions.change_location.allowed) {
      setOrderActionMessage({
        type: 'error',
        text: actions.change_location.message || `De bezorglocatie kan niet meer worden gewijzigd (minimaal ${actions.change_location.requiredHours} uur voorbereidingstijd vereist).`
      });
      return;
    }

    // Controleer producten toevoegen
    const isProductsAdded = modifyItems.some((it: any) => it.is_new || !selectedOrderForModify.items.some((orig: any) => orig.id === it.id));
    if (isProductsAdded && !actions.add_products.allowed) {
      setOrderActionMessage({
        type: 'error',
        text: actions.add_products.message || `Er kunnen geen producten meer worden toegevoegd (minimaal ${actions.add_products.requiredHours} uur voorbereidingstijd vereist).`
      });
      return;
    }

    // Controleer producten verwijderen
    const isProductsRemoved = selectedOrderForModify.items.some((orig: any) => !modifyItems.some((it: any) => it.id === orig.id));
    if (isProductsRemoved && !actions.remove_products.allowed) {
      setOrderActionMessage({
        type: 'error',
        text: actions.remove_products.message || `Er kunnen geen producten meer worden geschrapt uit de order (minimaal ${actions.remove_products.requiredHours} uur voorbereidingstijd vereist).`
      });
      return;
    }

    setIsModifying(true);
    setOrderActionMessage(null);
    try {
      const orderIds = selectedOrderForModify.items.map((i: any) => i.id);
      let biteberryOrderId = null;
      for (const item of selectedOrderForModify.items) {
        if (item.extra_notes) {
          try {
            const parsed = JSON.parse(item.extra_notes);
            if (parsed.biteberry_order_id) {
              biteberryOrderId = parsed.biteberry_order_id;
              break;
            }
          } catch (e) {}
        }
      }

      const calculatedTotal = modifyItems.reduce((sum, it) => sum + (Number(it.total_price || it.price) || 0), 0);

      const res = await fetch('/api/orders/modify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderIds,
          newDeliveryDate: modifyDate,
          newDeliveryTime: modifyTime,
          newAddressId: modifyAddressId || selectedOrderForModify.items[0]?.address_id,
          newNotes: modifyNotes,
          newPhone: modifyPhone,
          oldDeliveryDate: selectedOrderForModify.delivery_date,
          oldDeliveryTime: selectedOrderForModify.delivery_time,
          customerEmail: company?.billing_email,
          customerName: company?.name,
          companyName: company?.name,
          companyId: company?.id,
          addressId: modifyAddressId || selectedOrderForModify.items[0]?.address_id,
          userId: selectedOrderForModify.items[0]?.user_id,
          items: modifyItems,
          totalPrice: calculatedTotal,
          biteberryOrderId
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Fout bij wijzigen');

      // Refresh company data to get the newly synced order lines from Supabase
      await fetchCompanyData();

      setOrderActionMessage({
        type: 'success',
        text: 'Bestelling is succesvol gewijzigd. De producten, bezorglocatie en/of het bezorgmoment zijn direct bijgewerkt en per e-mail bevestigd.'
      });
      setSelectedOrderForModify(null);
    } catch (err: any) {
      console.error(err);
      setOrderActionMessage({
        type: 'error',
        text: err.message || 'Er ging iets mis bij het wijzigen van de bestelling.'
      });
    } finally {
      setIsModifying(false);
    }
  };

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

        
        // Fetch products
        let prodsList: any[] = [];
        try {
          const { data: prods } = await supabase.from('ob_products').select('*').order('sort_order', { ascending: true, nullsFirst: false }).order('created_at', { ascending: true });
          if (prods) {
            setDbProducts(prods);
            prodsList = prods;
          }
        } catch (e) {
          console.warn('No products table');
        }

        
        // Fetch assortment
        const { data: assortData } = await supabase.from('ob_company_assortment').select('product_name').eq('company_id', comp.id);
        if (assortData) setSelectedProducts(assortData.map((a: any) => a.product_name));

        // Fetch all active delivery methods
        const { data: dmData } = await supabase.from('ob_delivery_methods').select('*').eq('is_active', true).order('sort_order', { ascending: true });
        if (dmData) setAllDeliveryMethods(dmData);
        
        // Fetch selected delivery methods
        const { data: cdmData } = await supabase.from('ob_company_delivery_methods').select('delivery_method_id').eq('company_id', comp.id);
        if (cdmData) setSelectedDeliveryMethods(cdmData.map((a: any) => a.delivery_method_id));


        // Fetch employees
        const { data: empData } = await supabase.from('ob_user_profiles').select('*').eq('company_id', comp.id).eq('role', 'employee');
        if (empData) setEmployees(empData);
        
        // Fetch orders
        const { data: orderData } = await supabase.from('ob_orders').select('*, ob_company_addresses(*)').eq('company_id', comp.id).order('created_at', { ascending: false });
        if (orderData) setOrders(orderData);

        // Fetch product prices
        const { data: priceData } = await supabase.from('ob_product_prices').select('*');
        if (priceData) {
          const pMap: Record<string, number> = {};
          
          // 1. Default prices (no company_id)
          priceData.filter((p: any) => !p.company_id).forEach((p: any) => {
            const clean = (p.product_name || '').trim();
            pMap[`${clean}_${p.portion_size}`] = parseFloat(p.price);
            pMap[`${p.product_name}_${p.portion_size}`] = parseFloat(p.price);
          });

          // 2. Company specific override
          priceData.filter((p: any) => p.company_id === comp.id).forEach((p: any) => {
            const clean = (p.product_name || '').trim();
            pMap[`${clean}_${p.portion_size}`] = parseFloat(p.price);
            pMap[`${p.product_name}_${p.portion_size}`] = parseFloat(p.price);
          });

          // 3. Cross-link with prodsList
          if (prodsList.length > 0) {
            prodsList.forEach((prodItem: any) => {
              const prodName = prodItem.name || '';
              const cleanProdName = prodName.trim();
              priceData.forEach((p: any) => {
                const pClean = (p.product_name || '').trim();
                if (pClean.toLowerCase() === cleanProdName.toLowerCase()) {
                  const price = parseFloat(p.price);
                  pMap[`${prodName}_${p.portion_size}`] = price;
                  pMap[`${cleanProdName}_${p.portion_size}`] = price;
                }
              });
            });
          }

          setPriceMap(pMap);
        }

        // Fetch store_settings for preparation cutoff and modification rules
        const { data: stData } = await supabase.from('store_settings').select('*').eq('id', 1).maybeSingle();
        if (stData?.page_content?.min_order_modify_hours !== undefined) {
          setMinOrderModifyHours(Number(stData.page_content.min_order_modify_hours));
        }
        if (stData?.page_content?.modification_rules) {
          setStoreDeadlinesConfig(stData.page_content.modification_rules);
        }
        if (stData?.page_content?.company_deadlines && comp?.id && stData.page_content.company_deadlines[comp.id]) {
          setCompany(prev => prev ? {
            ...prev,
            custom_deadlines: prev.custom_deadlines || stData.page_content?.company_deadlines?.[comp.id]
          } : null);
        }
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
      const { error: delError } = await supabase.from('ob_company_delivery_methods').delete().eq('company_id', company.id);
      if (delError) {
        alert('Fout bij opslaan: ' + delError.message);
        setIsSaving(false);
        return;
      }
      if (selectedDeliveryMethods.length > 0) {
        const inserts = selectedDeliveryMethods.map(id => ({ company_id: company.id, delivery_method_id: id }));
        const { error: insError } = await supabase.from('ob_company_delivery_methods').insert(inserts);
        if (insError) {
          alert('Fout bij opslaan: ' + insError.message);
          setIsSaving(false);
          return;
        }
      }
      showSuccess();
    }
    setIsSaving(false);
  };

    const handleSaveAssortment = async () => {
    if (!company) return;
    setIsSaving(true);

    if (supabase) {
      // Clear old assortment
      const { error: delError } = await supabase.from('ob_company_assortment').delete().eq('company_id', company.id);
      if (delError) {
        alert('Fout bij opslaan (rechten probleem?): ' + delError.message);
        setIsSaving(false);
        return;
      }
      
      // Insert new assortment
      if (selectedProducts.length > 0) {
        const inserts = selectedProducts.map(p => ({ company_id: company.id, product_name: p }));
        const { error: insError } = await supabase.from('ob_company_assortment').insert(inserts);
        if (insError) {
          alert('Fout bij opslaan (rechten probleem?): ' + insError.message);
          setIsSaving(false);
          return;
        }
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
    <div className="min-h-screen bg-[#f4f6f9] pt-24 pb-20 font-serif overflow-x-hidden">
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
                <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-3 px-6 py-4 text-sm font-semibold transition-colors shrink-0 ${activeTab === 'orders' ? 'bg-[#151f33] text-white border-l-4 border-white' : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'}`}>
                    <ShoppingBag size={18} /> Bestelgeschiedenis
                  </button>
                  
                <button onClick={() => setActiveTab('assortment')} className={`w-full flex items-center gap-3 px-6 py-4 text-sm font-semibold transition-colors shrink-0 ${activeTab === 'assortment' ? 'bg-[#151f33] text-white border-l-4 border-white' : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'}`}>
                  <ListOrdered size={20} />
                  <span>Assortiment</span>
                </button>
                <button onClick={() => setActiveTab('delivery')} className={`w-full flex items-center gap-3 px-6 py-4 text-sm font-semibold transition-colors shrink-0 ${activeTab === 'delivery' ? 'bg-[#151f33] text-white border-l-4 border-white' : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'}`}>
                  <Truck size={20} />
                  <span>Bezorgopties</span>
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
          <div className="flex-1 min-w-0 bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
            
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

            
            {/* Tab: Orders */}
            {activeTab === 'orders' && (
              <div className="space-y-6 max-w-5xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-ob-text mb-1">Bestelgeschiedenis & Beheer</h2>
                    <p className="text-gray-500 text-sm">Bekijk al uw bestellingen en pas bezorgmomenten aan of annuleer indien nodig.</p>
                  </div>
                </div>

                {orderActionMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl flex items-center justify-between gap-3 text-sm font-medium ${
                      orderActionMessage.type === 'success'
                        ? 'bg-green-50 text-green-800 border border-green-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {orderActionMessage.type === 'success' ? <CheckCircle2 size={18} className="text-green-600 shrink-0" /> : <AlertTriangle size={18} className="text-red-600 shrink-0" />}
                      <span>{orderActionMessage.text}</span>
                    </div>
                    <button onClick={() => setOrderActionMessage(null)} className="text-gray-400 hover:text-gray-600">
                      <X size={16} />
                    </button>
                  </motion.div>
                )}
                
                {(() => {
                  const groupedOrders = Object.values(orders.reduce((acc, order) => {
                    const dateKey = new Date(order.created_at).toISOString().slice(0, 16);
                    const key = `${order.company_id || 'gast'}_${dateKey}_${order.delivery_date}_${order.delivery_time}`;
                    if (!acc[key]) {
                      let address = '';
                      if (order.ob_company_addresses) {
                        address = order.ob_company_addresses.address_line;
                        if (order.ob_company_addresses.label) {
                          address = `${order.ob_company_addresses.label} - ${address}`;
                        }
                      }

                      acc[key] = {
                        id: key,
                        created_at: order.created_at,
                        delivery_date: order.delivery_date,
                        delivery_time: order.delivery_time,
                        phone: order.phone || '',
                        notes: order.notes || '',
                        address: address,
                        total_order_price: 0,
                        status: order.status || 'pending',
                        items: []
                      };
                    }
                    acc[key].items.push(order);
                    acc[key].total_order_price += Number(order.total_price || 0);
                    if (order.status === 'cancelled') {
                      acc[key].status = 'cancelled';
                    }
                    return acc;
                  }, {} as Record<string, any>)).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

                  if (groupedOrders.length === 0) {
                    return (
                      <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <ShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                        <h3 className="text-lg font-medium text-gray-900">Geen bestellingen gevonden</h3>
                        <p className="text-gray-500 text-sm">Er zijn nog geen bestellingen geplaatst door dit bedrijf.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="w-full max-w-full overflow-auto custom-scrollbar bg-white border border-gray-200 rounded-xl max-h-[65vh]">
                      <table className="w-full text-left text-xs border-collapse min-w-[1000px]">
                        <thead>
                          <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                            <th className="py-3.5 px-4 font-semibold whitespace-nowrap">Datum (Besteld)</th>
                            <th className="py-3.5 px-4 font-semibold whitespace-nowrap">Contact & Adres</th>
                            <th className="py-3.5 px-4 font-semibold min-w-[200px]">Bestelling (Producten)</th>
                            <th className="py-3.5 px-4 font-semibold text-right whitespace-nowrap">Totaalprijs</th>
                            <th className="py-3.5 px-4 font-semibold whitespace-nowrap">Gewenste Levering</th>
                            <th className="py-3.5 px-4 font-semibold text-center whitespace-nowrap">Status & Acties</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {groupedOrders.map((group: any) => {
                            const isCancelled = group.status === 'cancelled';
                            return (
                              <tr key={group.id} className={`hover:bg-gray-50/50 align-top transition-colors ${isCancelled ? 'bg-gray-50/40 opacity-75' : ''}`}>
                                <td className="py-3 px-4 text-xs text-gray-800 whitespace-nowrap font-medium">
                                  {new Date(group.created_at).toLocaleString('nl-NL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td className="py-3 px-4 text-xs text-gray-700 max-w-[200px]">
                                  {group.phone && <div className="text-gray-900 font-semibold">{group.phone}</div>}
                                  {group.address ? (
                                    <div className="text-gray-500 text-[11px] mt-0.5 leading-snug">{group.address}</div>
                                  ) : (
                                    <span className="text-gray-400 italic text-[11px]">Geen adres</span>
                                  )}
                                  {group.notes && (
                                    <div className="text-xs text-gray-500 mt-1 italic line-clamp-2" title={group.notes}>
                                      📝 {group.notes}
                                    </div>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-xs">
                                  <div className="space-y-1">
                                    {group.items.map((item: any, i: number) => (
                                      <div key={item.id || i} className="text-xs flex items-center justify-between gap-3">
                                        <span className={`${isCancelled ? 'line-through text-gray-400' : 'text-gray-800 font-medium'}`}>
                                          {item.product_name} <span className="text-gray-500 font-normal">({item.portion_size}x)</span>
                                        </span>
                                        <span className="text-[11px] text-gray-400 shrink-0">€{Number(item.price || 0).toFixed(2)}</span>
                                      </div>
                                    ))}
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-xs text-gray-900 font-bold text-right whitespace-nowrap">
                                  €{group.total_order_price.toFixed(2)}
                                </td>
                                <td className="py-3 px-4 text-xs text-gray-700 whitespace-nowrap">
                                  <div className="font-medium">
                                    {group.delivery_date ? new Date(group.delivery_date).toLocaleDateString('nl-NL') : 'Onbekend'}
                                  </div>
                                  {group.delivery_time && <div className="text-[11px] text-gray-500">{group.delivery_time}</div>}
                                </td>
                                <td className="py-3 px-4 text-xs align-middle text-center whitespace-nowrap">
                                  {(() => {
                                    if (isCancelled) {
                                      return (
                                        <div className="inline-flex flex-col items-center gap-0.5">
                                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                                            <XCircle size={12} /> Geannuleerd
                                          </span>
                                          <span className="text-[10px] text-gray-400 italic">Geen verdere acties</span>
                                        </div>
                                      );
                                    }

                                    const actions = getOrderActions(group);
                                    const canAnyModify = actions.change_time.allowed || actions.change_location.allowed || actions.add_products.allowed || actions.remove_products.allowed;
                                    const canCancel = actions.cancel.allowed;

                                    if (!canAnyModify && !canCancel) {
                                      return (
                                        <div className="inline-flex flex-col items-center gap-0.5">
                                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200" title="Niet meer aanpasbaar: alle deadlines zijn verstreken">
                                            <Lock size={11} className="text-gray-400" /> Niet aanpasbaar
                                          </span>
                                          <span className="text-[10px] text-gray-400">Termijnen verstreken</span>
                                        </div>
                                      );
                                    }

                                    return (
                                      <div className="flex items-center justify-center gap-1.5">
                                        {canAnyModify ? (
                                          <button
                                            onClick={() => openModifyModal(group)}
                                            className="px-2.5 py-1.5 text-xs font-semibold text-[#05053D] bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center gap-1 transition-colors border border-blue-200 cursor-pointer shadow-2xs"
                                            title="Bestelling wijzigen"
                                          >
                                            <Edit2 size={12} /> Wijzigen
                                          </button>
                                        ) : (
                                          <span className="px-2 py-1 text-[11px] text-gray-400 bg-gray-50 border border-gray-200 rounded flex items-center gap-1 cursor-not-allowed">
                                            <Lock size={10} /> Wijzigen verlopen
                                          </span>
                                        )}

                                        {canCancel ? (
                                          <button
                                            onClick={() => openCancelModal(group)}
                                            className="px-2.5 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg flex items-center gap-1 transition-colors border border-red-200 cursor-pointer shadow-2xs"
                                            title="Bestelling annuleren"
                                          >
                                            <Trash2 size={12} /> Annuleren
                                          </button>
                                        ) : (
                                          <span className="px-2 py-1 text-[11px] text-gray-400 bg-gray-50 border border-gray-200 rounded flex items-center gap-1 cursor-not-allowed">
                                            <Lock size={10} /> Annuleren verlopen
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })()}
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
            )}


            {/* Tab: Assortment */}
            
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
                    <label key={method.id} className={`flex flex-col gap-3 p-4 border rounded-xl cursor-pointer transition-colors ${selectedDeliveryMethods.includes(method.id) ? 'border-ob-blue bg-blue-50/30 ring-1 ring-ob-blue' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
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
                        <span className="font-semibold text-[#05053D]">€{Number(method.price).toFixed(2)}{method.name?.toLowerCase().includes('uitserveren') ? ' / uur (uurtarief)' : ''}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}

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
                  {(dbProducts.length > 0 ? dbProducts : AVAILABLE_PRODUCTS).map(product => (
                    <label key={product.name} className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${selectedProducts.includes(product.name) ? 'border-ob-blue bg-blue-50/30 ring-1 ring-ob-blue' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                      <div className="w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        <img src={product.image_url || product.image} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
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

      {/* MODAL: Bestelling Annuleren */}
      {selectedOrderForCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-gray-100"
          >
            <div className="bg-red-50 p-6 border-b border-red-100 flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">Bestelling Annuleren</h3>
                <p className="text-xs text-red-700 mt-1">
                  Weet u zeker dat u deze bestelling wilt annuleren? Deze actie kan niet ongedaan worden gemaakt.
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderForCancel(null)}
                disabled={isCancelling}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 text-xs space-y-1.5 border border-gray-100">
                <div className="flex justify-between font-semibold text-gray-800">
                  <span>Geplande levering:</span>
                  <span>{selectedOrderForCancel.delivery_date} om {selectedOrderForCancel.delivery_time}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Aantal producten:</span>
                  <span>{selectedOrderForCancel.items?.length || 0} regels</span>
                </div>
                <div className="flex justify-between font-bold text-[#05053D] pt-1 border-t border-gray-200">
                  <span>Totaalbedrag:</span>
                  <span>€{Number(selectedOrderForCancel.total_order_price || 0).toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Reden van annulering (optioneel voor de keuken/beheer):
                </label>
                <textarea
                  rows={2}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Bijv. vergadering verplaatst of borrel vervalt..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-red-500 resize-none"
                />
              </div>

              <p className="text-[11px] text-gray-500 italic">
                ℹ️ Bij bevestiging wordt deze annulering direct verwerkt in ons systeem (BiteBerry) en ontvangt u een bevestigingsmail.
              </p>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedOrderForCancel(null)}
                  disabled={isCancelling}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Bestelling Behouden
                </button>
                <button
                  type="button"
                  onClick={handleCancelOrder}
                  disabled={isCancelling}
                  className="px-5 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 shadow-xs"
                >
                  {isCancelling ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Annuleren verwerken...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Definitief Annuleren
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* MODAL: Bestelling Wijzigen */}
      {selectedOrderForModify && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar border border-gray-100 my-8"
          >
            <div className="bg-[#05053D] text-white p-5 flex items-start justify-between sticky top-0 z-20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <Edit2 size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Bestelling Wijzigen</h3>
                  <p className="text-xs text-white/70">Producten toevoegen/verwijderen, bezorgmoment of notities aanpassen</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrderForModify(null)}
                disabled={isModifying}
                className="text-white/70 hover:text-white p-1"
              >
                <X size={20} />
              </button>
            </div>

            {(() => {
              const calculatedModifyTotal = modifyItems.reduce((sum, it) => sum + (Number(it.total_price || it.price) || 0), 0);
              const effectiveOrderTotal = calculatedModifyTotal > 0 ? calculatedModifyTotal : (Number(selectedOrderForModify?.total_order_price) || 0);
              const effectiveRules = getEffectiveDeadlines();
              const modalTier = getApplicableTier(effectiveOrderTotal, effectiveRules);
              const modalActions = getAllOrderActionsStatus(
                selectedOrderForModify.delivery_date,
                selectedOrderForModify.delivery_time,
                effectiveOrderTotal,
                effectiveRules,
                minOrderModifyHours
              );

              return (
                <form onSubmit={handleModifyOrder} className="p-6 space-y-6">
                  {/* Producten Beheren Sectie */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                        <ShoppingBag size={14} className="text-ob-blue" /> Producten in deze Bestelling ({modifyItems.length})
                      </label>
                      <span className="text-[11px] text-gray-500">
                        Minimaal 1 product vereist
                      </span>
                    </div>

                    {/* Lijst van huidige items */}
                    <div className="space-y-2 border border-gray-200 rounded-xl p-3 bg-gray-50/50 max-h-52 overflow-y-auto custom-scrollbar">
                      {modifyItems.length === 0 ? (
                        <div className="text-xs text-red-500 italic p-3 text-center bg-red-50 rounded-lg">
                          Geen producten meer in de bestelling. Voeg minimaal 1 product toe hieronder.
                        </div>
                      ) : (
                        modifyItems.map((item, idx) => (
                          <div key={item.id || idx} className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-gray-200 shadow-2xs">
                            <div className="flex-1 min-w-0 pr-3">
                              <div className="text-xs font-semibold text-gray-900 truncate">
                                {item.product_name}
                              </div>
                              <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
                                <span>Portie: {item.portion_size} stuks</span>
                                {item.is_new && (
                                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded-full font-medium border border-emerald-200">
                                    Nieuw toegevoegd
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3 shrink-0">
                              <span className="text-xs font-bold text-gray-900">
                                €{Number(item.total_price || item.price || 0).toFixed(2)}
                              </span>
                              {modalActions.remove_products.allowed ? (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveModifyItem(idx)}
                                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                                  title="Product verwijderen"
                                >
                                  <Trash2 size={15} />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  disabled
                                  className="p-1.5 text-gray-300 cursor-not-allowed"
                                  title={`Producten verwijderen niet meer mogelijk (< ${modalActions.remove_products.requiredHours}u voor levering)`}
                                >
                                  <Lock size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Product Toevoegen Kaart */}
                    {modalActions.add_products.allowed ? (
                      <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl space-y-3">
                        <div className="text-xs font-bold text-[#05053D] flex items-center gap-1.5">
                          <Plus size={14} className="text-ob-blue" />
                          <span>Product Toevoegen aan Bestelling</span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                          {/* Product selectie */}
                          <div className="sm:col-span-5">
                            <label className="block text-[11px] font-semibold text-gray-700 mb-1">Product</label>
                            <select
                              value={addProdName}
                              onChange={(e) => {
                                const pName = e.target.value;
                                setAddProdName(pName);
                                const pObj = dbProducts.find((p: any) => p.name === pName || p.name?.trim() === pName.trim());
                                const pPortions = (pObj?.portions && pObj.portions.length > 0) ? pObj.portions : [25, 50, 100, 200];
                                if (!pPortions.includes(addPortion)) {
                                  setAddPortion(pPortions[0]);
                                }
                                const pVariants = pObj?.variants || [];
                                setAddVariant(pVariants.length > 0 ? pVariants[0] : '');
                              }}
                              className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-ob-blue font-medium"
                            >
                              <option value="">-- Kies een snack / product --</option>
                              {(dbProducts.length > 0 ? dbProducts : AVAILABLE_PRODUCTS).map((p: any) => (
                                <option key={p.name} value={p.name}>{p.name}</option>
                              ))}
                            </select>
                          </div>

                          {/* Variant selectie (indien aanwezig) */}
                          {(() => {
                            const selectedObj = dbProducts.find((p: any) => p.name === addProdName || p.name?.trim() === (addProdName || '').trim());
                            const vars = selectedObj?.variants || [];
                            if (vars.length === 0) return null;
                            return (
                              <div className="sm:col-span-3">
                                <label className="block text-[11px] font-semibold text-gray-700 mb-1">Variant</label>
                                <select
                                  value={addVariant}
                                  onChange={(e) => setAddVariant(e.target.value)}
                                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-ob-blue font-medium"
                                >
                                  {vars.map((v: string) => (
                                    <option key={v} value={v}>{v}</option>
                                  ))}
                                </select>
                              </div>
                            );
                          })()}

                          {/* Portie selectie */}
                          <div className={(() => {
                            const selectedObj = dbProducts.find((p: any) => p.name === addProdName || p.name?.trim() === (addProdName || '').trim());
                            const vars = selectedObj?.variants || [];
                            return vars.length > 0 ? 'sm:col-span-2' : 'sm:col-span-4';
                          })()}>
                            <label className="block text-[11px] font-semibold text-gray-700 mb-1">Portie</label>
                            <select
                              value={addPortion}
                              onChange={(e) => setAddPortion(Number(e.target.value))}
                              className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-ob-blue font-medium"
                            >
                              {(() => {
                                const selectedObj = dbProducts.find((p: any) => p.name === addProdName || p.name?.trim() === (addProdName || '').trim());
                                const portions = (selectedObj?.portions && selectedObj.portions.length > 0) ? selectedObj.portions : [25, 50, 100, 200];
                                return portions.map((num: number) => (
                                  <option key={num} value={num}>{num} stuks</option>
                                ));
                              })()}
                            </select>
                          </div>

                          {/* Prijsweergave & Toevoegknop */}
                          <div className="sm:col-span-2 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={handleAddProduct}
                              disabled={!addProdName}
                              className="w-full px-3 py-1.5 text-xs font-bold text-white bg-ob-blue hover:bg-[#0c1322] disabled:opacity-40 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer shadow-2xs"
                            >
                              <Plus size={14} /> Toevoegen
                            </button>
                          </div>
                        </div>

                        {addProdName && (
                          <div className="text-[11px] text-blue-900 font-medium flex items-center justify-between pt-1 border-t border-blue-200/50">
                            <span>Prijs voor deze selectie:</span>
                            <span className="font-bold">€{getItemPrice(addProdName, addPortion, addVariant).toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          <Lock size={14} className="text-gray-400" />
                          <span>Producten toevoegen is niet meer mogelijk voor deze bestelling.</span>
                        </div>
                        <span className="text-[11px] text-gray-400">&lt; {modalActions.add_products.requiredHours}u voor bezorging</span>
                      </div>
                    )}

                    {/* Subtotaal & Nieuw Besteltotaal */}
                    <div className="flex items-center justify-between p-3 bg-gray-100/80 border border-gray-200 rounded-xl">
                      <span className="text-xs font-bold text-gray-700">Nieuw Besteltotaal:</span>
                      <span className="text-sm font-bold text-[#05053D]">
                        €{modifyItems.reduce((sum, it) => sum + (Number(it.total_price || it.price) || 0), 0).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Bezorglocatie, Moment & Contactgegevens */}
                  <div className="space-y-3 pt-2 border-t border-gray-100">
                    {/* Afleverlocatie / Adres */}
                    {addresses.length > 0 && (
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <MapPin size={13} className="text-ob-blue" /> Bezorglocatie / Afleveradres
                          </span>
                          {!modalActions.change_location.allowed && (
                            <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                              <Lock size={10} /> Locatie wijzigen niet mogelijk (&lt; {modalActions.change_location.requiredHours}u)
                            </span>
                          )}
                        </label>
                        <select
                          value={modifyAddressId}
                          onChange={(e) => setModifyAddressId(e.target.value)}
                          disabled={!modalActions.change_location.allowed}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-ob-blue bg-white disabled:bg-gray-100 disabled:text-gray-500 font-medium"
                        >
                          {addresses.map((addr) => (
                            <option key={addr.id} value={addr.id}>
                              {addr.label} &mdash; {addr.address_line}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Calendar size={13} className="text-ob-blue" /> Nieuwe Bezorgdatum
                          </span>
                          {!modalActions.change_time.allowed && (
                            <span className="text-[10px] text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 flex items-center gap-1">
                              <Lock size={10} /> Vast (&lt; {modalActions.change_time.requiredHours}u)
                            </span>
                          )}
                        </label>
                        <input
                          type="date"
                          required
                          disabled={!modalActions.change_time.allowed}
                          min={new Date().toISOString().split('T')[0]}
                          value={modifyDate}
                          onChange={(e) => setModifyDate(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-ob-blue disabled:bg-gray-100 disabled:text-gray-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Clock size={13} className="text-ob-blue" /> Nieuwe Bezorgtijd
                          </span>
                          {!modalActions.change_time.allowed && (
                            <span className="text-[10px] text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 flex items-center gap-1">
                              <Lock size={10} /> Vast
                            </span>
                          )}
                        </label>
                        <input
                          type="time"
                          required
                          disabled={!modalActions.change_time.allowed}
                          value={modifyTime}
                          onChange={(e) => setModifyTime(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-ob-blue disabled:bg-gray-100 disabled:text-gray-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                        <Phone size={13} className="text-ob-blue" /> Telefoonnummer Contactpersoon / Chauffeur
                      </label>
                      <input
                        type="tel"
                        required
                        value={modifyPhone}
                        onChange={(e) => setModifyPhone(e.target.value)}
                        placeholder="06 1234 5678"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-ob-blue"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Aangepaste Notities / Instructies voor Keuken & Chauffeur:
                      </label>
                      <textarea
                        rows={2}
                        value={modifyNotes}
                        onChange={(e) => setModifyNotes(e.target.value)}
                        placeholder="Bijv. melden bij receptie 2e verdieping..."
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-ob-blue resize-none"
                      />
                    </div>
                  </div>

                  {/* Informatie en wijzigingstermijn */}
                  <div className="bg-gradient-to-br from-slate-50 to-blue-50/30 border border-slate-200/90 rounded-2xl p-4 sm:p-5 text-xs text-slate-800 space-y-3.5 shadow-2xs">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200/80">
                      <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200/80 flex items-center justify-center shrink-0">
                        <Clock size={16} className="text-rose-600" />
                      </div>
                      <div>
                        <div className="text-[11px] uppercase tracking-wider font-semibold text-slate-500">Annuleringsdeadline</div>
                        <div className="text-sm font-bold text-slate-900">
                          tot <span className="text-rose-600">{modalTier.deadlines.cancel} uur</span> voor bezorging
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-slate-700 mb-2.5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#05053D]"></span>
                        U kunt de volgende wijzigingen doorvoeren tot:
                      </div>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
                        {/* Locatie wijzigen */}
                        <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
                            <MapPin size={13} className="text-ob-blue shrink-0" />
                            <span>Locatie wijzigen</span>
                          </div>
                          <div className="font-bold text-slate-900 text-xs sm:text-[13px]">
                            tot {modalTier.deadlines.change_location}u voor bezorging
                          </div>
                        </div>

                        {/* Tijdstip wijzigen */}
                        <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
                            <Calendar size={13} className="text-ob-blue shrink-0" />
                            <span>Tijdstip wijzigen</span>
                          </div>
                          <div className="font-bold text-slate-900 text-xs sm:text-[13px]">
                            tot {modalTier.deadlines.change_time}u voor bezorging
                          </div>
                        </div>

                        {/* Producten toevoegen */}
                        <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
                            <Plus size={13} className="text-emerald-600 shrink-0" />
                            <span>Producten toevoegen</span>
                          </div>
                          <div className="font-bold text-slate-900 text-xs sm:text-[13px]">
                            tot {modalTier.deadlines.add_products}u voor bezorging
                          </div>
                        </div>

                        {/* Producten schrappen */}
                        <div className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium">
                            <Trash2 size={13} className="text-rose-500 shrink-0" />
                            <span>Producten schrappen</span>
                          </div>
                          <div className="font-bold text-slate-900 text-xs sm:text-[13px]">
                            tot {modalTier.deadlines.remove_products}u voor bezorging
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedOrderForModify(null)}
                      disabled={isModifying}
                      className="px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
                    >
                      Sluiten
                    </button>
                    <button
                      type="submit"
                      disabled={isModifying || modifyItems.length === 0}
                      className="px-5 py-2 text-sm font-semibold text-white bg-[#05053D] hover:bg-[#1a2a47] rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 shadow-xs cursor-pointer"
                    >
                      {isModifying ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Opslaan & Doorvoeren...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={16} />
                          Wijzigingen Opslaan
                        </>
                      )}
                    </button>
                  </div>
                </form>
              );
            })()}
          </motion.div>
        </div>
      )}
    </div>
  );
}
