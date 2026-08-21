import { motion } from 'motion/react';
import { ArrowRight, Utensils, CalendarClock } from 'lucide-react';

export function Hero() {
  return (
    <section className="font-serif relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex flex-col items-center justify-center min-h-[80vh]">
      {/* Background Image & Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url("https://i.imgur.com/OvgsSyu.png")' }}
      >
        <div className="absolute inset-0 bg-ob-blue/90"></div>
      </div>
      
      <div className="font-serif max-w-5xl mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="font-serif flex items-center justify-center gap-3 mb-6">
            <span className="font-serif h-[1px] w-12 bg-white/50"></span>
            <span className="font-serif text-white/90 tracking-[0.2em] uppercase text-sm font-semibold">Exclusief in Amsterdam</span>
            <span className="font-serif h-[1px] w-12 bg-white/50"></span>
          </div>
          
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white mb-8 leading-tight">
            De perfecte <span className="font-serif italic text-white/90">kantoorborrel</span>,<br /> tot in de puntjes verzorgd.
          </h1>
          
          <p className="font-serif text-lg md:text-xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed">
            Onze butlers leveren de lekkerste snacks voor jouw kantoorborrel.
          </p>
          
          <div className="font-serif flex flex-col items-center justify-center gap-6">
            <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto justify-center">
              <a 
                href="#menu"
                className="font-serif group bg-white text-ob-blue px-8 py-4 flex items-center gap-3 hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl w-full sm:w-auto justify-center"
              >
                <span className="font-serif tracking-widest uppercase text-sm font-semibold">Bestel vooraf</span>
                <CalendarClock size={18} className="font-serif group-hover:scale-110 transition-transform" />
              </a>

              <a 
                href="#menu"
                className="font-serif group bg-white text-ob-blue px-8 py-4 flex items-center gap-3 hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl w-full sm:w-auto justify-center"
              >
                <span className="font-serif tracking-widest uppercase text-sm font-semibold">Bestel direct</span>
                <ArrowRight size={18} className="font-serif group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
            
            <a 
              href="#assortments"
              className="font-serif group border border-white/40 text-white px-8 py-4 flex items-center gap-3 hover:border-white hover:bg-white/10 transition-all duration-300 w-full sm:w-auto justify-center"
            >
              <span className="font-serif tracking-widest uppercase text-sm font-semibold">Bekijk aanbod</span>
              <Utensils size={18} className="font-serif group-hover:scale-110 transition-transform" />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
