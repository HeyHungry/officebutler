const fs = require('fs');

// 1. Assortments.tsx
let assortCode = fs.readFileSync('src/components/Assortments.tsx', 'utf8');

// Add context import
if (!assortCode.includes('useOrderModal')) {
  assortCode = assortCode.replace(
    /import \{ Utensils, Wine, Check \} from 'lucide-react';/,
    "import { Utensils, Wine, Check } from 'lucide-react';\nimport { useOrderModal } from '../contexts/OrderModalContext';"
  );
}

// Add hook usage
if (!assortCode.includes('const { openStep1 } = useOrderModal();')) {
  assortCode = assortCode.replace(
    /export function Assortments\(\) \{/,
    "export function Assortments() {\n  const { openStep1 } = useOrderModal();"
  );
}

// Replace Bestel Snacks button
assortCode = assortCode.replace(
  /<button className="font-serif w-full border border-ob-blue text-ob-blue hover:bg-ob-blue hover:text-white transition-colors py-4 uppercase tracking-widest text-sm">\s*Bestel Snacks\s*<\/button>/g,
  '<button onClick={openStep1} className="font-serif w-full border-2 border-ob-blue text-ob-blue hover:bg-ob-blue hover:text-white hover:-translate-y-1 hover:shadow-lg transition-all duration-300 py-4 uppercase tracking-widest text-sm font-bold">\n              Bestel Snacks\n            </button>'
);

// Replace Bestel Compleet button
assortCode = assortCode.replace(
  /<button className="font-serif w-full bg-ob-accent text-white hover:bg-ob-accent-hover transition-colors py-4 uppercase tracking-widest text-sm">\s*Bestel Compleet\s*<\/button>/g,
  '<button onClick={openStep1} className="font-serif w-full bg-ob-accent text-white hover:bg-ob-accent-hover hover:-translate-y-1 hover:shadow-lg transition-all duration-300 py-4 uppercase tracking-widest text-sm font-bold">\n              Bestel Compleet\n            </button>'
);

fs.writeFileSync('src/components/Assortments.tsx', assortCode);

// 2. Hero.tsx
let heroCode = fs.readFileSync('src/components/Hero.tsx', 'utf8');
heroCode = heroCode.replace(
  /className="font-serif group bg-white text-ob-blue px-8 py-4 flex items-center gap-3 hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl w-full sm:w-auto justify-center"/g,
  'className="font-serif group bg-white text-ob-blue px-8 py-4 flex items-center gap-3 hover:bg-gray-100 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 shadow-lg w-full sm:w-auto justify-center"'
);
heroCode = heroCode.replace(
  /className="font-serif group border border-white\/40 text-white px-8 py-4 flex items-center gap-3 hover:border-white hover:bg-white\/10 transition-all duration-300 w-full sm:w-auto justify-center"/g,
  'className="font-serif group border border-white/40 text-white px-8 py-4 flex items-center gap-3 hover:border-white hover:bg-white/10 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 w-full sm:w-auto justify-center"'
);
fs.writeFileSync('src/components/Hero.tsx', heroCode);

// 3. Navbar.tsx
let navCode = fs.readFileSync('src/components/Navbar.tsx', 'utf8');
navCode = navCode.replace(
  /className="font-serif bg-white text-ob-blue px-6 py-2\.5 hover:bg-gray-100 transition-colors duration-300 tracking-wider text-sm shadow-md font-semibold whitespace-nowrap shrink-0"/g,
  'className="font-serif bg-white text-ob-blue px-6 py-2.5 hover:bg-gray-100 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 tracking-wider text-sm shadow-md font-semibold whitespace-nowrap shrink-0"'
);
fs.writeFileSync('src/components/Navbar.tsx', navCode);

console.log('Other buttons updated');
