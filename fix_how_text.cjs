const fs = require('fs');
let code = fs.readFileSync('src/components/HowItWorks.tsx', 'utf8');

code = code.replace(
  />Hoe Werkt Office Butler\?</g,
  '>{content?.how_title || "Hoe Werkt Office Butler?"}<'
);

code = code.replace(
  />Stel uw pakket samen</g,
  '>{content?.how_step1_title || "Stel uw pakket samen"}<'
);
code = code.replace(
  />Kies uit onze vaste pakketten of stel zelf uw ideale borrel samen met onze losse snacks\.</g,
  '>{content?.how_step1_desc || "Kies uit onze vaste pakketten of stel zelf uw ideale borrel samen met onze losse snacks."}<'
);

code = code.replace(
  />Kies uw bezorgmoment</g,
  '>{content?.how_step2_title || "Kies uw bezorgmoment"}<'
);
code = code.replace(
  />Bestel direct voor levering binnen 45 minuten, of plan uw borrel vooruit voor een specifiek moment\.</g,
  '>{content?.how_step2_desc || "Bestel direct voor levering binnen 45 minuten, of plan uw borrel vooruit voor een specifiek moment."}<'
);

code = code.replace(
  />Geniet van de borrel</g,
  '>{content?.how_step3_title || "Geniet van de borrel"}<'
);
code = code.replace(
  />Onze butlers bezorgen de snacks warm en perfect gepresenteerd bij u op kantoor\.</g,
  '>{content?.how_step3_desc || "Onze butlers bezorgen de snacks warm en perfect gepresenteerd bij u op kantoor."}<'
);

fs.writeFileSync('src/components/HowItWorks.tsx', code);
