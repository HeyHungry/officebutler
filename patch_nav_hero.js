import fs from 'fs';

// Patch Navbar.tsx
let navCode = fs.readFileSync('src/components/Navbar.tsx', 'utf8');
navCode = navCode.replace(
  'import { SharedSettings, StoreSettings } from "../lib/supabase";',
  'import { SharedSettings, StoreSettings } from "../lib/supabase";\nimport { useOrderModal } from "../contexts/OrderModalContext";'
);
navCode = navCode.replace(
  'export function Navbar({ storeSettings }: { storeSettings: StoreSettings | null }) {',
  'export function Navbar({ storeSettings }: { storeSettings: StoreSettings | null }) {\n  const { openStep1 } = useOrderModal();'
);
// Replace both desktop and mobile BESTEL NU buttons
navCode = navCode.replace(
  /<a\s*href="\/#menu"\s*className="[^"]+"\s*>\s*BESTEL NU\s*<\/a>/g,
  (match) => {
    return match
      .replace('<a', '<button')
      .replace('href="/#menu"', '')
      .replace('</a>', '</button>')
      .replace('className="', 'onClick={() => { openStep1(); setIsMobileMenuOpen(false); }} className="');
  }
);
// Some cases might not have setIsMobileMenuOpen
navCode = navCode.replace(
  /onClick=\{\(\) => \{ openStep1\(\); setIsMobileMenuOpen\(false\); \}\} className="font-serif bg-white text-ob-blue px-6 py-2.5 hover:bg-gray-100 transition-colors duration-300 tracking-wider text-sm shadow-md font-semibold"/,
  'onClick={openStep1} className="font-serif bg-white text-ob-blue px-6 py-2.5 hover:bg-gray-100 transition-colors duration-300 tracking-wider text-sm shadow-md font-semibold"'
);
fs.writeFileSync('src/components/Navbar.tsx', navCode);

// Patch Hero.tsx
let heroCode = fs.readFileSync('src/components/Hero.tsx', 'utf8');
heroCode = heroCode.replace(
  "import { ArrowRight, Utensils, CalendarClock } from 'lucide-react';",
  "import { ArrowRight, Utensils, CalendarClock } from 'lucide-react';\nimport { useOrderModal } from '../contexts/OrderModalContext';"
);
heroCode = heroCode.replace(
  'export function Hero() {',
  'export function Hero() {\n  const { openStep2 } = useOrderModal();'
);
heroCode = heroCode.replace(
  /<a \n                href="#menu"\n                className="[^"]+"\n              >\n                <span className="font-serif tracking-widest uppercase text-sm font-semibold">Bestel vooraf<\/span>\n                <CalendarClock size=\{18\} className="font-serif group-hover:scale-110 transition-transform" \/>\n              <\/a>/,
  `<button onClick={openStep2} className="font-serif group bg-white text-ob-blue px-8 py-4 flex items-center gap-3 hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl w-full sm:w-auto justify-center"><span className="font-serif tracking-widest uppercase text-sm font-semibold">Bestel vooraf</span><CalendarClock size={18} className="font-serif group-hover:scale-110 transition-transform" /></button>`
);
heroCode = heroCode.replace(
  /<a \n                href="#menu"\n                className="[^"]+"\n              >\n                <span className="font-serif tracking-widest uppercase text-sm font-semibold">Bestel direct<\/span>\n                <ArrowRight size=\{18\} className="font-serif group-hover:translate-x-1 transition-transform" \/>\n              <\/a>/,
  `<button onClick={openStep2} className="font-serif group bg-white text-ob-blue px-8 py-4 flex items-center gap-3 hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl w-full sm:w-auto justify-center"><span className="font-serif tracking-widest uppercase text-sm font-semibold">Bestel direct</span><ArrowRight size={18} className="font-serif group-hover:translate-x-1 transition-transform" /></button>`
);
fs.writeFileSync('src/components/Hero.tsx', heroCode);
