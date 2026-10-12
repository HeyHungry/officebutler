import React, { useState, FormEvent } from 'react';
import { supabase, StoreSettings, DiscountCode } from '../lib/supabase';
import { Plus, Trash2, Tag, Percent, Gift, Check, X, AlertCircle, Edit2, Sparkles } from 'lucide-react';

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
  const [maxUsesTotal, setMaxUsesTotal] = useState<string>('');
  const [maxUsesPerPerson, setMaxUsesPerPerson] = useState<string>('');
  const [description, setDescription] = useState('');

  // Selected product object to get portions and variants
  const activeProductObj = dbProducts.find(p => p.name === selectedProduct) || dbProducts[0];

  // Code Generator function
  const generateRandomCode = (type: 'percentage' | 'free_product', pctVal?: number) => {
    const prefixes = [
      'OFFICE',
      'BORREL',
      'BUTLER',
      'VRIJMIBO',
      'SNACK',
      'ACTIE',
      'DEAL',
      'BEDRIJF',
      'WELKOM',
      'EXTRA',
      'SPECIAL',
      'FEEST'
    ];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const valPart = type === 'percentage' && pctVal ? `${pctVal}` : '';
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let rand = '';
    for (let i = 0; i < 4; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${prefix}${valPart ? valPart : ''}-${rand}`;
  };

  // Editing state for existing codes
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCodeName, setEditCodeName] = useState('');
  const [editDiscountType, setEditDiscountType] = useState<'percentage' | 'free_product'>('percentage');
  const [editPercentageValue, setEditPercentageValue] = useState<number>(10);
  const [editSelectedProduct, setEditSelectedProduct] = useState<string>('');
  const [editSelectedPortion, setEditSelectedPortion] = useState<number>(25);
  const [editSelectedVariant, setEditSelectedVariant] = useState<string>('');
  const [editMinOrderAmount, setEditMinOrderAmount] = useState<string>('');
  const [editMaxUsesTotal, setEditMaxUsesTotal] = useState<string>('');
  const [editMaxUsesPerPerson, setEditMaxUsesPerPerson] = useState<string>('');
  const [editDescription, setEditDescription] = useState('');
  const [editIsActive, setEditIsActive] = useState<boolean>(true);

  // Active product object for edit form
  const editActiveProductObj = dbProducts.find(p => p.name === editSelectedProduct) || dbProducts[0];

  const handleOpenAdd = () => {
    setIsAdding(true);
    setEditingId(null);
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
    setMaxUsesTotal('');
    setMaxUsesPerPerson('');
    setDescription('');
  };

  const handleStartEdit = (code: DiscountCode) => {
    setIsAdding(false);
    setErrorMsg(null);
    setSuccessMsg(null);
    setEditingId(code.id);
    setEditCodeName(code.code);
    setEditDiscountType(code.type);
    setEditPercentageValue(code.type === 'percentage' ? code.value : 10);

    const prodName = code.free_product?.product_name || (dbProducts[0]?.name || '');
    setEditSelectedProduct(prodName);
    const prod = dbProducts.find(p => p.name === prodName);
    setEditSelectedPortion(code.free_product?.portion_size || (prod?.portions?.[0] || 25));
    setEditSelectedVariant(code.free_product?.variant || (prod?.variants?.[0] || ''));

    setEditMinOrderAmount(code.min_order_amount !== undefined ? String(code.min_order_amount) : '');
    setEditMaxUsesTotal(code.max_uses_total !== undefined ? String(code.max_uses_total) : '');
    setEditMaxUsesPerPerson(code.max_uses_per_person !== undefined ? String(code.max_uses_per_person) : '');
    setEditDescription(code.description || '');
    setEditIsActive(code.is_active);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setErrorMsg(null);
  };

  const handleEditProductChange = (prodName: string) => {
    setEditSelectedProduct(prodName);
    const prod = dbProducts.find(p => p.name === prodName);
    if (prod) {
      if (prod.portions && prod.portions.length > 0) {
        setEditSelectedPortion(prod.portions[0]);
      }
      if (prod.variants && prod.variants.length > 0) {
        setEditSelectedVariant(prod.variants[0]);
      } else {
        setEditSelectedVariant('');
      }
    }
  };

  const handleUpdateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    const cleanCode = editCodeName.trim().toUpperCase().replace(/\s+/g, '');
    if (!cleanCode) {
      setErrorMsg('Voer een geldige kortingscode in.');
      return;
    }

    if (codes.some(c => c.id !== editingId && c.code === cleanCode)) {
      setErrorMsg(`Er bestaat al een andere code met de naam "${cleanCode}".`);
      return;
    }

    if (editDiscountType === 'percentage') {
      if (!editPercentageValue || editPercentageValue <= 0 || editPercentageValue > 100) {
        setErrorMsg('Voer een geldig percentage in tussen 1 en 100%.');
        return;
      }
    } else {
      if (!editSelectedProduct) {
        setErrorMsg('Selecteer een product voor de gratis actie.');
        return;
      }
    }

    const newCodes = codes.map(c => {
      if (c.id === editingId) {
        return {
          ...c,
          code: cleanCode,
          type: editDiscountType,
          value: editDiscountType === 'percentage' ? Number(editPercentageValue) : 0,
          free_product: editDiscountType === 'free_product' ? {
            product_name: editSelectedProduct,
            portion_size: Number(editSelectedPortion),
            variant: editSelectedVariant || undefined
          } : undefined,
          is_active: editIsActive,
          min_order_amount: editMinOrderAmount ? Number(editMinOrderAmount) : undefined,
          max_uses_total: editMaxUsesTotal ? Number(editMaxUsesTotal) : undefined,
          max_uses_per_person: editMaxUsesPerPerson ? Number(editMaxUsesPerPerson) : undefined,
          description: editDescription.trim() || undefined
        };
      }
      return c;
    });

    await saveCodesToSupabase(newCodes);
    setEditingId(null);
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
      max_uses_total: maxUsesTotal ? Number(maxUsesTotal) : undefined,
      max_uses_per_person: maxUsesPerPerson ? Number(maxUsesPerPerson) : undefined,
      used_count: 0,
      used_by: {},
      description: description.trim() || undefined,
      created_at: new Date().toISOString()
    };

    const newCodes = [newDiscount, ...codes];
    await saveCodesToSupabase(newCodes);
    setIsAdding(false);
  };

  const handleResetUsage = async (id: string) => {
    if (!confirm('Weet u zeker dat u de gebruiksteller voor deze kortingscode wilt resetten naar 0?')) return;
    const newCodes = codes.map(c => c.id === id ? { ...c, used_count: 0, used_by: {} } : c);
    await saveCodesToSupabase(newCodes);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Tag className="text-[#05053D]" size={22} />
            Kortingscodes (Particulier & Bedrijven)
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Beheer kortingscodes voor bestellingen. Codes kunnen niet gestapeld worden; stel optioneel een maximum totaal en per persoon in.
          </p>
        </div>

        {!isAdding && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 bg-[#5170ff] hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm cursor-pointer"
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
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Kortingscode (bijv. WELKOM10 of ZOMERACTIE)
                </label>
                <button
                  type="button"
                  onClick={() => setCodeName(generateRandomCode(discountType, percentageValue))}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5170ff] hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                  title="Genereer automatisch een unieke kortingscode"
                >
                  <Sparkles size={13} />
                  Genereer code
                </button>
              </div>
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
                    {[5, 10, 15, 20, 25, 50].map((val, idx) => (
                      <button
                        key={`discount-val-${val}-${idx}`}
                        type="button"
                        onClick={() => setPercentageValue(val)}
                        className={`px-2.5 py-1 text-xs rounded font-medium border cursor-pointer ${
                          percentageValue === val
                            ? 'bg-[#5170ff] text-white border-[#5170ff]'
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
                    {dbProducts.map((p, idx) => (
                      <option key={`disc-prod-${p.id || p.name}-${idx}`} value={p.name}>
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
                      {activeProductObj?.portions?.map((port: number, idx: number) => (
                        <option key={`disc-port-${port}-${idx}`} value={port}>
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
                        {activeProductObj.variants.map((v: string, idx: number) => (
                          <option key={`disc-var-${v}-${idx}`} value={v}>
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
                  placeholder="bijv. Welkomstactie LinkedIn / Bedrijfsdeal"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#05053D]"
                />
              </div>
            </div>

            {/* Max uses limits: total & per person */}
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                  🔢 Gebruikslimieten (Optioneel)
                </span>
                <span className="text-[11px] text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                  Kortingen stapelen niet
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Max. Aantal Keren Totaal Bruikbaar
                  </label>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={maxUsesTotal}
                    onChange={(e) => setMaxUsesTotal(e.target.value)}
                    placeholder="bijv. 100 (leeg = onbeperkt)"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#05053D]"
                  />
                  <span className="text-[11px] text-gray-500 block mt-0.5">
                    Totaal aantal bestellingen waarin deze code verzilverd mag worden.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Max. Aantal Keren Per Persoon
                  </label>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={maxUsesPerPerson}
                    onChange={(e) => setMaxUsesPerPerson(e.target.value)}
                    placeholder="bijv. 1 (leeg = onbeperkt)"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#05053D]"
                  />
                  <span className="text-[11px] text-gray-500 block mt-0.5">
                    Maximaal aantal keren per klant/e-mailadres of werknemer.
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-blue-800 italic pt-1 border-t border-blue-100/60">
                ℹ️ Klanten en bedrijven kunnen maximaal 1 kortingscode per bestelling gebruiken; kortingscodes kunnen niet gestapeld worden.
              </p>
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
                className="px-5 py-2 bg-[#5170ff] hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                {isSaving ? 'Opslaan...' : 'Kortingscode Aanmaken'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Code Form Card */}
      {editingId && (
        <div className="bg-white border-2 border-[#5170ff] rounded-xl p-6 shadow-lg relative">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
              <Edit2 size={18} className="text-[#5170ff]" />
              Kortingscode Bewerken: <span className="font-mono text-blue-900 font-extrabold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{editCodeName}</span>
            </h3>
            <button
              onClick={handleCancelEdit}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-md cursor-pointer"
              title="Annuleren"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleUpdateCode} className="space-y-4">
            {/* Code Name & Generator */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700">
                  Kortingscode
                </label>
                <button
                  type="button"
                  onClick={() => setEditCodeName(generateRandomCode(editDiscountType, editPercentageValue))}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5170ff] hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                  title="Genereer automatisch een nieuwe unieke code"
                >
                  <Sparkles size={13} />
                  Genereer code
                </button>
              </div>
              <input
                type="text"
                required
                value={editCodeName}
                onChange={(e) => setEditCodeName(e.target.value.toUpperCase())}
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
                  onClick={() => setEditDiscountType('percentage')}
                  className={`p-3 rounded-lg border-2 text-left flex items-start gap-3 transition-all cursor-pointer ${
                    editDiscountType === 'percentage'
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
                  onClick={() => setEditDiscountType('free_product')}
                  className={`p-3 rounded-lg border-2 text-left flex items-start gap-3 transition-all cursor-pointer ${
                    editDiscountType === 'free_product'
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
            {editDiscountType === 'percentage' && (
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
                      value={editPercentageValue}
                      onChange={(e) => setEditPercentageValue(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-base font-bold focus:outline-none focus:border-[#05053D]"
                    />
                    <span className="absolute right-3 top-2.5 text-gray-400 font-bold">%</span>
                  </div>
                  <div className="flex gap-2">
                    {[5, 10, 15, 20, 25, 50].map((val, idx) => (
                      <button
                        key={`edit-discount-val-${val}-${idx}`}
                        type="button"
                        onClick={() => setEditPercentageValue(val)}
                        className={`px-2.5 py-1 text-xs rounded font-medium border cursor-pointer ${
                          editPercentageValue === val
                            ? 'bg-[#5170ff] text-white border-[#5170ff]'
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
            {editDiscountType === 'free_product' && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Selecteer Gratis Product
                  </label>
                  <select
                    value={editSelectedProduct}
                    onChange={(e) => handleEditProductChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-[#05053D]"
                  >
                    {dbProducts.map((p, idx) => (
                      <option key={`edit-disc-prod-${p.id || p.name}-${idx}`} value={p.name}>
                        {p.name} {p.category ? `(${p.category})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      Aantal Stuks / Portiegrootte
                    </label>
                    <select
                      value={editSelectedPortion}
                      onChange={(e) => setEditSelectedPortion(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-[#05053D]"
                    >
                      {editActiveProductObj?.portions?.map((port: number, idx: number) => (
                        <option key={`edit-disc-port-${port}-${idx}`} value={port}>
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

                  {editActiveProductObj?.variants && editActiveProductObj.variants.length > 0 && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        Variant (Optioneel)
                      </label>
                      <select
                        value={editSelectedVariant}
                        onChange={(e) => setEditSelectedVariant(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-[#05053D]"
                      >
                        <option value="">Standaard</option>
                        {editActiveProductObj.variants.map((v: string, idx: number) => (
                          <option key={`edit-disc-var-${v}-${idx}`} value={v}>
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
                    value={editMinOrderAmount}
                    onChange={(e) => setEditMinOrderAmount(e.target.value)}
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
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="bijv. Welkomstactie LinkedIn / Bedrijfsdeal"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#05053D]"
                />
              </div>
            </div>

            {/* Max uses limits: total & per person */}
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                  🔢 Gebruikslimieten (Optioneel)
                </span>
                <span className="text-[11px] text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                  Kortingen stapelen niet
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Max. Aantal Keren Totaal Bruikbaar
                  </label>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={editMaxUsesTotal}
                    onChange={(e) => setEditMaxUsesTotal(e.target.value)}
                    placeholder="bijv. 100 (leeg = onbeperkt)"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#05053D]"
                  />
                  <span className="text-[11px] text-gray-500 block mt-0.5">
                    Totaal aantal bestellingen waarin deze code verzilverd mag worden.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Max. Aantal Keren Per Persoon
                  </label>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={editMaxUsesPerPerson}
                    onChange={(e) => setEditMaxUsesPerPerson(e.target.value)}
                    placeholder="bijv. 1 (leeg = onbeperkt)"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#05053D]"
                  />
                  <span className="text-[11px] text-gray-500 block mt-0.5">
                    Maximaal aantal keren per klant/e-mailadres of werknemer.
                  </span>
                </div>
              </div>
            </div>

            {/* Status toggle checkbox */}
            <div className="flex items-center gap-2 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-700">
                <input
                  type="checkbox"
                  checked={editIsActive}
                  onChange={(e) => setEditIsActive(e.target.checked)}
                  className="w-4 h-4 text-[#5170ff] rounded border-gray-300 focus:ring-[#5170ff]"
                />
                Deze kortingscode is actief en kan gebruikt worden
              </label>
            </div>

            {/* Submit & Cancel */}
            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Annuleren
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 bg-[#5170ff] hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                {isSaving ? 'Opslaan...' : 'Wijzigingen Opslaan'}
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
              className="inline-flex items-center gap-2 bg-[#5170ff] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors cursor-pointer"
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
                  <th className="py-3 px-4">Gebruik / Limiet</th>
                  <th className="py-3 px-4">Omschrijving</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Acties</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {codes.map((item, idx) => (
                  <tr key={`disc-code-${item.id || idx}-${idx}`} className={`hover:bg-gray-50/80 transition-colors ${!item.is_active ? 'opacity-60 bg-gray-50/40' : ''} ${editingId === item.id ? 'bg-blue-50/80 ring-2 ring-blue-300' : ''}`}>
                    {/* Code */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm bg-gray-100 text-gray-900 border border-gray-200 px-2.5 py-1 rounded">
                          {item.code}
                        </span>
                        {editingId === item.id && (
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-100 border border-blue-200 px-1.5 py-0.5 rounded">
                            Wordt bewerkt
                          </span>
                        )}
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

                    {/* Usage / Limit */}
                    <td className="py-3.5 px-4 text-xs">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 font-medium text-gray-800">
                          <span>{item.used_count || 0}x gebruikt</span>
                          {item.max_uses_total ? (
                            <span className="text-gray-500 font-normal">/ max. {item.max_uses_total}x</span>
                          ) : (
                            <span className="text-gray-400 font-normal">(onbeperkt)</span>
                          )}
                          {item.max_uses_total && (item.used_count || 0) >= item.max_uses_total ? (
                            <span className="bg-red-100 text-red-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                              Opgebruikt
                            </span>
                          ) : null}
                        </div>
                        <span className="text-gray-500">
                          {item.max_uses_per_person ? `Max. ${item.max_uses_per_person}x p.p.` : 'Onbeperkt p.p.'}
                        </span>
                        {(item.used_count || 0) > 0 && (
                          <button
                            type="button"
                            onClick={() => handleResetUsage(item.id)}
                            className="text-[10px] text-blue-600 hover:text-blue-800 underline w-fit cursor-pointer mt-0.5"
                            title="Zet teller terug op 0"
                          >
                            Reset teller (0)
                          </button>
                        )}
                      </div>
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

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(item)}
                          disabled={isSaving}
                          className="text-gray-600 hover:text-[#05053D] hover:bg-blue-50 px-2 py-1.5 rounded transition-colors cursor-pointer inline-flex items-center gap-1 text-xs font-semibold"
                          title="Kortingscode bewerken"
                        >
                          <Edit2 size={14} className="text-[#5170ff]" />
                          <span>Bewerken</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCode(item.id)}
                          disabled={isSaving}
                          className="text-gray-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-colors cursor-pointer"
                          title="Kortingscode verwijderen"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
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
