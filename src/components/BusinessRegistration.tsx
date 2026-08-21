import { useState } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { CheckCircle2 } from 'lucide-react';

export function BusinessRegistration() {
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    wishes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
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

      // Verzend e-mail functionaliteit via de client
      // In een echte productie-omgeving zou Supabase via een Edge Function of Webhook 
      // een e-mail sturen naar info@office-butler.com wanneer een nieuwe rij wordt toegevoegd.
      const subject = encodeURIComponent(`Nieuwe aanvraag: ${formData.companyName}`);
      const body = encodeURIComponent(`Bedrijfsnaam: ${formData.companyName}\nContactpersoon: ${formData.contactPerson}\nE-mailadres: ${formData.email}\nTelefoonnummer: ${formData.phone}\n\nWensen:\n${formData.wishes}`);
      
      // Open e-mail client direct
      window.location.href = `mailto:info@office-butler.com?subject=${subject}&body=${body}`;

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
    <section id="business" className="font-serif py-24 bg-white">
      <div className="font-serif max-w-7xl mx-auto px-6 lg:px-8 flex flex-col lg:flex-row items-center gap-16">
        
        <div className="font-serif w-full lg:w-1/2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-serif text-3xl md:text-5xl text-ob-text mb-6">Voor Bedrijven</h2>
            <div className="font-serif w-16 h-[1px] bg-ob-accent mb-8"></div>
            
            <h3 className="font-serif text-2xl mb-4 text-ob-blue italic">Een vaste partner voor uw kantoor.</h3>
            
            <p className="font-serif text-ob-text-light mb-6 leading-relaxed">
              Organiseert u regelmatig kantoorborrels of evenementen? Meld uw bedrijf aan bij Office Butler. Wij creëren een gepersonaliseerde bestelomgeving exclusief voor uw medewerkers.
            </p>
            
            <ul className="font-serif space-y-4 mb-10">
              <li className="font-serif flex items-center gap-3">
                <span className="font-serif w-1.5 h-1.5 rounded-full bg-ob-accent shrink-0"></span>
                <span className="font-serif text-ob-text">Een eigen, unieke URL (bijv. officebutler.nl/uw-bedrijf)</span>
              </li>
              <li className="font-serif flex items-center gap-3">
                <span className="font-serif w-1.5 h-1.5 rounded-full bg-ob-accent shrink-0"></span>
                <span className="font-serif text-ob-text">Gepersonaliseerd assortiment naar wens</span>
              </li>
              <li className="font-serif flex items-center gap-3">
                <span className="font-serif w-1.5 h-1.5 rounded-full bg-ob-accent shrink-0"></span>
                <span className="font-serif text-ob-text">Optie tot betalen op factuur</span>
              </li>
            </ul>
          </motion.div>
        </div>

        <div className="font-serif w-full lg:w-1/2">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="font-serif bg-ob-cream p-8 md:p-12 border border-ob-cream-dark shadow-sm relative overflow-hidden"
          >
            {isSuccess ? (
              <div className="font-serif flex flex-col items-center justify-center text-center h-full min-h-[300px] space-y-4">
                <CheckCircle2 size={48} className="text-green-600 mb-2" />
                <h3 className="font-serif text-2xl text-ob-text">Bedankt voor uw aanvraag!</h3>
                <p className="font-serif text-ob-text-light">
                  Wij hebben uw gegevens in goede orde ontvangen en nemen zo spoedig mogelijk contact met u op.
                </p>
                <button 
                  onClick={() => setIsSuccess(false)}
                  className="font-serif mt-6 text-sm text-ob-blue underline hover:text-ob-blue-dark"
                >
                  Nog een aanvraag doen
                </button>
              </div>
            ) : (
              <>
                <h3 className="font-serif text-2xl mb-8 text-center">Bedrijf Aanmelden</h3>
                <form className="font-serif space-y-5" onSubmit={handleSubmit}>
                  <div>
                    <input 
                      type="text" 
                      required
                      placeholder="Bedrijfsnaam" 
                      value={formData.companyName}
                      onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                      className="font-serif w-full bg-white border border-ob-text/10 px-4 py-3 focus:outline-none focus:border-ob-blue transition-colors font-serif" 
                    />
                  </div>
                  <div>
                    <input 
                      type="text" 
                      required
                      placeholder="Contactpersoon" 
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                      className="font-serif w-full bg-white border border-ob-text/10 px-4 py-3 focus:outline-none focus:border-ob-blue transition-colors font-serif" 
                    />
                  </div>
                  <div className="font-serif grid grid-cols-1 md:grid-cols-2 gap-5">
                    <input 
                      type="email" 
                      required
                      placeholder="E-mailadres" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="font-serif w-full bg-white border border-ob-text/10 px-4 py-3 focus:outline-none focus:border-ob-blue transition-colors font-serif" 
                    />
                    <input 
                      type="tel" 
                      required
                      placeholder="Telefoonnummer" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="font-serif w-full bg-white border border-ob-text/10 px-4 py-3 focus:outline-none focus:border-ob-blue transition-colors font-serif" 
                    />
                  </div>
                  <div>
                    <textarea 
                      placeholder="Eventuele wensen (bijv. frequentie, grootte team)" 
                      rows={3} 
                      value={formData.wishes}
                      onChange={(e) => setFormData({...formData, wishes: e.target.value})}
                      className="font-serif w-full bg-white border border-ob-text/10 px-4 py-3 focus:outline-none focus:border-ob-blue transition-colors font-serif resize-none"
                    ></textarea>
                  </div>
                  {errorMsg && <p className="font-serif text-red-500 text-sm">{errorMsg}</p>}
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="font-serif w-full bg-ob-text text-white py-4 hover:bg-ob-blue transition-colors uppercase tracking-widest text-sm mt-4 font-serif disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                  >
                    {isSubmitting ? 'Versturen...' : 'Aanvraag Versturen'}
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
