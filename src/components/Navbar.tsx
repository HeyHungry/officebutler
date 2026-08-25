import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';
import { StoreSettings } from '../lib/supabase';
import { useOrderModal } from '../contexts/OrderModalContext';

export function Navbar({ storeSettings }: { storeSettings?: StoreSettings }) {
  const { openStep1 } = useOrderModal();
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
    { name: 'Hoe het werkt', href: '/#how-it-works' },
    { name: 'Assortiment', href: '/#assortments' },
    { name: 'Menu', href: '/#menu' },
    { name: 'Voor Bedrijven', href: '/#business' },
    { name: 'Contact', href: '/#contact' },
  ];

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled ? 'bg-ob-blue shadow-lg py-2' : 'bg-ob-blue py-3'
      }`}
    >
      <div className="font-serif max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <a href="#" className="font-serif flex items-center justify-center overflow-hidden h-12 md:h-16 w-auto">
            <img src="https://i.imgur.com/ymXR7tL.png" alt="Office Butler" className="font-serif h-24 md:h-32 w-auto max-w-none" referrerPolicy="no-referrer" />
          </a>
          
          {storeSettings && (
            <div className="hidden sm:flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full animate-pulse-slow ${isOpen ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`}></span>
              <span className="text-white/90 font-serif text-sm font-medium tracking-wide">
                {isOpen ? 'Nu open' : 'Momenteel gesloten'}
              </span>
            </div>
          )}
        </div>

        {/* Desktop Nav */}
        <nav className="font-serif hidden md:flex items-center gap-8 font-serif">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href}
              className="font-serif text-white/80 hover:text-white transition-colors duration-300 text-[15px] uppercase tracking-widest"
            >
              {link.name}
            </a>
          ))}
          <a 
            href="/auth"
            className="font-serif text-white/80 hover:text-white transition-colors duration-300 text-[15px] uppercase tracking-widest font-semibold"
          >
            Inloggen
          </a>
          <button 
            
            onClick={openStep1} className="font-serif bg-white text-ob-blue px-6 py-2.5 hover:bg-gray-100 transition-colors duration-300 tracking-wider text-sm shadow-md font-semibold"
          >
            BESTEL NU
          </button>
        </nav>

        {/* Mobile Menu Toggle */}
        <button 
          className="font-serif md:hidden text-white"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu size={28} />
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="font-serif fixed inset-0 bg-ob-cream z-50 flex flex-col pt-20 px-6"
          >
            <button 
              className="font-serif absolute top-6 right-6 text-ob-text"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X size={32} />
            </button>

            {storeSettings && (
              <div className="flex items-center justify-center gap-2 mb-8">
                <span className={`w-3 h-3 rounded-full animate-pulse-slow ${isOpen ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'}`}></span>
                <span className="text-ob-text font-serif text-lg font-medium tracking-wide">
                  {isOpen ? 'Nu open' : 'Momenteel gesloten'}
                </span>
              </div>
            )}

            <div className="font-serif flex flex-col gap-8 text-center mt-4 font-serif">
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
                className="font-serif text-2xl text-ob-text hover:text-ob-accent transition-colors mt-4 font-semibold"
              >
                Inloggen
              </a>
              <button 
                onClick={() => { openStep1(); setIsMobileMenuOpen(false); }}
                className="font-serif bg-ob-blue text-white px-8 py-4 text-lg mt-4 inline-block mx-auto hover:bg-ob-blue-dark transition-colors"
              >
                BESTEL NU
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
