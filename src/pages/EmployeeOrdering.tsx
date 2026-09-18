import React, { useState, useEffect, FormEvent, MouseEvent } from 'react';
import { supabase, sortVariantsByCategory } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { PackageOpen, MapPin, Phone, ShoppingBag, CheckCircle2 , Clock, Calendar, Truck, X, Info, Utensils } from 'lucide-react';
import { motion } from 'framer-motion';

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
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [prices, setPrices] = useState<PriceMap>({});
  
  const [maxSpendLimit, setMaxSpendLimit] = useState<number | null>(null);

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


  useEffect(() => {
    fetchData();
  }, []);

  const getVariantSurcharge = (productName: string, variant: string, size: string | number) => {
    if (!variant) return 0;
    const prod = dbProducts.find(p => p.name === productName);
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
    for (const [s, qty] of Object.entries(sizes as any)) {
      const parts = String(s).split('_');
      const sizeNum = parts[0];
      const variant = parts[1] || '';
      const basePrice = prices[`${prod}_${sizeNum}`] || 0;
      const surcharge = getVariantSurcharge(prod, variant, sizeNum);
      prodSum += (basePrice + surcharge) * (qty as number);
    }
    return sum + prodSum;
  }, 0);

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

      let prods = null; try { const { data } = await supabase.from('ob_products').select('*').order('sort_order', { ascending: true, nullsFirst: false }).order('created_at', { ascending: true }); prods = data; } catch (e) { console.warn('No products table'); }
      if (prods) setDbProducts(prods);
      const { data: priceData } = await supabase.from('ob_product_prices').select('*');
      if (priceData) {
        const pMap: PriceMap = {};
        
        // 1. Default prices (no company_id)
        priceData.filter((p: any) => !p.company_id).forEach((p: any) => {
          pMap[`${p.product_name}_${p.portion_size}`] = parseFloat(p.price);
        });

        // 2. Company specific override
        priceData.filter((p: any) => p.company_id === compId).forEach((p: any) => {
          pMap[`${p.product_name}_${p.portion_size}`] = parseFloat(p.price);
        });
        
                setPrices(pMap);
      }

            // Fetch allowed delivery methods
      const { data: cdmData, error: cdmError } = await supabase.from('ob_company_delivery_methods').select('delivery_method_id').eq('company_id', compId);
      if (cdmError) console.error('Error fetching company delivery methods:', cdmError);
      
      if (cdmData && cdmData.length > 0) {
        const allowedIds = cdmData.map(a => a.delivery_method_id);
        const { data: dmData, error: dmError } = await supabase.from('ob_delivery_methods').select('*').in('id', allowedIds).eq('is_active', true).order('sort_order', { ascending: true });
        if (dmError) console.error('Error fetching delivery methods:', dmError);
        if (dmData && dmData.length > 0) {
          setDeliveryMethods(dmData);
          setSelectedDeliveryMethod(dmData[0]);
        }
      } else {
        // Fallback to defaults if none selected for company
        const { data: dmData, error: dmError } = await supabase.from('ob_delivery_methods').select('*').eq('is_active', true).order('sort_order', { ascending: true });
        if (dmError) console.error('Error fetching fallback delivery methods:', dmError);
        if (dmData && dmData.length > 0) {
          setDeliveryMethods(dmData);
          setSelectedDeliveryMethod(dmData[0]);
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
      setError("Selecteer a.u.b. minimaal één product en vul uw contactgegevens in.");
      return;
    }

    setIsSubmitting(true);
    setError('');

    const totalOrderPrice = Object.entries(selections).reduce((sum, [prod, sizes]) => {
      let prodSum = 0;
      for (const [s, qty] of Object.entries(sizes as any)) {
        const parts = String(s).split('_');
        const sizeNum = parts[0];
        const variant = parts[1] || '';
        const basePrice = prices[`${prod}_${sizeNum}`] || 0;
        const surcharge = getVariantSurcharge(prod, variant, sizeNum);
        prodSum += (basePrice + surcharge) * (qty as number);
      }
      return sum + prodSum;
    }, 0);
    
    if (maxSpendLimit !== null && totalOrderPrice > maxSpendLimit) {
      setError(`Het maximaal toegestane bedrag per bestelling is €${maxSpendLimit.toFixed(2)}. Het totaalbedrag is nu €${totalOrderPrice.toFixed(2)}.`);
      setIsSubmitting(false);
      return;
    }

    if (supabase) {
      try {
        const orderPromises: any[] = [];
        const orderLines: any[] = [];
        Object.entries(selections).forEach(([prod, sizes]) => {
          Object.entries(sizes as any).forEach(([sizeStr, qty]) => {
            const parts = String(sizeStr).split('_');
            const sizeNum = Number(parts[0]);
            const variant = parts[1] || '';
            const basePrice = prices[`${prod}_${sizeNum}`] || 0;
            const surcharge = getVariantSurcharge(prod, variant, sizeNum);
            const price = basePrice + surcharge;
            let finalProdName = variant ? `${prod} (${variant})` : prod;
            const dbProduct = dbProducts.find(p => p.name === prod);
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
                notes: notes,
                delivery_date: deliveryMode === 'zsm' ? new Date().toISOString().split('T')[0] : deliveryDate,
                delivery_time: deliveryMode === 'zsm' ? 'Zo snel mogelijk' : deliveryTime
              }));
            }
          });
        });

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
            notes: notes,
            delivery_date: deliveryMode === 'zsm' ? new Date().toISOString().split('T')[0] : deliveryDate,
            delivery_time: deliveryMode === 'zsm' ? 'Zo snel mogelijk' : deliveryTime
          }));
        }

        
        const results = await Promise.all(orderPromises);
        const errors = results.filter(r => r.error);
        if (errors.length > 0) throw errors[0].error;

        // Try to send the invoice email
        try {
          const res = await fetch('/api/send-invoice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            
            body: JSON.stringify({
              companyId,
              selections,
              prices,
              orderLines,
              addressId: selectedAddress,
              phone,
              notes,
              totalOrderPrice,
              deliveryDate: deliveryMode === 'zsm' ? new Date().toISOString().split('T')[0] : deliveryDate,
              deliveryTime: deliveryMode === 'zsm' ? 'Zo snel mogelijk' : deliveryTime,
              deliveryMethod: selectedDeliveryMethod?.name || 'Standaard Bezorging',
              deliveryMethodPrice: selectedDeliveryMethod?.price || 0
            })

          });
        } catch (emailErr) {
          console.error("Kon email niet verzenden:", emailErr);
          // We still show success to the user since the DB insert worked
        }

        setOrderSuccess(true);

      } catch (e: any) {
        console.error(e);
        setError("Er ging iets mis bij het plaatsen van de bestelling.");
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
          <h2 className="text-3xl font-bold text-ob-text mb-4">Bestelling Geplaatst!</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Uw kantoorborrel is succesvol besteld en zal op de gekozen afleverlocatie worden bezorgd.
            {emailFailed && <span className="block mt-4 text-orange-600 text-sm">Opmerking: Wegens een technische vertraging bij onze e-mailprovider duren bevestigingsmails momenteel iets langer dan gebruikelijk.</span>}
          </p>
          <button 
            onClick={() => {
              setOrderSuccess(false);
              setSelections({});
              setNotes('');
            }}
            className="w-full bg-ob-blue text-white py-3 rounded-lg font-semibold hover:bg-ob-blue-dark transition-colors"
          >
            Nieuwe Bestelling
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6f9] pt-28 pb-20 font-serif">
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-ob-text mb-1">Nieuwe Bestelling</h1>
            <p className="text-gray-500">Bestel via het account van <strong className="text-ob-blue">{companyName}</strong></p>
          </div>
          <button onClick={handleLogout} className="text-sm font-semibold text-red-600 hover:text-red-800 transition-colors">
            Uitloggen
          </button>
        </div>

        {error && (
          <div className="mb-8 bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        
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
                  <label key={method.id} className={`flex flex-col p-4 border rounded-xl cursor-pointer transition-colors ${selectedDeliveryMethod?.id === method.id ? 'border-ob-blue bg-blue-50/30 ring-1 ring-ob-blue' : 'border-gray-200 hover:bg-gray-50'}`}>
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
                          {method.price === 0 ? 'Gratis' : `+ €${Number(method.price).toFixed(2)}`}
                        </span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </section>
          )}

          {/* Step 1: Producten & Porties */}

          <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-ob-text flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-ob-blue text-white flex items-center justify-center text-sm">1</span> 
                Kies uw Snacks & Porties
              </h2>
              {maxSpendLimit !== null && (
                <div className={`text-sm font-medium px-3 py-1 rounded-lg ${totalOrderPrice > maxSpendLimit ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-blue-50 text-ob-blue'}`}>
                  Budget: €{maxSpendLimit.toFixed(2)} {totalOrderPrice > 0 && `(Gekozen: €${totalOrderPrice.toFixed(2)})`}
                </div>
              )}
            </div>
            
            {assortment.length === 0 ? (
              <p className="text-gray-500 italic">Uw kantoor heeft momenteel geen assortiment geselecteerd. Neem contact op met uw office manager.</p>
            ) : (
              <div className="flex flex-col gap-10">
                {(() => {
                  const itemsToRender = dbProducts.length > 0 
                    ? dbProducts.filter(p => assortment.includes(p.name) && !['inactive', 'inactief', 'verborgen'].includes((p.status || '').toLowerCase()))
                    : assortment.map(name => ({ name, status: 'Actief' }));

                  // Group items by category if available, maintaining category sort order
                  const grouped = itemsToRender.reduce((acc: any, item: any) => {
                    const itemCats = item.additional_categories && item.additional_categories.length > 0 
                      ? Array.from(new Set([item.category, ...item.additional_categories])) 
                      : [item.category || 'Assortiment'];
                    itemCats.forEach((cat: string) => {
                      if (!acc[cat]) acc[cat] = [];
                      acc[cat].push(item);
                    });
                    return acc;
                  }, {});

                  const categoryList = Object.keys(grouped).map(key => {
                    const primaryItems = itemsToRender.filter(
                      (i: any) => (i.category || 'Assortiment').trim().toLowerCase() === key.trim().toLowerCase()
                    );
                    const minSortOrder = primaryItems.length > 0
                      ? Math.min(...primaryItems.map((i: any) => i.sort_order ?? 9999))
                      : Math.min(...grouped[key].map((i: any) => i.sort_order ?? 9999));

                    return {
                      title: key,
                      items: grouped[key],
                      minSortOrder
                    };
                  });
                  categoryList.sort((a, b) => a.minSortOrder - b.minSortOrder);

                  return categoryList.map((category) => (
                    <div key={category.title}>
                      {categoryList.length > 1 && category.title !== 'Assortiment' && (
                        <h3 className="text-2xl font-serif font-bold text-ob-blue mb-5 border-b pb-2">{category.title}</h3>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {category.items.map((item: any) => {
                          const product = item.name;
                          const prodSelections = selections[product] || {};
                          const productSizes = (item.portions && item.portions.length > 0) ? item.portions : PORTION_SIZES;
                          const isSoldOut = ['uitverkocht', 'sold out', 'sold_out'].includes((item.status || '').toLowerCase());
                          const hasSelections = Object.keys(prodSelections).length > 0;
                          
                          return (
                            <div 
                              key={product} 
                              className={`flex flex-col h-full border rounded-xl overflow-hidden transition-all ${
                                hasSelections 
                                  ? 'border-ob-blue shadow-md ring-1 ring-ob-blue/10 bg-white' 
                                  : 'border-gray-200 bg-white hover:border-ob-blue/40 hover:shadow-sm'
                              } ${isSoldOut ? 'opacity-70' : ''}`}
                            >
                              {/* Top info section */}
                              <div className="p-4 flex gap-4">
                                <div 
                                  className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-100 relative group cursor-pointer" 
                                  onClick={() => setInfoModalProduct({ ...item, _openedFromCategory: category.title })}
                                >
                                  {item.image_url || PRODUCT_IMAGES[product] || item.image ? (
                                    <img 
                                      src={item.image_url || PRODUCT_IMAGES[product] || item.image} 
                                      alt={product} 
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                      <PackageOpen size={24} />
                                    </div>
                                  )}
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white text-xs font-semibold">Meer info</span>
                                  </div>
                                </div>
                                
                                <div className="flex-1 min-w-0 flex flex-col">
                                  <div className="flex items-start justify-between gap-2 mb-1.5">
                                    <h4 className="font-bold text-[15px] text-[#05053D] leading-tight">{product}</h4>
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
                                  
                                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                                    {item.status && !['actief', 'inactief', 'verborgen', 'active', 'inactive', 'hidden'].includes((item.status || '').toLowerCase()) && (
                                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase ${isSoldOut ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-blue-700 border border-blue-100'}`}>
                                        {item.status === 'new' ? 'Nieuw' : item.status === 'popular' ? 'Meest Gekozen' : item.status === 'sold_out' ? 'Uitverkocht' : item.status === 'coming_soon' ? 'Binnenkort' : item.status}
                                      </span>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => setInfoModalProduct({ ...item, _openedFromCategory: category.title })}
                                      className="text-[11px] text-ob-blue bg-blue-50/60 hover:bg-blue-100 px-2 py-0.5 rounded flex items-center gap-1 font-medium transition-colors cursor-pointer"
                                    >
                                      <Info size={12} />
                                      Meer info
                                    </button>
                                  </div>

                                  {(item.variants && item.variants.length > 0) && (
                                    <p className="text-xs text-gray-500 mb-2 flex flex-wrap gap-1">
                                      <span className="font-semibold text-gray-700">Opties:</span> {sortVariantsByCategory(item.variants, category.title).join(', ')}
                                    </p>
                                  )}

                                  {item.sauces && item.sauces.length > 0 && (
                                    <div className="mt-auto inline-flex items-start gap-1.5 bg-yellow-50/40 border border-yellow-100/50 px-2.5 py-1.5 rounded-lg w-fit">
                                      <span className="text-[#d4af37] text-sm leading-none mt-0.5">✦</span> 
                                      <span className="text-xs text-gray-600 font-medium leading-tight">Inclusief: <span className="font-bold text-gray-900">{item.sauces.join(', ')}</span></span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Action section pushed to bottom */}
                              <div className="p-4 bg-gray-50/50 mt-auto border-t border-gray-100 flex flex-col gap-3">
                                {(() => {
                                  const sortedVariants = (item.variants && item.variants.length > 0)
                                    ? sortVariantsByCategory(item.variants, category.title)
                                    : [];
                                  const defaultVariant = sortedVariants[0] || '';
                                  const variantKey = `${category.title}_${product}`;
                                  const currentVariant = (item.variants && item.variants.length > 0) ? (selectedVariants[variantKey] || defaultVariant) : '';
                                  
                                  return (
                                    <>
                                      {sortedVariants.length > 0 && (
                                        <div className="flex flex-col gap-1.5 w-full">
                                          <div className="flex items-center text-xs">
                                            <span className="font-semibold text-gray-700">Kies variant:</span>
                                          </div>
                                          <div className="flex flex-wrap gap-1.5 w-full">
                                            {sortedVariants.map((v: string) => {
                                              const isSelected = currentVariant === v;
                                              return (
                                                <button
                                                  key={v}
                                                  type="button"
                                                  onClick={() => setSelectedVariants({...selectedVariants, [variantKey]: v})}
                                                  className={`flex-1 min-w-[70px] py-1.5 px-2.5 text-xs rounded-full font-bold transition-all border text-center ${
                                                    isSelected
                                                      ? 'bg-[#05053D] text-white border-[#05053D] shadow-sm ring-1 ring-[#05053D]'
                                                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                  }`}
                                                >
                                                  {v}
                                                </button>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      )}
                                      <div className="grid grid-cols-2 gap-2 w-full">
                                        {productSizes.map((size: number) => {
                                          const selKey = currentVariant ? `${size}_${currentVariant}` : size.toString();
                                          const countForCurrentSelection = prodSelections[selKey] || 0;
                                          const totalCountForSize = Object.keys(prodSelections).reduce((sum, key) => (key === size.toString() || key.startsWith(size + '_')) ? sum + prodSelections[key] : sum, 0);
                                          
                                          const basePrice = prices[product + '_' + size];
                                          const displayPrice = basePrice !== undefined ? basePrice + getVariantSurcharge(product, currentVariant, size) : undefined;
                                          const isDisabled = basePrice === undefined || isSoldOut;
                                          
                                          return (
                                            <button
                                              key={size}
                                              type="button"
                                              disabled={isDisabled} 
                                              onClick={() => {
                                                handlePortionSelect(product, size, currentVariant);
                                              }}
                                              className={`relative py-2 px-1 text-sm rounded-lg border transition-all flex flex-col items-center justify-center gap-0.5 ${isDisabled ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200' : countForCurrentSelection > 0 ? 'bg-[#151f33] text-white border-[#151f33] shadow-md' : 'bg-white text-gray-700 border-gray-200 hover:border-[#151f33] hover:shadow-sm'}`}
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
                                                <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[11px] font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md border-2 border-white">
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
                                            {Object.entries(prodSelections).map(([s, qty]) => {
                                              const parts = s.split('_');
                                              const sizeNum = parts[0];
                                              const variant = parts[1] || '';
                                              const basePrice = prices[`${product}_${sizeNum}`] || 0;
                                              const surcharge = getVariantSurcharge(product, variant, sizeNum);
                                              const itemPrice = (basePrice + surcharge) * (qty as number);
                                              return (
                                                <div key={s} className="flex justify-between items-center text-xs bg-white px-2.5 py-1.5 rounded border border-gray-200">
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
                  ));
                })()}
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
          <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-ob-text mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-ob-blue text-white flex items-center justify-center text-sm">2</span> 
              Aflevergegevens
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-ob-text mb-2 flex items-center gap-2">
                  <MapPin size={16} className="text-gray-400" /> Kies Afleverlocatie
                </label>
                <select 
                  required
                  value={selectedAddress}
                  onChange={(e) => setSelectedAddress(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-ob-blue bg-white"
                >
                  <option value="" disabled>Selecteer een locatie...</option>
                  {addresses.map(addr => (
                    <option key={addr.id} value={addr.id}>
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
              <div>
                <label className="block text-sm font-semibold text-ob-text mb-2 flex items-center gap-2">
                  <Phone size={16} className="text-gray-400" /> Telefoonnummer contactpersoon
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

          {/* Submit */}
          <div className="pt-4">
            <button 
              type="submit" 
              disabled={isSubmitting || Object.keys(selections).length === 0 || !selectedAddress || !phone || (deliveryMode === 'scheduled' && (!deliveryDate || !deliveryTime))}
              className="w-full bg-[#05053D] text-white py-4 rounded-xl font-bold text-lg hover:bg-ob-blue transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isSubmitting ? 'Bezig met plaatsen...' : <><ShoppingBag size={20} /> Bestelling Plaatsen</>}
            </button>
          </div>

        </form>
      </div>

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
                   <span className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-ob-blue px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm">
                     {infoModalProduct._openedFromCategory}
                   </span>
                 )}
               </div>
            ) : null}
            
            <div className="p-6 overflow-y-auto flex flex-col gap-4">
              <div>
                <h3 className="text-2xl font-serif font-bold text-ob-blue pr-6 mb-2">{infoModalProduct.name}</h3>
                {(infoModalProduct.variants && infoModalProduct.variants.length > 0) && (
                  <p className="text-xs text-gray-500 mb-2 flex flex-wrap gap-1">
                    <span className="font-semibold text-gray-700">Opties:</span> {sortVariantsByCategory(infoModalProduct.variants, infoModalProduct._openedFromCategory || '').join(', ')}
                  </p>
                )}
                {infoModalProduct.sauces && infoModalProduct.sauces.length > 0 && (
                  <div className="inline-flex items-start gap-1.5 bg-yellow-50/40 border border-yellow-100/50 px-2.5 py-1.5 rounded-lg w-fit mb-3">
                    <span className="text-[#d4af37] text-sm leading-none mt-0.5">✦</span> 
                    <span className="text-xs text-gray-600 font-medium leading-tight">Inclusief: <span className="font-bold text-gray-900">{infoModalProduct.sauces.join(', ')}</span></span>
                  </div>
                )}
                {infoModalProduct.extra_info && <div className="text-gray-600 whitespace-pre-wrap">{infoModalProduct.extra_info}</div>}
              </div>
              
              <div className="mt-2 pt-4 border-t border-gray-100">
                <h4 className="font-bold text-ob-blue mb-3">Toevoegen aan bestelling</h4>
                {(() => {
                  const modalCategory = infoModalProduct._openedFromCategory || '';
                  const sortedModalVariants = (infoModalProduct.variants && infoModalProduct.variants.length > 0)
                    ? sortVariantsByCategory(infoModalProduct.variants, modalCategory)
                    : [];
                  const defaultModalVariant = sortedModalVariants[0] || '';
                  const variantKey = `${modalCategory}_${infoModalProduct.name}`;
                  const currentVariant = (infoModalProduct.variants && infoModalProduct.variants.length > 0) ? (selectedVariants[variantKey] || defaultModalVariant) : '';
                  const modalPortions = (infoModalProduct.portions && infoModalProduct.portions.length > 0)
                    ? [...infoModalProduct.portions].sort((a: number, b: number) => a - b)
                    : PORTION_SIZES;
                  
                  return (
                    <>
                      {sortedModalVariants.length > 0 && (
                        <div className="flex flex-col gap-1.5 w-full mb-3">
                          <div className="flex items-center text-xs">
                            <span className="font-semibold text-gray-700">Kies variant:</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 w-full">
                            {sortedModalVariants.map((v: string) => {
                              const isSelected = currentVariant === v;
                              return (
                                <button
                                  key={v}
                                  type="button"
                                  onClick={() => setSelectedVariants({...selectedVariants, [variantKey]: v})}
                                  className={`flex-1 min-w-[70px] py-1.5 px-3 text-xs rounded-full font-bold transition-all border text-center ${
                                    isSelected
                                      ? 'bg-[#05053D] text-white border-[#05053D] shadow-sm ring-1 ring-[#05053D]'
                                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                  }`}
                                >
                                  {v}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-2 w-full">
                        {modalPortions.map((size: number) => {
                          const selKey = currentVariant ? `${size}_${currentVariant}` : size.toString();
                          const prodSelections = selections[infoModalProduct.name] || {};
                          const countForCurrentSelection = prodSelections[selKey] || 0;
                          
                          const basePrice = prices[infoModalProduct.name + '_' + size];
                          const displayPrice = basePrice !== undefined ? basePrice + getVariantSurcharge(infoModalProduct.name, currentVariant, size) : undefined;
                          
                          const isSoldOut = ['uitverkocht', 'sold out', 'sold_out'].includes((infoModalProduct.status || '').toLowerCase());
                          const isDisabled = basePrice === undefined || isSoldOut;
                          
                          return (
                            <button
                              key={size}
                              type="button"
                              disabled={isDisabled}
                              onClick={() => {
                                handlePortionSelect(infoModalProduct.name, size, currentVariant);
                              }}
                              className={`relative py-3 px-1 text-sm rounded-lg border transition-all flex flex-col items-center justify-center gap-1 ${isDisabled ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200' : countForCurrentSelection > 0 ? 'bg-[#151f33] text-white border-[#151f33] shadow-md' : 'bg-white text-gray-700 border-gray-200 hover:border-[#151f33] hover:shadow-sm'}`}
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
                                <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[11px] font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md border-2 border-white">
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
