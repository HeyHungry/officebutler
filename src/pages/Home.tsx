import { Hero } from '../components/Hero';
import { HowItWorks } from '../components/HowItWorks';
import { Assortments } from '../components/Assortments';
import { Menu } from '../components/Menu';
import { BusinessRegistration } from '../components/BusinessRegistration';
import { ContactFAQ } from '../components/ContactFAQ';
import { SharedSettings, StoreSettings } from '../lib/supabase';

export function Home({ settings, storeSettings }: { settings: SharedSettings, storeSettings: StoreSettings }) {
  return (
    <main className="font-serif flex-grow">
      <Hero content={storeSettings?.page_content} />
      <HowItWorks content={storeSettings?.page_content} />
      <Menu content={storeSettings?.page_content} />
      <BusinessRegistration content={storeSettings?.page_content} />
      <Assortments content={storeSettings?.page_content} />
      <ContactFAQ settings={settings} storeSettings={storeSettings} content={storeSettings?.page_content} />
    </main>
  );
}
