import { StoreSettings } from '../lib/supabase';
import { motion } from 'motion/react';
import { Bike, ConciergeBell, Check } from 'lucide-react';
import { useOrderModal } from '../contexts/OrderModalContext';
import { useLanguage } from '../contexts/LanguageContext';
import { getTypographyStyle } from '../lib/typography';
import { EditableText } from './EditableText';

export function Assortments({ content, waveColor = 'text-white' }: { content?: any; waveColor?: string }) {
  const { openStep1 } = useOrderModal();
  const { t } = useLanguage();
  return (
    <section id="assortments" className="pt-20 pb-28 md:pb-36 bg-ob-cream relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <EditableText
            contentKey="assortments_title"
            label="Assortimenten Titel"
            value={content?.assortments_title}
            defaultValue={t("Onze Vaararrangementen", "Our Canal Cruise Packages")}
            as="h2"
            className="text-3xl md:text-5xl text-ob-text mb-4 font-title-default"
            style={getTypographyStyle('title', content?.assortments_title_font, content?.assortments_title_size)}
          />
          <EditableText
            contentKey="assortments_subtitle"
            label="Assortimenten Ondertitel"
            value={content?.assortments_subtitle}
            defaultValue={t('Kies het pakket dat het beste bij uw vaartocht of gezelschap past.', 'Choose the package that best fits your canal tour or guests.')}
            multiline
            as="p"
            className="text-ob-text-light max-w-2xl mx-auto font-subtitle-default"
            style={getTypographyStyle('subtitle', content?.assortments_subtitle_font, content?.assortments_subtitle_size)}
          />
          <div className="w-16 h-[1px] bg-ob-accent mx-auto mt-6"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Basis Assortiment */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white p-10 shadow-sm border-t-4 border-[#eaaf47] flex flex-col h-full rounded-xl"
          >
            <div className="text-[#eaaf47] mb-4">
              <Bike size={40} strokeWidth={1.5} />
            </div>
            <EditableText
              contentKey="assort_snacks_title"
              label="Pakket 1 Titel"
              value={content?.assort_snacks_title}
              defaultValue={t("Grachten Borrelmix", "Canal Snack Platter")}
              as="h3"
              className="text-3xl mb-2 font-heading-default text-ob-blue"
              style={getTypographyStyle('heading', content?.assort_snacks_title_font, content?.assort_snacks_title_size)}
            />
            <EditableText
              contentKey="assort_snacks_subtitle"
              label="Pakket 1 Ondertitel"
              value={content?.assort_snacks_subtitle}
              defaultValue={t("Vers en warm overgedragen aan de steiger", "Delivered hot and fresh right to your boat dock")}
              as="p"
              className="text-ob-text-light mb-8 italic font-subtitle-default"
              style={getTypographyStyle('subtitle', content?.assort_snacks_subtitle_font, content?.assort_snacks_subtitle_size)}
            />
            
            <ul className="space-y-4 mb-10 flex-grow font-paragraph-default">
              {(content?.assort_snacks_item1 ?? "Gegarandeerd warm en krokant aan boord") !== "" && (
                <li className="flex items-start gap-3">
                  <Check className="text-ob-accent mt-1 shrink-0" size={18} />
                  <EditableText
                    contentKey="assort_snacks_item1"
                    label="Pakket 1 Punt 1"
                    value={content?.assort_snacks_item1}
                    defaultValue={t("Gegarandeerd warm en krokant aan boord")}
                    as="span"
                    className="text-ob-text"
                    style={getTypographyStyle('paragraph', content?.assort_snacks_item1_font, content?.assort_snacks_item1_size)}
                  />
                </li>
              )}
              {(content?.assort_snacks_item2 ?? "Overdracht op uw afgesproken opstaplocatie of kade") !== "" && (
                <li className="flex items-start gap-3">
                  <Check className="text-ob-accent mt-1 shrink-0" size={18} />
                  <EditableText
                    contentKey="assort_snacks_item2"
                    label="Pakket 1 Punt 2"
                    value={content?.assort_snacks_item2}
                    defaultValue={t("Overdracht op uw afgesproken opstaplocatie of kade")}
                    as="span"
                    className="text-ob-text"
                    style={getTypographyStyle('paragraph', content?.assort_snacks_item2_font, content?.assort_snacks_item2_size)}
                  />
                </li>
              )}
              {(content?.assort_snacks_item3 ?? "Vaarklaar verpakt in thermoboxen met servetten") !== "" && (
                <li className="flex items-start gap-3">
                  <Check className="text-ob-accent mt-1 shrink-0" size={18} />
                  <EditableText
                    contentKey="assort_snacks_item3"
                    label="Pakket 1 Punt 3"
                    value={content?.assort_snacks_item3}
                    defaultValue={t("Vaarklaar verpakt in thermoboxen met servetten")}
                    as="span"
                    className="text-ob-text"
                    style={getTypographyStyle('paragraph', content?.assort_snacks_item3_font, content?.assort_snacks_item3_size)}
                  />
                </li>
              )}
              {(content?.assort_snacks_item4 ?? "Geschikt voor elk formaat sloep of salonboot") !== "" && (
                <li className="flex items-start gap-3">
                  <Check className="text-ob-accent mt-1 shrink-0" size={18} />
                  <EditableText
                    contentKey="assort_snacks_item4"
                    label="Pakket 1 Punt 4"
                    value={content?.assort_snacks_item4}
                    defaultValue={t("Geschikt voor elk formaat sloep of salonboot")}
                    as="span"
                    className="text-ob-text"
                    style={getTypographyStyle('paragraph', content?.assort_snacks_item4_font, content?.assort_snacks_item4_size)}
                  />
                </li>
              )}
            </ul>
            
            <button 
              onClick={openStep1} 
              className="w-full border-2 border-[#eaaf47] bg-[#eaaf47] text-[#151f33] hover:bg-[#d89e36] hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(234,175,71,0.5)] transition-all duration-300 py-4 font-button-default text-sm font-bold cursor-pointer rounded-xl" 
              style={getTypographyStyle('button', content?.assort_snacks_btn_font, content?.assort_snacks_btn_size)}
            >
              <EditableText
                contentKey="assort_snacks_btn"
                label="Pakket 1 Knop Tekst"
                value={content?.assort_snacks_btn}
                defaultValue={t("Bestel Borrelmix", "Order Snack Platter")}
                inline
                as="span"
              />
            </button>
          </motion.div>

          {/* Compleet Assortiment */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-white p-10 shadow-lg border-t-4 border-[#eaaf47] flex flex-col h-full relative overflow-hidden rounded-xl"
            style={{ background: 'linear-gradient(180deg, #151f33 0%, #1e2c47 100%)' }}
          >
            {(content?.assort_complete_badge ?? "Meest Gekozen") !== "" && (
              <div 
                className="absolute top-0 right-0 bg-[#eaaf47] text-[#151f33] text-xs uppercase tracking-wider py-1 px-3 font-button-default font-bold" 
                style={getTypographyStyle('button', content?.assort_complete_badge_font, content?.assort_complete_badge_size)}
              >
                <EditableText
                  contentKey="assort_complete_badge"
                  label="Pakket 2 Badge"
                  value={content?.assort_complete_badge}
                  defaultValue={t("Meest Gekozen", "Most Popular")}
                  inline
                  as="span"
                />
              </div>
            )}
            <div className="text-[#eaaf47] mb-4">
              <ConciergeBell size={40} strokeWidth={1.5} />
            </div>
            <EditableText
              contentKey="assort_complete_title"
              label="Pakket 2 Titel"
              value={content?.assort_complete_title}
              defaultValue={t("Vaartocht Compleet", "Full Cruise Catering")}
              as="h3"
              className="text-3xl mb-2 text-white font-heading-default"
              style={getTypographyStyle('heading', content?.assort_complete_title_font, content?.assort_complete_title_size)}
            />
            <EditableText
              contentKey="assort_complete_subtitle"
              label="Pakket 2 Ondertitel"
              value={content?.assort_complete_subtitle}
              defaultValue={t("Volledig verzorgde catering voor uw gasten", "Complete catering package for your cruise guests")}
              as="p"
              className="text-white/70 mb-8 italic font-subtitle-default"
              style={getTypographyStyle('subtitle', content?.assort_complete_subtitle_font, content?.assort_complete_subtitle_size)}
            />
            
            <ul className="space-y-4 mb-10 flex-grow font-paragraph-default">
              {(content?.assort_complete_item1 ?? "Uitgebreid assortiment warme en koude happen") !== "" && (
                <li className="flex items-start gap-3">
                  <Check className="text-ob-accent mt-1 shrink-0" size={18} />
                  <EditableText
                    contentKey="assort_complete_item1"
                    label="Pakket 2 Punt 1"
                    value={content?.assort_complete_item1}
                    defaultValue={t("Uitgebreid assortiment warme en koude happen")}
                    as="span"
                    className="text-white/90"
                    style={getTypographyStyle('paragraph', content?.assort_complete_item1_font, content?.assort_complete_item1_size)}
                  />
                </li>
              )}
              {(content?.assort_complete_item2 ?? "Inclusief gekoelde dranken en ijs") !== "" && (
                <li className="flex items-start gap-3">
                  <Check className="text-ob-accent mt-1 shrink-0" size={18} />
                  <EditableText
                    contentKey="assort_complete_item2"
                    label="Pakket 2 Punt 2"
                    value={content?.assort_complete_item2}
                    defaultValue={t("Inclusief gekoelde dranken en ijs")}
                    as="span"
                    className="text-white/90"
                    style={getTypographyStyle('paragraph', content?.assort_complete_item2_font, content?.assort_complete_item2_size)}
                  />
                </li>
              )}
              {(content?.assort_complete_item3 ?? "Volledig verzorgd voor uw gasten aan boord") !== "" && (
                <li className="flex items-start gap-3">
                  <Check className="text-ob-accent mt-1 shrink-0" size={18} />
                  <EditableText
                    contentKey="assort_complete_item3"
                    label="Pakket 2 Punt 3"
                    value={content?.assort_complete_item3}
                    defaultValue={t("Volledig verzorgd voor uw gasten aan boord")}
                    as="span"
                    className="text-white/90"
                    style={getTypographyStyle('paragraph', content?.assort_complete_item3_font, content?.assort_complete_item3_size)}
                  />
                </li>
              )}
              {(content?.assort_complete_item4 ?? "Ideaal voor rederijen en grotere gezelschappen") !== "" && (
                <li className="flex items-start gap-3">
                  <Check className="text-ob-accent mt-1 shrink-0" size={18} />
                  <EditableText
                    contentKey="assort_complete_item4"
                    label="Pakket 2 Punt 4"
                    value={content?.assort_complete_item4}
                    defaultValue={t("Ideaal voor rederijen en grotere gezelschappen")}
                    as="span"
                    className="text-white/90"
                    style={getTypographyStyle('paragraph', content?.assort_complete_item4_font, content?.assort_complete_item4_size)}
                  />
                </li>
              )}
            </ul>
            
            <button 
              onClick={openStep1} 
              className="w-full bg-[#eaaf47] text-[#151f33] hover:bg-[#d89e36] hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(234,175,71,0.5)] transition-all duration-300 py-4 font-button-default text-sm font-bold cursor-pointer shadow-md rounded-xl" 
              style={getTypographyStyle('button', content?.assort_complete_btn_font, content?.assort_complete_btn_size)}
            >
              <EditableText
                contentKey="assort_complete_btn"
                label="Pakket 2 Knop Tekst"
                value={content?.assort_complete_btn}
                defaultValue={t("Bestel Compleet", "Order Full Package")}
                inline
                as="span"
              />
            </button>
          </motion.div>
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
