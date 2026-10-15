import { StoreSettings } from '../lib/supabase';
import { motion } from 'motion/react';
import { ShoppingCart, Calendar, ConciergeBell } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getTypographyStyle } from '../lib/typography';
import { EditableText } from './EditableText';

export function HowItWorks({ content, waveColor = 'text-ob-cream' }: { content?: any; waveColor?: string }) {
  const { t } = useLanguage();
  const steps = [
    {
      icon: <ShoppingCart size={32} />,
      titleKey: 'how_step1_title',
      titleLabel: 'Stap 1 Titel',
      titleVal: content?.how_step1_title,
      defaultTitle: t("1. Stel Vaarpakket Samen", "1. Choose Cruise Package"),
      titleSize: content?.how_step1_title_size,
      titleFont: content?.how_step1_title_font,
      descKey: 'how_step1_desc',
      descLabel: 'Stap 1 Beschrijving',
      descVal: content?.how_step1_desc,
      defaultDesc: t("Kies uit onze samengestelde borrelboxen of stel zelf uw ideale hapjes en gekoelde dranken samen voor uw gasten aan boord."),
      descSize: content?.how_step1_desc_size,
      descFont: content?.how_step1_desc_font
    },
    {
      icon: <Calendar size={32} />,
      titleKey: 'how_step2_title',
      titleLabel: 'Stap 2 Titel',
      titleVal: content?.how_step2_title,
      defaultTitle: t("2. Tijd & Aanlegsteiger", "2. Time & Dock Location"),
      titleSize: content?.how_step2_title_size,
      titleFont: content?.how_step2_title_font,
      descKey: 'how_step2_desc',
      descLabel: 'Stap 2 Beschrijving',
      descVal: content?.how_step2_desc,
      defaultDesc: t("Geef uw vaartijd en vaste aanlegsteiger of kade in Amsterdam door voor een stipte, naadloze overdracht aan boord."),
      descSize: content?.how_step2_desc_size,
      descFont: content?.how_step2_desc_font
    },
    {
      icon: <ConciergeBell size={32} />,
      titleKey: 'how_step3_title',
      titleLabel: 'Stap 3 Titel',
      titleVal: content?.how_step3_title,
      defaultTitle: t("3. Warm Bezorgd aan Boord", "3. Delivered Warm On Board"),
      titleSize: content?.how_step3_title_size,
      titleFont: content?.how_step3_title_font,
      descKey: 'how_step3_desc',
      descLabel: 'Stap 3 Beschrijving',
      descVal: content?.how_step3_desc,
      defaultDesc: t("Onze butlers leveren de snacks warm en krokant in thermoboxen direct af aan de schipper of bemanning op de afgesproken locatie."),
      descSize: content?.how_step3_desc_size,
      descFont: content?.how_step3_desc_font
    }
  ];

  return (
    <section id="how-it-works" className="pt-20 pb-28 md:pb-36 bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <EditableText
            contentKey="how_title"
            label="Hoe Het Werkt Titel"
            value={content?.how_title}
            defaultValue={t("Hoe Werkt Canal Butler?", "How Does Canal Butler Work?")}
            as="h2"
            className="text-3xl md:text-5xl text-ob-text mb-4 font-title-default"
            style={getTypographyStyle('title', content?.how_title_font, content?.how_title_size)}
          />
          {(content?.how_subtitle || content?.how_subtitle === '') && (
            <EditableText
              contentKey="how_subtitle"
              label="Hoe Het Werkt Ondertitel"
              value={content?.how_subtitle}
              defaultValue=""
              multiline
              as="p"
              className="text-ob-text-light max-w-2xl mx-auto font-subtitle-default mb-4"
              style={getTypographyStyle('subtitle', content?.how_subtitle_font, content?.how_subtitle_size)}
            />
          )}
          <div className="w-16 h-[1px] bg-ob-accent mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connecting line for desktop */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-[1px] bg-ob-cream-dark z-0"></div>

          {steps.map((step, index) => (
            <motion.div 
              key={`step-${index}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative z-10 flex flex-col items-center text-center group"
            >
              <div className="w-24 h-24 bg-ob-cream rounded-full flex items-center justify-center text-[#eaaf47] mb-6 shadow-sm border border-ob-cream-dark group-hover:border-[#eaaf47] group-hover:text-[#d89e36] transition-colors duration-300">
                {step.icon}
              </div>
              <EditableText
                contentKey={step.titleKey}
                label={step.titleLabel}
                value={step.titleVal}
                defaultValue={step.defaultTitle}
                as="h3"
                className="text-xl mb-3 font-heading-default text-ob-text"
                style={getTypographyStyle('heading', step.titleFont, step.titleSize)}
              />
              <EditableText
                contentKey={step.descKey}
                label={step.descLabel}
                value={step.descVal}
                defaultValue={step.defaultDesc}
                multiline
                as="p"
                className="text-ob-text-light leading-relaxed max-w-xs font-paragraph-default"
                style={getTypographyStyle('paragraph', step.descFont, step.descSize)}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Golvende overgang naar de volgende sectie (Canal Wave) */}
      <div className="absolute -bottom-1 left-0 right-0 w-full overflow-hidden leading-none z-10 pointer-events-none">
        <svg 
          viewBox="0 0 1440 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className={`relative block w-full h-8 md:h-14 lg:h-18 ${waveColor}`}
          preserveAspectRatio="none"
        >
          <path 
            d="M0,50 C320,10 520,15 780,65 C1040,110 1260,75 1440,35 L1440,100 L0,100 Z" 
            fill="currentColor"
          />
        </svg>
      </div>
    </section>
  );
}
