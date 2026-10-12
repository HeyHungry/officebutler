import { StoreSettings } from '../lib/supabase';
import { motion } from 'motion/react';
import { ShoppingCart, Calendar, ConciergeBell } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getTypographyStyle } from '../lib/typography';
import { EditableText } from './EditableText';

export function HowItWorks({ content }: { content?: any }) {
  const { t } = useLanguage();
  const steps = [
    {
      icon: <ShoppingCart size={32} />,
      titleKey: 'how_step1_title',
      titleLabel: 'Stap 1 Titel',
      titleVal: content?.how_step1_title,
      defaultTitle: t("1. Bestel of Meld Aan", "1. Order or Register"),
      titleSize: content?.how_step1_title_size,
      titleFont: content?.how_step1_title_font,
      descKey: 'how_step1_desc',
      descLabel: 'Stap 1 Beschrijving',
      descVal: content?.how_step1_desc,
      defaultDesc: t("Bestel direct voor de vrijmibo, of meld uw bedrijf aan voor een vaste, gepersonaliseerde bestellink voor het personeel."),
      descSize: content?.how_step1_desc_size,
      descFont: content?.how_step1_desc_font
    },
    {
      icon: <Calendar size={32} />,
      titleKey: 'how_step2_title',
      titleLabel: 'Stap 2 Titel',
      titleVal: content?.how_step2_title,
      defaultTitle: t("2. Wij Bereiden Voor", "2. We Prepare"),
      titleSize: content?.how_step2_title_size,
      titleFont: content?.how_step2_title_font,
      descKey: 'how_step2_desc',
      descLabel: 'Stap 2 Beschrijving',
      descVal: content?.how_step2_desc,
      defaultDesc: t("Onze chefs in de Mokum Local Kitchen bereiden de warme snacks en verzamelen de gekoelde dranken op het afgesproken moment."),
      descSize: content?.how_step2_desc_size,
      descFont: content?.how_step2_desc_font
    },
    {
      icon: <ConciergeBell size={32} />,
      titleKey: 'how_step3_title',
      titleLabel: 'Stap 3 Titel',
      titleVal: content?.how_step3_title,
      defaultTitle: t("3. Bezorging op Kantoor", "3. Office Delivery"),
      titleSize: content?.how_step3_title_size,
      titleFont: content?.how_step3_title_font,
      descKey: 'how_step3_desc',
      descLabel: 'Stap 3 Beschrijving',
      descVal: content?.how_step3_desc,
      defaultDesc: t("Wij leveren alles vers, warm en gekoeld af bij u op kantoor in Amsterdam, precies op tijd voor de borrel of het evenement."),
      descSize: content?.how_step3_desc_size,
      descFont: content?.how_step3_desc_font
    }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <EditableText
            contentKey="how_title"
            label="Hoe Het Werkt Titel"
            value={content?.how_title}
            defaultValue={t("Hoe Werkt Office Butler?", "How Does Office Butler Work?")}
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
              <div className="w-24 h-24 bg-ob-cream rounded-full flex items-center justify-center text-[#5170ff] mb-6 shadow-sm border border-ob-cream-dark group-hover:border-[#5170ff] group-hover:text-[#5170ff] transition-colors duration-300">
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
    </section>
  );
}
