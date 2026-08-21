import { motion } from 'motion/react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { SharedSettings } from '../lib/supabase';

interface ContactFAQProps {
  settings: SharedSettings;
}

export function ContactFAQ({ settings }: ContactFAQProps) {
  return (
    <section id="contact" className="font-serif py-24 bg-ob-cream">
      <div className="font-serif max-w-7xl mx-auto px-6 lg:px-8">
        <div className="font-serif grid grid-cols-1 lg:grid-cols-2 gap-16">
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="font-serif text-3xl md:text-4xl text-ob-text mb-6">Contact & Informatie</h2>
            <div className="font-serif w-16 h-[1px] bg-ob-accent mb-10"></div>
            
            <div className="font-serif space-y-8">
              <div className="font-serif flex items-start gap-4">
                <div className="font-serif bg-white p-3 rounded-full text-ob-blue shadow-sm shrink-0">
                  <Phone size={24} />
                </div>
                <div>
                  <h4 className="font-serif text-lg mb-1 font-semibold">WhatsApp & Telefoon</h4>
                  <p className="font-serif text-ob-text-light font-serif">+31 20 786 7937</p>
                  <p className="font-serif text-sm text-ob-text-light/70 italic mt-1">Snelste reactie via WhatsApp</p>
                </div>
              </div>
              
              <div className="font-serif flex items-start gap-4">
                <div className="font-serif bg-white p-3 rounded-full text-ob-blue shadow-sm shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <h4 className="font-serif text-lg mb-1 font-semibold">E-mail</h4>
                  <p className="font-serif text-ob-text-light font-serif">info@borrelbutler.nl</p>
                </div>
              </div>
              
              <div className="font-serif flex items-start gap-4">
                <div className="font-serif bg-white p-3 rounded-full text-ob-blue shadow-sm shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="font-serif text-lg mb-1 font-semibold">Keuken (Mokum Local Kitchen)</h4>
                  <p className="font-serif text-ob-text-light font-serif">Hoofdweg 123, Amsterdam</p>
                  <p className="font-serif text-sm text-ob-text-light/70 italic mt-1">Alleen voor afhalen (op afspraak) of bezorging.</p>
                </div>
              </div>
            </div>

            <div className="font-serif mt-12 p-6 bg-white border border-ob-cream-dark shadow-sm">
              <h4 className="font-serif text-xl mb-2 text-ob-blue">Openingstijden Bezorging</h4>
              <p className="font-serif text-ob-text font-serif">{settings.opening_hours}</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="font-serif text-3xl md:text-4xl text-ob-text mb-6">Veelgestelde Vragen</h2>
            <div className="font-serif w-16 h-[1px] bg-ob-accent mb-10"></div>
            
            <div className="font-serif space-y-6">
              <div className="font-serif border-b border-ob-text/10 pb-6">
                <h4 className="font-serif text-lg mb-2 font-semibold">Bezorgen jullie ook buiten Amsterdam?</h4>
                <p className="font-serif text-ob-text-light font-serif text-sm leading-relaxed">Momenteel bezorgen wij met Office Butler uitsluitend op kantoren binnen de ring van Amsterdam om de kwaliteit en temperatuur van onze snacks te garanderen.</p>
              </div>
              <div className="font-serif border-b border-ob-text/10 pb-6">
                <h4 className="font-serif text-lg mb-2 font-semibold">Wat is het verschil met Canal Butler?</h4>
                <p className="font-serif text-ob-text-light font-serif text-sm leading-relaxed">Office Butler is het B2B zusterbedrijf van Canal Butler. We maken gebruik van dezelfde keuken (Mokum Local Kitchen) en bieden dezelfde premium kwaliteit, maar dan specifiek afgestemd op levering op kantoor in plaats van op de grachten.</p>
              </div>
              <div className="font-serif border-b border-ob-text/10 pb-6">
                <h4 className="font-serif text-lg mb-2 font-semibold">Hoe ver van tevoren moet ik bestellen?</h4>
                <p className="font-serif text-ob-text-light font-serif text-sm leading-relaxed">Voor reguliere bestellingen vragen wij u minimaal 2 uur van tevoren te bestellen. Voor grote groepen (&gt;30 personen) of een compleet assortiment horen wij dit graag minimaal 24 uur van tevoren.</p>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
