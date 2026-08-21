import { motion } from 'motion/react';
import { Building2, ChefHat, Truck } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      icon: <Building2 size={32} />,
      title: "1. Bestel of Meld Aan",
      description: "Bestel direct voor de vrijmibo, of meld uw bedrijf aan voor een vaste, gepersonaliseerde bestellink voor het personeel."
    },
    {
      icon: <ChefHat size={32} />,
      title: "2. Wij Bereiden Voor",
      description: "Onze chefs in de Mokum Local Kitchen bereiden de warme snacks en verzamelen de gekoelde dranken op het afgesproken moment."
    },
    {
      icon: <Truck size={32} />,
      title: "3. Bezorging op Kantoor",
      description: "Wij leveren alles vers, warm en gekoeld af bij u op kantoor in Amsterdam, precies op tijd voor de borrel of het evenement."
    }
  ];

  return (
    <section id="how-it-works" className="font-serif py-24 bg-white relative">
      <div className="font-serif max-w-7xl mx-auto px-6 lg:px-8">
        <div className="font-serif text-center mb-16">
          <h2 className="font-serif text-3xl md:text-5xl text-ob-text mb-4">Hoe Werkt Office Butler?</h2>
          <div className="font-serif w-16 h-[1px] bg-ob-accent mx-auto"></div>
        </div>

        <div className="font-serif grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connecting line for desktop */}
          <div className="font-serif hidden md:block absolute top-12 left-[16%] right-[16%] h-[1px] bg-ob-cream-dark z-0"></div>

          {steps.map((step, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="font-serif relative z-10 flex flex-col items-center text-center group"
            >
              <div className="font-serif w-24 h-24 bg-ob-cream rounded-full flex items-center justify-center text-ob-blue mb-6 shadow-sm border border-ob-cream-dark group-hover:border-ob-accent group-hover:text-ob-accent transition-colors duration-300">
                {step.icon}
              </div>
              <h3 className="font-serif text-xl mb-3">{step.title}</h3>
              <p className="font-serif text-ob-text-light leading-relaxed max-w-xs">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
