import React, { useState, useEffect, FormEvent, MouseEvent } from 'react';
import { supabase, sortVariantsByCategory, DiscountCode, validateDiscountCode, recordDiscountCodeUsage, PackagingOption, isItemVisibleForBrand, CURRENT_BRAND } from '../lib/supabase';
import { getTypographyStyle } from '../lib/typography';
import { useLanguage } from '../contexts/LanguageContext';
import { getDeliveryMethodName, getDeliveryMethodDescription, getSnackExtraInfo } from '../lib/translationFallbacks';
import { useNavigate } from 'react-router-dom';
import { PackageOpen, MapPin, Phone, ShoppingBag, CheckCircle2 , Clock, Calendar, Truck, X, Info, Utensils, ShieldCheck, Tag, Percent, Gift, CheckCircle, Package, ArrowDown, Compass, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { PrivacyModal } from '../components/PrivacyModal';
import { useModerator } from '../contexts/ModeratorContext';
import { EditableText } from '../components/EditableText';

const PRODUCT_IMAGES: Record<string, string> = {
  'Snack Mix': 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/img_0743d367c64afbf145e9c0fea03ba65553996e64ffef54a95252060ee7ac758c/responsive320',
  'Bitterballen': 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/233e7d3e-19d8-4504-adf9-2100d5c71800/responsive640',
  'Vlammetjes': 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/c3a12a9a-1fd9-4041-11a7-c2ba71d3c100/responsive960',
  'Frikandelletjes': 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/089a0deb-f72e-46b4-cd48-de98d1f82a00/responsive640',
  'Mini Kroketjes': 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/53ee579e-f63d-4c57-8f54-dae1e90a1c00/responsive640',
  'Chicken Wings': 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/ee601f8d-efac-4ef4-2cee-c4c59c117200/responsive640',
  'Kipnuggets': 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/b58dad40-1353-4159-e305-2669d75f6b00/responsive640',
  'Karaage Kip': 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/img_5991de8e937102a4dd1ef314fb255423bf85586b62f82c8285e054e14615ce52/responsive640',
  'Butterfly Gamba\'s': 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/8688dded-96d4-414f-e816-8553f5ec8000/responsive640',
  'Kaasstengels': 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/img_8d2216804329784b49540823b54b47525bfcf318725033896b6fb9646d6cc0d1/responsive640',
  'Curry Samosas': 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/ae28ddae-8a3f-4049-3527-09fa31308f00/responsive640',
  'Mini Loempia': 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/9eab1d3b-96cc-449a-e6af-7a4ee6e66d00/responsive640',
  'Vegan Bitterballen': 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/img_382e6f9d8eabd5d872ed938ed4c12f25c6696f38b8ab2d2791d968c2783fd954/responsive640'
};

const PORTION_SIZES = [25, 50, 100, 150];

type Address = {
  id: string;
  label: string;
  address_line: string;
  instructions?: string;
};

type PriceMap = Record<string, number>;

export function EmployeeOrdering() {
  const { t, language } = useLanguage();
  const { storeSettings } = useModerator();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [emailFailed, setEmailFailed] = useState(false);
  const [error, setError] = useState('');
  
  const [companyId, setCompanyId] = useState('');
  const [userId, setUserId] = useState('');
  const [companyName, setCompanyName] = useState('');
  
  const [assortment, setAssortment] = useState<string[]>([]);
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [categoryDescriptions, setCategoryDescriptions] = useState<Record<string, string>>({});
  const [categoryRestrictions, setCategoryRestrictions] = useState<Record<string, string[]>>({});
  const [pageContent, setPageContent] = useState<any>({});

  const activeContent = storeSettings?.page_content || pageContent;

  const getDynamicText = (key: string, defaultNl: string, defaultEn?: string) => {
    if (language === 'en' && activeContent?.[`${key}_en`]) {
      return activeContent[`${key}_en`];
    }
    if (activeContent?.[key]) {
      return activeContent[key];
    }
    return t(defaultNl, defaultEn || defaultNl);
  };
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [prices, setPrices] = useState<PriceMap>({});
  
  const [maxSpendLimit, setMaxSpendLimit] = useState<number | null>(null);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  const [deliveryMethods, setDeliveryMethods] = useState<any[]>([]);
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState<any>(null);

  // New multi-select state
  const [infoModalProduct, setInfoModalProduct] = useState<any | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [selections, setSelections] = useState<Record<string, Record<string, number>>>({});
  const [selectedAddress, setSelectedAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const sessionPref = sessionStorage.getItem('deliveryPref');
  const initialDeliveryMode = sessionPref === 'scheduled' ? 'scheduled' : 'zsm';
  const [deliveryMode, setDeliveryMode] = useState<'zsm' | 'scheduled'>(initialDeliveryMode);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');

  // Discount / Coupon states for companies
  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>([]);
  const [couponInput, setCouponInput] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<DiscountCode | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState('');

  // Packaging option state
  const [selectedPackagingOption, setSelectedPackagingOption] = useState<PackagingOption | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('');

  const handleApplyCoupon = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCouponError(null);
    setCouponSuccess(null);

    const clean = couponInput.trim().toUpperCase().replace(/\s+/g, '');
    if (!clean) {
      setCouponError('Vul a.u.b. een kortingscode in.');
      return;
    }

    // Geen stacking: als er al een code actief is
    if (appliedDiscount) {
      setCouponError(`Er is al een kortingscode actief (${appliedDiscount.code}). Kortingscodes kunnen niet gestapeld worden. Verwijder eerst de huidige code.`);
      return;
    }

    const found = discountCodes.find(c => c.code.toUpperCase() === clean);
    if (!found) {
      setCouponError('Deze kortingscode is ongeldig.');
      return;
    }

    // Validatie op actief, minimum orderbedrag, max_uses_total en max_uses_per_person
    const validation = validateDiscountCode(found, totalOrderPrice, userEmail || userId);
    if (!validation.valid) {
      setCouponError(validation.error || 'Deze kortingscode kan niet worden toegepast.');
      return;
    }

    setAppliedDiscount(found);
    if (found.type === 'percentage') {
      const disc = (totalOrderPrice * found.value) / 100;
      setCouponSuccess(`Code "${found.code}" toegepast: ${found.value}% korting (-€${disc.toFixed(2)})!`);
    } else {
      setCouponSuccess(`Code "${found.code}" toegepast: Gratis ${found.free_product?.portion_size} stuks ${found.free_product?.product_name}!`);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedDiscount(null);
    setCouponInput('');
    setCouponError(null);
    setCouponSuccess(null);
  };


  useEffect(() => {
    fetchData();
  }, []);

  const getVariantSurcharge = (productName: string, variant: string, size: string | number) => {
    if (!variant) return 0;
    const cleanName = (productName || '').trim().toLowerCase();
    const prod = dbProducts.find(p => p.name === productName || (p.name || '').trim().toLowerCase() === cleanName);
    if (!prod || !prod.variant_surcharges) return 0;
    return prod.variant_surcharges[`${variant}_${size}`] || prod.variant_surcharges[variant] || 0;
  };

  const handlePortionSelect = (product: string, size: number, variant: string = '') => {
    setSelections(prev => {
      const currentObj = prev[product] || {};
      const key = variant ? `${size}_${variant}` : `${size}`;
      const currentQty = currentObj[key] || 0;
      return {
        ...prev,
        [product]: {
          ...currentObj,
          [key]: currentQty + 1
        }
      };
    });
  };

  const handlePortionDeselect = (product: string, size: number, variant: string = '', e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setSelections(prev => {
      const currentObj = prev[product] || {};
      const key = variant ? `${size}_${variant}` : `${size}`;
      const currentQty = currentObj[key] || 0;
      
      if (currentQty <= 1) {
        const newObj = { ...currentObj };
        delete newObj[key];
        if (Object.keys(newObj).length === 0) {
          const newSelections = { ...prev };
          delete newSelections[product];
          return newSelections;
        }
        return { ...prev, [product]: newObj };
      }
      return {
        ...prev,
        [product]: {
          ...currentObj,
          [key]: currentQty - 1
        }
      };
    });
  };

  const totalOrderPrice = Object.entries(selections).reduce((sum, [prod, sizes]) => {
    let prodSum = 0;
    const cleanProd = (prod || '').trim();
    for (const [s, qty] of Object.entries(sizes as any)) {
      const parts = String(s).split('_');
      const sizeNum = parts[0];
      const variant = parts[1] || '';
      const basePrice = prices[`${cleanProd}_${sizeNum}`] ?? prices[`${prod}_${sizeNum}`] ?? 0;
      const surcharge = getVariantSurcharge(prod, variant, sizeNum);
      prodSum += (basePrice + surcharge) * (qty as number);
    }
    return sum + prodSum;
  }, 0);

  const selectedItemsList = Object.entries(selections).flatMap(([prod, sizes]) => {
    const cleanProd = (prod || '').trim();
    return Object.entries(sizes as Record<string, number>).map(([s, qty]) => {
      const parts = String(s).split('_');
      const sizeNum = parts[0];
      const variant = parts[1] || '';
      const basePrice = prices[`${cleanProd}_${sizeNum}`] ?? prices[`${prod}_${sizeNum}`] ?? 0;
      const surcharge = getVariantSurcharge(prod, variant, sizeNum);
      const unitPrice = basePrice + surcharge;
      const itemTotal = unitPrice * (qty as number);
      return {
        product: prod,
        size: Number(sizeNum),
        variant,
        qty: Number(qty),
        unitPrice,
        itemTotal,
        key: `${prod}_${s}`
      };
    });
  });

  const discountAmount = (appliedDiscount && appliedDiscount.type === 'percentage')
    ? (totalOrderPrice * (appliedDiscount.value || 0)) / 100
    : 0;

  const rawPackagingOptions: PackagingOption[] = pageContent?.packaging_options || [];
  const availablePackagingOptions = rawPackagingOptions.filter((opt: PackagingOption) => {
    if (!opt.is_active) return false;
    const hasCompanyException = opt.allowed_company_ids && companyId && (
      opt.allowed_company_ids.includes(companyId) || 
      (companyName && opt.allowed_company_ids.includes(companyName))
    );
    if (!hasCompanyException && !isItemVisibleForBrand(opt.allowed_brands)) {
      return false;
    }
    if (opt.available_for_all_companies) return true;
    if (hasCompanyException) return true;
    return false;
  });

  const packagingPrice = Number(selectedPackagingOption?.price) || 0;
  const deliveryPrice = Number(selectedDeliveryMethod?.price) || 0;
  const finalTotalAmount = Math.max(0, totalOrderPrice - discountAmount) + deliveryPrice + packagingPrice;

  useEffect(() => {
    if (availablePackagingOptions.length > 0) {
      if (!selectedPackagingOption || !availablePackagingOptions.some(o => o.id === selectedPackagingOption.id)) {
        setSelectedPackagingOption(availablePackagingOptions[0]);
      }
    } else {
      if (selectedPackagingOption) {
        setSelectedPackagingOption(null);
      }
    }
  }, [pageContent?.packaging_options, companyId, companyName]);

  const fetchData = async () => {
    if (!supabase) {
      setAssortment(['Snack Mix', 'Bitterballen']);
      setAddresses([{ id: 'a1', label: 'Receptie', address_line: 'Straat 1' }]);
      setPrices({ 
        'Snack Mix_25': 24.00, 'Snack Mix_50': 45.00,
        'Bitterballen_25': 22.00, 'Bitterballen_50': 40.00,
      });
      setCompanyName("Mock Company BV");
      setIsLoading(false);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      setUserId(session.user.id);

      const { data: profile } = await supabase.from('ob_user_profiles').select('*').eq('id', session.user.id).single();
      setUserEmail(session.user.email || profile?.billing_email || profile?.email || '');
      
      if (!profile || (profile.role !== 'employee' && profile.role !== 'office_manager' && profile.role !== 'admin')) {
        navigate('/'); 
        return;
      }

            const compId = profile.company_id;
      if (!compId || compId === 'null') {
         setError('Geen bedrijf gekoppeld aan dit account.');
         setIsLoading(false);
         return;
      }
      setCompanyId(compId);

      const { data: comp } = await supabase.from('ob_companies').select('name, employee_spend_limit').eq('id', compId).single();
      if (comp) {
        setCompanyName(comp.name);
        setMaxSpendLimit(comp.employee_spend_limit);
      }

      const { data: assortData } = await supabase.from('ob_company_assortment').select('product_name').eq('company_id', compId);
      if (assortData) setAssortment(assortData.map((a: any) => a.product_name));

      const { data: addrData } = await supabase.from('ob_company_addresses').select('*').eq('company_id', compId);
      if (addrData) setAddresses(addrData);

      let prods = null;
      let deliveryTrans: Record<string, { name_en?: string; description_en?: string }> = {};
      try {
        const [prodsRes, storeRes] = await Promise.all([
          supabase.from('ob_products').select('*').order('sort_order', { ascending: true, nullsFirst: false }).order('created_at', { ascending: true }),
          supabase.from('store_settings').select('page_content').eq('id', 1).maybeSingle()
        ]);
        const brandsMap: Record<string, string> = storeRes?.data?.page_content?.product_brands || {};
        const hideImagesMap: Record<string, boolean> = storeRes?.data?.page_content?.hide_image_products || {};
        const catDescMap: Record<string, string> = storeRes?.data?.page_content?.category_descriptions || {};
        const companyRestrictionsMap: Record<string, string[]> = storeRes?.data?.page_content?.company_restricted_products || {};
        const catRestrictionsMap: Record<string, string[]> = storeRes?.data?.page_content?.category_restricted_companies || {};
        const prodTranslations: Record<string, { extra_info_en?: string }> = storeRes?.data?.page_content?.product_translations || {};
        deliveryTrans = storeRes?.data?.page_content?.delivery_translations || {};
        setCategoryDescriptions(catDescMap);
        setCategoryRestrictions(catRestrictionsMap);
        if (storeRes?.data?.page_content) {
          setPageContent(storeRes.data.page_content);
          const loadedCodes: DiscountCode[] = storeRes.data.page_content.discount_codes || [];
          setDiscountCodes(loadedCodes);
        }
        if (prodsRes.data) {
          prods = prodsRes.data.map((p: any) => ({
            ...p,
            brand: p.brand || brandsMap[p.id] || brandsMap[p.name] || '',
            extra_info: p.extra_info || '',
            extra_info_en: p.extra_info_en || prodTranslations[p.id]?.extra_info_en || prodTranslations[p.name]?.extra_info_en || prodTranslations[(p.name || '').trim()]?.extra_info_en || '',
            hide_image: p.hide_image != null ? Boolean(p.hide_image) : Boolean(hideImagesMap[p.id] || hideImagesMap[p.name] || hideImagesMap[(p.name || '').trim()]),
            allowed_company_ids: p.allowed_company_ids || companyRestrictionsMap[p.id] || companyRestrictionsMap[p.name] || companyRestrictionsMap[(p.name || '').trim()] || []
          }));
        }
      } catch (e) {
        console.warn('No products table or store_settings');
      }
      if (prods) setDbProducts(prods);
      const { data: priceData } = await supabase.from('ob_product_prices').select('*');
      if (priceData) {
        const pMap: PriceMap = {};
        const allPrices = priceData;
        
        // 1. Universal standard prices (no company_id, brand is null or 'office_butler')
        allPrices
          .filter((p: any) => !p.company_id && (!p.brand || p.brand === 'office_butler'))
          .forEach((p: any) => {
            const cleanName = (p.product_name || '').trim();
            const price = parseFloat(p.price);
            pMap[`${cleanName}_${p.portion_size}`] = price;
            pMap[`${p.product_name}_${p.portion_size}`] = price;
          });

        // 2. Concept / Brand specific standard price override (no company_id, brand === CURRENT_BRAND)
        if (CURRENT_BRAND !== 'office_butler') {
          allPrices
            .filter((p: any) => !p.company_id && p.brand === CURRENT_BRAND)
            .forEach((p: any) => {
              const cleanName = (p.product_name || '').trim();
              const price = parseFloat(p.price);
              pMap[`${cleanName}_${p.portion_size}`] = price;
              pMap[`${p.product_name}_${p.portion_size}`] = price;
            });
        }

        // 3. Company specific override (highest priority: specific deals for this company)
        allPrices
          .filter((p: any) => p.company_id === compId)
          .forEach((p: any) => {
            const cleanName = (p.product_name || '').trim();
            const price = parseFloat(p.price);
            pMap[`${cleanName}_${p.portion_size}`] = price;
            pMap[`${p.product_name}_${p.portion_size}`] = price;
          });

        // Cross-link with dbProducts in case product.name has whitespace or different casing
        if (prods) {
          prods.forEach((prodItem: any) => {
            const prodName = prodItem.name || '';
            const cleanProdName = prodName.trim();
            // A. Base default
            allPrices
              .filter((p: any) => !p.company_id && (!p.brand || p.brand === 'office_butler'))
              .forEach((p: any) => {
                const pClean = (p.product_name || '').trim();
                if (pClean.toLowerCase() === cleanProdName.toLowerCase()) {
                  const price = parseFloat(p.price);
                  pMap[`${prodName}_${p.portion_size}`] = price;
                  pMap[`${cleanProdName}_${p.portion_size}`] = price;
                }
              });

            // B. Brand override
            if (CURRENT_BRAND !== 'office_butler') {
              allPrices
                .filter((p: any) => !p.company_id && p.brand === CURRENT_BRAND)
                .forEach((p: any) => {
                  const pClean = (p.product_name || '').trim();
                  if (pClean.toLowerCase() === cleanProdName.toLowerCase()) {
                    const price = parseFloat(p.price);
                    pMap[`${prodName}_${p.portion_size}`] = price;
                    pMap[`${cleanProdName}_${p.portion_size}`] = price;
                  }
                });
            }

            // C. Company deal override
            allPrices
              .filter((p: any) => p.company_id === compId)
              .forEach((p: any) => {
                const pClean = (p.product_name || '').trim();
                if (pClean.toLowerCase() === cleanProdName.toLowerCase()) {
                  const price = parseFloat(p.price);
                  pMap[`${prodName}_${p.portion_size}`] = price;
                  pMap[`${cleanProdName}_${p.portion_size}`] = price;
                }
              });
          });
        }
        
        setPrices(pMap);
      }

      // Fetch allowed delivery methods
      const { data: cdmData, error: cdmError } = await supabase.from('ob_company_delivery_methods').select('delivery_method_id').eq('company_id', compId);
      if (cdmError) console.error('Error fetching company delivery methods:', cdmError);
      
      const enrichDeliveryList = (list: any[]) => (list || [])
        .filter((m: any) => isItemVisibleForBrand(m.allowed_brands))
        .map((m: any) => ({
          ...m,
          name_en: m.name_en || deliveryTrans[m.id]?.name_en || deliveryTrans[m.name]?.name_en || '',
          description_en: m.description_en || deliveryTrans[m.id]?.description_en || deliveryTrans[m.name]?.description_en || ''
        }));

      if (cdmData && cdmData.length > 0) {
        const allowedIds = cdmData.map(a => a.delivery_method_id);
        const { data: dmData, error: dmError } = await supabase.from('ob_delivery_methods').select('*').in('id', allowedIds).eq('is_active', true).order('sort_order', { ascending: true });
        if (dmError) console.error('Error fetching delivery methods:', dmError);
        if (dmData && dmData.length > 0) {
          const enriched = enrichDeliveryList(dmData);
          setDeliveryMethods(enriched);
          if (enriched.length > 0) {
            setSelectedDeliveryMethod(enriched[0]);
          }
        }
      } else {
        // Fallback to defaults if none selected for company
        const { data: dmData, error: dmError } = await supabase.from('ob_delivery_methods').select('*').eq('is_active', true).order('sort_order', { ascending: true });
        if (dmError) console.error('Error fetching fallback delivery methods:', dmError);
        if (dmData && dmData.length > 0) {
          const enriched = enrichDeliveryList(dmData);
          setDeliveryMethods(enriched);
          if (enriched.length > 0) {
            setSelectedDeliveryMethod(enriched[0]);
          }
        }
      }



    } catch (e: any) {
      console.error(e);
      setError('Fout bij ophalen van gegevens.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    navigate('/auth');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (Object.keys(selections).length === 0 || !selectedAddress || !phone || (deliveryMode === 'scheduled' && (!deliveryDate || !deliveryTime))) {
      setError(pageContent?.emp_error_required || "Selecteer a.u.b. minimaal één product en vul uw contactgegevens in.");
      return;
    }

    setIsSubmitting(true);
    setError('');

    const totalOrderPrice = Object.entries(selections).reduce((sum, [prod, sizes]) => {
      let prodSum = 0;
      const cleanProd = (prod || '').trim();
      for (const [s, qty] of Object.entries(sizes as any)) {
        const parts = String(s).split('_');
        const sizeNum = parts[0];
        const variant = parts[1] || '';
        const basePrice = prices[`${cleanProd}_${sizeNum}`] ?? prices[`${prod}_${sizeNum}`] ?? 0;
        const surcharge = getVariantSurcharge(prod, variant, sizeNum);
        prodSum += (basePrice + surcharge) * (qty as number);
      }
      return sum + prodSum;
    }, 0);

    if (appliedDiscount) {
      const validation = validateDiscountCode(appliedDiscount, totalOrderPrice, userEmail || userId);
      if (!validation.valid) {
        setError(`Kortingscode fout: ${validation.error}`);
        setIsSubmitting(false);
        return;
      }
    }

    const calculatedDiscountAmount = (appliedDiscount && appliedDiscount.type === 'percentage')
      ? (totalOrderPrice * (appliedDiscount.value || 0)) / 100
      : 0;
    
    const effectiveSpend = Math.max(0, totalOrderPrice - calculatedDiscountAmount);
    if (maxSpendLimit !== null && effectiveSpend > maxSpendLimit) {
      const defaultLimitMsg = `Het maximaal toegestane bedrag per bestelling is €${maxSpendLimit.toFixed(2)}. Het totaalbedrag is nu €${effectiveSpend.toFixed(2)}.`;
      const configuredLimitMsg = pageContent?.emp_error_max_spend
        ? pageContent.emp_error_max_spend.replace('{limit}', maxSpendLimit.toFixed(2)).replace('{total}', effectiveSpend.toFixed(2))
        : defaultLimitMsg;
      setError(configuredLimitMsg);
      setIsSubmitting(false);
      return;
    }

    let discountNote = '';
    if (appliedDiscount) {
      if (appliedDiscount.type === 'percentage') {
        discountNote = `Kortingscode: ${appliedDiscount.code} (${appliedDiscount.value}% korting, -€${calculatedDiscountAmount.toFixed(2)})`;
      } else if (appliedDiscount.type === 'free_product' && appliedDiscount.free_product) {
        const fp = appliedDiscount.free_product;
        discountNote = `Kortingscode: ${appliedDiscount.code} (Gratis product: ${fp.portion_size} stuks ${fp.product_name}${fp.variant ? ` (${fp.variant})` : ''})`;
      }
    }

    const packagingNote = selectedPackagingOption
      ? `Verpakkingswijze: ${selectedPackagingOption.name}${Number(selectedPackagingOption.price) > 0 ? ` (+€${Number(selectedPackagingOption.price).toFixed(2)})` : ''}`
      : '';

    const fullNotes = `
${discountNote ? `${discountNote}\n` : ''}${packagingNote ? `${packagingNote}\n` : ''}${notes || ''}
    `.trim();

    if (supabase) {
      try {
        const orderPromises: any[] = [];
        const orderLines: any[] = [];
        Object.entries(selections).forEach(([prod, sizes]) => {
          const cleanProd = (prod || '').trim();
          Object.entries(sizes as any).forEach(([sizeStr, qty]) => {
            const parts = String(sizeStr).split('_');
            const sizeNum = Number(parts[0]);
            const variant = parts[1] || '';
            const basePrice = prices[`${cleanProd}_${sizeNum}`] ?? prices[`${prod}_${sizeNum}`] ?? 0;
            const surcharge = getVariantSurcharge(prod, variant, sizeNum);
            const price = basePrice + surcharge;
            let finalProdName = variant ? `${prod} (${variant})` : prod;
            const dbProduct = dbProducts.find(p => p.name === prod || (p.name || '').trim().toLowerCase() === cleanProd.toLowerCase());
            if (dbProduct && dbProduct.sauces && dbProduct.sauces.length > 0) {
              finalProdName += ` [+ ${dbProduct.sauces.join(', ')}]`;
            }

            orderLines.push({
              product_name: finalProdName,
              portion_size: sizeNum,
              price: price,
              qty: qty as number,
              lineTotal: price * (qty as number)
            });
            
            for (let i = 0; i < (qty as number); i++) {
              orderPromises.push(supabase.from('ob_orders').insert({
                company_id: companyId,
                user_id: userId || null,
                product_name: finalProdName,
                portion_size: sizeNum,
                price: price,
                total_price: price,
                address_id: selectedAddress,
                phone: phone,
                notes: fullNotes,
                delivery_date: deliveryMode === 'zsm' ? new Date().toISOString().split('T')[0] : deliveryDate,
                delivery_time: deliveryMode === 'zsm' ? 'Zo snel mogelijk' : deliveryTime
              }));
            }
          });
        });

        // Add free product if applicable
        if (appliedDiscount && appliedDiscount.type === 'free_product' && appliedDiscount.free_product) {
          const fp = appliedDiscount.free_product;
          const freeProdName = fp.variant ? `${fp.product_name} (${fp.variant})` : fp.product_name;
          const labeledName = `[GRATIS VIA CODE ${appliedDiscount.code}] ${freeProdName}`;
          orderLines.push({
            product_name: labeledName,
            portion_size: fp.portion_size,
            price: 0,
            qty: 1,
            lineTotal: 0
          });
          orderPromises.push(supabase.from('ob_orders').insert({
            company_id: companyId,
            user_id: userId || null,
            product_name: labeledName,
            portion_size: fp.portion_size,
            price: 0,
            total_price: 0,
            address_id: selectedAddress,
            phone: phone,
            notes: fullNotes,
            delivery_date: deliveryMode === 'zsm' ? new Date().toISOString().split('T')[0] : deliveryDate,
            delivery_time: deliveryMode === 'zsm' ? 'Zo snel mogelijk' : deliveryTime
          }));
        }

        if (selectedDeliveryMethod && selectedDeliveryMethod.price > 0) {
          orderPromises.push(supabase.from('ob_orders').insert({
            company_id: companyId,
            user_id: userId || null,
            product_name: 'Bezorging: ' + selectedDeliveryMethod.name,
            portion_size: 1,
            price: selectedDeliveryMethod.price,
            total_price: selectedDeliveryMethod.price,
            address_id: selectedAddress,
            phone: phone,
            notes: fullNotes,
            delivery_date: deliveryMode === 'zsm' ? new Date().toISOString().split('T')[0] : deliveryDate,
            delivery_time: deliveryMode === 'zsm' ? 'Zo snel mogelijk' : deliveryTime
          }));

          orderLines.push({
            product_name: 'Bezorging: ' + selectedDeliveryMethod.name,
            portion_size: 1,
            price: Number(selectedDeliveryMethod.price),
            qty: 1,
            lineTotal: Number(selectedDeliveryMethod.price)
          });
        }

        if (selectedPackagingOption && packagingPrice > 0) {
          orderPromises.push(supabase.from('ob_orders').insert({
            company_id: companyId,
            user_id: userId || null,
            product_name: 'Verpakking: ' + selectedPackagingOption.name,
            portion_size: 1,
            price: packagingPrice,
            total_price: packagingPrice,
            address_id: selectedAddress,
            phone: phone,
            notes: fullNotes,
            delivery_date: deliveryMode === 'zsm' ? new Date().toISOString().split('T')[0] : deliveryDate,
            delivery_time: deliveryMode === 'zsm' ? 'Zo snel mogelijk' : deliveryTime
          }));

          orderLines.push({
            product_name: 'Verpakking: ' + selectedPackagingOption.name,
            portion_size: 1,
            price: packagingPrice,
            qty: 1,
            lineTotal: packagingPrice
          });
        }

        const results = await Promise.all(orderPromises);
        const errors = results.filter(r => r.error);
        if (errors.length > 0) throw errors[0].error;

        const calculatedFinalTotal = Math.max(0, totalOrderPrice - calculatedDiscountAmount) + (Number(selectedDeliveryMethod?.price) || 0) + packagingPrice;

        // Record discount code usage
        if (appliedDiscount) {
          recordDiscountCodeUsage(appliedDiscount.id || appliedDiscount.code, userEmail || userId).catch(err => {
            console.error("Fout bij bijwerken kortingscode teller:", err);
          });
        }

        // Try to send the invoice email
        try {
          const selectedAddressObj = addresses.find(a => a.id === selectedAddress);
          const res = await fetch('/api/send-invoice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            
            body: JSON.stringify({
              companyId,
              companyName: companyName,
              customerName: companyName,
              rawAddress: selectedAddressObj?.address_line || selectedAddressObj?.label,
              addressLabel: selectedAddressObj?.label,
              selections,
              prices,
              orderLines,
              addressId: selectedAddress,
              phone,
              notes: fullNotes,
              totalOrderPrice: calculatedFinalTotal,
              deliveryDate: deliveryMode === 'zsm' ? new Date().toISOString().split('T')[0] : deliveryDate,
              deliveryTime: deliveryMode === 'zsm' ? 'Zo snel mogelijk' : deliveryTime,
              deliveryMethod: selectedDeliveryMethod?.name || 'Standaard Bezorging',
              deliveryMethodPrice: Number(selectedDeliveryMethod?.price) || 0,
              packagingOption: selectedPackagingOption?.name || null,
              packagingPrice: packagingPrice,
              discountCode: appliedDiscount?.code || null,
              discountType: appliedDiscount?.type || null,
              discountValue: appliedDiscount?.value || 0,
              discountAmount: calculatedDiscountAmount,
              freeProductInfo: (appliedDiscount?.type === 'free_product' && appliedDiscount.free_product)
                ? `${appliedDiscount.free_product.portion_size} stuks ${appliedDiscount.free_product.product_name}${appliedDiscount.free_product.variant ? ` (${appliedDiscount.free_product.variant})` : ''}`
                : null,
              finalTotal: calculatedFinalTotal
            })

          });
        } catch (emailErr) {
          console.error("Kon email niet verzenden:", emailErr);
          // We still show success to the user since the DB insert worked
        }

        setOrderSuccess(true);

      } catch (e: any) {
        console.error(e);
        setError(pageContent?.emp_error_general || "Er ging iets mis bij het plaatsen van de bestelling.");
      }
    } else {
      setTimeout(() => setOrderSuccess(true), 1000);
    }
    
    setIsSubmitting(false);
  };

  if (isLoading) {
    return <div className="min-h-screen bg-[#f4f6f9] pt-32 flex items-center justify-center font-serif text-ob-blue">Laden...</div>;
  }

  if (orderSuccess) {
    const successTitle = pageContent?.emp_success_title || "Bestelling Geplaatst!";
    const successMsg = pageContent?.emp_success_message || "Uw kantoorborrel is succesvol besteld en zal op de gekozen afleverlocatie worden bezorgd.";
    const delayNotice = pageContent?.delivery_delay_notice || "Opmerking: Wegens een technische vertraging bij onze e-mailprovider duren bevestigingsmails momenteel iets langer dan gebruikelijk.";
    const modifyTitle = pageContent?.emp_modify_title || "Bestelling wijzigen of annuleren?";
    const modifyNotice = pageContent?.emp_success_notice || "U kunt deze bestelling te allen tijde inzien, aanpassen of annuleren via uw Bedrijfsdashboard.";

    return (
      <div className="min-h-screen bg-[#f4f6f9] pt-32 pb-20 font-serif flex items-center justify-center px-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-10 rounded-2xl shadow-sm border border-gray-200 text-center max-w-md w-full"
        >
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-bold text-ob-text mb-4">{successTitle}</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            {successMsg}
            {emailFailed && <span className="block mt-4 text-orange-600 text-sm">{delayNotice}</span>}
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 mb-6 text-xs text-blue-900 text-left">
            💡 <strong>{modifyTitle}</strong><br />
            {modifyNotice}
          </div>

          <div className="flex flex-col gap-2.5">
            <button 
              onClick={() => navigate('/dashboard')}
              className="w-full bg-[#5170ff] text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
            >
              {pageContent?.emp_btn_dashboard || "Ga naar Bedrijfsdashboard"}
            </button>
            <button 
              onClick={() => {
                setOrderSuccess(false);
                setSelections({});
                setNotes('');
              }}
              className="w-full bg-gray-100 text-gray-700 py-2.5 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-sm"
            >
              {pageContent?.emp_btn_new || "Nieuwe Bestelling Plaatsen"}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const itemsToRender = dbProducts.length > 0 
    ? dbProducts.filter(p => {
        if (!assortment.includes(p.name)) return false;
        if (['inactive', 'inactief', 'verborgen'].includes((p.status || '').toLowerCase())) return false;
        
        const cat = (p.category || '').trim();
        if (cat && categoryRestrictions[cat] && Array.isArray(categoryRestrictions[cat]) && categoryRestrictions[cat].length > 0) {
          if (!categoryRestrictions[cat].includes(companyId)) return false;
        }

        const hasCompanyException = p.allowed_company_ids && Array.isArray(p.allowed_company_ids) && p.allowed_company_ids.length > 0;
        if (hasCompanyException) {
          if (!p.allowed_company_ids.includes(companyId)) return false;
        } else {
          // If not restricted to specific companies, enforce concept / brand visibility
          if (!isItemVisibleForBrand(p.allowed_brands)) return false;
        }
        return true;
      })
    : assortment.map(name => ({ name, status: 'Actief' }));

  const groupedCategories = itemsToRender.reduce((acc: any, item: any) => {
    const itemCats = item.additional_categories && item.additional_categories.length > 0 
      ? Array.from(new Set([item.category, ...item.additional_categories])) 
      : [item.category || 'Assortiment'];
    itemCats.forEach((cat: string) => {
      if (categoryRestrictions[cat] && Array.isArray(categoryRestrictions[cat]) && categoryRestrictions[cat].length > 0) {
        if (!categoryRestrictions[cat].includes(companyId)) return;
      }
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
    });
    return acc;
  }, {});

  const categoryList = Object.keys(groupedCategories)
    .filter(key => {
      if (categoryRestrictions[key] && Array.isArray(categoryRestrictions[key]) && categoryRestrictions[key].length > 0) {
        return categoryRestrictions[key].includes(companyId);
      }
      return true;
    })
    .map(key => {
    const primaryItems = itemsToRender.filter(
      (i: any) => (i.category || 'Assortiment').trim().toLowerCase() === key.trim().toLowerCase()
    );
    const minSortOrder = primaryItems.length > 0
      ? Math.min(...primaryItems.map((i: any) => i.sort_order ?? 9999))
      : Math.min(...groupedCategories[key].map((i: any) => i.sort_order ?? 9999));

    return {
      title: key,
      items: groupedCategories[key],
      minSortOrder
    };
  });
  categoryList.sort((a, b) => a.minSortOrder - b.minSortOrder);
  const totalSelectedItems = Object.keys(selections).length;

  const scrollToCategory = (catTitle: string) => {
    setActiveCategory(catTitle);
    const target = document.getElementById(`emp-cat-${encodeURIComponent(catTitle)}`);
    if (target) {
      const offset = 120;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = target.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const scrollToOrder = () => {
    const target = document.getElementById('emp-order-details-section');
    if (target) {
      const offset = 110;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = target.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6f9] pt-28 pb-20 font-serif">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <EditableText
              contentKey="emp_order_title"
              label="Titel 'Nieuwe Bestelling'"
              value={getDynamicText('emp_order_title', 'Nieuwe Bestelling', 'New Order')}
              defaultValue="Nieuwe Bestelling"
              as="h1"
              className="text-3xl font-bold text-ob-text mb-1 font-title-default"
            />
            <p className="text-gray-500 font-paragraph-default">
              {pageContent?.emp_order_subtitle 
                ? pageContent.emp_order_subtitle.replace('{companyName}', companyName) 
                : <>Bestel via het account van <strong className="text-ob-blue">{companyName}</strong></>}
            </p>
          </div>
          <button onClick={handleLogout} className="text-sm font-semibold text-red-600 hover:text-red-800 transition-colors font-button-default">
            Uitloggen
          </button>
        </div>

        {error && (
          <div className="mb-8 bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 font-paragraph-default">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="xl:grid xl:grid-cols-12 xl:gap-8 items-start">
            
            {/* Linkerkolom: Bestelstappen */}
            <div className="xl:col-span-8 2xl:col-span-9 space-y-8 min-w-0">
              
              {deliveryMethods.length > 0 && (
                <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="mb-6">
                    <h2 className="text-2xl font-normal text-ob-text flex items-center gap-2.5 font-title-default">
                      <Truck size={22} className="text-ob-accent" />
                      <EditableText
                        contentKey="order_delivery_section_title"
                        label="Titel 'Kies je bezorgmethode'"
                        value={getDynamicText('order_delivery_section_title', 'Kies je bezorgmethode', 'Choose your delivery method')}
                        defaultValue={t('Kies je bezorgmethode', 'Choose your delivery method')}
                        inline
                        as="span"
                      />
                    </h2>
                    <EditableText
                      contentKey="order_delivery_section_subtitle"
                      label="Ondertitel 'Selecteer hoe je je bestelling wilt ontvangen...'"
                      value={getDynamicText('order_delivery_section_subtitle', 'Selecteer hoe je je bestelling wilt ontvangen of laten verzorgen.', 'Select how you would like to receive or have your order served.')}
                      defaultValue={t('Selecteer hoe je je bestelling wilt ontvangen of laten verzorgen.', 'Select how you would like to receive or have your order served.')}
                      as="p"
                      className="text-gray-500 mt-1 font-paragraph-default"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {deliveryMethods.map((method, mIdx) => (
                      <label 
                        key={`emp-del-${method.id || mIdx}-${mIdx}`} 
                        className={`flex flex-col p-4 sm:p-5 border rounded-2xl cursor-pointer transition-all overflow-hidden ${
                          selectedDeliveryMethod?.id === method.id 
                            ? 'border-ob-blue bg-blue-50/30 ring-2 ring-ob-blue shadow-xs' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/80 shadow-2xs'
                        }`}
                      >
                        <div className="w-full h-32 sm:h-36 rounded-xl overflow-hidden bg-gray-100 mb-3.5 shrink-0 border border-gray-150">
                          <img src={method.image_url} alt={method.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <input 
                            type="radio" 
                            name="delivery_method_emp"
                            checked={selectedDeliveryMethod?.id === method.id}
                            onChange={() => setSelectedDeliveryMethod(method)}
                            className="w-5 h-5 mt-0.5 rounded-full border-gray-300 text-ob-blue focus:ring-ob-blue shrink-0 cursor-pointer" 
                          />
                          <div className="min-w-0 flex-1 flex flex-col justify-between">
                            <span className="font-bold text-gray-900 block text-sm sm:text-base font-heading-default break-words leading-snug mb-1">
                              {getDeliveryMethodName(method, language, t)}
                            </span>
                            {getDeliveryMethodDescription(method, language, t) && (
                              <span className="text-xs text-gray-500 block mb-2 font-paragraph-default leading-relaxed break-words">
                                {getDeliveryMethodDescription(method, language, t)}
                              </span>
                            )}
                            <span className="font-bold text-[#05053D] inline-block font-button-default text-xs tracking-wider mt-auto pt-1">
                              {method.price === 0 ? t('Gratis', 'Free') : `+ €${Number(method.price).toFixed(2)}${method.name?.toLowerCase().includes('uitserveren') ? ` ${t('/ uur (uurtarief)', '/ hour (hourly rate)')}` : ''}`}
                            </span>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </section>
              )}

              {/* Mobiele / Tablet Snelle Categorie Chips Balk */}
              {categoryList.length > 1 && (
                <div className="xl:hidden sticky top-20 z-20 bg-white/95 backdrop-blur-md p-2.5 rounded-2xl shadow-sm border border-gray-200/80">
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5 px-1 scroll-smooth">
                    {categoryList.map((category, catIdx) => {
                      const isCatActive = activeCategory === category.title;
                      const countInCat = category.items.reduce((sum: number, item: any) => sum + (selections[item.name] ? 1 : 0), 0);
                      return (
                        <button
                          key={`emp-mobile-chip-${category.title}-${catIdx}`}
                          type="button"
                          onClick={() => scrollToCategory(category.title)}
                          className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                            isCatActive
                              ? 'bg-ob-blue text-white shadow-xs font-bold'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <span className="font-paragraph-default">{category.title}</span>
                          {countInCat > 0 && (
                            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${isCatActive ? 'bg-white/20 text-white' : 'bg-[#5170ff] text-white'}`}>
                              {countInCat}
                            </span>
                          )}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={scrollToOrder}
                      className="shrink-0 ml-auto px-3 py-1.5 bg-[#5170ff] hover:bg-[#4060ee] text-white rounded-full text-xs font-bold font-button-default tracking-wide flex items-center gap-1 shadow-xs cursor-pointer"
                    >
                      <span>{t('Bestellen', 'Order')}</span>
                      <ArrowDown size={12} />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 1: Producten & Porties */}
              <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-normal text-ob-text flex items-center gap-2.5 font-title-default">
                    <Utensils size={22} className="text-ob-accent" />
                    Kies uw Snacks & Porties
                  </h2>
                  {maxSpendLimit !== null && (
                    <div className={`text-sm font-medium px-3 py-1 rounded-lg ${totalOrderPrice > maxSpendLimit ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-blue-50 text-ob-blue'}`}>
                      Budget: €{maxSpendLimit.toFixed(2)} {totalOrderPrice > 0 && `(Gekozen: €${totalOrderPrice.toFixed(2)})`}
                    </div>
                  )}
                </div>
                
                {assortment.length === 0 ? (
                  <p className="text-gray-500 italic font-paragraph-default">Uw kantoor heeft momenteel geen assortiment geselecteerd. Neem contact op met uw office manager.</p>
                ) : (
                  <div className="flex flex-col gap-10">
                    {categoryList.map((category, catIdx) => (
                      <div 
                        key={`emp-cat-${category.title || catIdx}-${catIdx}`}
                        id={`emp-cat-${encodeURIComponent(category.title)}`}
                        data-category-title={category.title}
                        className="scroll-mt-28"
                      >
                      {categoryList.length > 1 && category.title !== 'Assortiment' && (
                        <h3 
                          className="text-2xl font-bold text-ob-blue mb-2 border-b pb-2 font-title-default"
                          style={getTypographyStyle('title', pageContent?.menu_category_title_font, pageContent?.menu_category_title_size)}
                        >
                          {category.title}
                        </h3>
                      )}
                      {categoryDescriptions[category.title] && (
                        <p className="text-sm text-gray-600 mb-5 bg-blue-50/50 p-3 rounded-lg border border-blue-100/70 font-normal">
                          {categoryDescriptions[category.title]}
                        </p>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {category.items.map((item: any, itemIdx: number) => {
                          const product = item.name;
                          const prodSelections = selections[product] || {};
                          const rawSizes = (item.portions && item.portions.length > 0) ? item.portions : PORTION_SIZES;
                          const productSizes = Array.from(new Set(rawSizes)).sort((a: any, b: any) => Number(a) - Number(b));
                          const isSoldOut = ['uitverkocht', 'sold out', 'sold_out'].includes((item.status || '').toLowerCase());
                          const hasSelections = Object.keys(prodSelections).length > 0;
                          const hasImage = !item.hide_image && Boolean(item.image_url || PRODUCT_IMAGES[product] || item.image);
                          
                          return (
                            <div 
                              key={`emp-item-${category.title}-${item.id || item.name}-${itemIdx}`} 
                              className={`flex flex-col h-full border rounded-xl overflow-hidden transition-all ${
                                hasSelections 
                                  ? 'border-ob-blue shadow-md ring-1 ring-ob-blue/10 bg-white' 
                                  : 'border-gray-200 bg-white hover:border-ob-blue/40 hover:shadow-sm'
                              } ${isSoldOut ? 'opacity-70' : ''}`}
                            >
                              {/* Top info section */}
                              <div className={`p-4 flex ${hasImage ? 'gap-4' : 'flex-col gap-2'}`}>
                                      {hasImage && (
                                        <div 
                                          className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-100 relative group cursor-pointer" 
                                          onClick={() => setInfoModalProduct({ ...item, _openedFromCategory: category.title })}
                                        >
                                          <img 
                                            src={item.image_url || PRODUCT_IMAGES[product] || item.image} 
                                            alt={product} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                                          />
                                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-white text-xs font-semibold">{t('Extra informatie', 'Extra info')}</span>
                                          </div>
                                        </div>
                                      )}
                                      
                                      <div className="flex-1 min-w-0 flex flex-col">
                                        <div className="flex items-start justify-between gap-2 mb-1.5">
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className="font-normal text-[15px] text-[#05053D] leading-tight">{product}</h4>
                                          </div>
                                          {hasSelections && (
                                            <button 
                                              type="button" 
                                              onClick={() => setSelections(prev => { const c = {...prev}; delete c[product]; return c; })} 
                                              className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded hover:bg-red-100 uppercase font-bold shrink-0"
                                            >
                                              Wissen
                                            </button>
                                          )}
                                        </div>
                                        
                                        {((item.status && !['actief', 'inactief', 'verborgen', 'active', 'inactive', 'hidden'].includes((item.status || '').toLowerCase())) || !hasImage) && (
                                          <div className="flex flex-wrap items-center gap-1.5 mb-2">
                                            {item.status && !['actief', 'inactief', 'verborgen', 'active', 'inactive', 'hidden'].includes((item.status || '').toLowerCase()) && (
                                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase ${isSoldOut ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
                                                {item.status === 'new' ? 'Nieuw' : item.status === 'popular' ? 'Meest Gekozen' : item.status === 'sold_out' ? 'Uitverkocht' : item.status === 'coming_soon' ? 'Binnenkort' : item.status}
                                              </span>
                                            )}
                                            {!hasImage && (
                                              <button
                                                type="button"
                                                onClick={() => setInfoModalProduct({ ...item, _openedFromCategory: category.title })}
                                                className="text-[11px] text-ob-blue bg-blue-50/60 hover:bg-blue-100 px-2 py-0.5 rounded flex items-center gap-1 font-medium transition-colors cursor-pointer"
                                              >
                                                <Info size={12} />
                                                {t('Extra informatie', 'Extra info')}
                                              </button>
                                            )}
                                          </div>
                                        )}

                                        {(() => {
                                          const visibleCardVariants = sortVariantsByCategory(item.variants, category.title, item, pageContent?.category_variant_rules);
                                          return (visibleCardVariants.length > 1) ? (
                                            <p className="text-xs text-gray-500 mb-2 flex flex-wrap gap-1">
                                              <span className="font-semibold text-gray-700">Opties:</span> {visibleCardVariants.join(', ')}
                                            </p>
                                          ) : null;
                                        })()}

                                        {item.sauces && item.sauces.length > 0 && (
                                          <div className="mt-auto inline-flex items-start gap-1.5 bg-yellow-50/40 border border-yellow-100/50 px-2.5 py-1.5 rounded-lg w-fit">
                                            <span className="text-[#d4af37] text-sm leading-none mt-0.5">✦</span> 
                                            <span className="text-xs text-gray-600 font-medium leading-tight">Inclusief: <span className="font-bold text-gray-900">{item.sauces.join(', ')}</span></span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {/* Action section pushed to bottom */}
                                    <div className={`p-4 bg-gray-50/50 mt-auto border-t border-gray-100 flex flex-col ${hasImage ? 'gap-3' : 'gap-2.5'}`}>
                                {(() => {
                                  const sortedVariants = (item.variants && item.variants.length > 0)
                                    ? sortVariantsByCategory(item.variants, category.title, item, pageContent?.category_variant_rules)
                                    : [];
                                  const defaultVariant = sortedVariants[0] || '';
                                  const variantKey = `${category.title}_${product}`;
                                  const prevSelected = selectedVariants[variantKey];
                                  const currentVariant = (sortedVariants.length > 0)
                                    ? (prevSelected && sortedVariants.includes(prevSelected) ? prevSelected : defaultVariant)
                                    : '';
                                  
                                  return (
                                    <>
                                      {sortedVariants.length > 1 ? (
                                        <div className="flex flex-col gap-1.5 w-full">
                                          <div className="flex items-center text-xs">
                                            <span className="font-semibold text-gray-700">Kies variant:</span>
                                          </div>
                                          <div className="flex flex-wrap gap-1.5 w-full">
                                            {sortedVariants.map((v: string, vIdx: number) => {
                                              const isSelected = currentVariant === v;
                                              return (
                                                <button
                                                  key={`emp-var-${v}-${vIdx}`}
                                                  type="button"
                                                  onClick={() => setSelectedVariants({...selectedVariants, [variantKey]: v})}
                                                  className={`flex-1 min-w-[70px] py-1.5 px-2.5 text-xs rounded-full font-bold transition-all border text-center ${
                                                    isSelected
                                                      ? 'bg-[#151f34] text-white border-[#151f34] shadow-sm ring-1 ring-[#151f34]'
                                                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                  }`}
                                                >
                                                  {v}
                                                </button>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      ) : sortedVariants.length === 1 ? (
                                        <div className="flex items-center gap-1.5 text-xs text-gray-600 py-0.5">
                                          <span className="font-semibold text-gray-700">Variant:</span>
                                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                                            {sortedVariants[0]}
                                          </span>
                                        </div>
                                      ) : null}
                                      <div className="grid grid-cols-2 gap-2 w-full">
                                        {productSizes.map((size: any, sizeIdx: number) => {
                                          const selKey = currentVariant ? `${size}_${currentVariant}` : size.toString();
                                          const countForCurrentSelection = prodSelections[selKey] || 0;
                                          const totalCountForSize = Object.keys(prodSelections).reduce((sum, key) => (key === size.toString() || key.startsWith(size + '_')) ? sum + prodSelections[key] : sum, 0);
                                          
                                          const cleanProd = (product || '').trim();
                                          const basePrice = prices[cleanProd + '_' + size] ?? prices[product + '_' + size];
                                          const displayPrice = basePrice !== undefined ? basePrice + getVariantSurcharge(product, currentVariant, size) : undefined;
                                          const isDisabled = basePrice === undefined || isSoldOut;
                                          
                                          return (
                                            <button
                                              key={`emp-size-${size}-${sizeIdx}`}
                                              type="button"
                                              disabled={isDisabled} 
                                              onClick={() => {
                                                handlePortionSelect(product, size, currentVariant);
                                              }}
                                              className={`relative py-2 px-1 text-sm rounded-lg border transition-all flex flex-col items-center justify-center gap-0.5 ${isDisabled ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200' : countForCurrentSelection > 0 ? 'bg-[#151f34] text-white border-[#151f34] shadow-md' : 'bg-white text-gray-700 border-gray-200 hover:border-[#151f34] hover:shadow-sm'}`}
                                            >
                                              <span className="font-bold text-[13px]">{size} st.</span>
                                              <span className={`text-[11px] font-medium ${countForCurrentSelection > 0 ? 'text-white/90' : 'text-gray-500'}`}>{displayPrice !== undefined ? `€${displayPrice.toFixed(2)}` : '-'}</span>
                                              
                                              {countForCurrentSelection > 0 && (
                                                <div 
                                                  role="button"
                                                  onClick={(e) => handlePortionDeselect(product, size, currentVariant, e)}
                                                  className="absolute top-5 -right-2 bg-gray-400 text-white text-[12px] font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md border-2 border-white hover:bg-red-500 transition-colors z-10 cursor-pointer"
                                                  title="Verwijder één"
                                                >
                                                  -
                                                </div>
                                              )}
                                              {countForCurrentSelection > 0 && (
                                                <span className="absolute -top-2 -right-2 bg-[#151f34] text-white text-[11px] font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md border-2 border-white">
                                                  {countForCurrentSelection}
                                                </span>
                                              )}
                                              
                                              {countForCurrentSelection === 0 && totalCountForSize > 0 && (
                                                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-ob-blue/40" title="Al gekozen in een andere variant"></span>
                                              )}
                                            </button>
                                          );
                                        })}
                                      </div>

                                      {hasSelections && (
                                        <div className="mt-2 pt-3 border-t border-gray-200">
                                          <div className="flex flex-col gap-1">
                                            {Object.entries(prodSelections).map(([s, qty], sIdx) => {
                                              const parts = s.split('_');
                                              const sizeNum = parts[0];
                                              const variant = parts[1] || '';
                                              const cleanProd = (product || '').trim();
                                              const basePrice = prices[`${cleanProd}_${sizeNum}`] ?? prices[`${product}_${sizeNum}`] ?? 0;
                                              const surcharge = getVariantSurcharge(product, variant, sizeNum);
                                              const itemPrice = (basePrice + surcharge) * (qty as number);
                                              return (
                                                <div key={`emp-sel-${s}-${sIdx}`} className="flex justify-between items-center text-xs bg-white px-2.5 py-1.5 rounded border border-gray-200">
                                                  <span className="font-semibold text-gray-800">
                                                    {qty}x {sizeNum} stuks {variant && <span className="text-ob-blue font-bold">({variant})</span>}
                                                  </span>
                                                  <div className="flex items-center gap-1.5">
                                                    <span className="font-bold text-gray-700">€{itemPrice.toFixed(2)}</span>
                                                    <button
                                                      type="button"
                                                      onClick={(e) => handlePortionDeselect(product, Number(sizeNum), variant, e)}
                                                      className="text-gray-400 hover:text-red-500 font-bold px-1 rounded transition-colors"
                                                      title="Verwijder één"
                                                    >
                                                      ×
                                                    </button>
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      )}
                                    </>
                                  );
                                })()}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            
            {Object.keys(selections).length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
                <span className="font-bold text-gray-700">Totaalbedrag snacks:</span>
                <span className="text-2xl font-bold text-ob-blue">
                  €{totalOrderPrice.toFixed(2)}
                </span>
              </div>
            )}
          </section>

          {/* Step 2: Delivery Details */}
          <section id="emp-order-details-section" className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 scroll-mt-28">
            <h2 className="text-2xl font-normal text-ob-text mb-6 flex items-center gap-2.5 font-title-default">
              <span className="w-8 h-8 rounded-full bg-[#5170ff] text-white flex items-center justify-center text-sm shadow-xs font-bold font-heading-default">2</span> 
              Aflevergegevens
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-ob-text mb-2 flex items-center gap-2">
                  <MapPin size={16} className="text-[#5170ff]" /> Kies Afleverlocatie
                </label>
                <select 
                  required
                  value={selectedAddress}
                  onChange={(e) => setSelectedAddress(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-ob-blue bg-white"
                >
                  <option value="" disabled>Selecteer een locatie...</option>
                  {addresses.map((addr, aIdx) => (
                    <option key={`addr-opt-${addr.id || aIdx}-${aIdx}`} value={addr.id}>
                      {addr.label} ({addr.address_line})
                    </option>
                  ))}
                </select>
                {selectedAddress && addresses.find(a => a.id === selectedAddress)?.instructions && (
                  <p className="mt-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <strong>Instructies:</strong> {addresses.find(a => a.id === selectedAddress)?.instructions}
                  </p>
                )}
              </div>

              
              {/* Delivery Time Selection */}
              <div className="border-b border-gray-100 pb-6 mb-6">
                <label className="block text-sm font-semibold text-ob-text mb-3 flex items-center gap-2">
                  <Clock size={16} className="text-[#5170ff]" /> Bezorgmoment
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
                        <Calendar size={14} className="text-[#5170ff]" /> Datum
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
                        <Clock size={14} className="text-[#5170ff]" /> Tijd
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
              <div>
                <label className="block text-sm font-semibold text-ob-text mb-2 flex items-center gap-2">
                  <Phone size={16} className="text-[#5170ff]" /> Telefoonnummer contactpersoon
                </label>
                <input 
                  type="tel" 
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="06 1234 5678"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-ob-blue"
                />
                <p className="text-xs text-gray-500 mt-1.5">Zodat de koerier u kan bereiken bij aankomst.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-ob-text mb-2">Extra Notities (Optioneel)</label>
                <textarea 
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Speciale verzoeken of bijzonderheden..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-ob-blue resize-none"
                />
              </div>
            </div>
          </section>

          {/* Verpakkingsopties Sectie */}
          {availablePackagingOptions.length > 0 && (
            <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="mb-6">
                <h2 className="text-2xl font-normal text-ob-text flex items-center gap-2.5 font-title-default">
                  <Package size={22} className="text-ob-accent" />
                  {t('Verpakking van uw bestelling', 'Order packaging')}
                </h2>
                <p className="text-gray-500 mt-1 font-paragraph-default">
                  {t('Kies hoe u wilt dat uw bestelling verpakt en gepresenteerd wordt.', 'Choose how you would like your order packaged and presented.')}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availablePackagingOptions.map((opt) => {
                  const isSelected = selectedPackagingOption?.id === opt.id;
                  const optName = (language === 'en' && opt.name_en) ? opt.name_en : opt.name;
                  const optDesc = (language === 'en' && opt.description_en) ? opt.description_en : opt.description;
                  return (
                    <label
                      key={`emp-pack-${opt.id}`}
                      className={`flex flex-col p-4 sm:p-5 border rounded-2xl cursor-pointer transition-all overflow-hidden ${
                        isSelected
                          ? 'border-[#05053D] bg-blue-50/30 ring-2 ring-[#05053D] shadow-xs'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/80 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start gap-3.5 min-w-0">
                        <input
                          type="radio"
                          name="packaging_option_emp"
                          checked={isSelected}
                          onChange={() => setSelectedPackagingOption(opt)}
                          className="w-5 h-5 mt-1 rounded-full border-gray-300 text-[#05053D] focus:ring-[#05053D] shrink-0 cursor-pointer"
                        />
                        {opt.image_url && (
                          <img
                            src={opt.image_url}
                            alt={optName}
                            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-gray-200 shrink-0 shadow-2xs"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        )}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1 mb-1">
                            <span className="font-bold text-gray-900 text-sm sm:text-base font-heading-default break-words leading-snug">
                              {optName}
                            </span>
                            <span className="font-bold text-[#05053D] text-xs shrink-0 font-button-default">
                              {opt.price && Number(opt.price) > 0 ? `+ €${Number(opt.price).toFixed(2)}` : t('Inbegrepen', 'Included')}
                            </span>
                          </div>
                          {optDesc && (
                            <span className="text-xs text-gray-500 block font-paragraph-default leading-relaxed break-words">
                              {optDesc}
                            </span>
                          )}
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </section>
          )}

          {/* Kortingscode Sectie */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <h2 className="text-2xl font-normal text-ob-blue flex items-center gap-2.5 font-title-default">
                <Tag size={22} className="text-ob-accent" /> {t('Kortingscode', 'Discount code')}
              </h2>
              {appliedDiscount && (
                <span className="text-xs bg-green-100 text-green-800 font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle size={14} /> Toegepast
                </span>
              )}
            </div>

            <div className="p-6 space-y-4">
              {!appliedDiscount ? (
                <div>
                  <label className="block text-sm font-semibold text-ob-text mb-2">
                    Heeft uw bedrijf een kortingscode?
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="VOER KORTINGSCODE IN..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-ob-blue font-mono uppercase tracking-wider text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-6 py-3 bg-[#5170ff] hover:bg-blue-600 text-white rounded-xl font-bold text-sm transition-colors cursor-pointer shadow-sm"
                    >
                      Toepassen
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1.5">
                    Let op: er kan maximaal één kortingscode per bestelling worden toegepast (kortingen stapelen niet).
                  </p>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-green-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                      {appliedDiscount.type === 'percentage' ? <Percent size={18} /> : <Gift size={18} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm bg-white px-2 py-0.5 rounded border border-green-300 text-green-900">
                          {appliedDiscount.code}
                        </span>
                        <span className="text-xs text-green-700 font-semibold">Actief</span>
                      </div>
                      <p className="text-sm font-medium text-green-800 mt-1">
                        {appliedDiscount.type === 'percentage' 
                          ? `${appliedDiscount.value}% korting op uw bestelling (-€${discountAmount.toFixed(2)})`
                          : `Gratis product: ${appliedDiscount.free_product?.portion_size} stuks ${appliedDiscount.free_product?.product_name}${appliedDiscount.free_product?.variant ? ` (${appliedDiscount.free_product?.variant})` : ''}`
                        }
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-xs text-red-600 hover:text-red-800 font-semibold px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 bg-white cursor-pointer transition-colors"
                  >
                    Verwijderen
                  </button>
                </div>
              )}

              {couponError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-medium">
                  {couponError}
                </div>
              )}

              {couponSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-800 font-medium">
                  {couponSuccess}
                </div>
              )}
            </div>
          </section>

          {/* Overzicht en Totaalbedrag inclusief Bezorging */}
          {Object.keys(selections).length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-3">
              <h3 className="font-bold text-ob-text text-base border-b border-gray-100 pb-2">Overzicht Bestelling</h3>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotaal snacks:</span>
                <span className="font-semibold text-gray-900">€{totalOrderPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{t('Bezorgmethode', 'Delivery method')} ({getDeliveryMethodName(selectedDeliveryMethod, language, t)}):</span>
                <span className="font-semibold text-gray-900">
                  {selectedDeliveryMethod?.price && selectedDeliveryMethod.price > 0 
                    ? `€${Number(selectedDeliveryMethod.price).toFixed(2)}` 
                    : 'Gratis'}
                </span>
              </div>
              {selectedPackagingOption && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{t('Verpakking', 'Packaging')} ({(language === 'en' && selectedPackagingOption.name_en) ? selectedPackagingOption.name_en : selectedPackagingOption.name}):</span>
                  <span className="font-semibold text-gray-900">
                    {selectedPackagingOption.price && Number(selectedPackagingOption.price) > 0
                      ? `€${Number(selectedPackagingOption.price).toFixed(2)}`
                      : t('Inbegrepen', 'Included')}
                  </span>
                </div>
              )}
              {appliedDiscount && appliedDiscount.type === 'percentage' && discountAmount > 0 && (
                <div className="flex justify-between text-green-700 font-medium text-sm">
                  <span>Korting ({appliedDiscount.code} &mdash; {appliedDiscount.value}%)</span>
                  <span>-€${discountAmount.toFixed(2)}</span>
                </div>
              )}
              {appliedDiscount && appliedDiscount.type === 'free_product' && appliedDiscount.free_product && (
                <div className="flex justify-between text-green-700 font-medium text-sm">
                  <span>🎁 Gratis: {appliedDiscount.free_product.portion_size}x {appliedDiscount.free_product.product_name}</span>
                  <span className="font-bold">GRATIS</span>
                </div>
              )}
              <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                <span className="font-bold text-base text-gray-900">Totaalbedrag:</span>
                <span className="text-2xl font-bold text-ob-blue">
                  €{finalTotalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Legal / Privacy Notice */}
          <div className="pt-2">
            <div className="flex items-start gap-2.5 text-xs text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-150">
              <ShieldCheck size={16} className="text-[#5170ff] shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span>
                  {t(
                    'Door uw bestelling te plaatsen gaat u akkoord met de verwerking van uw gegevens conform onze',
                    'By placing your order, you agree to the processing of your details in accordance with our'
                  )}{' '}
                </span>
                <button
                  type="button"
                  onClick={() => setIsPrivacyModalOpen(true)}
                  className="text-[#5170ff] hover:underline font-semibold cursor-pointer inline-flex items-center gap-0.5"
                >
                  {t('Privacy Policy', 'Privacy Policy')}
                </button>
                <span>. {t('Op vers bereide warme snacks geldt geen herroepingsrecht.', 'Perishable warm snacks are exempt from statutory withdrawal rights.')}</span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button 
              type="submit" 
              disabled={isSubmitting || Object.keys(selections).length === 0 || !selectedAddress || !phone || (deliveryMode === 'scheduled' && (!deliveryDate || !deliveryTime))}
              className="w-full bg-[#5170ff] text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg font-button-default cursor-pointer"
            >
              {isSubmitting ? (pageContent?.btn_submitting || t('Bezig met plaatsen...', 'Placing order...')) : <><ShoppingBag size={20} /> {(language === 'en' && pageContent?.emp_btn_submit_en) ? pageContent.emp_btn_submit_en : (pageContent?.emp_btn_submit ? t(pageContent.emp_btn_submit) : t('Bestelling Plaatsen', 'Place Order'))} (€{finalTotalAmount.toFixed(2)})</>}
            </button>
          </div>

            </div>{/* Einde Linkerkolom */}

            {/* Rechterkolom: Sticky Zijbalk met Categorie Navigatie & Direct Naar Bestellen */}
            <aside className="hidden xl:block xl:col-span-4 2xl:col-span-3 sticky top-28 space-y-4">
              
              {/* Categorie Navigatie Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Compass size={18} className="text-ob-accent" />
                    <h3 className="font-bold text-ob-blue text-sm font-heading-default uppercase tracking-wider">
                      <EditableText
                        contentKey="order_sidebar_categories_title"
                        label="Zijbalk Titel 'Categorieën'"
                        value={getDynamicText('order_sidebar_categories_title', 'Categorieën', 'Categories')}
                        defaultValue={t('Categorieën', 'Categories')}
                        inline
                        as="span"
                      />
                    </h3>
                  </div>
                  <span className="text-xs text-gray-400 font-paragraph-default">
                    {categoryList.length} {t('secties', 'sections')}
                  </span>
                </div>

                <nav className="flex flex-col gap-1 max-h-[50vh] overflow-y-auto custom-scrollbar pr-1">
                  {categoryList.map((category, catIdx) => {
                    const isCatActive = activeCategory === category.title;
                    return (
                      <button
                        key={`emp-side-cat-${category.title}-${catIdx}`}
                        type="button"
                        onClick={() => scrollToCategory(category.title)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all flex items-center justify-between group cursor-pointer ${
                          isCatActive
                            ? 'bg-ob-blue text-white shadow-xs font-bold'
                            : 'text-gray-700 hover:bg-gray-100/80 hover:text-ob-blue'
                        }`}
                      >
                        <span className="truncate pr-2 font-paragraph-default">{category.title}</span>
                        <ChevronRight size={14} className={`shrink-0 transition-transform ${isCatActive ? 'text-white' : 'text-gray-400 group-hover:translate-x-0.5'}`} />
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Direct Naar Bestellen CTA Card */}
              <div className="bg-gradient-to-br from-white to-blue-50/40 rounded-2xl shadow-sm border border-blue-100/80 p-5 space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-gray-150">
                  <span className="text-xs uppercase tracking-wider font-bold text-gray-500 font-button-default">
                    <EditableText
                      contentKey="order_summary_selection_title"
                      label="Zijbalk 'Uw selectie'"
                      value={getDynamicText('order_summary_selection_title', 'Uw selectie', 'Your selection')}
                      defaultValue={t('Uw selectie', 'Your selection')}
                      inline
                      as="span"
                    />
                  </span>
                  {selectedItemsList.length > 0 && (
                    <span className="text-[11px] font-semibold text-[#5170ff] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                      {selectedItemsList.reduce((acc, i) => acc + i.qty, 0)} {selectedItemsList.reduce((acc, i) => acc + i.qty, 0) === 1 ? t('portie', 'portion') : t('porties', 'portions')}
                    </span>
                  )}
                </div>

                {/* Kort Bonnet / Overzicht van geselecteerde artikelen */}
                {selectedItemsList.length === 0 ? (
                  <div className="py-3 px-3 text-center text-xs text-gray-400 italic bg-white/70 rounded-xl border border-dashed border-gray-200">
                    {t('Selecteer snacks uit het assortiment hiernaast', 'Select snacks from the assortment')}
                  </div>
                ) : (
                  <div className="bg-white/90 rounded-xl p-3 border border-blue-100/80 shadow-2xs space-y-2 max-h-52 overflow-y-auto custom-scrollbar divide-y divide-gray-100">
                    {selectedItemsList.map((item) => (
                      <div key={item.key} className="pt-2 first:pt-0 flex items-start justify-between text-xs gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-gray-900 truncate">
                            <span className="text-[#5170ff] font-bold mr-1">{item.qty}x</span>
                            {item.product}
                          </div>
                          <div className="text-[11px] text-gray-500 font-normal">
                            {item.size} st.{item.variant ? ` • ${item.variant}` : ''}
                          </div>
                        </div>
                        <div className="text-right shrink-0 font-bold text-ob-blue font-heading-default">
                          €{item.itemTotal.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-sm font-medium text-gray-600 font-paragraph-default inline-flex items-center">
                    <EditableText
                      contentKey="order_summary_total_label"
                      label="Label 'Geschat totaal'"
                      value={getDynamicText('order_summary_total_label', 'Geschat totaal', 'Estimated total')}
                      defaultValue={t('Geschat totaal', 'Estimated total')}
                      inline
                      as="span"
                    />
                    <span>:</span>
                  </span>
                  <span className="text-2xl font-bold text-ob-blue font-heading-default">
                    €{finalTotalAmount.toFixed(2)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={scrollToOrder}
                  className="w-full bg-[#5170ff] hover:bg-[#4060ee] text-white py-3.5 px-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all font-button-default text-xs tracking-wider cursor-pointer"
                >
                  <ArrowDown size={16} />
                  <EditableText
                    contentKey="order_summary_btn_scroll"
                    label="Knop 'Naar Bestellen'"
                    value={getDynamicText('order_summary_btn_scroll', 'Naar Bestellen', 'Go to Order Details')}
                    defaultValue={t('Naar Bestellen', 'Go to Order Details')}
                    inline
                    as="span"
                  />
                </button>
                <EditableText
                  contentKey="emp_order_summary_btn_subtitle"
                  label="Onderschrift 'Direct door naar afleverlocatie...'"
                  value={getDynamicText('emp_order_summary_btn_subtitle', 'Direct door naar afleverlocatie & afronden', 'Jump directly to delivery location & submit')}
                  defaultValue={t('Direct door naar afleverlocatie & afronden', 'Jump directly to delivery location & submit')}
                  as="p"
                  className="text-[11px] text-gray-500 text-center font-paragraph-default"
                />
              </div>
            </aside>

          </div>{/* Einde xl:grid */}
        </form>
      </div>

      {/* Zwevende Mobiele / Tablet Quick-Bar naar Bestellen */}
      {totalSelectedItems > 0 && (
        <div className="xl:hidden fixed bottom-5 left-4 right-4 z-40 max-w-md mx-auto animate-in slide-in-from-bottom duration-300">
          <button
            type="button"
            onClick={scrollToOrder}
            className="w-full bg-[#151f34] text-white p-3.5 rounded-2xl shadow-2xl flex items-center justify-between border border-white/10 hover:bg-[#1e2a44] transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#5170ff] text-white flex items-center justify-center text-xs font-bold font-heading-default">
                {totalSelectedItems}
              </div>
              <div className="text-left">
                <span className="text-[11px] font-medium text-gray-300 block font-paragraph-default">
                  <EditableText
                    contentKey="order_mobile_selected_label"
                    label="Mobiel Label 'Geselecteerd'"
                    value={getDynamicText('order_mobile_selected_label', 'Geselecteerd', 'Selected')}
                    defaultValue={t('Geselecteerd', 'Selected')}
                    inline
                    as="span"
                  />
                </span>
                <span className="text-sm font-bold text-white block font-heading-default">€{finalTotalAmount.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-[#5170ff] hover:bg-[#4060ee] px-3.5 py-2 rounded-xl text-xs font-bold font-button-default tracking-wider shadow-sm">
              <EditableText
                contentKey="order_mobile_btn_scroll"
                label="Mobiele Knop 'Naar Bestellen'"
                value={getDynamicText('order_mobile_btn_scroll', 'Naar Bestellen', 'Go to Order')}
                defaultValue={t('Naar Bestellen', 'Go to Order')}
                inline
                as="span"
              />
              <ArrowDown size={14} />
            </div>
          </button>
        </div>
      )}

      <PrivacyModal 
        isOpen={isPrivacyModalOpen} 
        onClose={() => setIsPrivacyModalOpen(false)} 
        pageContent={pageContent} 
      />

      {/* Product Details Modal */}
      {infoModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setInfoModalProduct(null)}>
          <div 
            className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl relative border border-gray-100 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              type="button"
              onClick={() => setInfoModalProduct(null)} 
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-gray-700 flex items-center justify-center backdrop-blur shadow-sm transition-all"
            >
              <X size={18} />
            </button>
            
            {(infoModalProduct.image_url || PRODUCT_IMAGES[infoModalProduct.name] || infoModalProduct.image) ? (
               <div className="w-full h-48 sm:h-56 shrink-0 bg-gray-100 relative">
                 <img 
                   src={infoModalProduct.image_url || PRODUCT_IMAGES[infoModalProduct.name] || infoModalProduct.image} 
                   alt={infoModalProduct.name} 
                   className="w-full h-full object-cover" 
                 />
                 {infoModalProduct._openedFromCategory && (
                   <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-ob-blue px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm font-button-default">
                     {t(infoModalProduct._openedFromCategory)}
                   </span>
                 )}
               </div>
            ) : null}
            
            <div className="p-6 overflow-y-auto flex flex-col gap-4">
              <div>
                <h3 className="text-2xl font-title-default font-normal text-ob-blue pr-6 mb-2">{t(infoModalProduct.name)}</h3>
                {infoModalProduct.brand && (
                  <div className="inline-flex items-center gap-2 bg-blue-50/80 border border-blue-200/60 px-3 py-1.5 rounded-lg text-xs font-medium mb-3 font-paragraph-default">
                    <span className="text-ob-blue/70 font-semibold">{t('Merk:', 'Brand:')}</span>
                    <span className="text-ob-blue font-bold text-sm font-heading-default">{infoModalProduct.brand}</span>
                  </div>
                )}
                {(() => {
                  const modalCat = infoModalProduct._openedFromCategory || '';
                  const visibleModalVariants = sortVariantsByCategory(infoModalProduct.variants, modalCat, infoModalProduct, pageContent?.category_variant_rules);
                  return (visibleModalVariants.length > 1) ? (
                    <p className="text-xs text-gray-500 mb-2 flex flex-wrap gap-1 font-paragraph-default">
                      <span className="font-semibold text-gray-700">{t('Opties:', 'Options:')}</span> {visibleModalVariants.map((v: string) => t(v)).join(', ')}
                    </p>
                  ) : null;
                })()}
                {infoModalProduct.sauces && infoModalProduct.sauces.length > 0 && (
                  <div className="inline-flex items-start gap-1.5 bg-yellow-50/40 border border-yellow-100/50 px-2.5 py-1.5 rounded-lg w-fit mb-3 font-paragraph-default">
                    <span className="text-[#d4af37] text-sm leading-none mt-0.5">✦</span> 
                    <span className="text-xs text-gray-600 font-medium leading-tight">{t('Inclusief:', 'Includes:')} <span className="font-bold text-gray-900">{infoModalProduct.sauces.map((s: string) => t(s)).join(', ')}</span></span>
                  </div>
                )}
                {getSnackExtraInfo(infoModalProduct, language, t) && (
                  <div className="text-gray-600 whitespace-pre-wrap font-paragraph-default text-sm leading-relaxed">
                    {getSnackExtraInfo(infoModalProduct, language, t)}
                  </div>
                )}
              </div>
              
              <div className="mt-2 pt-4 border-t border-gray-100">
                <h4 className="font-bold text-ob-blue mb-3 font-heading-default">{t('Toevoegen aan bestelling', 'Add to order')}</h4>
                {(() => {
                  const modalCategory = infoModalProduct._openedFromCategory || '';
                  const sortedModalVariants = (infoModalProduct.variants && infoModalProduct.variants.length > 0)
                    ? sortVariantsByCategory(infoModalProduct.variants, modalCategory, infoModalProduct, pageContent?.category_variant_rules)
                    : [];
                  const defaultModalVariant = sortedModalVariants[0] || '';
                  const variantKey = `${modalCategory}_${infoModalProduct.name}`;
                  const prevSelected = selectedVariants[variantKey];
                  const currentVariant = sortedModalVariants.length > 0
                    ? (prevSelected && sortedModalVariants.includes(prevSelected) ? prevSelected : defaultModalVariant)
                    : '';
                  const modalPortions = (infoModalProduct.portions && infoModalProduct.portions.length > 0)
                    ? [...infoModalProduct.portions].sort((a: number, b: number) => a - b)
                    : PORTION_SIZES;
                  
                  return (
                    <>
                      {sortedModalVariants.length > 1 ? (
                        <div className="flex flex-col gap-1.5 w-full mb-3">
                          <div className="flex items-center text-xs">
                            <span className="font-semibold text-gray-700">Kies variant:</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 w-full">
                            {sortedModalVariants.map((v: string, vIdx: number) => {
                              const isSelected = currentVariant === v;
                              return (
                                <button
                                  key={`emp-modal-var-${v}-${vIdx}`}
                                  type="button"
                                  onClick={() => setSelectedVariants({...selectedVariants, [variantKey]: v})}
                                  className={`flex-1 min-w-[70px] py-1.5 px-3 text-xs rounded-full font-bold transition-all border text-center ${
                                    isSelected
                                      ? 'bg-[#151f34] text-white border-[#151f34] shadow-sm ring-1 ring-[#151f34]'
                                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                  }`}
                                >
                                  {v}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : sortedModalVariants.length === 1 ? (
                        <div className="flex items-center gap-1.5 text-xs text-gray-600 mb-3">
                          <span className="font-semibold text-gray-700">Variant:</span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                            {sortedModalVariants[0]}
                          </span>
                        </div>
                      ) : null}
                      
                      <div className="grid grid-cols-2 gap-2 w-full">
                        {Array.from(new Set(modalPortions)).sort((a: any, b: any) => Number(a) - Number(b)).map((size: any, sizeIdx: number) => {
                          const selKey = currentVariant ? `${size}_${currentVariant}` : size.toString();
                          const prodSelections = selections[infoModalProduct.name] || {};
                          const countForCurrentSelection = prodSelections[selKey] || 0;
                          
                          const cleanInfoProd = (infoModalProduct.name || '').trim();
                          const basePrice = prices[cleanInfoProd + '_' + size] ?? prices[infoModalProduct.name + '_' + size];
                          const displayPrice = basePrice !== undefined ? basePrice + getVariantSurcharge(infoModalProduct.name, currentVariant, size) : undefined;
                          
                          const isSoldOut = ['uitverkocht', 'sold out', 'sold_out'].includes((infoModalProduct.status || '').toLowerCase());
                          const isDisabled = basePrice === undefined || isSoldOut;
                          
                          return (
                            <button
                              key={`emp-modal-size-${size}-${sizeIdx}`}
                              type="button"
                              disabled={isDisabled} 
                              onClick={() => {
                                handlePortionSelect(infoModalProduct.name, size, currentVariant);
                              }}
                              className={`relative py-3 px-1 text-sm rounded-lg border transition-all flex flex-col items-center justify-center gap-1 ${isDisabled ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200' : countForCurrentSelection > 0 ? 'bg-[#151f34] text-white border-[#151f34] shadow-md' : 'bg-white text-gray-700 border-gray-200 hover:border-[#151f34] hover:shadow-sm'}`}
                            >
                              <span className="font-bold text-[14px]">{size} stuks</span>
                              <span className={`text-[12px] font-medium ${countForCurrentSelection > 0 ? 'text-white/90' : 'text-gray-500'}`}>{displayPrice !== undefined ? `€${displayPrice.toFixed(2)}` : '-'}</span>
                              
                              {countForCurrentSelection > 0 && (
                                <div 
                                  role="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handlePortionDeselect(infoModalProduct.name, size, currentVariant, e);
                                  }}
                                  className="absolute top-5 -right-2 bg-gray-400 text-white text-[12px] font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md border-2 border-white hover:bg-red-500 transition-colors z-10 cursor-pointer"
                                  title="Verwijder één"
                                >
                                  -
                                </div>
                              )}
                              {countForCurrentSelection > 0 && (
                                <span className="absolute -top-2 -right-2 bg-[#151f34] text-white text-[11px] font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md border-2 border-white">
                                  {countForCurrentSelection}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
