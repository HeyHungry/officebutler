const fs = require('fs');
let code = fs.readFileSync('src/components/Menu.tsx', 'utf8');

code = code.replace(
  /<h2 className="font-serif text-3xl md:text-5xl text-ob-text mb-4">Ons Menu<\/h2>/,
  '<h2 className="font-serif text-3xl md:text-5xl text-ob-text mb-4">{content?.menu_title || "Ons Menu"}</h2>'
);

code = code.replace(
  /<p className="font-serif text-ob-text-light max-w-2xl mx-auto">Zelf samenstellen of iets extra's toevoegen aan uw pakket\? Bekijk ons uitgebreide menu\.<\/p>/,
  '<p className="font-serif text-ob-text-light max-w-2xl mx-auto">{content?.menu_subtitle || "Zelf samenstellen of iets extra\'s toevoegen aan uw pakket? Bekijk ons uitgebreide menu."}</p>'
);

code = code.replace(
  /<span className="font-serif tracking-widest uppercase text-sm font-semibold">Bekijk volledig menu<\/span>/,
  '<span className="font-serif tracking-widest uppercase text-sm font-semibold">{content?.menu_btn || "Bekijk volledig menu"}</span>'
);

fs.writeFileSync('src/components/Menu.tsx', code);
