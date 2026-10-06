import React, { useState } from 'react';
import { 
  Clock, 
  Save, 
  RotateCcw, 
  CheckCircle2, 
  HelpCircle, 
  Sliders, 
  AlertTriangle,
  Building2,
  Calendar,
  MapPin,
  PlusCircle,
  MinusCircle,
  XCircle
} from 'lucide-react';
import { 
  DeadlineTier, 
  DeadlineAction, 
  DEFAULT_DEADLINE_TIERS, 
  DEADLINE_ACTION_LABELS,
  ModificationRulesConfig,
  CompanyCustomDeadlines
} from '../lib/orderDeadlines';

interface DeadlinesManagerProps {
  globalRules?: ModificationRulesConfig;
  onSaveGlobalRules?: (rules: ModificationRulesConfig) => Promise<void>;
  
  // Optioneel: bij bewerken van een specifiek bedrijf
  company?: {
    id: string;
    name: string;
    custom_deadlines?: CompanyCustomDeadlines;
  } | null;
  onSaveCompanyRules?: (companyId: string, customDeadlines: CompanyCustomDeadlines) => Promise<void>;
  onCloseCompanyModal?: () => void;
}

export function DeadlinesManager({
  globalRules,
  onSaveGlobalRules,
  company,
  onSaveCompanyRules,
  onCloseCompanyModal
}: DeadlinesManagerProps) {
  const isCompanyMode = Boolean(company);

  // Initialiseer tiers
  const initialTiers: DeadlineTier[] = (() => {
    if (isCompanyMode && company?.custom_deadlines?.tiers && company.custom_deadlines.tiers.length > 0) {
      return JSON.parse(JSON.stringify(company.custom_deadlines.tiers));
    }
    if (globalRules?.tiers && globalRules.tiers.length > 0) {
      return JSON.parse(JSON.stringify(globalRules.tiers));
    }
    return JSON.parse(JSON.stringify(DEFAULT_DEADLINE_TIERS));
  })();

  const [useCustomCompany, setUseCustomCompany] = useState<boolean>(
    Boolean(company?.custom_deadlines?.use_custom)
  );
  const [tiers, setTiers] = useState<DeadlineTier[]>(initialTiers);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleDeadlineChange = (tierId: string, action: DeadlineAction, value: string) => {
    const num = Math.max(0, parseFloat(value) || 0);
    setTiers(prev => prev.map(t => {
      if (t.id !== tierId) return t;
      return {
        ...t,
        deadlines: {
          ...t.deadlines,
          [action]: num
        }
      };
    }));
  };

  const handleResetToDefaults = () => {
    if (window.confirm("Weet u zeker dat u de aanbevolen standaardtijden wilt herstellen?")) {
      setTiers(JSON.parse(JSON.stringify(DEFAULT_DEADLINE_TIERS)));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (isCompanyMode && company && onSaveCompanyRules) {
        await onSaveCompanyRules(company.id, {
          use_custom: useCustomCompany,
          tiers: tiers
        });
      } else if (onSaveGlobalRules) {
        await onSaveGlobalRules({
          enabled: true,
          tiers: tiers
        });
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Fout bij opslaan van termijnen:", err);
      alert("Er is een fout opgetreden bij het opslaan van de termijnen.");
    } finally {
      setIsSaving(false);
    }
  };

  const actionIcons: Record<DeadlineAction, React.ReactNode> = {
    cancel: <XCircle size={16} className="text-red-500" />,
    change_location: <MapPin size={16} className="text-amber-500" />,
    change_time: <Calendar size={16} className="text-blue-500" />,
    add_products: <PlusCircle size={16} className="text-emerald-500" />,
    remove_products: <MinusCircle size={16} className="text-orange-500" />
  };

  return (
    <div className="space-y-6 max-w-7xl animate-in fade-in duration-200">
      {/* Koptekst */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-ob-blue/10 text-ob-blue rounded-lg">
              <Clock size={24} />
            </span>
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#05053D] flex items-center gap-3">
                {isCompanyMode ? (
                  <>
                    <span>Wijzigingstermijnen:</span>
                    <span className="text-ob-blue underline decoration-amber-400">{company?.name}</span>
                  </>
                ) : (
                  <span>Wijzigingstermijnen & Deadlines</span>
                )}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {isCompanyMode 
                  ? `Stel specifieke annulerings- en wijzigingstermijnen in voor ${company?.name}, of neem de standaardregels over.`
                  : 'Beheer de standaardtijdslimieten per bestelgrootte (in euro\'s) voor annuleren, tijdstip, locatie en producten.'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          {(!isCompanyMode || useCustomCompany) && (
            <button
              type="button"
              onClick={handleResetToDefaults}
              className="px-3.5 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Herstel aanbevolen standaardtijden"
            >
              <RotateCcw size={14} /> Standaard Herstellen
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 text-xs font-bold text-white bg-[#5170ff] hover:bg-blue-600 disabled:opacity-50 rounded-lg transition-all flex items-center gap-2 shadow-xs cursor-pointer"
          >
            {isSaving ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : saveSuccess ? (
              <CheckCircle2 size={16} className="text-emerald-400" />
            ) : (
              <Save size={16} />
            )}
            <span>{saveSuccess ? 'Opgeslagen!' : 'Termijnen Opslaan'}</span>
          </button>

          {isCompanyMode && onCloseCompanyModal && (
            <button
              type="button"
              onClick={onCloseCompanyModal}
              className="px-3 py-2 text-xs font-medium text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Sluiten
            </button>
          )}
        </div>
      </div>

      {/* Bedrijfsmodus toggle */}
      {isCompanyMode && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-ob-blue text-white flex items-center justify-center shrink-0">
              <Building2 size={20} />
            </div>
            <div>
              <div className="text-sm font-bold text-[#05053D]">
                Regels voor {company?.name}
              </div>
              <div className="text-xs text-gray-600">
                {useCustomCompany 
                  ? 'Dit bedrijf gebruikt momenteel aangepaste termijnen die afwijken van het standaardbeleid.' 
                  : 'Dit bedrijf volgt momenteel automatisch de algemene standaard termijnen.'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white p-1 rounded-xl border border-blue-200 shadow-2xs shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setUseCustomCompany(false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                !useCustomCompany ? 'bg-ob-blue text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Standaard Regels Overnemen
            </button>
            <button
              type="button"
              onClick={() => setUseCustomCompany(true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                useCustomCompany ? 'bg-ob-blue text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Aangepast voor dit Bedrijf
            </button>
          </div>
        </div>
      )}

      {/* Toelichting & Betekenis van de 5 acties */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs">
        <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-2">
          <HelpCircle size={15} className="text-ob-blue" />
          <span>Overzicht van de 5 Individuele Wijzigingsacties:</span>
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {(Object.keys(DEADLINE_ACTION_LABELS) as DeadlineAction[]).map((act, idx) => (
            <div key={`deadline-act-${act}-${idx}`} className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-start gap-2.5">
              <span className="shrink-0 mt-0.5">{actionIcons[act]}</span>
              <div>
                <div className="font-bold text-[#05053D]">{DEADLINE_ACTION_LABELS[act].label}</div>
                <div className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                  {DEADLINE_ACTION_LABELS[act].description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tiers Tabel / Kaarten */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-bold text-[#05053D] flex items-center gap-2">
            <Sliders size={16} className="text-ob-blue" />
            <span>Termijnen per Bestelgrootte (in uren vóór het bezorgmoment)</span>
          </div>
          <span className="text-xs text-gray-500">
            Waarde <strong>0</strong> = tot op het laatste moment toegestaan
          </span>
        </div>

        {/* Desktop Tabel weergave */}
        <div className="hidden lg:block bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200 text-[11px] font-bold text-gray-600 uppercase tracking-wider">
                <th className="p-4 w-56">Bestelgrootte</th>
                <th className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-red-700">
                    <XCircle size={14} /> Annuleren
                  </div>
                </th>
                <th className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-amber-700">
                    <MapPin size={14} /> Locatie Wijzigen
                  </div>
                </th>
                <th className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-blue-700">
                    <Calendar size={14} /> Tijdstip Wijzigen
                  </div>
                </th>
                <th className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-emerald-700">
                    <PlusCircle size={14} /> Items Toevoegen
                  </div>
                </th>
                <th className="p-4 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-orange-700">
                    <MinusCircle size={14} /> Items Schrappen
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {tiers.map((tier, idx) => (
                <tr key={`tier-tr-${tier.id || idx}-${idx}`} className="hover:bg-blue-50/20 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-[#05053D]">{tier.name}</div>
                    <div className="text-[11px] text-gray-500">
                      {tier.max_amount !== null 
                        ? `€${tier.min_amount} tot €${tier.max_amount}` 
                        : `Vanaf €${tier.min_amount}`}
                    </div>
                  </td>

                  {/* Annuleren */}
                  <td className="p-3 text-center">
                    <div className="inline-flex items-center justify-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="336"
                        step="0.5"
                        disabled={isCompanyMode && !useCustomCompany}
                        value={tier.deadlines.cancel}
                        onChange={e => handleDeadlineChange(tier.id, 'cancel', e.target.value)}
                        className="w-16 px-2.5 py-1.5 text-center font-bold text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-400 disabled:bg-gray-100 disabled:text-gray-400"
                      />
                      <span className="text-xs text-gray-500 font-medium">u</span>
                    </div>
                  </td>

                  {/* Locatie */}
                  <td className="p-3 text-center">
                    <div className="inline-flex items-center justify-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="336"
                        step="0.5"
                        disabled={isCompanyMode && !useCustomCompany}
                        value={tier.deadlines.change_location}
                        onChange={e => handleDeadlineChange(tier.id, 'change_location', e.target.value)}
                        className="w-16 px-2.5 py-1.5 text-center font-bold text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:bg-gray-100 disabled:text-gray-400"
                      />
                      <span className="text-xs text-gray-500 font-medium">u</span>
                    </div>
                  </td>

                  {/* Tijdstip */}
                  <td className="p-3 text-center">
                    <div className="inline-flex items-center justify-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="336"
                        step="0.5"
                        disabled={isCompanyMode && !useCustomCompany}
                        value={tier.deadlines.change_time}
                        onChange={e => handleDeadlineChange(tier.id, 'change_time', e.target.value)}
                        className="w-16 px-2.5 py-1.5 text-center font-bold text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-100 disabled:text-gray-400"
                      />
                      <span className="text-xs text-gray-500 font-medium">u</span>
                    </div>
                  </td>

                  {/* Toevoegen */}
                  <td className="p-3 text-center">
                    <div className="inline-flex items-center justify-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="336"
                        step="0.5"
                        disabled={isCompanyMode && !useCustomCompany}
                        value={tier.deadlines.add_products}
                        onChange={e => handleDeadlineChange(tier.id, 'add_products', e.target.value)}
                        className="w-16 px-2.5 py-1.5 text-center font-bold text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 disabled:bg-gray-100 disabled:text-gray-400"
                      />
                      <span className="text-xs text-gray-500 font-medium">u</span>
                    </div>
                  </td>

                  {/* Schrappen */}
                  <td className="p-3 text-center">
                    <div className="inline-flex items-center justify-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="336"
                        step="0.5"
                        disabled={isCompanyMode && !useCustomCompany}
                        value={tier.deadlines.remove_products}
                        onChange={e => handleDeadlineChange(tier.id, 'remove_products', e.target.value)}
                        className="w-16 px-2.5 py-1.5 text-center font-bold text-sm bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:bg-gray-100 disabled:text-gray-400"
                      />
                      <span className="text-xs text-gray-500 font-medium">u</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobiele Kaarten Weergave */}
        <div className="lg:hidden space-y-4">
          {tiers.map((tier, idx) => (
            <div key={`tier-card-${tier.id || idx}-${idx}`} className="bg-white p-5 rounded-xl border border-gray-200 shadow-2xs space-y-4">
              <div className="border-b pb-2">
                <div className="font-bold text-base text-[#05053D]">{tier.name}</div>
                <div className="text-xs text-gray-500">
                  {tier.max_amount !== null 
                    ? `Orderbedrag tussen €${tier.min_amount} en €${tier.max_amount}` 
                    : `Orderbedrag vanaf €${tier.min_amount}`}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {(Object.keys(DEADLINE_ACTION_LABELS) as DeadlineAction[]).map((act, idx) => (
                  <div key={`card-act-${tier.id || ''}-${act}-${idx}`} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center gap-2">
                      {actionIcons[act]}
                      <span className="font-semibold text-gray-800">{DEADLINE_ACTION_LABELS[act].short}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="336"
                        step="0.5"
                        disabled={isCompanyMode && !useCustomCompany}
                        value={tier.deadlines[act]}
                        onChange={e => handleDeadlineChange(tier.id, act, e.target.value)}
                        className="w-16 px-2 py-1 text-center font-bold bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-ob-blue disabled:bg-gray-100"
                      />
                      <span className="text-gray-500">uur</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
