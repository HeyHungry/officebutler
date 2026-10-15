import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Edit3, RotateCcw, Check, Type } from 'lucide-react';
import { useModerator } from '../contexts/ModeratorContext';
import { useLanguage } from '../contexts/LanguageContext';
import { FONT_OPTIONS, getCustomTypographyStyle } from '../lib/typography';

export function InlineTextEditModal() {
  const { editingField, closeInlineEdit, saveFieldContent, storeSettings } = useModerator();
  const { language: currentGlobalLang } = useLanguage();

  const [activeLang, setActiveLang] = useState<'nl' | 'en'>(currentGlobalLang === 'en' ? 'en' : 'nl');
  const [textValue, setTextValue] = useState<string>('');
  const [fontValue, setFontValue] = useState<string>('auto');
  const [sizeValue, setSizeValue] = useState<string>('auto');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showSavedFeedback, setShowSavedFeedback] = useState<boolean>(false);

  // Sync state whenever editingField changes or activeLang changes
  useEffect(() => {
    if (editingField) {
      const pc = storeSettings?.page_content || {};
      const targetKey = activeLang === 'en' ? `${editingField.key}_en` : editingField.key;
      const existingVal = (pc as any)[targetKey];

      if (existingVal !== undefined && existingVal !== null) {
        setTextValue(String(existingVal));
      } else if (activeLang === 'nl' && editingField.value !== undefined) {
        setTextValue(editingField.value);
      } else if (activeLang === 'nl' && editingField.defaultValue !== undefined) {
        setTextValue(editingField.defaultValue);
      } else {
        setTextValue('');
      }

      const existingFont = (pc as any)[`${editingField.key}_font`] || 'auto';
      const existingSize = (pc as any)[`${editingField.key}_size`];
      setFontValue(existingFont);

      // Als grootte 'auto', '100%', 'default' of leeg is, zet op 'auto' zodat 'Standaard (Origineel)' geselecteerd staat
      if (!existingSize || existingSize === 'auto' || existingSize === '100%' || existingSize === 'default') {
        setSizeValue('auto');
      } else {
        setSizeValue(existingSize);
      }
    }
  }, [editingField, activeLang, storeSettings]);

  if (!editingField) return null;

  const isTitle =
    editingField.type === 'title' ||
    editingField.key.toLowerCase().includes('title') ||
    editingField.key.toLowerCase().includes('heading') ||
    editingField.label.toLowerCase().includes('titel') ||
    editingField.label.toLowerCase().includes('kop');

  const titlePresets = [
    { label: 'Standaard (Origineel)', val: 'auto' },
    { label: '48px', val: '48px' },
    { label: '64px', val: '64px' },
    { label: '76px', val: '76px' },
    { label: '88px', val: '88px' },
    { label: '+20%', val: '120%' },
    { label: '+50%', val: '150%' }
  ];

  const bodyPresets = [
    { label: 'Standaard (Origineel)', val: 'auto' },
    { label: '14px', val: '14px' },
    { label: '16px', val: '16px' },
    { label: '18px', val: '18px' },
    { label: '22px', val: '22px' },
    { label: '28px', val: '28px' },
    { label: '+20%', val: '120%' }
  ];

  const presets = isTitle ? titlePresets : bodyPresets;

  const isPresetActive = (val: string) => {
    if (val === 'auto') {
      return !sizeValue || sizeValue === 'auto' || sizeValue === '100%' || sizeValue === 'default';
    }
    return sizeValue === val;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Bij opslaan met 'auto' wordt de override gewist zodat het originele responsieve ontwerp weer actief is
      const finalSize = (!sizeValue || sizeValue === 'auto' || sizeValue === '100%' || sizeValue === 'default') ? 'auto' : sizeValue;
      const finalFont = (!fontValue || fontValue === 'auto') ? 'auto' : fontValue;

      const success = await saveFieldContent(
        editingField.key,
        textValue,
        activeLang,
        finalFont,
        finalSize
      );
      if (success) {
        setShowSavedFeedback(true);
        setTimeout(() => {
          setShowSavedFeedback(false);
          closeInlineEdit();
        }, 500);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetText = () => {
    if (editingField.defaultValue !== undefined) {
      setTextValue(editingField.defaultValue);
    } else {
      setTextValue('');
    }
  };

  const handleResetAll = () => {
    if (editingField.defaultValue !== undefined) {
      setTextValue(editingField.defaultValue);
    } else {
      setTextValue('');
    }
    setFontValue('auto');
    setSizeValue('auto');
  };

  const handleResetTypography = () => {
    setFontValue('auto');
    setSizeValue('auto');
  };

  const isMultiline = editingField.multiline ?? (textValue.length > 60 || editingField.key.includes('desc') || editingField.key.includes('subtitle') || editingField.key.includes('faq_a'));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-4 bg-[#151f34] text-white flex items-center justify-between border-b border-[#eaaf47]/30 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#eaaf47] flex items-center justify-center text-[#151f34] shrink-0 shadow-sm font-bold">
                <Edit3 size={16} />
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold leading-tight text-white">
                  Tekst & Opmaak Bewerken
                </h3>
                <p className="text-xs text-white/70 -mt-0.5 font-sans">
                  {editingField.label} <span className="opacity-50">({editingField.key})</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeInlineEdit}
              className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Sluiten"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto custom-scrollbar">
            {/* Language Tabs & Herstelknoppen */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
              <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl border border-gray-200">
                <button
                  type="button"
                  onClick={() => setActiveLang('nl')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeLang === 'nl'
                      ? 'bg-white text-gray-900 shadow-xs'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <span>🇳🇱</span> Nederlands
                </button>
                <button
                  type="button"
                  onClick={() => setActiveLang('en')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    activeLang === 'en'
                      ? 'bg-[#151f34] text-white shadow-xs'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <span>🇬🇧</span> Engels (English)
                </button>
              </div>

              {/* Herstelknoppen bovenaan */}
              <div className="flex items-center gap-1.5">
                {editingField.defaultValue && (
                  <button
                    type="button"
                    onClick={handleResetText}
                    className="text-xs text-gray-600 hover:text-[#151f34] flex items-center gap-1 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-gray-100 border border-transparent hover:border-gray-200"
                    title="Herstel alleen de tekst naar de standaardwaarde"
                  >
                    <RotateCcw size={12} />
                    <span>Tekst herstellen</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleResetAll}
                  className="text-xs text-gray-600 hover:text-red-600 flex items-center gap-1 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-gray-100 border border-transparent hover:border-gray-200"
                  title="Herstel tekst, lettertype en grootte naar standaard (wist overrides)"
                >
                  <RotateCcw size={12} />
                  <span>Alles herstellen</span>
                </button>
              </div>
            </div>

            {/* Input or Textarea */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                {activeLang === 'nl' ? 'Nederlandse tekst:' : 'Engelse vertaling:'}
              </label>

              {isMultiline ? (
                <textarea
                  rows={4}
                  autoFocus
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  placeholder={editingField.defaultValue || 'Voer tekst in...'}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#151f34] focus:border-transparent transition-all font-sans leading-relaxed resize-y min-h-[90px]"
                />
              ) : (
                <input
                  type="text"
                  autoFocus
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  placeholder={editingField.defaultValue || 'Voer tekst in...'}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#151f34] focus:border-transparent transition-all font-sans"
                />
              )}

              {editingField.allowHtml && (
                <p className="text-[11px] text-gray-400 mt-1.5">
                  Tip: HTML-tags zoals &lt;span class="..."&gt; zijn toegestaan voor speciale opmaak.
                </p>
              )}
            </div>

            {/* Lettertype & Grootte Paneel */}
            <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5 uppercase tracking-wider">
                  <Type size={14} className="text-[#eaaf47]" />
                  Opmaak: Lettertype & Grootte
                </span>
                {(fontValue !== 'auto' || (sizeValue !== 'auto' && sizeValue !== '100%')) && (
                  <button
                    type="button"
                    onClick={handleResetTypography}
                    className="text-[11px] text-gray-500 hover:text-red-600 underline cursor-pointer"
                    title="Zet lettertype en grootte terug naar standaard"
                  >
                    Herstel naar standaard
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Lettertype select */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    Lettertype:
                  </label>
                  <select
                    value={fontValue}
                    onChange={(e) => setFontValue(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#151f34] focus:border-[#151f34] transition-all cursor-pointer font-sans"
                  >
                    {FONT_OPTIONS.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tekstgrootte input */}
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    Tekstgrootte (px, % of rem):
                  </label>
                  <input
                    type="text"
                    value={sizeValue === 'auto' ? '' : sizeValue}
                    onChange={(e) => setSizeValue(e.target.value || 'auto')}
                    placeholder="Standaard (auto)"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#151f34] focus:border-[#151f34] transition-all font-sans"
                  />
                </div>
              </div>

              {/* Snelle grootte opties (Presets) */}
              <div>
                <span className="text-[11px] font-semibold text-gray-600 block mb-1.5">
                  Snelle keuzes ({isTitle ? 'Titels' : 'Body tekst'}):
                </span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {presets.map((p) => {
                    const active = isPresetActive(p.val);
                    return (
                      <button
                        key={p.val}
                        type="button"
                        onClick={() => setSizeValue(p.val)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          active
                            ? 'bg-[#151f34] text-[#eaaf47] shadow-xs border border-[#151f34]'
                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Voorbeeld Box */}
              <div className="bg-white rounded-lg p-3 border border-gray-200 text-left">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mb-1.5">
                  Live voorbeeld:
                </span>
                <div
                  className="text-gray-800 break-words leading-relaxed overflow-hidden"
                  style={getCustomTypographyStyle(
                    fontValue,
                    sizeValue === 'auto' ? undefined : sizeValue,
                    isTitle ? 'title' : (editingField.type || 'paragraph')
                  )}
                >
                  {textValue || editingField.defaultValue || 'Voorbeeld tekst'}
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 shrink-0">
              <button
                type="button"
                onClick={closeInlineEdit}
                disabled={isSaving}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Annuleren
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 text-xs font-bold text-[#151f34] bg-[#eaaf47] hover:bg-[#d89e36] rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {showSavedFeedback ? (
                  <>
                    <Check size={14} className="text-[#151f34]" />
                    <span>Opgeslagen!</span>
                  </>
                ) : isSaving ? (
                  <span>Opslaan...</span>
                ) : (
                  <>
                    <Save size={14} />
                    <span>Opslaan</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
