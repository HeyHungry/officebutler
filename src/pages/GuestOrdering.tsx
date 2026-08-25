import { useState, FormEvent, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Utensils, CheckCircle, Info, ShoppingBag, ArrowLeft, Building, Mail, MapPin, Phone, Calendar, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const menuCategories = [
  {
    "title": "Deals",
    "items": [
      {
        "name": "Bitterballen Deal",
        "image": "https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/img_326b38dcee73a775f892e835c057c0bd82a331ff30cac86050212b55404a5e3d/responsive320"
      },
      {
        "name": "Dutch Classic Deal",
        "image": "https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/3f0af910-b1b9-498c-b744-5d20c6c8b600/responsive320"
      },
      {
        "name": "Deluxe Deal",
        "image": "https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/efa8dd02-7551-4367-9b38-40ed4e3c6600/responsive320"
      },
      {
        "name": "Chicken Deal",
        "image": "https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/img_d536a8e36dbb3466292358eb7220e395cf43a00f539abdc333d35ef625a63982/responsive320"
      },
      {
        "name": "Vega Deal",
        "image": "https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/img_707cf27d8a142b4b2a4a95940d7cc906c9a7c3a7a86d3f6e8589924d38557734/responsive320"
      }
    ]
  },
  {
    "title": "Snacks",
    "items": [
      {
        "name": "Snack Mix",
        "image": "https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/img_0743d367c64afbf145e9c0fea03ba65553996e64ffef54a95252060ee7ac758c/responsive320"
      },
      {
        "name": "Bitterballen",
        "image": "https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/233e7d3e-19d8-4504-adf9-2100d5c71800/responsive640"
      },
      {
        "name": "Vlammetjes",
        "image": "https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/c3a12a9a-1fd9-4041-11a7-c2ba71d3c100/responsive960"
      },
      {
        "name": "Frikandelletjes",
        "image": "https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/089a0deb-f72e-46b4-cd48-de98d1f82a00/responsive640"
      },
      {
        "name": "Mini Kroketjes",
        "image": "https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/53ee579e-f63d-4c57-8f54-dae1e90a1c00/responsive640"
      },
      {
        "name": "Chicken Wings",
        "image": "https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/ee601f8d-efac-4ef4-2cee-c4c59c117200/responsive640"
      },
      {
        "name": "Kipnuggets",
        "image": "https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/b58dad40-1353-4159-e305-2669d75f6b00/responsive640"
      },
      {
        "name": "Karaage Kip",
        "image": "https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/img_5991de8e937102a4dd1ef314fb255423bf85586b62f82c8285e054e14615ce52/responsive640"
      },
      {
        "name": "Butterfly Gamba's",
        "image": "https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/8688dded-96d4-414f-e816-8553f5ec8000/responsive640"
      }
    ]
  },
  {
    "title": "Vega",
    "items": [
      {
        "name": "Kaasstengels",
        "image": "https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/img_8d2216804329784b49540823b54b47525bfcf318725033896b6fb9646d6cc0d1/responsive640"
      },
      {
        "name": "Curry Samosas",
        "image": "https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/ae28ddae-8a3f-4049-3527-09fa31308f00/responsive640"
      },
      {
        "name": "Mini Loempia",
        "image": "https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/9eab1d3b-96cc-449a-e6af-7a4ee6e66d00/responsive640"
      },
      {
        "name": "Vegan Bitterballen",
        "image": "https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/img_382e6f9d8eabd5d872ed938ed4c12f25c6696f38b8ab2d2791d968c2783fd954/responsive640"
      }
    ]
  }
];

export function GuestOrdering() {
  const [assortment, setAssortment] = useState<string[]>(['Bitterballen Deal', 'Vega Deal', 'Snack Mix']);
  const [prices, setPrices] = useState<Record<string, number>>({ 
    'Bitterballen Deal_25': 25.50, 'Bitterballen Deal_50': 48.00,
    'Dutch Classic Deal_25': 24.50, 'Dutch Classic Deal_50': 46.00,
    'Deluxe Deal_25': 29.50, 'Deluxe Deal_50': 55.00,
    'Chicken Deal_25': 27.50, 'Chicken Deal_50': 52.00,
    'Vega Deal_25': 26.50, 'Vega Deal_50': 49.00,
    
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

  const [selections, setSelections] = useState<Record<string, number>>({});
  
  // Guest Details
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestBillingInfo, setGuestBillingInfo] = useState('');
  const [guestAddress, setGuestAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  
  const [deliveryMode, setDeliveryMode] = useState<'zsm' | 'scheduled'>('zsm');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [error, setError] = useState('');

  // Fetch prices if available
  useEffect(() => {
    async function fetchAssortment() {
      if (supabase) {
        const { data: globalPrices } = await supabase.from('ob_product_prices').select('*');
        if (globalPrices) {
          const newPrices: Record<string, number> = {};
          const productNames = new Set<string>();
          globalPrices.forEach(gp => {
            newPrices[`${gp.product_name}_${gp.portion_size}`] = gp.default_price;
            productNames.add(gp.product_name);
          });
          // We merge the fetched prices with the hardcoded ones so we don't lose the hardcoded ones if the DB is empty
          if (Object.keys(newPrices).length > 0) {
            setPrices(prev => ({ ...prev, ...newPrices }));
          }
        }
      }
    }
    fetchAssortment();
  }, []);

  const handlePortionSelect = (product: string, size: number) => {
    setSelections(prev => ({
      ...prev,
      [product]: size
    }));
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

    const totalOrderPrice = Object.entries(selections).reduce((sum, [prod, size]) => sum + (prices[`${prod}_${size}`] || 0), 0);

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
        const orderPromises = Object.entries(selections).map(([prod, size]) => {
          const price = prices[`${prod}_${size}`] || 0;
          return supabase.from('ob_orders').insert({
            product_name: prod,
            portion_size: size,
            price: price,
            total_price: price,
            phone: phone,
            notes: fullNotes,
            delivery_date: deliveryMode === 'zsm' ? new Date().toISOString().split('T')[0] : deliveryDate,
            delivery_time: deliveryMode === 'zsm' ? 'Zo snel mogelijk' : deliveryTime
          });
        });
        
        const results = await Promise.all(orderPromises);
        const errors = results.filter(r => r.error);
        if (errors.length > 0) throw errors[0].error;

        try {
          await fetch('/api/send-guest-invoice', {
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
        } catch (emailErr) {
          console.error("Kon email niet verzenden:", emailErr);
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
            Bedankt voor uw bestelling, {guestName}. We hebben uw aanvraag goed ontvangen en de factuur is verstuurd.
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

  const totalOrderPrice = Object.entries(selections).reduce((sum, [prod, size]) => sum + (prices[`${prod}_${size}`] || 0), 0);

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
          
          {/* Assortment */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl font-bold text-ob-blue flex items-center gap-2">
                <Utensils size={20} className="text-ob-accent" /> Assortiment & Prijzen
              </h2>
            </div>
            
            <div className="p-6">
              <div className="flex flex-col gap-12">
                {menuCategories.map((category) => (
                  <div key={category.title}>
                    <h3 className="text-2xl font-serif font-bold text-ob-blue mb-6 border-b pb-2">{category.title}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {category.items.map((item) => {
                        const product = item.name;
                        const price25 = prices[product + "_25"];
                        const price50 = prices[product + "_50"];
                        const selectedSize = selections[product];
                        
                        return (
                          <div key={product} className={"flex gap-4 border rounded-xl p-4 transition-all " + (selectedSize ? 'border-ob-blue bg-blue-50/30 shadow-sm' : 'border-gray-200 hover:border-ob-blue/30')}>
                            <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                              <img src={item.image} alt={product} className="w-full h-full object-cover" />
                            </div>
                            
                            <div className="flex-1 flex flex-col justify-between">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-gray-900 leading-tight">{product}</h4>
                              </div>
                              
                              <div className="flex flex-wrap gap-2 mt-auto">
                                {price25 !== undefined && (
                                  <button
                                    type="button"
                                    onClick={() => handlePortionSelect(product, 25)}
                                    className={"px-3 py-1.5 text-xs rounded-lg border transition-colors " + (selectedSize === 25 ? 'bg-ob-blue text-white border-ob-blue font-semibold' : 'bg-white text-gray-600 border-gray-200 hover:border-ob-blue')}
                                  >
                                    25 st. (€{price25.toFixed(2)})
                                  </button>
                                )}
                                {price50 !== undefined && (
                                  <button
                                    type="button"
                                    onClick={() => handlePortionSelect(product, 50)}
                                    className={"px-3 py-1.5 text-xs rounded-lg border transition-colors " + (selectedSize === 50 ? 'bg-ob-blue text-white border-ob-blue font-semibold' : 'bg-white text-gray-600 border-gray-200 hover:border-ob-blue')}
                                  >
                                    50 st. (€{price50.toFixed(2)})
                                  </button>
                                )}
                                {price25 === undefined && price50 === undefined && (
                                  <span className="text-xs text-gray-400 italic">Prijs wordt geladen...</span>
                                )}
                              </div>

                              {selectedSize && (
                                <div className="mt-3 flex items-center justify-between pt-3 border-t border-gray-100">
                                  <span className="text-xs font-semibold text-ob-blue">Geselecteerd: {selectedSize} st.</span>
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
