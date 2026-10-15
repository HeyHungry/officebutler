import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, Edit3, RotateCcw, Check, Type, Sparkles, AlertCircle } from 'lucide-react';
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
      
      // If no size exists or if previously set to '100%' / 'auto', treat as 'auto' (Standard)
      if (!existingSize || existingSize === 'auto' || existingSize === '100%' || existingSize === 'default') {
        setSizeValue('auto');
      } else {
        setSizeValue(String(existingSize));
      }
    }
  }, [editingField, activeLang, storeSettings]);

  if (!editingField) return null;

  const isTitle = editingField.key.includes('title') && !editingField.key.includes('sub');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Pass clean values: 'auto' will cause the override to be deleted in database
      const finalFont = fontValue === 'auto' ? 'auto' : fontValue;
      const finalSize = sizeValue === 'auto' || sizeValue === '100%' || !sizeValue ? 'auto' : sizeValue;

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

  // Reset helpers
  const handleResetText = () => {
    if (editingField.defaultValue !== undefined) {
      setTextValue(editingField.defaultValue);
    } else {
      setTextValue('');
    }
  };

  const handleResetTypography = () => {
    setFontValue('auto');
    setSizeValue('auto');
  };

  const handleResetAll = () => {
    handleResetText();
    handleResetTypography();
  };

  const hasCustomTypography = fontValue !== 'auto' || (sizeValue !== 'auto' && sizeValue !== '100%' && sizeValue !== '');
  const hasCustomText = editingField.defaultValue !== undefined && textValue !== editingField.defaultValue;

  const isMultiline = editingField.multiline ?? (textValue.length > 60 || editingField.key.includes('desc') || editingField.key.includes('subtitle') || editingField.key.includes('faq_a'));

  // Quick preset sizes
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

  const currentPresets = isTitle ? titlePresets : bodyPresets;

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
          <div className="px-6 py-4 bg-[#151f34] text-white flex items-center justify-between border-b border-[#b58b4c]/30 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#5170ff] flex items-center justify-center text-white shrink-0 shadow-sm">
                <Edit3 size={16} />
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold leading-tight text-white">
                  Tekst & Opmaak Bewerken
                </h3>
                <p className="text-xs text-white/60 -mt-0.5 font-sans">
                  {editingField.label} <span className="opacity-40">({editingField.key})</span>
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
            {/* Language Tabs & Quick Reset */}
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
                      ? 'bg-[#5170ff] text-white shadow-xs'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <span>🇬🇧</span> Engels (English)
                </button>
              </div>

              {/* Reset Knoppen */}
              <div className="flex items-center gap-2">
                {hasCustomText && (
                  <button
                    type="button"
                    onClick={handleResetText}
                    className="text-xs text-gray-500 hover:text-[#5170ff] flex items-center gap-1 transition-colors cursor-pointer bg-gray-50 px-2 py-1 rounded-md border border-gray-200"
                    title="Herstel alleen de originele tekst"
                  >
                    <RotateCcw size={11} />
                    <span>Tekst herstellen</span>
                  </button>
                )}
                {(hasCustomTypography || hasCustomText) && (
                  <button
                    type="button"
                    onClick={handleResetAll}
                    className="text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-md flex items-center gap-1 transition-all cursor-pointer font-medium"
                    title="Zet zowel tekst als lettertype en tekstgrootte terug naar fabrieksstandaard"
                  >
                    <RotateCcw size={12} />
                    <span>Alles herstellen</span>
                  </button>
                )}
              </div>
            </div>

            {/* Input or Textarea */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5 flex items-center justify-between">
                <span>{activeLang === 'nl' ? 'Nederlandse tekst:' : 'Engelse vertaling:'}</span>
                {editingField.defaultValue && editingField.defaultValue !== textValue && (
                  <span className="text-[10px] text-gray-400">
                    Origineel: "{editingField.defaultValue.slice(0, 30)}{editingField.defaultValue.length > 30 ? '...' : ''}"
                  </span>
                )}
              </label>

              {isMultiline ? (
                <textarea
                  rows={4}
                  autoFocus
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  placeholder={editingField.defaultValue || 'Voer tekst in...'}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#5170ff] focus:border-transparent transition-all font-sans leading-relaxed resize-y min-h-[90px]"
                />
              ) : (
                <input
                  type="text"
                  autoFocus
                  value={textValue}
                  onChange={(e) => setTextValue(e.target.value)}
                  placeholder={editingField.defaultValue || 'Voer tekst in...'}
                  className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#5170ff] focus:border-transparent transition-all font-sans"
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
                  <Type size={14} className="text-[#5170ff]" />
                  Opmaak: Lettertype & Grootte
                </span>
                
                {hasCustomTypography && (
                  <button
                    type="button"
                    onClick={handleResetTypography}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium cursor-pointer"
                    title="Herstel lettertype en grootte naar standaard (origineel ontwerp)"
                  >
                    <RotateCcw size={11} />
                    <span>Herstel naar standaard</span>
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
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#5170ff] focus:border-[#5170ff] transition-all cursor-pointer font-sans"
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
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1 flex items-center justify-between">
                    <span>Tekstgrootte:</span>
                    <span className="text-[10px] text-gray-400 font-normal">
                      {sizeValue === 'auto' ? 'Origineel ontwerp' : sizeValue}
                    </span>
                  </label>
                  <input
                    type="text"
                    value={sizeValue === 'auto' ? '' : sizeValue}
                    onChange={(e) => setSizeValue(e.target.value || 'auto')}
                    placeholder="Standaard (Auto) of bv. 64px, +20%"
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#5170ff] focus:border-[#5170ff] transition-all font-sans"
                  />
                </div>
              </div>

              {/* Snelle grootte opties */}
              <div className="pt-0.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-gray-500 font-medium">Snelle keuzes:</span>
                  <span className="text-[10px] text-gray-400">
                    {'Standaard (Auto)'} = originele responsieve titelgrootte
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {currentPresets.map((sz) => {
                    const isSelected = sizeValue === sz.val;
                    return (
                      <button
                        key={sz.val}
                        type="button"
                        onClick={() => setSizeValue(sz.val)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#5170ff] text-white shadow-xs'
                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        {sz.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Voorbeeld Box */}
              <div className="bg-white rounded-lg p-3 border border-gray-200 text-left">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 flex items-center gap-1">
                    <Sparkles size={11} className="text-[#5170ff]" />
                    Live voorbeeld:
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {fontValue === 'auto' ? 'Standaard lettertype' : fontValue} • {sizeValue === 'auto' ? 'Standaard grootte' : sizeValue}
                  </span>
                </div>
                <div
                  className="text-gray-900 break-words leading-relaxed overflow-hidden"
                  style={getCustomTypographyStyle(fontValue, sizeValue, editingField.key)}
                >
                  {textValue || editingField.defaultValue || 'Voorbeeld tekst'}
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100 shrink-0">
              <div>
                {(hasCustomTypography || hasCustomText) && (
                  <button
                    type="button"
                    onClick={handleResetAll}
                    className="text-xs text-gray-500 hover:text-amber-700 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw size={12} />
                    <span>Herstel naar standaard</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
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
                  className="px-5 py-2 text-xs font-bold text-white bg-[#5170ff] hover:bg-[#4060ee] rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {showSavedFeedback ? (
                    <>
                      <Check size={14} className="text-white" />
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
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
