import { motion, AnimatePresence } from 'motion/react';
import { X, Building2, Clock, Zap, LogIn, User } from 'lucide-react';
import { useOrderModal } from '../contexts/OrderModalContext';
import { useNavigate } from 'react-router-dom';

export function OrderModal() {
  const { step, closeModal, openStep2 } = useOrderModal();
  const navigate = useNavigate();

  if (step === 'none') return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
            <h2 className="text-2xl font-serif font-bold text-ob-blue">
              {step === 'step1' ? 'Hoe wilt u bestellen?' : 'Maak uw keuze'}
            </h2>
            <button onClick={closeModal} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition-colors">
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
                  className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-ob-blue hover:bg-blue-50 transition-colors text-left group"
                >
                  <div className="bg-ob-blue/10 p-3 rounded-lg text-ob-blue group-hover:scale-110 transition-transform">
                    <Building2 size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Word vaste klant</h3>
                    <p className="text-sm text-gray-500">Meld uw bedrijf aan voor een vaste bestelomgeving</p>
                  </div>
                </button>

                <button
                  onClick={() => openStep2()}
                  className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-ob-blue hover:bg-blue-50 transition-colors text-left group"
                >
                  <div className="bg-ob-blue/10 p-3 rounded-lg text-ob-blue group-hover:scale-110 transition-transform">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Bestel vooraf</h3>
                    <p className="text-sm text-gray-500">Plan uw bestelling voor een later moment</p>
                  </div>
                </button>

                <button
                  onClick={() => openStep2()}
                  className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-ob-blue hover:bg-blue-50 transition-colors text-left group"
                >
                  <div className="bg-ob-blue/10 p-3 rounded-lg text-ob-blue group-hover:scale-110 transition-transform">
                    <Zap size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Bestel direct</h3>
                    <p className="text-sm text-gray-500">Ontvang uw bestelling zo snel mogelijk</p>
                  </div>
                </button>
              </>
            )}

            {step === 'step2' && (
              <>
                <button
                  onClick={() => {
                    closeModal();
                    navigate('/auth');
                  }}
                  className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-ob-blue hover:bg-blue-50 transition-colors text-left group"
                >
                  <div className="bg-ob-blue/10 p-3 rounded-lg text-ob-blue group-hover:scale-110 transition-transform">
                    <LogIn size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Inloggen</h3>
                    <p className="text-sm text-gray-500">Voor bestaande zakelijke klanten en medewerkers</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    closeModal();
                    navigate('/guest-order');
                  }}
                  className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-ob-blue hover:bg-blue-50 transition-colors text-left group"
                >
                  <div className="bg-ob-blue/10 p-3 rounded-lg text-ob-blue group-hover:scale-110 transition-transform">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Eenmalig / Particulier bestellen</h3>
                    <p className="text-sm text-gray-500">Snel bestellen zonder account</p>
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
