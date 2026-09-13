import { useState, FormEvent, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Utensils, CheckCircle, Info, ShoppingBag, ArrowLeft, Building, Mail, MapPin, Phone, Calendar, Clock, Truck } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export function GuestOrdering() {
  const [assortment, setAssortment] = useState<string[]>(['Snack Mix', 'Bitterballen']);
  const [prices, setPrices] = useState<Record<string, number>>({ 
    'Snack Mix_25': 24.00, 'Snack Mix_50': 45.00,
    'Bitterballen_25': 22.00, 'Bitterballen_50': 40.00,
    'Vlammetjes_25': 25.00, 'Vlammetjes_50': 47.00,
    'Frikandelletjes_25': 20.00, 'Frikandelletjes_50': 38.00,
    'Mini Kroketjes_25': 23.00, 'Mini Kroketjes_50': 42.00,
    'Chicken Wings_25': 26.00, 'Chicken Wings_50': 50.00,
    'Kipnuggets_25': 21.00, 'Kipnuggets_50': 39.00,
    'Karaage Kip_25': 28.00, 'Karaage Kip_50': 52.00,
    "Butterfly Gamba's_25": 30.00, "Butterfly Gamba's_50": 55.00,

    'Kaasstengels_25': 24.00, 'Kaasstengels_50': 45.00,
    'Curry Samosas_25': 25.00, 'Curry Samosas_50': 47.00,
    'Mini Loempia_25': 22.00, 'Mini Loempia_50': 40.00,
    'Vegan Bitterballen_25': 26.00, 'Vegan Bitterballen_50': 48.00,
  });

  const [selections, setSelections] = useState<Record<string, Record<number, number>>>({});
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [deliveryMethods, setDeliveryMethods] = useState<any[]>([]);
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState<any>(null);
  
  // Guest Details
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestBillingInfo, setGuestBillingInfo] = useState('');
  const location = useLocation();
  const sessionPref = sessionStorage.getItem('deliveryPref');
  const initialDeliveryMode = (location.state?.deliveryMode === 'scheduled' || sessionPref === 'scheduled') ? 'scheduled' : 'zsm';

  const [guestAddress, setGuestAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  
  const [deliveryMode, setDeliveryMode] = useState<'zsm' | 'scheduled'>(initialDeliveryMode);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [emailFailed, setEmailFailed] = useState(false);
  const [error, setError] = useState('');

  // Fetch prices if available
  useEffect(() => {
    async function fetchAssortment() {
      if (supabase) {
        const { data: globalPrices } = await supabase.from('ob_product_prices').select('*');
        let prods = null; try { const { data } = await supabase.from('ob_products').select('*').order('sort_order', { ascending: true, nullsFirst: false }).order('created_at', { ascending: true }); prods = data; } catch (e) { console.warn('No products table'); }
        if (prods) setDbProducts(prods);
        if (prods) {
          const grouped = prods.reduce((acc, item) => {
            if (item.status === 'Verborgen' || item.status === 'Inactief') return acc;
            if (!acc[item.category]) acc[item.category] = [];
            acc[item.category].push(item);
            return acc;
          }, {});
          
          const cats = Object.keys(grouped).map(key => ({
            title: key,
            items: grouped[key],
            minSortOrder: Math.min(...grouped[key].map((i: any) => i.sort_order || 0))
          }));
          cats.sort((a, b) => a.minSortOrder - b.minSortOrder);
          setCategories(cats);

        }

                        if (globalPrices) {
          const newPrices: Record<string, number> = {};
          const productNames = new Set<string>();
          globalPrices.forEach(gp => {
            newPrices[`${gp.product_name}_${gp.portion_size}`] = gp.price || gp.default_price;
            productNames.add(gp.product_name);
          });
          if (Object.keys(newPrices).length > 0) {
            setPrices(prev => ({ ...prev, ...newPrices }));
          }
        }
        
        const { data: dmData, error: dmError } = await supabase.from('ob_delivery_methods').select('*').eq('is_active', true).order('sort_order', { ascending: true });
        if (dmError) console.error('Error fetching delivery methods:', dmError);
        if (dmData && dmData.length > 0) {
          setDeliveryMethods(dmData);
          setSelectedDeliveryMethod(dmData[0]);
        }


      }
    }
    fetchAssortment();
  }, []);

  const handlePortionSelect = (product: string, size: number) => {
    setSelections(prev => {
      const currentObj = prev[product] || {};
      const currentQty = currentObj[size] || 0;
      return {
        ...prev,
        [product]: {
          ...currentObj,
          [size]: currentQty + 1
        }
      };
    });
  };

  const handleRemove = (product: string) => {
    setSelections(prev => {
      const copy = { ...prev };
      delete copy[product];
      return copy;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (Object.keys(selections).length === 0 || !guestName || !guestEmail || !guestAddress || !phone || (deliveryMode === 'scheduled' && (!deliveryDate || !deliveryTime))) {
      setError("Vul a.u.b. alle verplichte velden in en selecteer minimaal één product.");
      return;
    }

    setIsSubmitting(true);
    setError('');

    const totalOrderPrice = Object.entries(selections).reduce((sum, [prod, sizes]) => {
      let prodSum = 0;
      for (const [s, qty] of Object.entries(sizes as any)) {
        prodSum += (prices[`${prod}_${s}`] || 0) * (qty as number);
      }
      return sum + prodSum;
    }, 0);

    const fullNotes = `
[GAST BESTELLING]
Naam: ${guestName}
Email: ${guestEmail}
Factuuradres/KVK: ${guestBillingInfo}
Bezorgadres: ${guestAddress}
Extra Notities: ${notes}
    `.trim();

    if (supabase) {
      try {
        const orderPromises: any[] = [];
        Object.entries(selections).forEach(([prod, sizes]) => {
          Object.entries(sizes as any).forEach(([sizeStr, qty]) => {
            const size = Number(sizeStr);
            const price = prices[`${prod}_${size}`] || 0;
            
            for (let i = 0; i < (qty as number); i++) {
              orderPromises.push(supabase.from('ob_orders').insert({
                product_name: prod,
                portion_size: size,
                price: price,
                total_price: price,
                phone: phone,
                notes: fullNotes,
                delivery_date: deliveryMode === 'zsm' ? new Date().toISOString().split('T')[0] : deliveryDate,
                delivery_time: deliveryMode === 'zsm' ? 'Zo snel mogelijk' : deliveryTime
              }));
            }
          });
        });

        if (selectedDeliveryMethod && selectedDeliveryMethod.price > 0) {
          orderPromises.push(supabase.from('ob_orders').insert({
            product_name: 'Bezorging: ' + selectedDeliveryMethod.name,
            portion_size: 1,
            price: selectedDeliveryMethod.price,
            total_price: selectedDeliveryMethod.price,
            phone: phone,
            notes: fullNotes,
            delivery_date: deliveryMode === 'zsm' ? new Date().toISOString().split('T')[0] : deliveryDate,
            delivery_time: deliveryMode === 'zsm' ? 'Zo snel mogelijk' : deliveryTime
          }));
        }

        
        const results = await Promise.all(orderPromises);
        const errors = results.filter(r => r.error);
        if (errors.length > 0) throw errors[0].error;

        try {
          const res = await fetch('/api/send-guest-invoice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              guestName,
              guestEmail,
              guestBillingInfo,
              guestAddress,
              selections,
              prices,
              phone,
              notes,
              totalOrderPrice,
              deliveryDate: deliveryMode === 'zsm' ? new Date().toISOString().split('T')[0] : deliveryDate,
              deliveryTime: deliveryMode === 'zsm' ? 'Zo snel mogelijk' : deliveryTime
            })
          });
          if (!res.ok) {
            setEmailFailed(true);
          }
        } catch (emailErr) {
          console.error("Kon email niet verzenden:", emailErr);
          setEmailFailed(true);
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

  if (orderSuccess) {
    return (
      <div className="font-serif min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 text-center border border-gray-100">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-500" />
          </div>
          <h2 className="text-3xl font-bold text-ob-blue mb-4">Bestelling Ontvangen!</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Bedankt voor uw bestelling, {guestName}. We hebben uw aanvraag goed ontvangen.{emailFailed ? " (Op dit moment is er een lichte vertraging in ons e-mailsysteem. Uw bestelling is veilig in goede banen, maar de bevestigingsmail volgt mogelijk iets later)." : " De factuur is verstuurd naar uw e-mail."}
          </p>
          <Link 
            to="/"
            className="inline-block bg-ob-blue text-white px-8 py-3 rounded-xl font-semibold hover:bg-ob-blue-dark transition-colors"
          >
            Terug naar home
          </Link>
        </div>
      </div>
    );
  }

  const totalOrderPrice = Object.entries(selections).reduce((sum, [prod, sizes]) => {
      let prodSum = 0;
      for (const [s, qty] of Object.entries(sizes as any)) {
        prodSum += (prices[`${prod}_${s}`] || 0) * (qty as number);
      }
      return sum + prodSum;
    }, 0);

  return (
    <div className="font-serif min-h-screen bg-gray-50 pb-20 pt-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-ob-blue hover:text-ob-accent font-semibold mb-6">
          <ArrowLeft size={20} /> Terug naar home
        </Link>
        
        
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
                    <label key={method.id} className={`flex flex-col p-4 border rounded-xl cursor-pointer transition-colors ${selectedDeliveryMethod?.id === method.id ? 'border-ob-blue bg-blue-50/30 ring-1 ring-ob-blue' : 'border-gray-200 hover:bg-gray-50'}`}>
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
                            {method.price === 0 ? 'Gratis' : `+ €${Number(method.price).toFixed(2)}`}
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

          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl font-bold text-ob-blue flex items-center gap-2">
                <Utensils size={20} className="text-ob-accent" /> Assortiment & Prijzen
              </h2>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col gap-12">
                {categories.map((category) => (
                  <div key={category.title}>
                    <h3 className="text-2xl font-serif font-bold text-ob-blue mb-6 border-b pb-2">{category.title}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {category.items.map((item) => {
                        const product = item.name;
                        const prodSelections = selections[product] || {};
                        let productSizes = Object.keys(prices)
                          .filter(key => key.startsWith(product + "_"))
                          .map(key => parseInt(key.split("_")[1], 10))
                          .sort((a, b) => a - b);
                        if (item.portions && item.portions.length > 0) {
                          productSizes = item.portions;
                        }
                        
                        return (
                          <div key={product} className={"flex gap-4 border rounded-xl p-4 transition-all " + (Object.keys(prodSelections).length > 0 ? 'border-ob-blue bg-blue-50/30 shadow-sm' : 'border-gray-200 hover:border-ob-blue/30')}>
                            <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                              <img src={item.image_url || item.image} alt={product} className="w-full h-full object-cover" />
                            </div>
                            
                            <div className="flex-1 flex flex-col justify-between">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-gray-900 leading-tight flex flex-wrap items-center gap-2">{product}
{item.status && !['actief', 'inactief', 'verborgen', 'active', 'inactive', 'hidden'].includes((item.status || '').toLowerCase()) && (
<span className={`px-2 py-1 rounded-full text-xs font-medium shrink-0 ${['uitverkocht', 'sold out', 'sold_out'].includes((item.status || '').toLowerCase()) ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{item.status === 'new' ? 'Nieuw' : item.status === 'popular' ? 'Meest Gekozen' : item.status === 'sold_out' ? 'Uitverkocht' : item.status === 'coming_soon' ? 'Binnenkort' : item.status}</span>
)}</h4>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-2 mt-auto w-full">
                                {productSizes.length > 0 ? (
                                  productSizes.map(size => (
                                    <button
                                      key={size}
                                      type="button"
                                      disabled={prices[product + '_' + size] === undefined || ['uitverkocht', 'sold out', 'sold_out'].includes((item.status || '').toLowerCase())} onClick={() => handlePortionSelect(product, size)}
                                      className={`p-2 text-xs rounded-lg border transition-colors flex flex-col items-center justify-center gap-0.5 ${(prices[product + '_' + size] === undefined || ['uitverkocht', 'sold out', 'sold_out'].includes((item.status || '').toLowerCase())) ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-100' : (prodSelections[size] || 0) > 0 ? 'bg-ob-blue text-white border-ob-blue font-semibold' : 'bg-white text-gray-600 border-gray-200 hover:border-ob-blue hover:-translate-y-1 hover:shadow-md transition-all'}`}
                                    >
                                      <span className="font-semibold text-[13px]">{size} st.</span>
                                      <span className={(prodSelections[size] || 0) > 0 ? 'text-white/90' : 'text-gray-500'}>{prices[product + '_' + size] !== undefined ? `€${prices[product + '_' + size].toFixed(2)}` : '-'}</span>
                                    </button>
                                  ))
                                ) : (
                                  <span className="text-xs text-gray-400 italic col-span-2">Prijs wordt geladen...</span>
                                )}
                              </div>

                              {Object.keys(prodSelections).length > 0 && (
                                <div className="mt-3 flex items-center justify-between pt-3 border-t border-gray-100">
                                  <div className="flex flex-col gap-1">
                                    {Object.entries(prodSelections).map(([s, qty]) => (
                                      <span key={s} className="text-xs font-semibold text-ob-blue">{qty as number}x {s} st.</span>
                                    ))}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleRemove(product)}
                                    className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 bg-red-50 rounded-md"
                                  >
                                    Wissen
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary Line */}
              {Object.keys(selections).length > 0 && (
                <div className="mt-8 p-4 bg-ob-blue text-white rounded-xl flex justify-between items-center shadow-lg">
                  <div className="flex items-center gap-2">
                    <ShoppingBag size={20} className="text-ob-accent" />
                    <span className="font-semibold">{Object.keys(selections).length} {Object.keys(selections).length === 1 ? 'product' : 'producten'} geselecteerd</span>
                  </div>
                  <span className="text-xl font-bold">Totaal: €{totalOrderPrice.toFixed(2)}</span>
                </div>
              )}
            </div>
          </section>

          {/* Details Form */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl font-bold text-ob-blue flex items-center gap-2">
                <Building size={20} className="text-ob-accent" /> Gegevens & Bezorging
              </h2>
            </div>
            
            <div className="p-6 space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-gray-100 pb-6">
                <div>
                  <label className="block text-sm font-semibold text-ob-text mb-2 flex items-center gap-2">
                    <Building size={16} className="text-gray-400" /> Naam / Bedrijfsnaam
                  </label>
                  <input 
                    type="text" 
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Bv. Jan Jansen of Bedrijf BV"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-ob-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ob-text mb-2 flex items-center gap-2">
                    <Mail size={16} className="text-gray-400" /> Factuur E-mailadres
                  </label>
                  <input 
                    type="email" 
                    required
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="facturen@bedrijf.nl"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-ob-blue"
                  />
                </div>
              </div>

              <div className="border-b border-gray-100 pb-6">
                <label className="block text-sm font-semibold text-ob-text mb-2">Factuurgegevens (KVK, BTW, Adres)</label>
                <textarea 
                  required
                  rows={2}
                  value={guestBillingInfo}
                  onChange={(e) => setGuestBillingInfo(e.target.value)}
                  placeholder="KVK nummer, postadres, of andere gegevens voor op de factuur..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-ob-blue resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-gray-100 pb-6">
                <div>
                  <label className="block text-sm font-semibold text-ob-text mb-2 flex items-center gap-2">
                    <MapPin size={16} className="text-gray-400" /> Volledig Bezorgadres
                  </label>
                  <textarea 
                    required
                    rows={2}
                    value={guestAddress}
                    onChange={(e) => setGuestAddress(e.target.value)}
                    placeholder="Straatnaam, huisnummer, postcode en stad"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-ob-blue resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ob-text mb-2 flex items-center gap-2">
                    <Phone size={16} className="text-gray-400" /> Telefoonnummer
                  </label>
                  <input 
                    type="tel" 
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="06 1234 5678"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-ob-blue h-full"
                  />
                </div>
              </div>

              {/* Delivery Time Selection */}
              <div className="border-b border-gray-100 pb-6">
                <label className="block text-sm font-semibold text-ob-text mb-3 flex items-center gap-2">
                  <Clock size={16} className="text-gray-400" /> Bezorgmoment
                </label>
                
                <div className="flex gap-4 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="guestDeliveryMode" 
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
                      name="guestDeliveryMode" 
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
                <label className="block text-sm font-semibold text-ob-text mb-2">Extra Notities (Optioneel)</label>
                <textarea 
                  rows={2}
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
              disabled={isSubmitting || Object.keys(selections).length === 0 || !guestName || !guestEmail || !guestAddress || !phone || (deliveryMode === 'scheduled' && (!deliveryDate || !deliveryTime))}
              className="w-full bg-[#05053D] text-white py-4 rounded-xl font-bold text-lg hover:bg-ob-blue transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isSubmitting ? 'Bezig met plaatsen...' : <><ShoppingBag size={20} /> Bestelling Plaatsen (€{totalOrderPrice.toFixed(2)})</>}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
