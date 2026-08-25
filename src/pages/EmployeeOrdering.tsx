import { useState, useEffect, FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { PackageOpen, MapPin, Phone, ShoppingBag, CheckCircle2 , Clock, Calendar } from 'lucide-react';
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
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [companyId, setCompanyId] = useState('');
  const [userId, setUserId] = useState('');
  const [companyName, setCompanyName] = useState('');
  
  const [assortment, setAssortment] = useState<string[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [prices, setPrices] = useState<PriceMap>({});
  const [maxSpendLimit, setMaxSpendLimit] = useState<number | null>(null);

  // New multi-select state: productName -> portionSize
  const [selections, setSelections] = useState<Record<string, number>>({});
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

    const totalOrderPrice = Object.entries(selections).reduce((sum, [prod, size]) => sum + (prices[`${prod}_${size}`] || 0), 0);
    
    if (maxSpendLimit !== null && totalOrderPrice > maxSpendLimit) {
      setError(`Het maximaal toegestane bedrag per bestelling is €${maxSpendLimit.toFixed(2)}. Het totaalbedrag is nu €${totalOrderPrice.toFixed(2)}.`);
      setIsSubmitting(false);
      return;
    }

    if (supabase) {
      try {
        const orderPromises = Object.entries(selections).map(([prod, size]) => {
          const price = prices[`${prod}_${size}`] || 0;
          
          return supabase.from('ob_orders').insert({
            company_id: companyId,
            user_id: userId,
            product_name: prod,
            portion_size: size,
            price: price,
            total_price: price,
            address_id: selectedAddress,
            phone: phone,
            notes: notes,
            delivery_date: deliveryMode === 'zsm' ? new Date().toISOString().split('T')[0] : deliveryDate,
            delivery_time: deliveryMode === 'zsm' ? 'Zo snel mogelijk' : deliveryTime
          });

        });
        
        
        const results = await Promise.all(orderPromises);
        const errors = results.filter(r => r.error);
        if (errors.length > 0) throw errors[0].error;

        // Try to send the invoice email
        try {
          await fetch('/api/send-invoice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            
            body: JSON.stringify({
              companyId,
              selections,
              prices,
              addressId: selectedAddress,
              phone,
              notes,
              totalOrderPrice,
              deliveryDate: deliveryMode === 'zsm' ? new Date().toISOString().split('T')[0] : deliveryDate,
              deliveryTime: deliveryMode === 'zsm' ? 'Zo snel mogelijk' : deliveryTime
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
          
          {/* Step 1: Producten & Porties */}
          <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-ob-text flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-ob-blue text-white flex items-center justify-center text-sm">1</span> 
                Kies uw Snacks & Porties
              </h2>
              {maxSpendLimit !== null && (
                <div className="text-sm font-medium bg-blue-50 text-ob-blue px-3 py-1 rounded-lg">
                  Budget: €{maxSpendLimit.toFixed(2)}
                </div>
              )}
            </div>
            
            {assortment.length === 0 ? (
              <p className="text-gray-500 italic">Uw kantoor heeft momenteel geen assortiment geselecteerd. Neem contact op met uw office manager.</p>
            ) : (
              <div className="space-y-4">
                {assortment.map(product => {
                  const isSelected = !!selections[product];
                  return (
                    <div key={product} className={`border-2 rounded-xl p-4 transition-all ${isSelected ? 'border-ob-blue bg-blue-50/10' : 'border-gray-100'}`}>
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex items-center gap-4 md:w-1/3">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                            {PRODUCT_IMAGES[product] ? (
                              <img src={PRODUCT_IMAGES[product]} alt={product} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <PackageOpen size={24} />
                              </div>
                            )}
                          </div>
                          <span className="font-semibold text-ob-text text-lg">{product}</span>
                        </div>
                        
                        <div className="flex-1 flex flex-wrap gap-2">
                          {PORTION_SIZES.map(size => {
                            const price = prices[`${product}_${size}`];
                            const isSizeSelected = selections[product] === size;
                            
                            // If no price is set for this product+size, we disable it
                            const hasPrice = price !== undefined;
                            
                            return (
                              <button
                                key={size}
                                type="button"
                                disabled={!hasPrice}
                                onClick={() => {
                                  setSelections(prev => {
                                    const next = { ...prev };
                                    if (next[product] === size) delete next[product];
                                    else next[product] = size;
                                    return next;
                                  });
                                }}
                                className={`flex-1 min-w-[80px] py-2 px-3 rounded-lg border text-center transition-all ${!hasPrice ? 'opacity-50 cursor-not-allowed border-gray-100 bg-gray-50' : isSizeSelected ? 'border-ob-blue bg-ob-blue text-white shadow-sm' : 'border-gray-200 hover:border-ob-blue text-gray-700 bg-white'}`}
                              >
                                <div className="font-bold">{size}</div>
                                <div className={`text-xs ${isSizeSelected ? 'text-blue-100' : 'text-gray-500'}`}>
                                  {hasPrice ? `€${price.toFixed(2)}` : '-'}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {Object.keys(selections).length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-100 flex justify-between items-center">
                <span className="font-bold text-gray-700">Totaalbedrag:</span>
                <span className="text-2xl font-bold text-ob-blue">
                  €{Object.entries(selections).reduce((sum, [prod, size]) => sum + (prices[`${prod}_${size}`] || 0), 0).toFixed(2)}
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
    </div>
  );
}
