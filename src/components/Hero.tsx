import { StoreSettings } from '../lib/supabase';
import { motion } from 'motion/react';
import { ArrowRight, Utensils, CalendarClock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOrderModal } from '../contexts/OrderModalContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getTypographyStyle } from '../lib/typography';
import { EditableText } from './EditableText';

export function Hero({ content, waveColor = 'text-ob-cream' }: { content?: any; waveColor?: string }) {
  const navigate = useNavigate();
  const { openStep2 } = useOrderModal();
  const { t, language } = useLanguage();
  const rawBg = (content?.hero_background_image || '').trim() || 'https://i.imgur.com/owrXF8B.png';
  let bgImage = rawBg;
  if (bgImage.startsWith('https://imgur.com/')) {
    const cleanId = bgImage
      .replace('https://imgur.com/', '')
      .replace(/^a\//, '')
      .replace(/^gallery\//, '')
      .split(/[?#/]/)[0];
    if (cleanId) {
      bgImage = `https://i.imgur.com/${cleanId}.png`;
    }
  }

  const defaultTitle = language === 'nl'
    ? 'De perfecte borrel <span class="italic text-[#eaaf47]">aan boord</span>.'
    : 'The perfect gathering <span class="italic text-[#eaaf47]">on the water</span>.';
  const rawTitle = content?.hero_title || defaultTitle;
  const formattedTitle = rawTitle.includes('aan boord')
    ? rawTitle.replace('aan boord', '<span class="italic text-[#eaaf47]">aan boord</span>')
    : (rawTitle.includes('on the water')
      ? rawTitle.replace('on the water', '<span class="italic text-[#eaaf47]">on the water</span>')
      : (rawTitle.includes('kantoorborrel')
        ? rawTitle.replace('kantoorborrel', '<span class="italic text-[#eaaf47]">aan boord</span>')
        : rawTitle));

  return (
    <section className="relative pt-32 pb-28 md:pb-36 lg:pt-48 lg:pb-44 overflow-hidden flex flex-col items-center justify-center min-h-[80vh]">
      {/* Background Image & Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-[center_25%] bg-no-repeat transition-all duration-500"
        style={{ backgroundImage: `url("${bgImage}")` }}
      >
        <div 
          className="absolute inset-0" 
          style={{ background: 'linear-gradient(180deg, rgba(21, 31, 51, 0.99) 0%, rgba(21, 31, 51, 0.92) 50%, rgba(21, 31, 51, 0.65) 100%)' }}
        ></div>
      </div>
      
      <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="h-[1px] w-12 bg-[#eaaf47]/60"></span>
            <EditableText
              contentKey="hero_pre_title"
              label="Hero Subkop"
              value={content?.hero_pre_title}
              defaultValue={t("Aan de Amsterdamse Grachten", "On the Amsterdam Canals")}
              as="span"
              className="text-[#eaaf47] tracking-[0.2em] uppercase text-sm font-semibold"
              style={getTypographyStyle('heading', content?.hero_pre_title_font, content?.hero_pre_title_size)}
            />
            <span className="h-[1px] w-12 bg-[#eaaf47]/60"></span>
          </div>
          
          <EditableText
            contentKey="hero_title"
            label="Hero Titel"
            value={rawTitle}
            defaultValue={defaultTitle}
            allowHtml
            as="h1"
            className="text-5xl md:text-7xl lg:text-8xl text-white mb-8 leading-tight font-title-default"
            style={getTypographyStyle('title', content?.hero_title_font, content?.hero_title_size)}
            dangerouslySetInnerHTML={{ __html: formattedTitle }}
          />
          
          <EditableText
            contentKey="hero_subtitle"
            label="Hero Ondertitel"
            value={content?.hero_subtitle}
            defaultValue={t('Verse, warme snacks en gekoelde dranken bezorgd op vaste aanleglocaties voor rederijen en sloepen in Amsterdam.', 'Fresh hot snacks and drinks delivered to fixed docking locations for canal cruises and boats in Amsterdam.')}
            multiline
            as="p"
            className="text-lg md:text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed font-subtitle-default"
            style={getTypographyStyle('subtitle', content?.hero_subtitle_font, content?.hero_subtitle_size)}
          />
          
          <div className="flex flex-col items-center justify-center gap-6">
            <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto justify-center">
              <button 
                onClick={() => {
                  sessionStorage.setItem('deliveryPref', 'scheduled');
                  navigate('/guest-order?mode=scheduled', { state: { deliveryMode: 'scheduled' } });
                }} 
                className="group bg-[#eaaf47] text-[#151f33] font-bold border border-transparent px-8 py-4 flex items-center gap-3 hover:bg-[#d89e36] hover:shadow-[0_0_25px_rgba(234,175,71,0.6)] hover:-translate-y-1 transition-all duration-300 shadow-lg w-full sm:w-[260px] justify-center h-[56px] cursor-pointer rounded-xl"
              >
                <EditableText
                  contentKey="hero_btn_order"
                  label="Hero Knop 'Bestel nu'"
                  value={content?.hero_btn_order}
                  defaultValue={t("Bestel nu", "Order now")}
                  inline
                  as="span"
                  className="font-button-default text-sm font-bold text-[#151f33]"
                  style={getTypographyStyle('button', content?.hero_btn_order_font, content?.hero_btn_order_size)}
                />
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform text-[#151f33]" />
              </button>
            </div>
            
            <a 
              href="#menu"
              className="group border-2 border-[#eaaf47] text-[#eaaf47] px-8 py-4 flex items-center gap-3 hover:bg-[#eaaf47] hover:text-[#151f33] hover:shadow-[0_0_20px_rgba(234,175,71,0.5)] hover:-translate-y-1 transition-all duration-300 w-full sm:w-[260px] justify-center h-[56px] cursor-pointer rounded-xl font-bold"
            >
              <EditableText
                contentKey="hero_btn_offer"
                label="Hero Knop 'Bekijk aanbod'"
                value={content?.hero_btn_offer}
                defaultValue={t("Bekijk aanbod", "View assortment")}
                inline
                as="span"
                className="font-button-default text-sm font-semibold"
                style={getTypographyStyle('button', content?.hero_btn_offer_font, content?.hero_btn_offer_size)}
              />
              <Utensils size={18} className="group-hover:scale-110 transition-transform" />
            </a>
          </div>
        </motion.div>
      </div>

      {/* Golvende water-overgang naar de volgende sectie (Canal Wave) */}
      <div className="absolute -bottom-1 left-0 right-0 w-full overflow-hidden leading-none z-10 pointer-events-none">
        <svg 
          viewBox="0 0 1440 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className={`relative block w-full h-10 md:h-16 lg:h-22 ${waveColor}`}
          preserveAspectRatio="none"
        >
          <path 
            d="M0,50 C320,10 520,15 780,65 C1040,110 1260,75 1440,35 L1440,100 L0,100 Z" 
            fill="currentColor"
          />
        </svg>
      </div>
    </section>
  );
}
