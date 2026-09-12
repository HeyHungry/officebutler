const fs = require('fs');
let code = fs.readFileSync('src/components/Assortments.tsx', 'utf8');

code = code.replace(
  />Onze Assortimenten</g,
  '>{content?.assortments_title || "Onze Assortimenten"}<'
);

code = code.replace(
  />Office Snacks</g,
  '>{content?.assort_snacks_title || "Office Snacks"}<'
);
code = code.replace(
  />Gemengde warme snacks \(Bourgondiër\)</g,
  '>{content?.assort_snacks_item1 || "Gemengde warme snacks (Bourgondiër)"}<'
);
code = code.replace(
  />Inclusief sauzen</g,
  '>{content?.assort_snacks_item2 || "Inclusief sauzen"}<'
);
code = code.replace(
  />Perfect als aanvulling</g,
  '>{content?.assort_snacks_item3 || "Perfect als aanvulling"}<'
);
code = code.replace(
  />\s*Bestel Snacks\s*</g,
  '>\n              {content?.assort_snacks_btn || "Bestel Snacks"}\n            <'
);

code = code.replace(
  />Office Compleet</g,
  '>{content?.assort_complete_title || "Office Compleet"}<'
);
code = code.replace(
  />Uitgebreid assortiment</g,
  '>{content?.assort_complete_item1 || "Uitgebreid assortiment"}<'
);
code = code.replace(
  />Inclusief dranken</g,
  '>{content?.assort_complete_item2 || "Inclusief dranken"}<'
);
code = code.replace(
  />Compleet verzorgd</g,
  '>{content?.assort_complete_item3 || "Compleet verzorgd"}<'
);
code = code.replace(
  />\s*Bestel Compleet\s*</g,
  '>\n              {content?.assort_complete_btn || "Bestel Compleet"}\n            <'
);

fs.writeFileSync('src/components/Assortments.tsx', code);
