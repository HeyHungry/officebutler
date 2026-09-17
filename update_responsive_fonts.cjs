const fs = require('fs');

const files = [
  'src/components/Hero.tsx',
  'src/components/HowItWorks.tsx',
  'src/components/Assortments.tsx',
  'src/components/Menu.tsx',
  'src/components/BusinessRegistration.tsx',
  'src/components/ContactFAQ.tsx'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let code = fs.readFileSync(file, 'utf8');

  // Replace for content?.SOME_KEY
  code = code.replace(
    /style=\{\{ fontSize: content\?\.([a-zA-Z0-9_]+) \}\}/g,
    'style={{ fontSize: content?.$1 ? `calc(${String(content.$1).replace(/[^0-9]/g,\'\')} / 100 * 1em)` : undefined }}'
  );

  // Replace for step.SOME_KEY
  code = code.replace(
    /style=\{\{ fontSize: step\.([a-zA-Z0-9_]+) \}\}/g,
    'style={{ fontSize: step.$1 ? `calc(${String(step.$1).replace(/[^0-9]/g,\'\')} / 100 * 1em)` : undefined }}'
  );

  fs.writeFileSync(file, code);
}
