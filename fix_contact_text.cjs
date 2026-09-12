const fs = require('fs');
let code = fs.readFileSync('src/components/ContactFAQ.tsx', 'utf8');

code = code.replace(
  /export function ContactFAQ\(\{ settings \}: ContactFAQProps\) \{/,
  'export function ContactFAQ({ settings, content }: ContactFAQProps & { content?: any }) {'
);

code = code.replace(
  />Contact & Informatie</g,
  '>{content?.contact_title || "Contact & Informatie"}<'
);

code = code.replace(
  />Veelgestelde Vragen</g,
  '>{content?.faq_title || "Veelgestelde Vragen"}<'
);

fs.writeFileSync('src/components/ContactFAQ.tsx', code);

// also pass it in Home.tsx
let homeCode = fs.readFileSync('src/pages/Home.tsx', 'utf8');
homeCode = homeCode.replace(
  /<ContactFAQ settings=\{settings\} \/>/,
  '<ContactFAQ settings={settings} content={storeSettings?.page_content} />'
);
fs.writeFileSync('src/pages/Home.tsx', homeCode);
