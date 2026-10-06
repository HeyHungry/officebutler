import { StoreSettings } from '../lib/supabase';
import { motion } from 'motion/react';
import { Bike, ConciergeBell, Check } from 'lucide-react';
import { useOrderModal } from '../contexts/OrderModalContext';
import { getTypographyStyle } from '../lib/typography';

export function Assortments({ content }: { content?: any }) {
  const { openStep1 } = useOrderModal();
  return (
    <section id="assortments" className="py-24 bg-ob-cream-dark/30">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 
            className="text-3xl md:text-5xl text-ob-text mb-4 font-title-default" 
            style={getTypographyStyle('title', content?.assortments_title_font, content?.assortments_title_size)}
          >
            {content?.assortments_title || "Onze Assortimenten"}
          </h2>
          <p 
            className="text-ob-text-light max-w-2xl mx-auto font-subtitle-default" 
            style={getTypographyStyle('subtitle', content?.assortments_subtitle_font, content?.assortments_subtitle_size)}
          >
            {content?.assortments_subtitle || 'Kies het pakket dat het beste bij uw kantoorborrel past.'}
          </p>
          <div className="w-16 h-[1px] bg-ob-accent mx-auto mt-6"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Basis Assortiment */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white p-10 shadow-sm border-t-4 border-[#5270ff] flex flex-col h-full"
          >
            <div className="text-[#5170ff] mb-4">
              <Bike size={40} strokeWidth={1.5} />
            </div>
            <h3 
              className="text-3xl mb-2 font-heading-default text-ob-blue" 
              style={getTypographyStyle('heading', content?.assort_snacks_title_font, content?.assort_snacks_title_size)}
            >
              {content?.assort_snacks_title || "Bezorgen"}
            </h3>
            <p 
              className="text-ob-text-light mb-8 italic font-subtitle-default" 
              style={getTypographyStyle('subtitle', content?.assort_snacks_subtitle_font, content?.assort_snacks_subtitle_size)}
            >
              {content?.assort_snacks_subtitle || "Netjes en warm tot aan de deur geleverd"}
            </p>
            
            <ul className="space-y-4 mb-10 flex-grow font-paragraph-default">
              {(content?.assort_snacks_item1 ?? "Gegarandeerd warme levering") !== "" && (
                <li className="flex items-start gap-3">
                  <Check className="text-ob-accent mt-1 shrink-0" size={18} />
                  <span className="text-ob-text" style={getTypographyStyle('paragraph', content?.assort_snacks_item1_font, content?.assort_snacks_item1_size)}>
                    {content?.assort_snacks_item1 || "Gegarandeerd warme levering"}
                  </span>
                </li>
              )}
              {(content?.assort_snacks_item2 ?? "Stipt op de afgesproken tijd (of binnen 45 min)") !== "" && (
                <li className="flex items-start gap-3">
                  <Check className="text-ob-accent mt-1 shrink-0" size={18} />
                  <span className="text-ob-text" style={getTypographyStyle('paragraph', content?.assort_snacks_item2_font, content?.assort_snacks_item2_size)}>
                    {content?.assort_snacks_item2 || "Stipt op de afgesproken tijd (of binnen 45 min)"}
                  </span>
                </li>
              )}
              {(content?.assort_snacks_item3 ?? "Gratis bezorgservice") !== "" && (
                <li className="flex items-start gap-3">
                  <Check className="text-ob-accent mt-1 shrink-0" size={18} />
                  <span className="text-ob-text" style={getTypographyStyle('paragraph', content?.assort_snacks_item3_font, content?.assort_snacks_item3_size)}>
                    {content?.assort_snacks_item3 || "Gratis bezorgservice"}
                  </span>
                </li>
              )}
              {(content?.assort_snacks_item4 ?? "Vanaf 10 personen") !== "" && (
                <li className="flex items-start gap-3">
                  <Check className="text-ob-accent mt-1 shrink-0" size={18} />
                  <span className="text-ob-text" style={getTypographyStyle('paragraph', content?.assort_snacks_item4_font, content?.assort_snacks_item4_size)}>
                    {content?.assort_snacks_item4 || "Vanaf 10 personen"}
                  </span>
                </li>
              )}
            </ul>
            
            <button 
              onClick={openStep1} 
              className="w-full border-2 border-[#5170ff] text-[#5170ff] hover:bg-[#5170ff] hover:text-white hover:-translate-y-1 hover:shadow-lg transition-all duration-300 py-4 font-button-default text-sm font-bold cursor-pointer" 
              style={getTypographyStyle('button', content?.assort_snacks_btn_font, content?.assort_snacks_btn_size)}
            >
              {content?.assort_snacks_btn || "Kies Bezorgen"}
            </button>
          </motion.div>

          {/* Compleet Assortiment */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-white p-10 shadow-lg border-t-4 border-[#5170ff] flex flex-col h-full relative overflow-hidden"
            style={{ background: 'linear-gradient(180deg, #151f34 0%, #5270ff 100%)' }}
          >
            {(content?.assort_complete_badge ?? "Meest Gekozen") !== "" && (
              <div 
                className="absolute top-0 right-0 bg-[#5170ff] text-white text-xs uppercase tracking-wider py-1 px-3 font-button-default" 
                style={getTypographyStyle('button', content?.assort_complete_badge_font, content?.assort_complete_badge_size)}
              >
                {content?.assort_complete_badge || "Meest Gekozen"}
              </div>
            )}
            <div className="text-[#5170ff] mb-4">
              <ConciergeBell size={40} strokeWidth={1.5} />
            </div>
            <h3 
              className="text-3xl mb-2 text-white font-heading-default" 
              style={getTypographyStyle('heading', content?.assort_complete_title_font, content?.assort_complete_title_size)}
            >
              {content?.assort_complete_title || "Uitpakken & uitserveren"}
            </h3>
            <p 
              className="text-white/70 mb-8 italic font-subtitle-default" 
              style={getTypographyStyle('subtitle', content?.assort_complete_subtitle_font, content?.assort_complete_subtitle_size)}
            >
              {content?.assort_complete_subtitle || "De ultieme butler ervaring"}
            </p>
            
            <ul className="space-y-4 mb-10 flex-grow font-paragraph-default">
              {(content?.assort_complete_item1 ?? "Butlers pakken de snacks uit en maken ze eetklaar") !== "" && (
                <li className="flex items-start gap-3">
                  <Check className="text-ob-accent mt-1 shrink-0" size={18} />
                  <span className="text-white/90" style={getTypographyStyle('paragraph', content?.assort_complete_item1_font, content?.assort_complete_item1_size)}>
                    {content?.assort_complete_item1 || "Butlers pakken de snacks uit en maken ze eetklaar"}
                  </span>
                </li>
              )}
              {(content?.assort_complete_item2 ?? "Butlers serveren de warme hapjes direct uit") !== "" && (
                <li className="flex items-start gap-3">
                  <Check className="text-ob-accent mt-1 shrink-0" size={18} />
                  <span className="text-white/90" style={getTypographyStyle('paragraph', content?.assort_complete_item2_font, content?.assort_complete_item2_size)}>
                    {content?.assort_complete_item2 || "Butlers serveren de warme hapjes direct uit"}
                  </span>
                </li>
              )}
              {(content?.assort_complete_item3 ?? "Ideaal voor grotere groepen of evenementen") !== "" && (
                <li className="flex items-start gap-3">
                  <Check className="text-ob-accent mt-1 shrink-0" size={18} />
                  <span className="text-white/90" style={getTypographyStyle('paragraph', content?.assort_complete_item3_font, content?.assort_complete_item3_size)}>
                    {content?.assort_complete_item3 || "Ideaal voor grotere groepen of evenementen"}
                  </span>
                </li>
              )}
              {(content?.assort_complete_item4 ?? "Identiek aan de kwaliteit van Canal Butler") !== "" && (
                <li className="flex items-start gap-3">
                  <Check className="text-ob-accent mt-1 shrink-0" size={18} />
                  <span className="text-white/90" style={getTypographyStyle('paragraph', content?.assort_complete_item4_font, content?.assort_complete_item4_size)}>
                    {content?.assort_complete_item4 || "Identiek aan de kwaliteit van Canal Butler"}
                  </span>
                </li>
              )}
            </ul>
            
            <button 
              onClick={openStep1} 
              className="w-full bg-[#5170ff] text-white hover:bg-[#4060ee] hover:-translate-y-1 hover:shadow-lg transition-all duration-300 py-4 font-button-default text-sm font-bold cursor-pointer shadow-md" 
              style={getTypographyStyle('button', content?.assort_complete_btn_font, content?.assort_complete_btn_size)}
            >
              {content?.assort_complete_btn || "Kies Butler Service"}
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
