import React, { useState, FormEvent } from 'react';
import { supabase, StoreSettings, PackagingOption, ObCompany, AVAILABLE_BRANDS } from '../lib/supabase';
import { Package, Plus, Trash2, Edit2, Check, X, AlertCircle, Building2, Users, Search, ArrowUp, ArrowDown, Globe, Image as ImageIcon } from 'lucide-react';

type PackagingOptionsManagerProps = {
  storeSettings?: StoreSettings;
  onStoreSettingsUpdated?: (settings: StoreSettings) => void;
  companies: ObCompany[];
};

export function PackagingOptionsManager({ storeSettings, onStoreSettingsUpdated, companies = [] }: PackagingOptionsManagerProps) {
  const options: PackagingOption[] = storeSettings?.page_content?.packaging_options || [];

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmOpt, setDeleteConfirmOpt] = useState<PackagingOption | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form states (shared for add & edit)
  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [price, setPrice] = useState<string>('0');
  const [isActive, setIsActive] = useState(true);
  const [availableForGuests, setAvailableForGuests] = useState(false);
  const [availableForAllCompanies, setAvailableForAllCompanies] = useState(true);
  const [allowedCompanyIds, setAllowedCompanyIds] = useState<string[]>([]);
  const [allowedBrands, setAllowedBrands] = useState<string[]>([]);
  const [companySearch, setCompanySearch] = useState('');

  const resetForm = () => {
    setName('');
    setNameEn('');
    setDescription('');
    setDescriptionEn('');
    setImageUrl('');
    setPrice('0');
    setIsActive(true);
    setAvailableForGuests(false);
    setAvailableForAllCompanies(true);
    setAllowedCompanyIds([]);
    setAllowedBrands([]);
    setCompanySearch('');
  };

  const handleOpenAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setErrorMsg(null);
    setSuccessMsg(null);
    resetForm();
  };

  const handleStartEdit = (opt: PackagingOption) => {
    setIsAdding(false);
    setEditingId(opt.id);
    setErrorMsg(null);
    setSuccessMsg(null);
    setName(opt.name || '');
    setNameEn(opt.name_en || '');
    setDescription(opt.description || '');
    setDescriptionEn(opt.description_en || '');
    setImageUrl(opt.image_url || '');
    setPrice(opt.price !== undefined ? String(opt.price) : '0');
    setIsActive(opt.is_active ?? true);
    setAvailableForGuests(Boolean(opt.available_for_guests));
    setAvailableForAllCompanies(opt.available_for_all_companies ?? true);
    setAllowedCompanyIds(opt.allowed_company_ids || []);
    setAllowedBrands(opt.allowed_brands || []);
    setCompanySearch('');
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setErrorMsg(null);
    resetForm();
  };

  const saveOptionsToSupabase = async (newOptions: PackagingOption[], customSuccessMsg?: string) => {
    setIsSaving(true);
    setErrorMsg(null);
    try {
      const currentContent = storeSettings?.page_content || {};
      const updatedPageContent = {
        ...currentContent,
        packaging_options: newOptions
      };

      if (supabase) {
        const targetId = storeSettings?.id || 1;
        const { error } = await supabase
          .from('store_settings')
          .update({ page_content: updatedPageContent })
          .eq('id', targetId);

        if (error) {
          console.error('Fout bij opslaan verpakkingsopties in Supabase:', error);
          throw error;
        }
      }

      const updatedSettings: StoreSettings = {
        ...(storeSettings || { id: 1, override_status: 'AUTO', schedule: {}, pickup_url: '', delivery_url: '' }),
        page_content: updatedPageContent
      };

      if (onStoreSettingsUpdated) {
        onStoreSettingsUpdated(updatedSettings);
      }

      setSuccessMsg(customSuccessMsg || 'Verpakkingsopties succesvol opgeslagen.');
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      console.error('Fout bij opslaan verpakkingsopties:', err);
      setErrorMsg(err.message || 'Kon wijzigingen niet opslaan in database.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (id: string) => {
    const newOptions = options.map(o => o.id === id ? { ...o, is_active: !o.is_active } : o);
    await saveOptionsToSupabase(newOptions);
  };

  const handleDeleteClick = (opt: PackagingOption) => {
    setErrorMsg(null);
    setDeleteConfirmOpt(opt);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmOpt) return;
    const targetId = deleteConfirmOpt.id;
    const optName = deleteConfirmOpt.name;
    try {
      if (editingId === targetId) {
        setIsAdding(false);
        setEditingId(null);
        resetForm();
      }
      const newOptions = options.filter(o => o.id !== targetId);
      await saveOptionsToSupabase(newOptions, `Verpakkingsoptie "${optName}" succesvol verwijderd.`);
      setDeleteConfirmOpt(null);
    } catch (err: any) {
      console.error('Fout bij verwijderen verpakkingsoptie:', err);
      setErrorMsg(err.message || 'Kon verpakkingsoptie niet verwijderen.');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= options.length) return;
    const newOptions = [...options];
    const temp = newOptions[index];
    newOptions[index] = newOptions[targetIndex];
    newOptions[targetIndex] = temp;
    await saveOptionsToSupabase(newOptions);
  };

  const handleToggleCompany = (compId: string) => {
    if (allowedCompanyIds.includes(compId)) {
      setAllowedCompanyIds(allowedCompanyIds.filter(id => id !== compId));
    } else {
      setAllowedCompanyIds([...allowedCompanyIds, compId]);
    }
  };

  const handleSelectAllCompanies = () => {
    setAllowedCompanyIds(companies.map(c => c.id));
  };

  const handleDeselectAllCompanies = () => {
    setAllowedCompanyIds([]);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setErrorMsg('Voer een naam in voor de verpakkingsoptie.');
      return;
    }

    const numPrice = parseFloat(price.replace(',', '.')) || 0;
    if (numPrice < 0) {
      setErrorMsg('Prijs mag niet negatief zijn.');
      return;
    }

    if (!availableForGuests && !availableForAllCompanies && allowedCompanyIds.length === 0) {
      setErrorMsg('Selecteer minimaal één doelgroep (gasten, alle bedrijven, of minimaal één specifiek bedrijf).');
      return;
    }

    if (isAdding) {
      const newOption: PackagingOption = {
        id: crypto.randomUUID ? crypto.randomUUID() : `pack_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        name: cleanName,
        name_en: nameEn.trim() || undefined,
        description: description.trim() || undefined,
        description_en: descriptionEn.trim() || undefined,
        image_url: imageUrl.trim() || undefined,
        price: numPrice,
        is_active: isActive,
        available_for_guests: availableForGuests,
        available_for_all_companies: availableForAllCompanies,
        allowed_company_ids: !availableForAllCompanies ? allowedCompanyIds : undefined,
        allowed_brands: allowedBrands.length > 0 ? allowedBrands : undefined,
        created_at: new Date().toISOString(),
        sort_order: options.length
      };
      const newOptions = [...options, newOption];
      await saveOptionsToSupabase(newOptions);
      setIsAdding(false);
      resetForm();
    } else if (editingId) {
      const newOptions = options.map(o => {
        if (o.id === editingId) {
          return {
            ...o,
            name: cleanName,
            name_en: nameEn.trim() || undefined,
            description: description.trim() || undefined,
            description_en: descriptionEn.trim() || undefined,
            image_url: imageUrl.trim() || undefined,
            price: numPrice,
            is_active: isActive,
            available_for_guests: availableForGuests,
            available_for_all_companies: availableForAllCompanies,
            allowed_company_ids: !availableForAllCompanies ? allowedCompanyIds : undefined,
            allowed_brands: allowedBrands.length > 0 ? allowedBrands : undefined
          };
        }
        return o;
      });
      await saveOptionsToSupabase(newOptions);
      setEditingId(null);
      resetForm();
    }
  };

  const filteredCompanies = companies.filter(c => {
    const q = companySearch.toLowerCase();
    return c.name.toLowerCase().includes(q) || (c.billing_email && c.billing_email.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="text-[#05053D]" size={22} />
            Verpakkingsopties (Bedrijven & Gasten)
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Bepaal hoe bestellingen verpakt worden, inclusief Engelse vertalingen, afbeeldingen en doelgroepen per bedrijf of gast.
          </p>
        </div>

        {!isAdding && !editingId && (
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 bg-[#5170ff] hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm cursor-pointer shrink-0"
          >
            <Plus size={16} />
            Nieuwe Verpakkingsoptie
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

      {/* Add / Edit Form Card */}
      {(isAdding || editingId) && (
        <div className="bg-white border-2 border-[#5170ff] rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
              {isAdding ? <Plus size={18} className="text-[#5170ff]" /> : <Edit2 size={18} className="text-[#5170ff]" />}
              {isAdding ? 'Nieuwe Verpakkingsoptie Toevoegen' : `Verpakkingsoptie Bewerken: ${name || 'Naamloos'}`}
            </h3>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-md cursor-pointer"
              title="Sluiten"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name & Extra Price */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Naam van de verpakking (Nederlands) *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="bijv. Standaard Cateringdozen, Luxe Schalen, Individuele Zakjes..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#05053D] focus:ring-1 focus:ring-[#05053D]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Extra Kosten (€)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-400 font-semibold">€</span>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-7 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold focus:outline-none focus:border-[#05053D] focus:ring-1 focus:ring-[#05053D]"
                  />
                </div>
                <span className="text-[11px] text-gray-400 mt-1 block">Laat op 0 voor gratis / inbegrepen.</span>
              </div>
            </div>

            {/* English Name (Translation) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1 flex items-center gap-1.5">
                <Globe size={14} className="text-[#5170ff]" />
                Engelse naam / English name (optioneel)
              </label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="e.g. Standard Catering Boxes, Luxury Platters, Individual Bags..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#05053D] focus:ring-1 focus:ring-[#05053D]"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">Wordt automatisch getoond aan bezoekers die de Engelse taal selecteren.</span>
            </div>

            {/* Descriptions: NL & EN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Omschrijving (Nederlands - optioneel)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="bijv. Gerechten worden per soort gescheiden verpakt in thermische cateringdozen."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#05053D] focus:ring-1 focus:ring-[#05053D] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1 flex items-center gap-1.5">
                  <Globe size={14} className="text-[#5170ff]" />
                  Omschrijving (Engels / English - optioneel)
                </label>
                <textarea
                  rows={2}
                  value={descriptionEn}
                  onChange={(e) => setDescriptionEn(e.target.value)}
                  placeholder="e.g. Dishes are packaged separately by type in insulated catering boxes."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-[#05053D] focus:ring-1 focus:ring-[#05053D] resize-none"
                />
              </div>
            </div>

            {/* Image link / URL */}
            <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1 flex items-center gap-1.5">
                <ImageIcon size={14} className="text-[#5170ff]" />
                Afbeelding link / URL (optioneel)
              </label>
              <div className="flex flex-col sm:flex-row gap-3 items-start">
                <div className="flex-1 w-full">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://voorbeeld.nl/foto.jpg of https://images.unsplash.com/..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:border-[#05053D] focus:ring-1 focus:ring-[#05053D]"
                  />
                  <span className="text-[11px] text-gray-500 mt-1 block">
                    Plak hier een directe link naar een afbeelding (JPG, PNG, WebP). Deze afbeelding wordt getoond bij de verpakkingskeuze op de bestelpagina.
                  </span>
                </div>
                {imageUrl && (
                  <div className="flex items-center gap-2 bg-white p-1.5 rounded-lg border border-gray-200 shrink-0">
                    <img
                      src={imageUrl}
                      alt="Voorbeeld"
                      className="w-14 h-14 object-cover rounded-md"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=Ongeldig';
                      }}
                    />
                    <div className="text-[11px] text-gray-500 pr-2">
                      <span className="font-semibold block text-gray-700">Voorvertoning</span>
                      <span>Link actief</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Target Audience / Visibility Settings */}
            <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-950 flex items-center gap-1.5">
                <Users size={16} className="text-[#5170ff]" />
                Zichtbaarheid & Doelgroep (Wie krijgt deze optie te zien?)
              </span>

              {/* Guests toggle */}
              <div className="bg-white p-3 rounded-lg border border-gray-200 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-sm text-gray-800 block">Zichtbaar voor gasten (particulieren)</span>
                  <span className="text-xs text-gray-500">Mogen bezoekers op de openbare bestelpagina deze optie zien?</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={availableForGuests}
                    onChange={(e) => setAvailableForGuests(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#5170ff]"></div>
                </label>
              </div>

              {/* Companies visibility selection */}
              <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
                <span className="font-semibold text-sm text-gray-800 flex items-center gap-2">
                  <Building2 size={16} className="text-[#5170ff]" />
                  Zichtbaarheid voor Bedrijven
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className={`p-3 rounded-lg border-2 flex items-start gap-3 cursor-pointer transition-colors ${availableForAllCompanies ? 'border-[#05053D] bg-blue-50/40 text-[#05053D]' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}>
                    <input
                      type="radio"
                      name="comp_visibility"
                      checked={availableForAllCompanies}
                      onChange={() => setAvailableForAllCompanies(true)}
                      className="mt-1 text-[#05053D] focus:ring-[#05053D]"
                    />
                    <div>
                      <span className="font-bold text-sm block">Alle Bedrijven</span>
                      <span className="text-xs text-gray-500">Ieder geregistreerd kantoor/bedrijf ziet deze verpakkingsoptie.</span>
                    </div>
                  </label>

                  <label className={`p-3 rounded-lg border-2 flex items-start gap-3 cursor-pointer transition-colors ${!availableForAllCompanies ? 'border-[#05053D] bg-blue-50/40 text-[#05053D]' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}>
                    <input
                      type="radio"
                      name="comp_visibility"
                      checked={!availableForAllCompanies}
                      onChange={() => setAvailableForAllCompanies(false)}
                      className="mt-1 text-[#05053D] focus:ring-[#05053D]"
                    />
                    <div>
                      <span className="font-bold text-sm block">Alleen Specifieke Bedrijven</span>
                      <span className="text-xs text-gray-500">Kies handmatig welke bedrijven deze optie mogen kiezen.</span>
                    </div>
                  </label>
                </div>

                {/* Company checklist when specific companies selected */}
                {!availableForAllCompanies && (
                  <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="relative flex-1">
                        <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                        <input
                          type="text"
                          value={companySearch}
                          onChange={(e) => setCompanySearch(e.target.value)}
                          placeholder="Zoek bedrijf..."
                          className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:border-[#05053D]"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleSelectAllCompanies}
                          className="text-xs text-[#5170ff] hover:underline font-semibold cursor-pointer"
                        >
                          Alles selecteren ({companies.length})
                        </button>
                        <span className="text-gray-300">|</span>
                        <button
                          type="button"
                          onClick={handleDeselectAllCompanies}
                          className="text-xs text-gray-500 hover:underline cursor-pointer"
                        >
                          Deselecteren
                        </button>
                      </div>
                    </div>

                    <div className="max-h-52 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100 bg-gray-50/50">
                      {companies.length === 0 ? (
                        <p className="text-xs text-gray-500 p-3 italic text-center">Nog geen bedrijven geregistreerd.</p>
                      ) : filteredCompanies.length === 0 ? (
                        <p className="text-xs text-gray-500 p-3 italic text-center">Geen bedrijven gevonden voor "{companySearch}".</p>
                      ) : (
                        filteredCompanies.map((c) => {
                          const isChecked = allowedCompanyIds.includes(c.id);
                          return (
                            <label
                              key={`pack-comp-${c.id}`}
                              className={`flex items-center justify-between px-3 py-2 text-xs cursor-pointer hover:bg-white transition-colors ${isChecked ? 'bg-blue-50/70 font-semibold text-blue-950' : 'text-gray-700'}`}
                            >
                              <div className="flex items-center gap-2.5">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleToggleCompany(c.id)}
                                  className="w-4 h-4 rounded text-[#5170ff] border-gray-300 focus:ring-[#5170ff]"
                                />
                                <span>{c.name}</span>
                              </div>
                              {c.billing_email && (
                                <span className="text-[11px] text-gray-400 font-normal">{c.billing_email}</span>
                              )}
                            </label>
                          );
                        })
                      )}
                    </div>
                    <span className="text-[11px] text-blue-800 font-medium block">
                      {allowedCompanyIds.length} {allowedCompanyIds.length === 1 ? 'bedrijf geselecteerd' : 'bedrijven geselecteerd'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Website / Brand Visibility */}
            <div className="bg-teal-50/60 border border-teal-200/80 rounded-xl p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-teal-950 flex items-center gap-1.5">
                  <Globe size={14} className="text-teal-700" />
                  🌐 Zichtbaarheid per website / concept
                </span>
                {allowedBrands.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setAllowedBrands([])}
                    className="text-[11px] text-teal-700 hover:text-teal-900 underline font-medium cursor-pointer"
                  >
                    Toon op alle websites
                  </button>
                )}
              </div>
              <p className="text-[11px] text-teal-800/90">
                {allowedBrands.length === 0 ? (
                  <span>🟢 <strong>Standaard:</strong> Zichtbaar op álle websites (Office Butler, Canal Butler & Snack Butler).</span>
                ) : (
                  <span>🎯 <strong>Exclusief:</strong> Alleen zichtbaar op de hieronder aangevinkte website(s).</span>
                )}
              </p>
              <div className="flex flex-wrap gap-2 pt-0.5">
                {AVAILABLE_BRANDS.map(brand => {
                  const isSelected = allowedBrands.includes(brand.id);
                  return (
                    <label
                      key={`pack-brand-${brand.id}`}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-teal-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          const updated = e.target.checked
                            ? [...allowedBrands, brand.id]
                            : allowedBrands.filter(b => b !== brand.id);
                          setAllowedBrands(updated);
                        }}
                        className="sr-only"
                      />
                      <span>{brand.badge}</span>
                      {isSelected && <Check size={12} className="stroke-[3]" />}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Active toggle */}
            <div className="flex items-center gap-2 pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-700">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-[#5170ff] rounded border-gray-300 focus:ring-[#5170ff]"
                />
                Deze verpakkingsoptie is actief en kan gekozen worden
              </label>
            </div>

            {/* Submit & Cancel */}
            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Annuleren
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 bg-[#5170ff] hover:bg-blue-600 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-2"
              >
                {isSaving ? 'Opslaan...' : isAdding ? 'Optie Toevoegen' : 'Wijzigingen Opslaan'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Existing Options Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {options.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Package size={42} className="mx-auto text-gray-300 mb-3" />
            <h4 className="text-base font-bold text-gray-700">Nog geen verpakkingsopties ingesteld</h4>
            <p className="text-sm text-gray-500 max-w-md mx-auto mt-1 mb-4">
              Voeg verpakkingsopties toe zodat bedrijven en/of particuliere klanten op de bestelpagina kunnen kiezen hoe hun bestelling verpakt moet worden (bijv. cateringdozen, herbruikbare schalen of per persoon).
            </p>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 bg-[#5170ff] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors cursor-pointer"
            >
              <Plus size={16} />
              Eerste optie toevoegen
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">Volgorde</th>
                  <th className="py-3 px-4">Verpakking & Omschrijving</th>
                  <th className="py-3 px-4">Extra Prijs</th>
                  <th className="py-3 px-4">Zichtbaarheid Bedrijven</th>
                  <th className="py-3 px-4 text-center">Gasten</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Acties</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {options.map((item, idx) => {
                  const isCurrentEditing = editingId === item.id;
                  const companyCount = item.available_for_all_companies
                    ? 'Alle bedrijven'
                    : `${(item.allowed_company_ids || []).length} specifiek ${(item.allowed_company_ids || []).length === 1 ? 'bedrijf' : 'bedrijven'}`;

                  return (
                    <tr
                      key={`pack-opt-${item.id || idx}-${idx}`}
                      className={`hover:bg-gray-50/80 transition-colors ${!item.is_active ? 'opacity-60 bg-gray-50/40' : ''} ${isCurrentEditing ? 'bg-blue-50/80 ring-2 ring-blue-300' : ''}`}
                    >
                      {/* Sort order buttons */}
                      <td className="py-3.5 px-2 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0 || isSaving}
                            onClick={() => handleMove(idx, 'up')}
                            className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                            title="Omhoog verplaatsen"
                          >
                            <ArrowUp size={13} />
                          </button>
                          <button
                            type="button"
                            disabled={idx === options.length - 1 || isSaving}
                            onClick={() => handleMove(idx, 'down')}
                            className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                            title="Omlaag verplaatsen"
                          >
                            <ArrowDown size={13} />
                          </button>
                        </div>
                      </td>

                      {/* Name, Image & description */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-3">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-11 h-11 object-cover rounded-lg border border-gray-200 shrink-0"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-11 h-11 rounded-lg bg-gray-100 text-gray-400 flex items-center justify-center shrink-0">
                              <Package size={18} />
                            </div>
                          )}
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-gray-900 flex items-center gap-2">
                              {item.name}
                              {isCurrentEditing && (
                                <span className="text-[10px] font-bold text-blue-700 bg-blue-100 border border-blue-200 px-1.5 py-0.5 rounded">
                                  Wordt bewerkt
                                </span>
                              )}
                            </span>
                            {item.name_en && (
                              <span className="text-xs text-blue-600 flex items-center gap-1 font-medium">
                                <Globe size={11} />
                                {item.name_en}
                              </span>
                            )}
                            {item.description && (
                              <span className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.description}</span>
                            )}
                            {item.description_en && (
                              <span className="text-[11px] text-gray-400 italic line-clamp-1">EN: {item.description_en}</span>
                            )}
                            {item.allowed_brands && item.allowed_brands.length > 0 && (
                              <span className="text-[10px] text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded w-fit mt-1 border border-teal-200 font-medium flex items-center gap-1">
                                🌐 Alleen op: {item.allowed_brands.map((b: string) => AVAILABLE_BRANDS.find(ab => ab.id === b)?.name || b).join(', ')}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 font-semibold text-gray-800">
                        {item.price && Number(item.price) > 0 ? (
                          <span>+€{Number(item.price).toFixed(2)}</span>
                        ) : (
                          <span className="text-emerald-700 font-medium">Inbegrepen (€0)</span>
                        )}
                      </td>

                      {/* Companies visibility */}
                      <td className="py-3.5 px-4 text-xs">
                        {item.available_for_all_companies ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-[#05053D] font-semibold border border-blue-100">
                            <Building2 size={13} />
                            Alle bedrijven
                          </span>
                        ) : (
                          <div className="flex flex-col gap-0.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 font-semibold border border-amber-200 w-fit">
                              <Building2 size={13} />
                              {companyCount}
                            </span>
                            {item.allowed_company_ids && item.allowed_company_ids.length > 0 && (
                              <span className="text-[11px] text-gray-400 truncate max-w-xs block">
                                {companies.filter(c => item.allowed_company_ids?.includes(c.id)).map(c => c.name).join(', ')}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Guests visibility */}
                      <td className="py-3.5 px-4 text-center text-xs">
                        {item.available_for_guests ? (
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                            Zichtbaar
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">
                            Nee
                          </span>
                        )}
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
                            title="Verpakkingsoptie bewerken"
                          >
                            <Edit2 size={14} className="text-[#5170ff]" />
                            <span>Bewerken</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(item)}
                            disabled={isSaving}
                            className="text-gray-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50 transition-colors cursor-pointer"
                            title="Verpakkingsoptie verwijderen"
                          >
                            <Trash2 size={16} />
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
      </div>

      {/* Bevestigingsmodal voor Verwijderen (geen window.confirm die in iframes blokkeert) */}
      {deleteConfirmOpt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 flex flex-col gap-4 animate-in zoom-in-95">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                <Trash2 size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-gray-900">Verpakkingsoptie verwijderen?</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Weet u zeker dat u deze optie definitief wilt verwijderen?
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDeleteConfirmOpt(null)}
                disabled={isSaving}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 flex items-center gap-3">
              {deleteConfirmOpt.image_url ? (
                <img
                  src={deleteConfirmOpt.image_url}
                  alt={deleteConfirmOpt.name}
                  className="w-12 h-12 object-cover rounded-lg border border-gray-200 shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-gray-200 text-gray-500 flex items-center justify-center shrink-0">
                  <Package size={20} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-gray-900 truncate">{deleteConfirmOpt.name}</p>
                {deleteConfirmOpt.name_en && (
                  <p className="text-xs text-blue-600 truncate">EN: {deleteConfirmOpt.name_en}</p>
                )}
                <p className="text-xs text-gray-500 mt-0.5">
                  {deleteConfirmOpt.price && Number(deleteConfirmOpt.price) > 0
                    ? `+€${Number(deleteConfirmOpt.price).toFixed(2)}`
                    : 'Inbegrepen (€0)'}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-600">
              Deze verpakkingsoptie wordt direct verwijderd uit Supabase en is niet langer zichtbaar voor bestellingen.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setDeleteConfirmOpt(null)}
                disabled={isSaving}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Annuleren
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSaving}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <span>Verwijderen...</span>
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span>Ja, definitief verwijderen</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
