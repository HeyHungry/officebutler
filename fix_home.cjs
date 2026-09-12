const fs = require('fs');
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
appCode = appCode.replace(/<Route path="\/" element=\{<Home settings=\{settings\} \/>\} \/>/, '<Route path="/" element={<Home settings={settings} storeSettings={storeSettings} />} />');
fs.writeFileSync('src/App.tsx', appCode);

let homeCode = fs.readFileSync('src/pages/Home.tsx', 'utf8');
homeCode = homeCode.replace(/import \{ SharedSettings \} from '\.\.\/lib\/supabase';/, "import { SharedSettings, StoreSettings } from '../lib/supabase';");
homeCode = homeCode.replace(/export function Home\(\{ settings \}: \{ settings: SharedSettings \}\) \{/, "export function Home({ settings, storeSettings }: { settings: SharedSettings, storeSettings: StoreSettings }) {");

homeCode = homeCode.replace(/<Hero \/>/, "<Hero content={storeSettings?.page_content} />");
homeCode = homeCode.replace(/<HowItWorks \/>/, "<HowItWorks content={storeSettings?.page_content} />");
homeCode = homeCode.replace(/<Menu \/>/, "<Menu content={storeSettings?.page_content} />");
homeCode = homeCode.replace(/<Assortments \/>/, "<Assortments content={storeSettings?.page_content} />");
homeCode = homeCode.replace(/<BusinessRegistration \/>/, "<BusinessRegistration content={storeSettings?.page_content} />");

fs.writeFileSync('src/pages/Home.tsx', homeCode);
