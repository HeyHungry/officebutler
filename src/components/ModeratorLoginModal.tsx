import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, LogIn, ExternalLink, ShieldCheck, CheckCircle2, LogOut, X, Edit3 } from 'lucide-react';
import { useModerator } from '../contexts/ModeratorContext';
import { supabase, CENTRAL_MODERATOR_URL, CURRENT_BRAND } from '../lib/supabase';

interface ModeratorLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ModeratorLoginModal({ isOpen, onClose }: ModeratorLoginModalProps) {
  const { 
    isAuthenticated, 
    setIsAuthenticated, 
    isModeratorView, 
    setIsModeratorView, 
    openModPanel, 
    openCentralDashboard,
    logoutModerator 
  } = useModerator();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentEmail, setCurrentEmail] = useState<string | null>(null);

  // Controleer huidige gebruiker als de modal geopend wordt
  useEffect(() => {
    if (isOpen && supabase) {
      setError('');
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user?.email) {
          setCurrentEmail(user.email);
        }
      });
    }
  }, [isOpen, isAuthenticated]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!supabase) {
      setError('Supabase is niet verbonden of URL/key ontbreekt.');
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (authError) {
        setError(authError.message === 'Invalid login credentials' 
          ? 'Onjuist e-mailadres of wachtwoord.' 
          : authError.message);
        setIsLoading(false);
        return;
      }

      if (data?.user) {
        // Controleer optioneel of het account geen gewone medewerker is
        try {
          const { data: profile } = await supabase
            .from('ob_user_profiles')
            .select('role')
            .eq('id', data.user.id)
            .maybeSingle();

          if (profile && profile.role && profile.role !== 'admin') {
            setError('Dit account is geregistreerd als medewerker en heeft geen moderator-rechten.');
            setIsLoading(false);
            return;
          }
        } catch {}

        setIsAuthenticated(true);
        setIsModeratorView(true);
        setCurrentEmail(data.user.email || email);
        setPassword('');
      }
    } catch (err: any) {
      setError(err?.message || 'Er is een onverwachte fout opgetreden.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    await logoutModerator();
    setCurrentEmail(null);
    setIsLoading(false);
  };

  const centralUrl = `${CENTRAL_MODERATOR_URL}${CENTRAL_MODERATOR_URL.includes('?') ? '&' : '?'}brand=${CURRENT_BRAND}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl border border-gray-150 w-full max-w-md overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="px-6 py-5 bg-[#151f34] text-white flex items-center justify-between border-b border-[#b58b4c]/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#b58b4c] shrink-0 bg-white/10">
                <img 
                  src="https://i.imgur.com/jRnV52s.jpg" 
                  alt="Mokum Local Kitchen" 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold text-white leading-tight">
                  Mokum Local Kitchen
                </h3>
                <p className="text-xs text-[#b58b4c] font-sans flex items-center gap-1 font-medium">
                  <ShieldCheck size={13} />
                  <span>Moderator Toegang</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Sluiten"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6">
            {!isAuthenticated ? (
              /* INLOGFORMULIER */
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="text-left mb-2">
                  <h4 className="text-base font-semibold text-[#05053D]">Inloggen als Moderator</h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Log in met uw Supabase beheerdersaccount om de Moderator View te activeren.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    E-mailadres
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="moderator@mokumlocalkitchen.nl"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#5170ff] focus:border-transparent transition-all font-sans"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Wachtwoord
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#5170ff] focus:border-transparent transition-all font-sans"
                  />
                </div>

                {error && (
                  <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#151f34] hover:bg-[#25334d] text-white py-3 px-4 rounded-xl font-semibold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                >
                  <LogIn size={16} />
                  <span>{isLoading ? 'Bezig met inloggen...' : 'Inloggen als Moderator'}</span>
                </button>
              </form>
            ) : (
              /* AL INGELOGD: TOON BEHEERACTIES MET KNOP NAAR CENTRAAL DASHBOARD */
              <div className="space-y-5 text-center">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 size={26} />
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-[#05053D]">Succesvol Ingelogd</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    U heeft administratorrechten voor <strong>Canal Butler</strong>.
                  </p>
                  {currentEmail && (
                    <span className="inline-block mt-2 px-2.5 py-1 bg-gray-100 rounded-md text-xs font-mono text-gray-700">
                      {currentEmail}
                    </span>
                  )}
                </div>

                {/* Alleen een knop naar het centrale dashboard */}
                <div className="pt-2 space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      openCentralDashboard();
                    }}
                    className="w-full bg-[#eaaf47] hover:bg-[#d89e36] text-[#151f33] py-3.5 px-4 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2.5 cursor-pointer"
                  >
                    <span>Naar Centraal Dashboard</span>
                    <ExternalLink size={16} />
                  </button>

                  <p className="text-[11px] text-gray-400 text-center">
                    Beheer hier menu's, prijzen, openingstijden en configuratie van Canal Butler & Office Butler op het centrale dashboard.
                  </p>
                </div>

                {/* Footer acties in modal */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoading}
                    className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1.5 cursor-pointer p-1"
                  >
                    <LogOut size={13} />
                    <span>Uitloggen</span>
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                  >
                    Sluiten
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
