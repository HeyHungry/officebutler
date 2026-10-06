import { motion } from 'motion/react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { SharedSettings, StoreSettings, formatStoreSchedule } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { getTypographyStyle } from '../lib/typography';

interface ContactFAQProps {
  settings: SharedSettings;
  storeSettings?: StoreSettings;
  content?: any;
}

export function ContactFAQ({ settings, storeSettings, content }: ContactFAQProps) {
  const { t } = useLanguage();
  const customHours = content?.opening_hours_custom?.trim();
  const scheduleLines = formatStoreSchedule(storeSettings?.schedule);

  const faqItems = [
    {
      q: content?.faq_q1 || "Bezorgen jullie ook buiten Amsterdam?",
      qSize: content?.faq_q1_size,
      qFont: content?.faq_q1_font,
      a: content?.faq_a1 || "Momenteel bezorgen wij met Office Butler uitsluitend op kantoren binnen de ring van Amsterdam om de kwaliteit en temperatuur van onze snacks te garanderen.",
      aSize: content?.faq_a1_size,
      aFont: content?.faq_a1_font,
    },
    {
      q: content?.faq_q2 || "Wat is het verschil met Canal Butler?",
      qSize: content?.faq_q2_size,
      qFont: content?.faq_q2_font,
      a: content?.faq_a2 || "Office Butler is het B2B zusterbedrijf van Canal Butler. We maken gebruik van dezelfde keuken (Mokum Local Kitchen) en bieden dezelfde premium kwaliteit, maar dan specifiek afgestemd op levering op kantoor in plaats van op de grachten.",
      aSize: content?.faq_a2_size,
      aFont: content?.faq_a2_font,
    },
    {
      q: content?.faq_q3 || "Hoe ver van tevoren moet ik bestellen?",
      qSize: content?.faq_q3_size,
      qFont: content?.faq_q3_font,
      a: content?.faq_a3 || "Voor reguliere bestellingen vragen wij u minimaal 2 uur van tevoren te bestellen. Voor grote groepen (>30 personen) of een compleet assortiment horen wij dit graag minimaal 24 uur van tevoren.",
      aSize: content?.faq_a3_size,
      aFont: content?.faq_a3_font,
    },
    ...(content?.faq_q4 ? [{
      q: content.faq_q4,
      qSize: content?.faq_q4_size,
      qFont: content?.faq_q4_font,
      a: content?.faq_a4 || "",
      aSize: content?.faq_a4_size,
      aFont: content?.faq_a4_font,
    }] : [])
  ];

  return (
    <section id="contact" className="py-24 bg-ob-cream">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 
              className="text-3xl md:text-4xl text-ob-text mb-6 font-title-default" 
              style={getTypographyStyle('title', content?.contact_title_font, content?.contact_title_size)}
            >
              {content?.contact_title || "Contact & Informatie"}
            </h2>
            <div className="w-16 h-[1px] bg-ob-accent mb-10"></div>
            
            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="bg-white p-3 rounded-full text-[#5170ff] shadow-sm shrink-0">
                  <Phone size={24} />
                </div>
                <div>
                  <h4 className="text-lg mb-1 font-heading-default text-ob-text">{t('WhatsApp & Telefoon', 'WhatsApp & Phone')}</h4>
                  <p className="text-ob-text-light font-paragraph-default">+31 20 786 7937</p>
                  <p className="text-sm text-ob-text-light/70 italic mt-1 font-paragraph-default">{t('Snelste reactie via WhatsApp', 'Fastest response via WhatsApp')}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="bg-white p-3 rounded-full text-[#5170ff] shadow-sm shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <h4 className="text-lg mb-1 font-heading-default text-ob-text">{t('E-mail', 'Email')}</h4>
                  <p className="text-ob-text-light font-paragraph-default">info@office-butler.com</p>
                </div>
              </div>
            </div>

            <div className="mt-12 p-6 bg-white border border-ob-cream-dark shadow-sm">
              <h4 className="text-xl mb-2 text-ob-blue font-heading-default">{t('Openingstijden Bezorging', 'Delivery Hours')}</h4>
              {customHours ? (
                <p className="text-ob-text font-paragraph-default">{customHours}</p>
              ) : scheduleLines.length > 0 ? (
                <div className="space-y-1">
                  {scheduleLines.map((line, idx) => (
                    <p key={`sched-line-${idx}`} className="text-ob-text font-paragraph-default">{t(line)}</p>
                  ))}
                </div>
              ) : (
                <p className="text-ob-text font-paragraph-default">{settings?.opening_hours || "Ma - Vr: 15:00 - 21:00"}</p>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 
              className="text-3xl md:text-4xl text-ob-text mb-6 font-title-default" 
              style={getTypographyStyle('title', content?.faq_title_font, content?.faq_title_size)}
            >
              {content?.faq_title || "Veelgestelde Vragen"}
            </h2>
            <div className="w-16 h-[1px] bg-ob-accent mb-10"></div>
            
            <div className="space-y-6">
              {faqItems.map((item, idx) => (
                <div key={`faq-item-${idx}`} className="border-b border-ob-text/10 pb-6">
                  <h4 
                    className="text-lg mb-2 font-heading-default text-ob-text"
                    style={getTypographyStyle('heading', item.qFont, item.qSize)}
                  >
                    {item.q}
                  </h4>
                  <p 
                    className="text-ob-text-light text-sm leading-relaxed font-paragraph-default"
                    style={getTypographyStyle('paragraph', item.aFont, item.aSize)}
                  >
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
