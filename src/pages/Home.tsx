import { Hero } from '../components/Hero';
import { HowItWorks } from '../components/HowItWorks';
import { Assortments } from '../components/Assortments';
import { Menu } from '../components/Menu';
import { BusinessRegistration } from '../components/BusinessRegistration';
import { ContactFAQ } from '../components/ContactFAQ';
import { SharedSettings } from '../lib/supabase';

export function Home({ settings }: { settings: SharedSettings }) {
  return (
    <main className="font-serif flex-grow">
      <Hero />
      <HowItWorks />
      <Menu />
      <BusinessRegistration />
      <Assortments />
      <ContactFAQ settings={settings} />
    </main>
  );
}
