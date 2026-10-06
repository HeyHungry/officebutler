import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { StoreSettings } from '../lib/supabase';
import { useOrderModal } from '../contexts/OrderModalContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getTypographyStyle } from '../lib/typography';
import { LOGO_DATA_URI } from '../assets/logoData';

export function Navbar({ storeSettings }: { storeSettings?: StoreSettings }) {
  const content = storeSettings?.page_content;
  const { openStep1 } = useOrderModal();
  const { language, setLanguage, t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!storeSettings) return;

    const checkOpenStatus = () => {
      if (storeSettings.override_status === 'OPEN') {
        setIsOpen(true);
        return;
      }
      if (storeSettings.override_status === 'CLOSED') {
        setIsOpen(false);
        return;
      }

      // AUTO mode
      const now = new Date();
      const currentDay = now.getDay().toString();
      const scheduleForDay = storeSettings.schedule[currentDay];

      if (!scheduleForDay || scheduleForDay.closed) {
        setIsOpen(false);
        return;
      }

      const currentTime = now.getHours() * 60 + now.getMinutes();
      const [openHour, openMin] = scheduleForDay.open.split(':').map(Number);
      const [closeHour, closeMin] = scheduleForDay.close.split(':').map(Number);
      
      const openTime = openHour * 60 + openMin;
      let closeTime = closeHour * 60 + closeMin;
      
      // Handle closing times past midnight
      if (closeTime < openTime) {
        closeTime += 24 * 60;
      }

      let compareTime = currentTime;
      // If we are currently in the early morning hours and the store closes past midnight
      if (currentTime < openTime && closeTime > 24 * 60) {
          compareTime += 24 * 60;
      }

      setIsOpen(compareTime >= openTime && compareTime < closeTime);
    };

    checkOpenStatus();
    // Update status every minute
    const interval = setInterval(checkOpenStatus, 60000);
    return () => clearInterval(interval);
  }, [storeSettings]);

  const navLinks = [
    { key: 'nav_link_how', defaultName: 'Hoe het werkt', href: '/#how-it-works' },
    { key: 'nav_link_menu', defaultName: 'Assortiment', href: '/#menu' },
    { key: 'nav_link_business', defaultName: 'Voor Bedrijven', href: '/#business' },
    { key: 'nav_link_contact', defaultName: 'Contact', href: '/#contact' },
  ];

  const getNavLinkName = (link: typeof navLinks[0]) => {
    if (content && content[link.key]) {
      return t(content[link.key]);
    }
    return t(link.defaultName);
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled ? 'shadow-lg' : ''
      } py-2 md:py-2.5`}
      style={{ backgroundColor: '#151f34' }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-6 xl:gap-10 shrink-0 ">
          <a href="/" className="flex items-center justify-center shrink-0">
            <div className="overflow-hidden flex items-center justify-center h-13 md:h-14">
              <img 
                src={LOGO_DATA_URI} 
                alt="Office Butler" 
                className="h-26 md:h-30 w-auto object-contain max-w-none transition-all duration-300" 
              />
            </div>
          </a>
          
          {false && storeSettings && (
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <span className={`w-2.5 h-2.5 rounded-full animate-pulse-slow ${isOpen ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`}></span>
              <span className="text-white/90 text-sm font-medium tracking-wide whitespace-nowrap">
                {isOpen ? t('Nu open') : t('Momenteel gesloten')}
              </span>
            </div>
          )}
        </div>

        {/* Desktop Nav Links - Centered */}
        <nav className="hidden lg:flex flex-1 items-center justify-center gap-6 xl:gap-10">
          {navLinks.map((link, idx) => (
            <a 
              key={`desktop-nav-${link.href}-${idx}`} 
              href={link.href}
              className="text-white/80 hover:text-white transition-colors duration-300 text-[15px] uppercase tracking-widest whitespace-nowrap font-button-default"
              style={getTypographyStyle('button', (content && content[`${link.key}_font`]) || content?.nav_links_font, (content && content[`${link.key}_size`]) || content?.nav_links_size)}
            >
              {getNavLinkName(link)}
            </a>
          ))}
        </nav>
        
        {/* Desktop Actions - Right aligned */}
        <div className="hidden lg:flex items-center justify-end gap-5 xl:gap-8 shrink-0 ">
          {/* Language Switcher */}
          <div className="flex items-center bg-[#5170ff] rounded-full p-0.5 text-xs shadow-[0_0_15px_rgba(81,112,255,0.45)] transition-all duration-300">
            <button 
              onClick={() => setLanguage('nl')}
              className={`px-2.5 py-1 rounded-full font-sans text-xs font-semibold tracking-wider transition-all cursor-pointer ${
                language === 'nl' 
                  ? 'bg-white text-[#5170ff] shadow-sm' 
                  : 'text-white/85 hover:text-white'
              }`}
              title="Nederlands"
            >
              NL
            </button>
            <button 
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-full font-sans text-xs font-semibold tracking-wider transition-all cursor-pointer ${
                language === 'en' 
                  ? 'bg-white text-[#5170ff] shadow-sm' 
                  : 'text-white/85 hover:text-white'
              }`}
              title="English"
            >
              EN
            </button>
          </div>

          <a 
            href="/auth"
            className="text-white/80 hover:text-white transition-colors duration-300 text-[15px] uppercase tracking-widest font-semibold whitespace-nowrap font-button-default"
            style={getTypographyStyle('button', content?.nav_btn_login_font, content?.nav_btn_login_size)}
          >
            {content?.nav_btn_login ? t(content.nav_btn_login) : t('Inloggen')}
          </a>
          <button 
            onClick={openStep1} 
            className="bg-[#5170ff] hover:bg-[#4060ee] rounded-xl text-white px-6 py-2.5 shadow-[0_0_20px_rgba(81,112,255,0.5)] hover:shadow-[0_0_30px_rgba(81,112,255,0.8)] hover:-translate-y-0.5 transition-all duration-300 tracking-wider text-sm font-bold whitespace-nowrap shrink-0 cursor-pointer font-button-default"
            style={getTypographyStyle('button', content?.nav_btn_order_font, content?.nav_btn_order_size)}
          >
            {content?.nav_btn_order ? t(content.nav_btn_order) : t('BESTEL NU')}
          </button>
        </div>

        {/* Mobile Menu Toggle & Mobile Lang */}
        <div className="lg:hidden flex items-center gap-3">
          <div className="flex items-center bg-[#5170ff] rounded-full p-0.5 text-[11px] shadow-[0_0_15px_rgba(81,112,255,0.45)]">
            <button 
              onClick={() => setLanguage('nl')}
              className={`px-2 py-0.5 rounded-full font-sans font-semibold transition-all cursor-pointer ${
                language === 'nl' ? 'bg-white text-[#5170ff] shadow-sm' : 'text-white/85 hover:text-white'
              }`}
            >
              NL
            </button>
            <button 
              onClick={() => setLanguage('en')}
              className={`px-2 py-0.5 rounded-full font-sans font-semibold transition-all cursor-pointer ${
                language === 'en' ? 'bg-white text-[#5170ff] shadow-sm' : 'text-white/85 hover:text-white'
              }`}
            >
              EN
            </button>
          </div>

          <button 
            className="font-serif text-white p-1"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Menu"
          >
            <Menu size={28} />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 bg-ob-cream z-50 flex flex-col pt-20 px-6 overflow-y-auto"
          >
            <button 
              className="absolute top-6 right-6 text-ob-text"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X size={32} />
            </button>

            {/* Mobile Language Switcher */}
            <div className="flex items-center justify-center gap-2 mb-6 p-2 bg-ob-blue/5 rounded-xl border border-ob-blue/10">
              <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold mr-1">Taal / Language:</span>
              <button 
                onClick={() => setLanguage('nl')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  language === 'nl' ? 'bg-ob-blue text-white shadow-xs' : 'text-ob-blue hover:bg-ob-blue/10'
                }`}
              >
                🇳🇱 NL
              </button>
              <button 
                onClick={() => setLanguage('en')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  language === 'en' ? 'bg-ob-blue text-white shadow-xs' : 'text-ob-blue hover:bg-ob-blue/10'
                }`}
              >
                🇬🇧 EN
              </button>
            </div>

            {false && storeSettings && (
              <div className="flex items-center justify-center gap-2 mb-8">
                <span className={`w-3 h-3 rounded-full animate-pulse-slow ${isOpen ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`}></span>
                <span className="text-ob-text text-lg font-medium tracking-wide">
                  {isOpen ? t('Nu open') : t('Momenteel gesloten')}
                </span>
              </div>
            )}

            <div className="flex flex-col gap-6 text-center mt-2">
              {navLinks.map((link, idx) => (
                <a 
                  key={`mobile-nav-${link.href}-${idx}`} 
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-2xl text-ob-text hover:text-ob-accent transition-colors font-button-default"
                  style={getTypographyStyle('button', (content && content[`${link.key}_font`]) || content?.nav_links_font, (content && content[`${link.key}_size`]) || content?.nav_links_size)}
                >
                  {getNavLinkName(link)}
                </a>
              ))}
              <a 
                href="/auth"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl text-ob-text hover:text-ob-accent transition-colors mt-2 font-semibold font-button-default"
                style={getTypographyStyle('button', content?.nav_btn_login_font, content?.nav_btn_login_size)}
              >
                {content?.nav_btn_login ? t(content.nav_btn_login) : t('Inloggen')}
              </a>
              <button 
                onClick={() => { openStep1(); setIsMobileMenuOpen(false); }}
                className="bg-[#5170ff] text-white px-8 py-4 text-lg mt-4 inline-block mx-auto hover:bg-[#4060ee] transition-colors font-button-default rounded-xl shadow-md"
                style={getTypographyStyle('button', content?.nav_btn_order_font, content?.nav_btn_order_size)}
              >
                {content?.nav_btn_order ? t(content.nav_btn_order) : t('BESTEL NU')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
