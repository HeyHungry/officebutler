import { StoreSettings } from '../lib/supabase';
import { motion } from 'motion/react';
import { ArrowRight, Utensils, CalendarClock } from 'lucide-react';
import { useOrderModal } from '../contexts/OrderModalContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getTypographyStyle } from '../lib/typography';

export function Hero({ content }: { content?: any }) {
  const { openStep2 } = useOrderModal();
  const { t, language } = useLanguage();
  const bgImage = content?.hero_background_image || 'https://i.imgur.com/VKJOvsI.png';

  const defaultTitle = language === 'nl'
    ? 'De perfecte <span class="italic text-white/90">kantoorborrel</span>.'
    : 'The perfect <span class="italic text-white/90">office gathering</span>.';
  const rawTitle = content?.hero_title || defaultTitle;
  const formattedTitle = rawTitle.includes('kantoorborrel')
    ? rawTitle.replace('kantoorborrel', '<span class="italic text-white/90">kantoorborrel</span>')
    : (rawTitle.includes('office gathering')
      ? rawTitle.replace('office gathering', '<span class="italic text-white/90">office gathering</span>')
      : rawTitle);

  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex flex-col items-center justify-center min-h-[80vh]">
      {/* Background Image & Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-[center_20%] bg-no-repeat transition-all duration-500"
        style={{ backgroundImage: `url("${bgImage}")` }}
      >
        <div 
          className="absolute inset-0" 
          style={{ background: 'linear-gradient(180deg, rgba(21, 31, 52, 0.90) 0%, rgba(21, 31, 52, 0.70) 50%, rgba(21, 31, 52, 0.40) 100%)' }}
        ></div>
      </div>
      
      <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="h-[1px] w-12 bg-white/50"></span>
            <span 
              className="text-white/90 tracking-[0.2em] uppercase text-sm font-semibold"
              style={getTypographyStyle('heading', content?.hero_pre_title_font, content?.hero_pre_title_size)}
            >
              {content?.hero_pre_title || t("Exclusief in Amsterdam", "Exclusively in Amsterdam")}
            </span>
            <span className="h-[1px] w-12 bg-white/50"></span>
          </div>
          
          <h1 
            className="text-5xl md:text-7xl lg:text-8xl text-white mb-8 leading-tight font-title-default" 
            style={getTypographyStyle('title', content?.hero_title_font, content?.hero_title_size)} 
            dangerouslySetInnerHTML={{ __html: formattedTitle }}
          ></h1>
          
          <p 
            className="text-lg md:text-xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed font-subtitle-default" 
            style={getTypographyStyle('subtitle', content?.hero_subtitle_font, content?.hero_subtitle_size)}
          >
            {content?.hero_subtitle || t('Onze butlers leveren de lekkerste snacks voor jouw kantoorborrel.', 'Our butlers deliver the finest hot snacks for your office event.')}
          </p>
          
          <div className="flex flex-col items-center justify-center gap-6">
            <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto justify-center">
              <button 
                onClick={() => window.location.href = '/guest-order'} 
                className="group bg-[#5170ff] text-white border border-transparent px-8 py-4 flex items-center gap-3 hover:bg-[#4060ee] hover:shadow-[0_0_25px_rgba(81,112,255,0.6)] hover:-translate-y-1 transition-all duration-300 shadow-lg w-full sm:w-[260px] justify-center h-[56px] cursor-pointer"
              >
                <span 
                  className="font-button-default text-sm font-semibold" 
                  style={getTypographyStyle('button', content?.hero_btn_order_font, content?.hero_btn_order_size)}
                >
                  {content?.hero_btn_order || t("Bestel nu", "Order now")}
                </span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            <a 
              href="#menu"
              className="group border-2 border-[#5170ff] text-white px-8 py-4 flex items-center gap-3 hover:bg-[#5170ff] hover:text-white hover:shadow-[0_0_20px_rgba(81,112,255,0.5)] hover:-translate-y-1 transition-all duration-300 w-full sm:w-[260px] justify-center h-[56px] cursor-pointer"
            >
              <span 
                className="font-button-default text-sm font-semibold" 
                style={getTypographyStyle('button', content?.hero_btn_offer_font, content?.hero_btn_offer_size)}
              >
                {content?.hero_btn_offer || t("Bekijk aanbod", "View assortment")}
              </span>
              <Utensils size={18} className="group-hover:scale-110 transition-transform" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
