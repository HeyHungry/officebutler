const fs = require('fs');
let code = fs.readFileSync('src/components/BusinessRegistration.tsx', 'utf8');

code = code.replace(
  /<h3 className="font-serif text-2xl mb-4 text-ob-blue italic">Een vaste partner voor uw kantoor\.<\/h3>/,
  '<h3 className="font-serif text-2xl mb-4 text-ob-blue italic">{content?.business_subtitle || "Een vaste partner voor uw kantoor."}</h3>'
);

code = code.replace(
  /<span className="font-serif text-ob-text">Een eigen, unieke URL \(bijv\. officebutler\.nl\/uw-bedrijf\)<\/span>/,
  '<span className="font-serif text-ob-text">{content?.business_point1 || "Een eigen, unieke URL (bijv. officebutler.nl/uw-bedrijf)"}</span>'
);

code = code.replace(
  /<span className="font-serif text-ob-text">Gepersonaliseerd assortiment naar wens<\/span>/,
  '<span className="font-serif text-ob-text">{content?.business_point2 || "Gepersonaliseerd assortiment naar wens"}</span>'
);

code = code.replace(
  /<span className="font-serif text-ob-text">Optie tot betalen op factuur<\/span>/,
  '<span className="font-serif text-ob-text">{content?.business_point3 || "Optie tot betalen op factuur"}</span>'
);

code = code.replace(
  /\{isSubmitting \? 'Versturen\.\.\.' : 'Aanvraag Versturen'\}/,
  "{isSubmitting ? 'Versturen...' : (content?.business_btn || 'Kantoor Inschrijven')}"
);

fs.writeFileSync('src/components/BusinessRegistration.tsx', code);
