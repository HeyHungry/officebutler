import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { StoreSettings } from '../lib/supabase';
import { useOrderModal } from '../contexts/OrderModalContext';
import { useLanguage } from '../contexts/LanguageContext';

export function Navbar({ storeSettings }: { storeSettings?: StoreSettings }) {
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
    { name: t('Hoe het werkt'), href: '/#how-it-works' },
    { name: t('Assortiment'), href: '/#menu' },
    { name: t('Voor Bedrijven'), href: '/#business' },
    { name: t('Contact'), href: '/#contact' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled ? 'bg-ob-blue shadow-lg py-2' : 'bg-ob-blue py-3'
      }`}
    >
      <div className="font-serif max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-6 xl:gap-10 shrink-0 ">
          <a href="/" className="font-serif flex items-center justify-center overflow-hidden h-12 md:h-16 w-auto">
            <img src="https://i.imgur.com/ymXR7tL.png" alt="Office Butler" className="font-serif h-24 md:h-32 w-auto max-w-none" referrerPolicy="no-referrer" />
          </a>
          
          {false && storeSettings && (
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <span className={`w-2.5 h-2.5 rounded-full animate-pulse-slow ${isOpen ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`}></span>
              <span className="text-white/90 font-serif text-sm font-medium tracking-wide whitespace-nowrap">
                {isOpen ? t('Nu open') : t('Momenteel gesloten')}
              </span>
            </div>
          )}
        </div>

        {/* Desktop Nav Links - Centered */}
        <nav className="font-serif hidden lg:flex flex-1 items-center justify-center gap-6 xl:gap-10">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href}
              className="font-serif text-white/80 hover:text-white transition-colors duration-300 text-[15px] uppercase tracking-widest whitespace-nowrap"
            >
              {link.name}
            </a>
          ))}
        </nav>
        
        {/* Desktop Actions - Right aligned */}
        <div className="font-serif hidden lg:flex items-center justify-end gap-5 xl:gap-8 shrink-0 ">
          {/* Language Switcher */}
          <div className="flex items-center bg-white/10 rounded-full p-0.5 border border-white/20 text-xs">
            <button 
              onClick={() => setLanguage('nl')}
              className={`px-2.5 py-1 rounded-full font-sans text-xs font-semibold tracking-wider transition-all cursor-pointer ${
                language === 'nl' 
                  ? 'bg-white text-ob-blue shadow-xs' 
                  : 'text-white/70 hover:text-white'
              }`}
              title="Nederlands"
            >
              NL
            </button>
            <button 
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 rounded-full font-sans text-xs font-semibold tracking-wider transition-all cursor-pointer ${
                language === 'en' 
                  ? 'bg-white text-ob-blue shadow-xs' 
                  : 'text-white/70 hover:text-white'
              }`}
              title="English"
            >
              EN
            </button>
          </div>

          <a 
            href="/auth"
            className="font-serif text-white/80 hover:text-white transition-colors duration-300 text-[15px] uppercase tracking-widest font-semibold whitespace-nowrap"
          >
            {t('Inloggen')}
          </a>
          <button 
            onClick={openStep1} className="font-serif bg-white text-ob-blue px-6 py-2.5 hover:shadow-[0_0_20px_rgba(5,5,61,0.4)] hover:-translate-y-0.5 transition-all duration-300 tracking-wider text-sm shadow-md font-semibold whitespace-nowrap shrink-0"
          >
            {t('BESTEL NU')}
          </button>
        </div>

        {/* Mobile Menu Toggle & Mobile Lang */}
        <div className="lg:hidden flex items-center gap-3">
          <div className="flex items-center bg-white/10 rounded-full p-0.5 border border-white/20 text-[11px]">
            <button 
              onClick={() => setLanguage('nl')}
              className={`px-2 py-0.5 rounded-full font-sans font-semibold transition-all ${
                language === 'nl' ? 'bg-white text-ob-blue' : 'text-white/70'
              }`}
            >
              NL
            </button>
            <button 
              onClick={() => setLanguage('en')}
              className={`px-2 py-0.5 rounded-full font-sans font-semibold transition-all ${
                language === 'en' ? 'bg-white text-ob-blue' : 'text-white/70'
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
            className="font-serif fixed inset-0 bg-ob-cream z-50 flex flex-col pt-20 px-6 overflow-y-auto"
          >
            <button 
              className="font-serif absolute top-6 right-6 text-ob-text"
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
                <span className="text-ob-text font-serif text-lg font-medium tracking-wide">
                  {isOpen ? t('Nu open') : t('Momenteel gesloten')}
                </span>
              </div>
            )}

            <div className="font-serif flex flex-col gap-6 text-center mt-2 font-serif">
              {navLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="font-serif text-2xl text-ob-text hover:text-ob-accent transition-colors"
                >
                  {link.name}
                </a>
              ))}
              <a 
                href="/auth"
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-serif text-2xl text-ob-text hover:text-ob-accent transition-colors mt-2 font-semibold"
              >
                {t('Inloggen')}
              </a>
              <button 
                onClick={() => { openStep1(); setIsMobileMenuOpen(false); }}
                className="font-serif bg-ob-blue text-white px-8 py-4 text-lg mt-4 inline-block mx-auto hover:bg-ob-blue-dark transition-colors"
              >
                {t('BESTEL NU')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
