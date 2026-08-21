import { useState, useEffect, FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight, MapPin, PackageOpen, Phone, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';

// Product images mapping
const PRODUCT_IMAGES: Record<string, string> = {
  'Bitterballen Deal': 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/img_326b38dcee73a775f892e835c057c0bd82a331ff30cac86050212b55404a5e3d/responsive320',
  'Dutch Classic Deal': 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/3f0af910-b1b9-498c-b744-5d20c6c8b600/responsive320',
  'Deluxe Deal': 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/efa8dd02-7551-4367-9b38-40ed4e3c6600/responsive320',
  'Chicken Deal': 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/img_d536a8e36dbb3466292358eb7220e395cf43a00f539abdc333d35ef625a63982/responsive320',
  'Vega Deal': 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/img_707cf27d8a142b4b2a4a95940d7cc906c9a7c3a7a86d3f6e8589924d38557734/responsive320',
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

const PORTION_SIZES = [20, 40, 60, 80, 100];

type Address = {
  id: string;
  label: string;
  address_line: string;
  instructions?: string;
};

type PriceMap = Record<number, number>;

export function EmployeeOrdering() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [companyId, setCompanyId] = useState('');
  const [userId, setUserId] = useState('');
  const [companyName, setCompanyName] = useState('');

  // Data
  const [assortment, setAssortment] = useState<string[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [prices, setPrices] = useState<PriceMap>({});

  // Form State
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedPortion, setSelectedPortion] = useState<number | ''>('');
  const [selectedAddress, setSelectedAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    if (!supabase) {
      // Mock Data
      setAssortment(['Bitterballen Deal', 'Vega Deal', 'Snack Mix']);
      setAddresses([{ id: 'a1', label: 'Receptie', address_line: 'Straat 1' }]);
      setPrices({ 20: 25.50, 40: 48.00, 60: 69.00, 80: 89.00, 100: 105.00 });
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

      // Get profile
      const { data: profile } = await supabase.from('ob_user_profiles').select('*').eq('id', session.user.id).single();
      
      if (!profile || (profile.role !== 'employee' && profile.role !== 'office_manager' && profile.role !== 'admin')) {
        navigate('/'); 
        return;
      }

      const compId = profile.company_id;
      setCompanyId(compId);

      // Fetch company name
      const { data: comp } = await supabase.from('ob_companies').select('name').eq('id', compId).single();
      if (comp) setCompanyName(comp.name);

      // Fetch Assortment
      const { data: assortData } = await supabase.from('ob_company_assortment').select('product_name').eq('company_id', compId);
      if (assortData) setAssortment(assortData.map((a: any) => a.product_name));

      // Fetch Addresses
      const { data: addrData } = await supabase.from('ob_company_addresses').select('*').eq('company_id', compId);
      if (addrData) setAddresses(addrData);

      // Fetch Prices
      const { data: priceData } = await supabase.from('ob_portion_prices').select('*');
      if (priceData) {
        const pMap: PriceMap = {};
        priceData.forEach((p: any) => { pMap[p.portion_size] = p.price; });
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
    if (!selectedProduct || !selectedPortion || !selectedAddress || !phone) {
      setError("Vul a.u.b. alle verplichte velden in.");
      return;
    }

    setIsSubmitting(true);
    setError('');

    if (supabase) {
      try {
        const orderPrice = prices[selectedPortion] || 0;
        const { error: insertError } = await supabase.from('ob_orders').insert({
          company_id: companyId,
          user_id: userId,
          product_name: selectedProduct,
          portion_size: selectedPortion,
          price: orderPrice,
          address_id: selectedAddress,
          phone: phone,
          notes: notes
        });

        if (insertError) throw insertError;
        setOrderSuccess(true);
      } catch (e: any) {
        console.error(e);
        setError("Er ging iets mis bij het plaatsen van de bestelling.");
      }
    } else {
      // Mock success
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
              setSelectedProduct('');
              setSelectedPortion('');
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
          
          {/* Step 1: Product Selection */}
          <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-ob-text mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-ob-blue text-white flex items-center justify-center text-sm">1</span> 
              Kies een Product
            </h2>
            
            {assortment.length === 0 ? (
              <p className="text-gray-500 italic">Uw kantoor heeft momenteel geen assortiment geselecteerd. Neem contact op met uw office manager.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {assortment.map(product => (
                  <div 
                    key={product}
                    onClick={() => setSelectedProduct(product)}
                    className={`cursor-pointer rounded-xl border-2 transition-all p-3 flex flex-col items-center text-center gap-3 ${selectedProduct === product ? 'border-ob-blue bg-blue-50/20' : 'border-gray-100 hover:border-gray-300'}`}
                  >
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-50 flex items-center justify-center shrink-0">
                      {PRODUCT_IMAGES[product] ? (
                        <img src={PRODUCT_IMAGES[product]} alt={product} className="w-full h-full object-cover" />
                      ) : (
                        <PackageOpen className="text-gray-400" />
                      )}
                    </div>
                    <span className="font-semibold text-sm text-ob-text">{product}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Step 2: Portion Size */}
          <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-ob-text mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-ob-blue text-white flex items-center justify-center text-sm">2</span> 
              Portiegrootte
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {PORTION_SIZES.map(size => (
                <div 
                  key={size}
                  onClick={() => setSelectedPortion(size)}
                  className={`cursor-pointer rounded-xl border-2 transition-all p-4 text-center ${selectedPortion === size ? 'border-ob-blue bg-blue-50/20' : 'border-gray-100 hover:border-gray-300'}`}
                >
                  <div className="text-2xl font-bold text-ob-text mb-1">{size}</div>
                  <div className="text-sm text-gray-500 mb-2">stuks</div>
                  <div className="font-semibold text-ob-blue">
                    {prices[size] ? `€${prices[size].toFixed(2)}` : '-'}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Step 3: Delivery Details */}
          <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-xl font-bold text-ob-text mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-ob-blue text-white flex items-center justify-center text-sm">3</span> 
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
              disabled={isSubmitting || !selectedProduct || !selectedPortion || !selectedAddress || !phone}
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
