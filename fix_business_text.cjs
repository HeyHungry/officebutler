const fs = require('fs');
let code = fs.readFileSync('src/components/BusinessRegistration.tsx', 'utf8');

code = code.replace(
  />Voor Bedrijven</g,
  '>{content?.business_title || "Voor Bedrijven"}<'
);

code = code.replace(
  />Achteraf betalen op factuur</g,
  '>{content?.business_point1 || "Achteraf betalen op factuur"}<'
);

code = code.replace(
  />Overzichtelijk dashboard</g,
  '>{content?.business_point2 || "Overzichtelijk dashboard"}<'
);

code = code.replace(
  />Vaste bezorgmomenten inplannen</g,
  '>{content?.business_point3 || "Vaste bezorgmomenten inplannen"}<'
);

code = code.replace(
  />Kantoor Inschrijven</g,
  '>{content?.business_btn || "Kantoor Inschrijven"}<'
);

fs.writeFileSync('src/components/BusinessRegistration.tsx', code);
