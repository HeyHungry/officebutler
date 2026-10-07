import { motion, AnimatePresence } from 'motion/react';
import { X, Building2, Clock, Zap, LogIn, User } from 'lucide-react';
import { useOrderModal } from '../contexts/OrderModalContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

export function OrderModal({ content }: { content?: any }) {
  const { step, deliveryPref, closeModal, openStep2 } = useOrderModal();
  const { t } = useLanguage();
  const navigate = useNavigate();

  if (step === 'none') return null;

  const getTxt = (key: string, fallbackNl: string, fallbackEn?: string) => {
    return content?.[key] || t(fallbackNl, fallbackEn);
  };

  return (
    <AnimatePresence>
      <div key={`order-modal-${step}`} className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={closeModal}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden z-10"
        >
          <div className="flex justify-between items-center p-6 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-ob-blue font-title-default">
              {step === 'step1' 
                ? getTxt('modal_step1_title', 'Hoe wilt u bestellen?', 'How would you like to order?') 
                : getTxt('modal_step2_title', 'Maak uw keuze', 'Make your choice')}
            </h2>
            <button onClick={closeModal} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors cursor-pointer" aria-label="Close">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {step === 'step1' && (
              <>
                <button
                  onClick={() => {
                    closeModal();
                    const el = document.getElementById('business');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                    else navigate('/#business');
                  }}
                  className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-[#5170ff] hover:bg-[#5170ff]/5 transition-colors text-left group cursor-pointer"
                >
                  <div className="bg-[#5170ff]/10 p-3 rounded-lg text-[#5170ff] group-hover:scale-110 transition-transform">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 font-heading-default">{content?.modal_business_title || content?.business_title || t("Word vaste klant", "Become a regular client")}</h3>
                    <p className="text-sm text-gray-500 font-paragraph-default">{content?.modal_business_subtitle || content?.business_subtitle || t("Meld uw bedrijf aan voor een vaste bestelomgeving", "Register your company for a dedicated ordering portal")}</p>
                  </div>
                </button>

                <button
                  onClick={() => openStep2('scheduled')} className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-[#5170ff] hover:bg-[#5170ff]/5 transition-colors text-left group cursor-pointer">
                  <div className="bg-[#5170ff]/10 p-3 rounded-lg text-[#5170ff] group-hover:scale-110 transition-transform">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 font-heading-default">{getTxt('modal_preorder_title', 'Bestel vooraf', 'Pre-order')}</h3>
                    <p className="text-sm text-gray-500 font-paragraph-default">{getTxt('modal_preorder_subtitle', 'Plan uw bestelling voor een later moment', 'Schedule your order for a later time')}</p>
                  </div>
                </button>

                <button
                  onClick={() => openStep2('zsm')}
                  className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-[#5170ff] hover:bg-[#5170ff]/5 transition-colors text-left group cursor-pointer"
                >
                  <div className="bg-[#5170ff]/10 p-3 rounded-lg text-[#5170ff] group-hover:scale-110 transition-transform">
                    <Zap size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 font-heading-default">{getTxt('modal_direct_title', 'Bestel direct', 'Order directly')}</h3>
                    <p className="text-sm text-gray-500 font-paragraph-default">{getTxt('modal_direct_subtitle', 'Ontvang uw bestelling zo snel mogelijk', 'Receive your order as quickly as possible')}</p>
                  </div>
                </button>
              </>
            )}

            {step === 'step2' && (
              <>
                <button
                  onClick={() => {
                    closeModal();
                    navigate('/auth', { state: { deliveryMode: deliveryPref } });
                  }}
                  className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-[#5170ff] hover:bg-[#5170ff]/5 transition-colors text-left group cursor-pointer"
                >
                  <div className="bg-[#5170ff]/10 p-3 rounded-lg text-[#5170ff] group-hover:scale-110 transition-transform">
                    <LogIn size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 font-heading-default">{getTxt('modal_login_title', 'Inloggen', 'Login')}</h3>
                    <p className="text-sm text-gray-500 font-paragraph-default">{getTxt('modal_login_subtitle', 'Voor bestaande zakelijke klanten en medewerkers', 'For registered corporate clients and employees')}</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    closeModal();
                    navigate('/guest-order', { state: { deliveryMode: deliveryPref } });
                  }}
                  className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-[#5170ff] hover:bg-[#5170ff]/5 transition-colors text-left group cursor-pointer"
                >
                  <div className="bg-[#5170ff]/10 p-3 rounded-lg text-[#5170ff] group-hover:scale-110 transition-transform">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 font-heading-default">{getTxt('modal_guest_title', 'Eenmalig / Particulier bestellen', 'One-time / Guest order')}</h3>
                    <p className="text-sm text-gray-500 font-paragraph-default">{getTxt('modal_guest_subtitle', 'Snel bestellen zonder account', 'Quick ordering without an account')}</p>
                  </div>
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
