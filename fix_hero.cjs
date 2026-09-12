const fs = require('fs');
let code = fs.readFileSync('src/components/Hero.tsx', 'utf8');

code = code.replace(
  /<span className="font-serif text-white\/90 tracking-\[0\.2em\] uppercase text-sm font-semibold">Exclusief in Amsterdam<\/span>/,
  '<span className="font-serif text-white/90 tracking-[0.2em] uppercase text-sm font-semibold">{content?.hero_pre_title || "Exclusief in Amsterdam"}</span>'
);

fs.writeFileSync('src/components/Hero.tsx', code);
