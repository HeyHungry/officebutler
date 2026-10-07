import { useState } from 'react';
import { X, ShieldCheck, Printer, Mail, ExternalLink, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getPrivacyPolicy } from '../lib/privacyPolicyData';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  pageContent?: any;
}

export function PrivacyModal({ isOpen, onClose, pageContent }: PrivacyModalProps) {
  const { language: currentAppLang } = useLanguage();
  const [modalLang, setModalLang] = useState<'nl' | 'en'>(currentAppLang || 'nl');

  if (!isOpen) return null;

  const policy = getPrivacyPolicy(pageContent, modalLang);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in print:p-0 print:bg-white"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl relative border border-gray-200 flex flex-col max-h-[90vh] overflow-hidden print:max-h-none print:shadow-none print:border-none print:rounded-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between gap-4 bg-gradient-to-r from-gray-50 to-white print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-ob-blue flex items-center justify-center shrink-0">
              <ShieldCheck size={22} className="text-[#5170ff]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-ob-blue leading-tight">
                {policy.title}
              </h3>
              <p className="text-xs text-gray-500 font-sans mt-0.5">
                Mokum Local Kitchen &bull; KvK 99852667 &bull; {modalLang === 'en' ? 'Effective:' : 'Laatst bijgewerkt:'} {policy.lastUpdated}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language toggle in modal */}
            <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setModalLang('nl')}
                className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${modalLang === 'nl' ? 'bg-white text-ob-blue shadow-2xs' : 'text-gray-500 hover:text-gray-800'}`}
                title="Nederlands"
              >
                NL
              </button>
              <button
                type="button"
                onClick={() => setModalLang('en')}
                className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${modalLang === 'en' ? 'bg-[#5170ff] text-white shadow-2xs' : 'text-gray-500 hover:text-gray-800'}`}
                title="English"
              >
                EN
              </button>
            </div>

            <button
              type="button"
              onClick={handlePrint}
              className="p-2 text-gray-500 hover:text-ob-blue hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              title={modalLang === 'en' ? 'Print Privacy Policy' : 'Afdrukken'}
            >
              <Printer size={18} />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              aria-label="Sluiten"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-sm text-gray-700 leading-relaxed font-sans">
          
          {/* Quick Notice Badge */}
          <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4 text-xs text-blue-900 flex items-start gap-3">
            <Globe size={18} className="text-[#5170ff] shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-950 mb-0.5">
                {modalLang === 'en' ? 'Compliant with GDPR / AVG & Dutch Telecommunications Act' : 'Conform AVG / GDPR & Nederlandse Telecommunicatiewet'}
              </p>
              <p className="text-blue-800/90 leading-normal">
                {policy.intro}
              </p>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-6 divide-y divide-gray-100">
            {policy.sections.map((section, idx) => (
              <div key={`priv-sec-${idx}`} className={idx > 0 ? 'pt-5' : ''}>
                <h4 className="font-bold text-ob-blue text-base mb-2 font-serif">
                  {section.heading}
                </h4>
                <div className="text-gray-600 whitespace-pre-line leading-relaxed text-[13.5px]">
                  {section.body}
                </div>
              </div>
            ))}
          </div>

          {/* Contact Box */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h5 className="font-bold text-gray-900 text-xs uppercase tracking-wider mb-1">
                {modalLang === 'en' ? 'Questions or Privacy Requests?' : 'Vragen of Privacyverzoek indienen?'}
              </h5>
              <p className="text-xs text-gray-500">
                {modalLang === 'en' 
                  ? 'Contact our data protection coordinator directly at:' 
                  : 'Neem rechtstreeks contact op met onze gegevensbeheerder via:'}
              </p>
            </div>
            <a 
              href={`mailto:${policy.contactEmail || 'info@office-butler.com'}`}
              className="inline-flex items-center gap-2 bg-[#151f34] hover:bg-[#1f2937] text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors shrink-0"
            >
              <Mail size={14} />
              {policy.contactEmail || 'info@office-butler.com'}
            </a>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500 print:hidden">
          <span>
            Office Butler &bull; Handelsnaam van Mokum Local Kitchen (KvK 99852667)
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 font-semibold rounded-lg transition-colors cursor-pointer self-end sm:self-auto"
          >
            {modalLang === 'en' ? 'Close' : 'Sluiten'}
          </button>
        </div>
      </div>
    </div>
  );
}
