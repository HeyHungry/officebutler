import { StoreSettings } from '../lib/supabase';
import { motion } from 'motion/react';
import { ArrowRight, Utensils, CalendarClock } from 'lucide-react';
import { useOrderModal } from '../contexts/OrderModalContext';

export function Hero({ content }: { content?: any }) {
  const { openStep2 } = useOrderModal();
  return (
    <section className="font-serif relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex flex-col items-center justify-center min-h-[80vh]">
      {/* Background Image & Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-[center_20%] bg-no-repeat"
        style={{ backgroundImage: 'url("https://i.imgur.com/VKJOvsI.png")' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-ob-blue via-ob-blue/80 to-ob-blue/40"></div>
      </div>
      
      <div className="font-serif max-w-5xl mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="font-serif flex items-center justify-center gap-3 mb-6">
            <span className="font-serif h-[1px] w-12 bg-white/50"></span>
            <span className="font-serif text-white/90 tracking-[0.2em] uppercase text-sm font-semibold">{content?.hero_pre_title || "Exclusief in Amsterdam"}</span>
            <span className="font-serif h-[1px] w-12 bg-white/50"></span>
          </div>
          
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white mb-8 leading-tight" style={{ fontSize: content?.hero_title_size ? `calc(${String(content.hero_title_size).replace(/[^0-9]/g,'')} / 100 * 1em)` : undefined }} dangerouslySetInnerHTML={{ __html: content?.hero_title ? content.hero_title.replace('kantoorborrel', '<span class="font-serif italic text-white/90">kantoorborrel</span>') : 'De perfecte <span class="font-serif italic text-white/90">kantoorborrel</span>.' }}></h1>
          
          <p className="font-serif text-lg md:text-xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed" style={{ fontSize: content?.hero_subtitle_size ? `calc(${String(content.hero_subtitle_size).replace(/[^0-9]/g,'')} / 100 * 1em)` : undefined }}>
            {content?.hero_subtitle || 'Onze butlers leveren de lekkerste snacks voor jouw kantoorborrel.'}
          </p>
          
          <div className="font-serif flex flex-col items-center justify-center gap-6">
            <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto justify-center">
              <button onClick={() => window.location.href = '/guest-order'} className="font-serif group bg-white text-ob-blue border border-transparent px-8 py-4 flex items-center gap-3 hover:shadow-[0_0_20px_rgba(5,5,61,0.5)] hover:-translate-y-1 transition-all duration-300 shadow-lg w-full sm:w-[260px] justify-center h-[56px]">
                <span className="font-serif tracking-widest uppercase text-sm font-semibold" style={{ fontSize: content?.hero_btn_order_size ? `calc(${String(content.hero_btn_order_size).replace(/[^0-9]/g,'')} / 100 * 1em)` : undefined }}>{content?.hero_btn_order || "Bestel nu"}</span>
                <ArrowRight size={18} className="font-serif group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            <a 
              href="#menu"
              className="font-serif group border border-white/50 text-white px-8 py-4 flex items-center gap-3 hover:bg-white hover:text-ob-blue hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:-translate-y-1 transition-all duration-300 w-full sm:w-[260px] justify-center h-[56px]"
            >
              <span className="font-serif tracking-widest uppercase text-sm font-semibold" style={{ fontSize: content?.hero_btn_offer_size ? `calc(${String(content.hero_btn_offer_size).replace(/[^0-9]/g,'')} / 100 * 1em)` : undefined }}>{content?.hero_btn_offer || "Bekijk aanbod"}</span>
              <Utensils size={18} className="font-serif group-hover:scale-110 transition-transform" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
