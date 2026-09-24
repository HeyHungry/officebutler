import { Hero } from '../components/Hero';
import { HowItWorks } from '../components/HowItWorks';
import { Assortments } from '../components/Assortments';
import { Menu } from '../components/Menu';
import { BusinessRegistration } from '../components/BusinessRegistration';
import { ContactFAQ } from '../components/ContactFAQ';
import { SharedSettings, StoreSettings, DEFAULT_SECTION_ORDER, HomepageSectionKey } from '../lib/supabase';

export function Home({ settings, storeSettings }: { settings: SharedSettings, storeSettings: StoreSettings }) {
  const content = storeSettings?.page_content;

  // Haal de geconfigureerde sectievolgorde op of val terug op de standaardvolgorde
  const rawOrder = content?.section_order && Array.isArray(content.section_order) && content.section_order.length > 0
    ? (content.section_order as HomepageSectionKey[])
    : DEFAULT_SECTION_ORDER;

  // Zorg dat alle bekende secties aanwezig zijn (ook als er een nieuw is toegevoegd)
  const fullOrder = [
    ...rawOrder.filter(key => DEFAULT_SECTION_ORDER.includes(key as HomepageSectionKey)),
    ...DEFAULT_SECTION_ORDER.filter(key => !rawOrder.includes(key))
  ];

  const renderSection = (key: HomepageSectionKey) => {
    switch (key) {
      case 'hero':
        return <Hero content={content} />;
      case 'how_it_works':
        return <HowItWorks content={content} />;
      case 'menu':
        return <Menu content={content} />;
      case 'business':
        return <BusinessRegistration content={content} />;
      case 'assortments':
        return <Assortments content={content} />;
      case 'contact':
        return <ContactFAQ settings={settings} storeSettings={storeSettings} content={content} />;
      default:
        return null;
    }
  };

  return (
    <main className="font-serif flex-grow">
      {fullOrder.map(sectionKey => (
        <div key={sectionKey} className="contents">
          {renderSection(sectionKey as HomepageSectionKey)}
        </div>
      ))}
    </main>
  );
}
