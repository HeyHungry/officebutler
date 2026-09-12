const fs = require('fs');

let code = fs.readFileSync('src/components/Hero.tsx', 'utf8');

code = code.replace(
  />EXCLUSIEF IN AMSTERDAM</g,
  '>{content?.hero_pre_title || "EXCLUSIEF IN AMSTERDAM"}<'
);

code = code.replace(
  />Bestel vooraf</g,
  '>{content?.hero_btn_scheduled || "Bestel vooraf"}<'
);

code = code.replace(
  />Bestel direct</g,
  '>{content?.hero_btn_direct || "Bestel direct"}<'
);

code = code.replace(
  />Bekijk aanbod</g,
  '>{content?.hero_btn_offer || "Bekijk aanbod"}<'
);

fs.writeFileSync('src/components/Hero.tsx', code);
