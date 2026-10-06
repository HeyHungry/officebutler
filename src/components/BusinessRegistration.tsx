import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getTypographyStyle } from '../lib/typography';

export function BusinessRegistration({ content }: { content?: any }) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    wishes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [emailFailed, setEmailFailed] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      if (supabase) {
        // Gebruik de office_butler_leads tabel zodat andere websites niet beïnvloed worden
        const { error } = await supabase
          .from('office_butler_leads')
          .insert([
            {
              company_name: formData.companyName,
              contact_person: formData.contactPerson,
              email: formData.email,
              phone: formData.phone,
              wishes: formData.wishes,
              created_at: new Date().toISOString()
            }
          ]);

        if (error) {
          console.error("Supabase error:", error);
          // Fallback als tabel nog niet bestaat
          throw new Error("Kon niet opslaan in database.");
        }
      } else {
        // Fallback delay voor als Supabase niet is gekoppeld
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      try {
        const res = await fetch('/api/notify-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyName: formData.companyName,
            contactPerson: formData.contactPerson,
            email: formData.email,
            phone: formData.phone,
            wishes: formData.wishes
          })
        });
        if (!res.ok) {
          setEmailFailed(true);
        }
      } catch (emailErr) {
        console.error("Kon email niet verzenden via API:", emailErr);
        setEmailFailed(true);
      }

      setIsSuccess(true);
      setFormData({ companyName: '', contactPerson: '', email: '', phone: '', wishes: '' });
    } catch (err) {
      console.error(err);
      setErrorMsg('Er ging iets mis bij het versturen. Probeer het later opnieuw of neem direct contact op via info@office-butler.com.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="business" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-16">
        
        <div className="w-full lg:w-1/2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 
              className="text-3xl md:text-5xl text-ob-text mb-6 font-title-default" 
              style={getTypographyStyle('title', content?.business_title_font, content?.business_title_size)}
            >
              {content?.business_title || "Voor Bedrijven"}
            </h2>
            <div className="w-16 h-[1px] bg-ob-accent mb-8"></div>
            
            <h3 
              className="text-2xl mb-4 text-ob-blue italic font-subtitle-default" 
              style={getTypographyStyle('subtitle', content?.business_subtitle_font, content?.business_subtitle_size)}
            >
              {content?.business_subtitle || "Een vaste partner voor uw kantoor."}
            </h3>
            
            <p 
              className="text-ob-text-light mb-6 leading-relaxed font-paragraph-default"
              style={getTypographyStyle('paragraph', content?.business_desc_font, content?.business_desc_size)}
            >
              {content?.business_desc || "Organiseert u regelmatig kantoorborrels of evenementen? Meld uw bedrijf aan bij Office Butler. Wij creëren een gepersonaliseerde bestelomgeving exclusief voor uw medewerkers."}
            </p>
            
            <ul className="space-y-4 mb-10 font-paragraph-default">
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-ob-accent shrink-0"></span>
                <span className="text-ob-text" style={getTypographyStyle('paragraph', content?.business_point1_font, content?.business_point1_size)}>
                  {content?.business_point1 || "Een eigen, unieke URL (bijv. officebutler.nl/uw-bedrijf)"}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-ob-accent shrink-0"></span>
                <span className="text-ob-text" style={getTypographyStyle('paragraph', content?.business_point2_font, content?.business_point2_size)}>
                  {content?.business_point2 || "Gepersonaliseerd assortiment naar wens"}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-ob-accent shrink-0"></span>
                <span className="text-ob-text" style={getTypographyStyle('paragraph', content?.business_point3_font, content?.business_point3_size)}>
                  {content?.business_point3 || "Optie tot betalen op factuur"}
                </span>
              </li>
            </ul>
          </motion.div>
        </div>

        <div className="w-full lg:w-1/2">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-ob-cream p-8 md:p-12 border border-ob-cream-dark shadow-sm relative overflow-hidden"
          >
            {isSuccess ? (
              <div className="flex flex-col items-center justify-center text-center h-full min-h-[300px] space-y-4">
                <CheckCircle2 size={48} className="text-green-600 mb-2" />
                <h3 className="font-heading-default text-2xl text-ob-text">{t('Bedankt voor uw aanvraag!', 'Thank you for your registration!')}</h3>
                <p className="font-paragraph-default text-ob-text-light">
                  {t('Wij hebben uw gegevens in goede orde ontvangen en nemen zo spoedig mogelijk contact met u op.', 'We have received your details in good order and will contact you as soon as possible.')}
                </p>
                <button 
                  onClick={() => setIsSuccess(false)}
                  className="font-button-default mt-6 text-sm text-ob-blue underline hover:text-ob-blue-dark cursor-pointer"
                >
                  {t('Nog een aanvraag doen', 'Submit another request')}
                </button>
              </div>
            ) : (
              <>
                <h3 
                  className="text-2xl mb-8 text-center font-heading-default text-ob-text"
                  style={getTypographyStyle('heading', content?.business_form_title_font, content?.business_form_title_size)}
                >
                  {content?.business_form_title || t('Bedrijf Aanmelden')}
                </h3>
                <form className="space-y-5" onSubmit={handleSubmit}>
                  <div>
                    <input 
                      type="text" 
                      required
                      placeholder={t('Bedrijfsnaam', 'Company Name')} 
                      value={formData.companyName}
                      onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                      className="w-full bg-white border border-ob-text/10 px-4 py-3 focus:outline-none focus:border-ob-blue transition-colors font-paragraph-default" 
                    />
                  </div>
                  <div>
                    <input 
                      type="text" 
                      required
                      placeholder={t('Contactpersoon', 'Contact Person')} 
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                      className="w-full bg-white border border-ob-text/10 px-4 py-3 focus:outline-none focus:border-ob-blue transition-colors font-paragraph-default" 
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <input 
                      type="email" 
                      required
                      placeholder={t('E-mailadres', 'Email Address')} 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-white border border-ob-text/10 px-4 py-3 focus:outline-none focus:border-ob-blue transition-colors font-paragraph-default" 
                    />
                    <input 
                      type="tel" 
                      required
                      placeholder={t('Telefoonnummer', 'Phone Number')} 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full bg-white border border-ob-text/10 px-4 py-3 focus:outline-none focus:border-ob-blue transition-colors font-paragraph-default" 
                    />
                  </div>
                  <div>
                    <textarea 
                      placeholder={t('Eventuele wensen (bijv. frequentie, grootte team)', 'Special requests (e.g. frequency, team size)')} 
                      rows={3} 
                      value={formData.wishes}
                      onChange={(e) => setFormData({...formData, wishes: e.target.value})}
                      className="w-full bg-white border border-ob-text/10 px-4 py-3 focus:outline-none focus:border-ob-blue transition-colors font-paragraph-default resize-none" 
                    ></textarea>
                  </div>
                  {errorMsg && <p className="font-paragraph-default text-red-500 text-sm">{errorMsg}</p>}
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#5170ff] text-white py-4 hover:bg-[#4060ee] transition-colors font-button-default text-sm mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center cursor-pointer shadow-md"
                    style={getTypographyStyle('button', content?.business_btn_font, content?.business_btn_size)}
                  >
                    {isSubmitting ? t('Versturen...', 'Submitting...') : (content?.business_btn || t('Kantoor Inschrijven'))}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
