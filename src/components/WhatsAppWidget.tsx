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
    <div className="fixed bottom-6 right-6 z-50 flex items-end gap-4">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-6 w-[320px] relative origin-right flex items-start gap-4 border border-ob-cream-dark"
          >
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
            <div 
              className="text-white rounded-full p-2.5 shrink-0 shadow-sm"
              style={{ background: 'linear-gradient(135deg, #151f34 0%, #5270ff 100%)' }}
            >
              <MessageCircle size={20} strokeWidth={1.5} />
            </div>
            <div className="pr-4">
              <h4 className="font-semibold text-ob-text mb-2 text-lg font-heading-default">Office Butler</h4>
              <p className="text-[13px] text-ob-text-light font-paragraph-default leading-relaxed">
                Wij bezorgen de perfecte kantoorborrel direct bij u op de zaak!
                <br /><br />
                Meer weten? Chat hier met de Office Butler!
              </p>
              <a 
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block bg-[#25D366] text-white px-4 py-2 rounded-full text-xs font-semibold hover:bg-[#1EBE5D] transition-colors font-button-default shadow-xs"
              >
                Chat via WhatsApp
              </a>
            </div>
            {/* Triangle pointer */}
            <div className="absolute bottom-6 -right-2 w-4 h-4 bg-white rotate-45 transform shadow-[2px_-2px_4px_rgba(0,0,0,0.05)] border-t border-r border-ob-cream-dark" style={{ zIndex: -1 }}></div>
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
        className="text-white rounded-full shadow-[0_8px_20px_rgba(21,31,52,0.35)] hover:scale-105 hover:shadow-[0_10px_25px_rgba(82,112,255,0.4)] transition-all duration-300 flex items-center justify-center shrink-0 w-[60px] h-[60px]"
        style={{ background: 'linear-gradient(135deg, #151f34 0%, #5270ff 100%)' }}
        aria-label="Chat via WhatsApp"
      >
        <MessageCircle size={30} strokeWidth={1.5} />
      </a>
    </div>
  );
}
