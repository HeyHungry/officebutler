import { StoreSettings } from '../lib/supabase';
import { motion } from 'motion/react';
import { Utensils, Wine, Check } from 'lucide-react';
import { useOrderModal } from '../contexts/OrderModalContext';

export function Assortments({ content }: { content?: any }) {
  const { openStep1 } = useOrderModal();
  return (
    <section id="assortments" className="font-serif py-24 bg-ob-cream-dark/30">
      <div className="font-serif max-w-7xl mx-auto px-6 lg:px-8">
        <div className="font-serif text-center mb-16">
          <h2 className="font-serif text-3xl md:text-5xl text-ob-text mb-4" style={{ fontSize: content?.assortments_title_size ? `calc(${String(content.assortments_title_size).replace(/[^0-9]/g,'')} / 100 * 1em)` : undefined }}>{content?.assortments_title || "Onze Assortimenten"}</h2>
          <p className="font-serif text-ob-text-light max-w-2xl mx-auto" style={{ fontSize: content?.assortments_subtitle_size ? `calc(${String(content.assortments_subtitle_size).replace(/[^0-9]/g,'')} / 100 * 1em)` : undefined }}>{content?.assortments_subtitle || 'Kies het pakket dat het beste bij uw kantoorborrel past.'}</p>
          <div className="font-serif w-16 h-[1px] bg-ob-accent mx-auto mt-6"></div>
        </div>

        <div className="font-serif grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Basis Assortiment */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="font-serif bg-white p-10 shadow-sm border-t-4 border-ob-blue flex flex-col h-full"
          >
            <div className="font-serif text-ob-blue mb-4">
              <Utensils size={40} strokeWidth={1.5} />
            </div>
            <h3 className="font-serif text-3xl mb-2" style={{ fontSize: content?.assort_snacks_title_size ? `calc(${String(content.assort_snacks_title_size).replace(/[^0-9]/g,'')} / 100 * 1em)` : undefined }}>{content?.assort_snacks_title || "Office Snacks"}</h3>
            <p className="font-serif text-ob-text-light mb-8 italic" style={{ fontSize: content?.assort_snacks_subtitle_size ? `calc(${String(content.assort_snacks_subtitle_size).replace(/[^0-9]/g,'')} / 100 * 1em)` : undefined }}>{content?.assort_snacks_subtitle || "Puur genieten van warme en koude snacks."}</p>
            
            <ul className="font-serif space-y-4 mb-10 flex-grow">
              <li className="font-serif flex items-start gap-3">
                <Check className="font-serif text-ob-accent mt-1 shrink-0" size={18} />
                <span className="font-serif text-ob-text" style={{ fontSize: content?.assort_snacks_item1_size ? `calc(${String(content.assort_snacks_item1_size).replace(/[^0-9]/g,'')} / 100 * 1em)` : undefined }}>{content?.assort_snacks_item1 || "Premium bittergarnituur (ambachtelijk)"}</span>
              </li>
              <li className="font-serif flex items-start gap-3">
                <Check className="font-serif text-ob-accent mt-1 shrink-0" size={18} />
                <span className="font-serif text-ob-text" style={{ fontSize: content?.assort_snacks_item2_size ? `calc(${String(content.assort_snacks_item2_size).replace(/[^0-9]/g,'')} / 100 * 1em)` : undefined }}>{content?.assort_snacks_item2 || "Luxe koude hapjes en borrelplanken"}</span>
              </li>
              <li className="font-serif flex items-start gap-3">
                <Check className="font-serif text-ob-accent mt-1 shrink-0" size={18} />
                <span className="font-serif text-ob-text" style={{ fontSize: content?.assort_snacks_item3_size ? `calc(${String(content.assort_snacks_item3_size).replace(/[^0-9]/g,'')} / 100 * 1em)` : undefined }}>{content?.assort_snacks_item3 || "Geleverd in warmhoudboxen"}</span>
              </li>
              <li className="font-serif flex items-start gap-3">
                <Check className="font-serif text-ob-accent mt-1 shrink-0" size={18} />
                <span className="font-serif text-ob-text">Vanaf 10 personen</span>
              </li>
            </ul>
            
            <button onClick={openStep1} className="font-serif w-full border-2 border-ob-blue text-ob-blue hover:bg-ob-blue hover:text-white hover:-translate-y-1 hover:shadow-lg transition-all duration-300 py-4 uppercase tracking-widest text-sm font-bold" style={{ fontSize: content?.assort_snacks_btn_size ? `calc(${String(content.assort_snacks_btn_size).replace(/[^0-9]/g,'')} / 100 * 1em)` : undefined }}>{content?.assort_snacks_btn || "Bestel Snacks"}
            </button>
          </motion.div>

          {/* Compleet Assortiment */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="font-serif bg-ob-text text-white p-10 shadow-lg border-t-4 border-ob-accent flex flex-col h-full relative overflow-hidden"
          >
            <div className="font-serif absolute top-0 right-0 bg-ob-accent text-white text-xs uppercase tracking-wider py-1 px-3">
              Meest Gekozen
            </div>
            <div className="font-serif text-ob-accent mb-4">
              <Wine size={40} strokeWidth={1.5} />
            </div>
            <h3 className="font-serif text-3xl mb-2 text-white" style={{ fontSize: content?.assort_complete_title_size ? `calc(${String(content.assort_complete_title_size).replace(/[^0-9]/g,'')} / 100 * 1em)` : undefined }}>{content?.assort_complete_title || "Office Compleet"}</h3>
            <p className="font-serif text-white/70 mb-8 italic" style={{ fontSize: content?.assort_complete_subtitle_size ? `calc(${String(content.assort_complete_subtitle_size).replace(/[^0-9]/g,'')} / 100 * 1em)` : undefined }}>{content?.assort_complete_subtitle || "De volledige vrijmibo ervaring."}</p>
            
            <ul className="font-serif space-y-4 mb-10 flex-grow">
              <li className="font-serif flex items-start gap-3">
                <Check className="font-serif text-ob-accent mt-1 shrink-0" size={18} />
                <span className="font-serif text-white/90" style={{ fontSize: content?.assort_complete_item1_size ? `calc(${String(content.assort_complete_item1_size).replace(/[^0-9]/g,'')} / 100 * 1em)` : undefined }}>{content?.assort_complete_item1 || "Alles uit het Basis Assortiment"}</span>
              </li>
              <li className="font-serif flex items-start gap-3">
                <Check className="font-serif text-ob-accent mt-1 shrink-0" size={18} />
                <span className="font-serif text-white/90" style={{ fontSize: content?.assort_complete_item2_size ? `calc(${String(content.assort_complete_item2_size).replace(/[^0-9]/g,'')} / 100 * 1em)` : undefined }}>{content?.assort_complete_item2 || "Gekoelde bieren (o.a. speciaalbier), wijnen en fris"}</span>
              </li>
              <li className="font-serif flex items-start gap-3">
                <Check className="font-serif text-ob-accent mt-1 shrink-0" size={18} />
                <span className="font-serif text-white/90" style={{ fontSize: content?.assort_complete_item3_size ? `calc(${String(content.assort_complete_item3_size).replace(/[^0-9]/g,'')} / 100 * 1em)` : undefined }}>{content?.assort_complete_item3 || "Optioneel: Inclusief glaswerk"}</span>
              </li>
              <li className="font-serif flex items-start gap-3">
                <Check className="font-serif text-ob-accent mt-1 shrink-0" size={18} />
                <span className="font-serif text-white/90">Identiek aan de kwaliteit van Canal Butler</span>
              </li>
            </ul>
            
            <button onClick={openStep1} className="font-serif w-full bg-ob-accent text-white hover:bg-ob-accent-hover hover:-translate-y-1 hover:shadow-lg transition-all duration-300 py-4 uppercase tracking-widest text-sm font-bold" style={{ fontSize: content?.assort_complete_btn_size ? `calc(${String(content.assort_complete_btn_size).replace(/[^0-9]/g,'')} / 100 * 1em)` : undefined }}>{content?.assort_complete_btn || "Bestel Compleet"}
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
