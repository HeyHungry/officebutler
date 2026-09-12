const fs = require('fs');
let code = fs.readFileSync('src/components/Assortments.tsx', 'utf8');

code = code.replace(
  /<h3 className="font-serif text-3xl mb-2">Basis Assortiment<\/h3>/,
  '<h3 className="font-serif text-3xl mb-2">{content?.assort_snacks_title || "Office Snacks"}</h3>'
);

code = code.replace(
  /<span className="font-serif text-ob-text">Premium bittergarnituur \(ambachtelijk\)<\/span>/,
  '<span className="font-serif text-ob-text">{content?.assort_snacks_item1 || "Premium bittergarnituur (ambachtelijk)"}</span>'
);

code = code.replace(
  /<span className="font-serif text-ob-text">Luxe koude hapjes en borrelplanken<\/span>/,
  '<span className="font-serif text-ob-text">{content?.assort_snacks_item2 || "Luxe koude hapjes en borrelplanken"}</span>'
);

code = code.replace(
  /<span className="font-serif text-ob-text">Geleverd in warmhoudboxen<\/span>/,
  '<span className="font-serif text-ob-text">{content?.assort_snacks_item3 || "Geleverd in warmhoudboxen"}</span>'
);


code = code.replace(
  /<h3 className="font-serif text-3xl mb-2 text-white">Compleet Assortiment<\/h3>/,
  '<h3 className="font-serif text-3xl mb-2 text-white">{content?.assort_complete_title || "Office Compleet"}</h3>'
);

code = code.replace(
  /<span className="font-serif text-white\/90">Alles uit het Basis Assortiment<\/span>/,
  '<span className="font-serif text-white/90">{content?.assort_complete_item1 || "Alles uit het Basis Assortiment"}</span>'
);

code = code.replace(
  /<span className="font-serif text-white\/90">Gekoelde bieren \(o\.a\. speciaalbier\), wijnen en fris<\/span>/,
  '<span className="font-serif text-white/90">{content?.assort_complete_item2 || "Gekoelde bieren (o.a. speciaalbier), wijnen en fris"}</span>'
);

code = code.replace(
  /<span className="font-serif text-white\/90">Optioneel: Inclusief glaswerk<\/span>/,
  '<span className="font-serif text-white/90">{content?.assort_complete_item3 || "Optioneel: Inclusief glaswerk"}</span>'
);

fs.writeFileSync('src/components/Assortments.tsx', code);
