import { useState, FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, UserPlus, Building, Mail, Phone, Lock, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type AuthMode = 'login' | 'register' | 'success';

export function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (supabase) {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError('Ongeldige inloggegevens of account bestaat niet.');
      } else {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: profile } = await supabase
            .from('ob_user_profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
          
          if (profile?.role === 'admin') {
            navigate('/');
          } else {
            navigate('/dashboard');
          }
        } else {
          navigate('/');
        }
      }
    } else {
      setError('Supabase is niet verbonden (Preview Modus)');
    }
    
    setIsLoading(false);
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== passwordConfirm) {
      setError('Wachtwoorden komen niet overeen.');
      return;
    }

    setIsLoading(true);

    if (supabase) {
      // 1. Sign up user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setIsLoading(false);
        return;
      }

      if (authData?.user) {
        // 2. Insert into ob_companies
        const { data: companyData, error: companyError } = await supabase
          .from('ob_companies')
          .insert({
            name: companyName,
            address: address,
            phone: phone,
            billing_email: email,
            is_approved: false
          })
          .select()
          .single();

        if (companyError) {
          console.error("Company insert error:", companyError);
          // Don't show technical error, show generic
          setError('Er is een fout opgetreden bij het inschrijven.');
          setIsLoading(false);
          return;
        }

        // 3. Insert into ob_user_profiles
        if (companyData) {
          const { error: profileError } = await supabase
            .from('ob_user_profiles')
            .insert({
              id: authData.user.id,
              company_id: companyData.id,
              role: 'office_manager'
            });

          if (profileError) {
            console.error("Profile insert error:", profileError);
          }
        }
        
        setMode('success');
      }
    } else {
      // Mock success for preview
      setTimeout(() => setMode('success'), 1000);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-ob-cream pt-32 pb-20 px-6 flex items-center justify-center font-serif">
      <div className="w-full max-w-md bg-white p-8 shadow-xl rounded-sm border border-gray-100">
        
        <AnimatePresence mode="wait">
          {mode === 'success' ? (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="flex justify-center mb-6 text-green-600">
                <CheckCircle2 size={64} />
              </div>
              <h2 className="text-2xl font-semibold text-ob-text mb-4 tracking-wide">
                Bedankt voor het inschrijven!
              </h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Wij hebben uw aanmelding voor <strong>{companyName || 'uw kantoor'}</strong> succesvol ontvangen. Wij nemen zo snel mogelijk contact met u op om uw inschrijving te bevestigen.
              </p>
              <button 
                onClick={() => navigate('/')}
                className="bg-ob-blue text-white px-8 py-3 tracking-wider hover:bg-ob-blue-dark transition-colors"
              >
                TERUG NAAR HOME
              </button>
            </motion.div>
          ) : mode === 'login' ? (
            <motion.div 
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-semibold text-ob-text mb-2 tracking-wide">Welkom Terug</h2>
                <p className="text-gray-500">Log in op uw Office Butler account</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-ob-text mb-1.5">E-mailadres</label>
                  <div className="relative">
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 focus:outline-none focus:border-ob-blue focus:ring-1 focus:ring-ob-blue transition-colors"
                      placeholder="naam@bedrijf.nl"
                    />
                    <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-ob-text mb-1.5">Wachtwoord</label>
                  <div className="relative">
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 focus:outline-none focus:border-ob-blue focus:ring-1 focus:ring-ob-blue transition-colors"
                      placeholder="••••••••"
                    />
                    <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                {error && <div className="text-red-500 text-sm font-medium p-3 bg-red-50 border border-red-100 rounded">{error}</div>}

                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-ob-blue text-white py-3.5 flex items-center justify-center gap-2 hover:bg-ob-blue-dark transition-colors tracking-wider font-semibold mt-2 disabled:opacity-50"
                >
                  {isLoading ? 'BEZIG...' : <><LogIn size={18} /> INLOGGEN</>}
                </button>
              </form>

              <div className="mt-8 text-center pt-6 border-t border-gray-100">
                <p className="text-gray-600 mb-3">Nieuw kantoor inschrijven?</p>
                <button 
                  onClick={() => { setMode('register'); setError(''); }}
                  className="text-ob-blue font-semibold hover:text-ob-accent transition-colors tracking-wide underline underline-offset-4"
                >
                  REGISTREER UW KANTOOR
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="register"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-ob-text mb-2 tracking-wide">Kantoor Inschrijven</h2>
                <p className="text-gray-500 text-sm">Meld uw kantoor aan voor Office Butler</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                
                <div className="space-y-4 pt-2">
                  <h3 className="text-sm uppercase tracking-wider text-gray-400 font-semibold border-b pb-2">Kantoor Gegevens</h3>
                  
                  <div>
                    <label className="block text-sm font-semibold text-ob-text mb-1.5">Kantoornaam</label>
                    <div className="relative">
                      <input type="text" required value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 focus:outline-none focus:border-ob-blue" placeholder="Bedrijf B.V." />
                      <Building size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-ob-text mb-1.5">Kantoor Adres</label>
                    <input type="text" required value={address} onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 focus:outline-none focus:border-ob-blue" placeholder="Straatnaam 1, 1234AB Amsterdam" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-ob-text mb-1.5">Telefoonnummer</label>
                    <div className="relative">
                      <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 focus:outline-none focus:border-ob-blue" placeholder="06 12345678" />
                      <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <h3 className="text-sm uppercase tracking-wider text-gray-400 font-semibold border-b pb-2">Inloggegevens (Beheerder)</h3>
                  
                  <div>
                    <label className="block text-sm font-semibold text-ob-text mb-1.5">E-mailadres</label>
                    <div className="relative">
                      <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 focus:outline-none focus:border-ob-blue" placeholder="beheer@bedrijf.nl" />
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-ob-text mb-1.5">Wachtwoord</label>
                    <div className="relative">
                      <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} minLength={6}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 focus:outline-none focus:border-ob-blue" placeholder="Minimaal 6 tekens" />
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-ob-text mb-1.5">Wachtwoord Controle</label>
                    <div className="relative">
                      <input type="password" required value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} minLength={6}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 focus:outline-none focus:border-ob-blue" placeholder="Herhaal wachtwoord" />
                      <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                </div>

                {error && <div className="text-red-500 text-sm font-medium p-3 bg-red-50 border border-red-100 rounded">{error}</div>}

                <button type="submit" disabled={isLoading} className="w-full bg-ob-blue text-white py-3.5 flex items-center justify-center gap-2 hover:bg-ob-blue-dark transition-colors tracking-wider font-semibold mt-4 disabled:opacity-50">
                  {isLoading ? 'BEZIG...' : <><UserPlus size={18} /> INSCHRIJVEN</>}
                </button>
              </form>

              <div className="mt-6 text-center pt-6 border-t border-gray-100">
                <button onClick={() => { setMode('login'); setError(''); }} className="text-gray-500 text-sm hover:text-ob-text transition-colors">
                  ← Terug naar inloggen
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
