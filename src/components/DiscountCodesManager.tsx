import React, { useState, FormEvent } from 'react';
import { supabase, StoreSettings, DiscountCode } from '../lib/supabase';
import { Plus, Trash2, Tag, Percent, Gift, Check, X, AlertCircle } from 'lucide-react';

type DiscountCodesManagerProps = {
  storeSettings?: StoreSettings;
  onStoreSettingsUpdated?: (settings: StoreSettings) => void;
  dbProducts: any[];
};

export function DiscountCodesManager({ storeSettings, onStoreSettingsUpdated, dbProducts }: DiscountCodesManagerProps) {
  const codes: DiscountCode[] = storeSettings?.page_content?.discount_codes || [];
  
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states for new discount code
  const [codeName, setCodeName] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'free_product'>('percentage');
  const [percentageValue, setPercentageValue] = useState<number>(10);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [selectedPortion, setSelectedPortion] = useState<number>(25);
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [minOrderAmount, setMinOrderAmount] = useState<string>('');
  const [description, setDescription] = useState('');

  // Selected product object to get portions and variants
  const activeProductObj = dbProducts.find(p => p.name === selectedProduct) || dbProducts[0];

  const handleOpenAdd = () => {
    setIsAdding(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    setCodeName('');
    setDiscountType('percentage');
    setPercentageValue(10);
    if (dbProducts.length > 0) {
      setSelectedProduct(dbProducts[0].name);
      setSelectedPortion(dbProducts[0].portions?.[0] || 25);
      setSelectedVariant(dbProducts[0].variants?.[0] || '');
    }
    setMinOrderAmount('');
    setDescription('');
  };

  const handleProductChange = (prodName: string) => {
    setSelectedProduct(prodName);
    const prod = dbProducts.find(p => p.name === prodName);
    if (prod) {
      if (prod.portions && prod.portions.length > 0) {
        setSelectedPortion(prod.portions[0]);
      }
      if (prod.variants && prod.variants.length > 0) {
        setSelectedVariant(prod.variants[0]);
      } else {
        setSelectedVariant('');
      }
    }
  };

  const saveCodesToSupabase = async (newCodes: DiscountCode[]) => {
    if (!storeSettings) return;
    setIsSaving(true);
    setErrorMsg(null);
    try {
      const updatedPageContent = {
        ...(storeSettings.page_content || {}),
        discount_codes: newCodes
      };

      if (supabase) {
        const { error } = await supabase
          .from('store_settings')
          .update({ page_content: updatedPageContent })
          .eq('id', storeSettings.id || 1);

        if (error) throw error;
      }

      const updatedSettings: StoreSettings = {
        ...storeSettings,
        page_content: updatedPageContent
      };

      if (onStoreSettingsUpdated) {
        onStoreSettingsUpdated(updatedSettings);
      }

      setSuccessMsg('Kortingscodes succesvol opgeslagen.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      console.error('Fout bij opslaan kortingscodes:', err);
      setErrorMsg(err.message || 'Kon wijzigingen niet opslaan in database.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (id: string) => {
    const newCodes = codes.map(c => c.id === id ? { ...c, is_active: !c.is_active } : c);
    await saveCodesToSupabase(newCodes);
  };

  const handleDeleteCode = async (id: string) => {
    if (!confirm('Weet u zeker dat u deze kortingscode wilt verwijderen?')) return;
    const newCodes = codes.filter(c => c.id !== id);
    await saveCodesToSupabase(newCodes);
  };

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = codeName.trim().toUpperCase().replace(/\s+/g, '');
    if (!cleanCode) {
      setErrorMsg('Voer een geldige kortingscode in.');
      return;
    }

    if (codes.some(c => c.code === cleanCode)) {
      setErrorMsg(`De code "${cleanCode}" bestaat al.`);
      return;
    }

    if (discountType === 'percentage') {
      if (!percentageValue || percentageValue <= 0 || percentageValue > 100) {
        setErrorMsg('Voer een geldig percentage in tussen 1 en 100%.');
        return;
      }
    } else {
      if (!selectedProduct) {
        setErrorMsg('Selecteer een product voor de gratis actie.');
        return;
      }
    }

    const newDiscount: DiscountCode = {
      id: crypto.randomUUID ? crypto.randomUUID() : `code_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      code: cleanCode,
      type: discountType,
      value: discountType === 'percentage' ? Number(percentageValue) : 0,
      free_product: discountType === 'free_product' ? {
        product_name: selectedProduct,
        portion_size: Number(selectedPortion),
        variant: selectedVariant || undefined
      } : undefined,
      is_active: true,
      min_order_amount: minOrderAmount ? Number(minOrderAmount) : undefined,
      description: description.trim() || undefined,
      created_at: new Date().toISOString()
    };

    const newCodes = [newDiscount, ...codes];
    await saveCodesToSupabase(newCodes);
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Tag className="text-[#05053D]" size={22} />
            Kortingscodes Particulier
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Beheer kortingscodes voor eenmalige particuliere bestellingen (percentage of gratis product).
          </p>
        </div>

        {!isAdding && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 bg-[#05053D] hover:bg-blue-950 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm cursor-pointer"
          >
            <Plus size={16} />
            Nieuwe Kortingscode
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle size={18} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <Check size={18} className="shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Add New Code Form Modal / Card */}
      {isAdding && (
        <div className="bg-white border-2 border-blue-200 rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
              <Plus size={18} className="text-[#05053D]" />
              Nieuwe Kortingscode Aanmaken
            </h3>
            <button
              onClick={() => setIsAdding(false)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-md"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleCreateCode} className="space-y-4">
            {/* Code Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                Kortingscode (bijv. WELKOM10 of ZOMERACTIE)
              </label>
              <input
                type="text"
                required
                value={codeName}
                onChange={(e) => setCodeName(e.target.value.toUpperCase())}
                placeholder="VOER CODE IN..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-base font-mono font-bold uppercase tracking-wider focus:outline-none focus:border-[#05053D] focus:ring-1 focus:ring-[#05053D]"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">
                Codes zijn niet hoofdlettergevoelig voor klanten.
              </span>
            </div>

            {/* Type selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Type Voordeel
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDiscountType('percentage')}
                  className={`p-3 rounded-lg border-2 text-left flex items-start gap-3 transition-all cursor-pointer ${
                    discountType === 'percentage'
                      ? 'border-[#05053D] bg-blue-50/50 text-[#05053D]'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <Percent size={20} className="mt-0.5 shrink-0 text-[#05053D]" />
                  <div>
                    <span className="font-bold text-sm block">Percentage Korting</span>
                    <span className="text-xs text-gray-500">Korting op het totale bestelbedrag (bijv. 10% of 25%)</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDiscountType('free_product')}
                  className={`p-3 rounded-lg border-2 text-left flex items-start gap-3 transition-all cursor-pointer ${
                    discountType === 'free_product'
                      ? 'border-[#05053D] bg-blue-50/50 text-[#05053D]'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <Gift size={20} className="mt-0.5 shrink-0 text-emerald-600" />
                  <div>
                    <span className="font-bold text-sm block">Gratis Product</span>
                    <span className="text-xs text-gray-500">Gratis borrelsnack of hapje uit het assortiment</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Percentage Input */}
            {discountType === 'percentage' && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Kortingspercentage (%)
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative w-32">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      required
                      value={percentageValue}
                      onChange={(e) => setPercentageValue(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base font-bold focus:outline-none focus:border-[#05053D]"
                    />
                    <span className="absolute right-3 top-2.5 text-gray-400 font-bold">%</span>
                  </div>
                  <div className="flex gap-2">
                    {[5, 10, 15, 20, 25, 50].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setPercentageValue(val)}
                        className={`px-2.5 py-1 text-xs rounded font-medium border cursor-pointer ${
                          percentageValue === val
                            ? 'bg-[#05053D] text-white border-[#05053D]'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {val}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Free Product Selector */}
            {discountType === 'free_product' && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Selecteer Gratis Product
                  </label>
                  <select
                    value={selectedProduct}
                    onChange={(e) => handleProductChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-[#05053D]"
                  >
                    {dbProducts.map((p) => (
                      <option key={p.id || p.name} value={p.name}>
                        {p.name} {p.category ? `(${p.category})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Portion size */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Aantal Stuks / Portiegrootte
                    </label>
                    <select
                      value={selectedPortion}
                      onChange={(e) => setSelectedPortion(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-[#05053D]"
                    >
                      {activeProductObj?.portions?.map((port: number) => (
                        <option key={port} value={port}>
                          {port} stuks
                        </option>
                      )) || (
                        <>
                          <option value={25}>25 stuks</option>
                          <option value={50}>50 stuks</option>
                          <option value={100}>100 stuks</option>
                        </>
                      )}
                    </select>
                  </div>

                  {/* Variant if available */}
                  {activeProductObj?.variants && activeProductObj.variants.length > 0 && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Variant (Optioneel)
                      </label>
                      <select
                        value={selectedVariant}
                        onChange={(e) => setSelectedVariant(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-[#05053D]"
                      >
                        <option value="">Standaard</option>
                        {activeProductObj.variants.map((v: string) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Min order amount & description */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Minimaal Bestelbedrag (€) <span className="text-gray-400 font-normal">(Optioneel)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-400">€</span>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(e.target.value)}
                    placeholder="bijv. 50"
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#05053D]"
                  />
                </div>
                <span className="text-[11px] text-gray-400 block mt-0.5">Leeglaten voor geen minimum.</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Interne Notitie / Omschrijving <span className="text-gray-400 font-normal">(Optioneel)</span>
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="bijv. Welkomstactie LinkedIn"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#05053D]"
                />
              </div>
            </div>

            {/* Submit & Cancel */}
            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Annuleren
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 bg-[#05053D] hover:bg-blue-950 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                {isSaving ? 'Opslaan...' : 'Kortingscode Aanmaken'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Existing codes table / list */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {codes.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Tag size={40} className="mx-auto text-gray-300 mb-3" />
            <h4 className="text-base font-bold text-gray-700">Nog geen kortingscodes</h4>
            <p className="text-sm text-gray-500 max-w-md mx-auto mt-1 mb-4">
              Maak een kortingscode aan om particuliere klanten een percentage korting of een gratis snack te geven.
            </p>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 bg-[#05053D] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-950 transition-colors cursor-pointer"
            >
              <Plus size={16} />
              Eerste code toevoegen
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Code</th>
                  <th className="py-3 px-4">Type & Voordeel</th>
                  <th className="py-3 px-4">Min. Bestelwaarde</th>
                  <th className="py-3 px-4">Omschrijving</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Acties</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {codes.map((item) => (
                  <tr key={item.id} className={`hover:bg-gray-50/80 transition-colors ${!item.is_active ? 'opacity-60 bg-gray-50/40' : ''}`}>
                    {/* Code */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm bg-gray-100 text-gray-900 border border-gray-200 px-2.5 py-1 rounded">
                          {item.code}
                        </span>
                      </div>
                    </td>

                    {/* Benefit */}
                    <td className="py-3.5 px-4">
                      {item.type === 'percentage' ? (
                        <div className="flex items-center gap-1.5 text-blue-900 font-semibold">
                          <Percent size={15} className="text-[#05053D]" />
                          <span>{item.value}% korting op bestelling</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                          <Gift size={15} className="text-emerald-600" />
                          <span>
                            Gratis: {item.free_product?.portion_size}x {item.free_product?.product_name}
                            {item.free_product?.variant ? ` (${item.free_product.variant})` : ''}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Min order amount */}
                    <td className="py-3.5 px-4 text-gray-600">
                      {item.min_order_amount && item.min_order_amount > 0 ? (
                        <span className="font-medium text-gray-800">Vanaf €{Number(item.min_order_amount).toFixed(2)}</span>
                      ) : (
                        <span className="text-gray-400">Geen minimum</span>
                      )}
                    </td>

                    {/* Description */}
                    <td className="py-3.5 px-4 text-gray-500 text-xs">
                      {item.description || <span className="text-gray-300">-</span>}
                    </td>

                    {/* Active toggle */}
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(item.id)}
                        disabled={isSaving}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          item.is_active
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title="Klik om status aan/uit te zetten"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${item.is_active ? 'bg-green-600' : 'bg-gray-400'}`} />
                        {item.is_active ? 'Actief' : 'Inactief'}
                      </button>
                    </td>

                    {/* Delete action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteCode(item.id)}
                        disabled={isSaving}
                        className="text-gray-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-colors cursor-pointer"
                        title="Kortingscode verwijderen"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
