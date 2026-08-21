import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X } from 'lucide-react';

export function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false);
  
  useEffect(() => {
    // Optionally open the widget automatically after 5 seconds to grab attention
    // Disabled for now as per request
    // const timer = setTimeout(() => {
    //   setIsOpen(true);
    // }, 5000);
    // return () => clearTimeout(timer);
  }, []);
  
  const phoneNumber = "31207867937";
  const message = "Hallo Office Butler, ik heb een vraag over de kantoorborrel.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <div className="font-serif fixed bottom-6 right-6 z-50 flex items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="font-serif bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-6 w-[320px] relative origin-right flex items-start gap-4 border border-ob-cream-dark"
          >
            <button 
              onClick={() => setIsOpen(false)}
              className="font-serif absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
            <div className="font-serif bg-ob-blue text-white rounded-full p-2 shrink-0">
              <MessageCircle size={20} strokeWidth={1.5} />
            </div>
            <div className="font-serif pr-4">
              <h4 className="font-serif font-semibold text-ob-text mb-2 font-serif text-lg">Office Butler</h4>
              <p className="font-serif text-[13px] text-ob-text-light font-serif leading-relaxed">
                Wij bezorgen de perfecte kantoorborrel direct bij u op de zaak!
                <br /><br />
                Meer weten? Chat hier met de Office Butler!
              </p>
              <a 
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-serif mt-4 inline-block bg-[#25D366] text-white px-4 py-2 rounded-full text-xs font-serif font-semibold hover:bg-[#1EBE5D] transition-colors"
              >
                Chat via WhatsApp
              </a>
            </div>
            {/* Triangle pointer */}
            <div className="font-serif absolute bottom-6 -right-2 w-4 h-4 bg-white rotate-45 transform shadow-[2px_-2px_4px_rgba(0,0,0,0.05)] border-t border-r border-ob-cream-dark" style={{ zIndex: -1 }}></div>
          </motion.div>
        )}
      </AnimatePresence>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          if (!isOpen) {
            e.preventDefault();
            setIsOpen(true);
          }
        }}
        className="font-serif bg-ob-blue text-white rounded-full shadow-[0_8px_20px_rgb(0,0,0,0.2)] hover:scale-105 transition-transform duration-300 flex items-center justify-center shrink-0 w-[60px] h-[60px]"
        aria-label="Chat via WhatsApp"
      >
        <MessageCircle size={30} strokeWidth={1.5} />
      </a>
    </div>
  );
}
