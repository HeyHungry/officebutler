import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Printer, Mail, Globe, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getPrivacyPolicy } from '../lib/privacyPolicyData';
import { supabase } from '../lib/supabase';

export function PrivacyPolicyPage() {
  const { language: currentAppLang } = useLanguage();
  const [pageLang, setPageLang] = useState<'nl' | 'en'>(currentAppLang || 'nl');
  const [pageContent, setPageContent] = useState<any>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchContent = async () => {
      try {
        if (supabase) {
          const { data } = await supabase.from('store_settings').select('page_content').eq('id', 1).maybeSingle();
          if (data?.page_content) {
            setPageContent(data.page_content);
          }
        }
      } catch (e) {
        console.warn('Could not load privacy policy content:', e);
      }
    };
    fetchContent();
  }, []);

  const policy = getPrivacyPolicy(pageContent, pageLang);

  return (
    <div className="min-h-screen bg-gray-50/70 font-sans py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Navigation & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-ob-blue transition-colors bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-2xs w-fit"
          >
            <ArrowLeft size={16} />
            {pageLang === 'en' ? 'Back to Home' : 'Terug naar Home'}
          </Link>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Language toggle */}
            <div className="flex items-center bg-white p-1 rounded-xl border border-gray-200 shadow-2xs text-xs font-semibold">
              <button
                type="button"
                onClick={() => setPageLang('nl')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${pageLang === 'nl' ? 'bg-[#151f34] text-white shadow-xs' : 'text-gray-500 hover:text-gray-800'}`}
              >
                Nederlands
              </button>
              <button
                type="button"
                onClick={() => setPageLang('en')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${pageLang === 'en' ? 'bg-[#5170ff] text-white shadow-xs' : 'text-gray-500 hover:text-gray-800'}`}
              >
                English
              </button>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-ob-blue bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-2xs transition-colors cursor-pointer"
            >
              <Printer size={15} />
              {pageLang === 'en' ? 'Print' : 'Afdrukken'}
            </button>
          </div>
        </div>

        {/* Main Document Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#151f34] to-[#1e2d4d] text-white p-8 sm:p-10">
            <div className="flex items-center gap-3 text-amber-400 mb-3 text-xs uppercase tracking-wider font-semibold">
              <ShieldCheck size={18} />
              <span>{pageLang === 'en' ? 'Legal & Privacy Compliance' : 'Juridisch & Privacybeleid'}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-white mb-2">
              {policy.title}
            </h1>
            <p className="text-gray-300 text-xs sm:text-sm font-sans flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>Mokum Local Kitchen (handelsnaam Office Butler)</span>
              <span>&bull;</span>
              <span>KvK: 99852667</span>
              <span>&bull;</span>
              <span>{pageLang === 'en' ? 'Last revised:' : 'Laatst bijgewerkt:'} {policy.lastUpdated}</span>
            </p>
          </div>

          <div className="p-6 sm:p-10 space-y-8">
            
            {/* Intro callout */}
            <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-5 text-sm text-blue-950 flex items-start gap-3 leading-relaxed">
              <Globe size={20} className="text-[#5170ff] shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-1">
                  {pageLang === 'en' ? 'Scope & Applicability' : 'Toepassingsbereik'}
                </p>
                <p className="text-blue-900/90 leading-relaxed text-[13.5px]">
                  {policy.intro}
                </p>
              </div>
            </div>

            {/* Sections */}
            <div className="space-y-8 divide-y divide-gray-100">
              {policy.sections.map((section, idx) => (
                <div key={`page-sec-${idx}`} className={idx > 0 ? 'pt-7' : ''}>
                  <h2 className="text-lg sm:text-xl font-serif font-bold text-[#151f34] mb-3">
                    {section.heading}
                  </h2>
                  <div className="text-gray-700 whitespace-pre-line leading-relaxed text-sm sm:text-[14.5px]">
                    {section.body}
                  </div>
                </div>
              ))}
            </div>

            {/* Direct Contact Bar */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8">
              <div>
                <h3 className="font-bold text-gray-900 text-sm">
                  {pageLang === 'en' ? 'Data Protection Officer / Privacy Queries' : 'Vragen over uw gegevens of AVG-verzoek?'}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {pageLang === 'en' 
                    ? 'Submit your access, rectification or deletion requests directly via email.'
                    : 'Dien uw verzoek tot inzage, correctie of verwijdering direct in via e-mail.'}
                </p>
              </div>
              <a 
                href={`mailto:${policy.contactEmail || 'info@office-butler.com'}`}
                className="inline-flex items-center gap-2 bg-[#5170ff] hover:bg-[#4060ee] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors shadow-sm w-fit"
              >
                <Mail size={15} />
                {policy.contactEmail || 'info@office-butler.com'}
              </a>
            </div>

          </div>

          {/* Footer note */}
          <div className="bg-gray-50 p-6 border-t border-gray-100 text-center text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Office Butler &bull; Mokum Local Kitchen (KvK 99852667). {pageLang === 'en' ? 'All rights reserved.' : 'Alle rechten voorbehouden.'}
          </div>

        </div>

      </div>
    </div>
  );
}
