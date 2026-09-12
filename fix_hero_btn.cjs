const fs = require('fs');
let code = fs.readFileSync('src/components/Hero.tsx', 'utf8');

code = code.replace(
  /className="font-serif group border border-white\/40 text-white px-8 py-4 flex items-center gap-3 hover:border-white hover:bg-gray-100 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 w-full sm:w-auto justify-center"/g,
  'className="font-serif group border border-white/50 text-white px-8 py-4 flex items-center gap-3 hover:bg-white hover:text-ob-blue hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto justify-center"'
);

fs.writeFileSync('src/components/Hero.tsx', code);
