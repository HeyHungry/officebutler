const fs = require('fs');

function updateComponent(file, compName, fallbackHero, fallbackSub, typeName) {
  let code = fs.readFileSync(file, 'utf8');
  
  if (!code.includes('StoreSettings')) {
     code = code.replace(/import {/, "import { StoreSettings } from '../lib/supabase';\nimport {");
     // wait, might not be first line, just insert at top
  }
  
  // Actually let's just pass `content?: StoreSettings['page_content']` instead of whole settings to keep it simple.
  // We can just add type manually.
  let contentParam = `content?: any`; 
  code = code.replace(
    new RegExp(`export function ${compName}\\(\\) \\{`),
    `export function ${compName}({ content }: { content?: any }) {`
  );
  
  if (compName === 'Hero') {
    code = code.replace(
      /<h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white mb-8 leading-tight">\s*De perfecte <span className="font-serif italic text-white\/90">kantoorborrel<\/span>\.\s*<\/h1>/,
      `<h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white mb-8 leading-tight" dangerouslySetInnerHTML={{ __html: content?.hero_title ? content.hero_title.replace('kantoorborrel', '<span class="font-serif italic text-white/90">kantoorborrel</span>') : 'De perfecte <span class="font-serif italic text-white/90">kantoorborrel</span>.' }}></h1>`
    );
    code = code.replace(
      /Onze butlers leveren de lekkerste snacks voor jouw kantoorborrel\./,
      `{content?.hero_subtitle || 'Onze butlers leveren de lekkerste snacks voor jouw kantoorborrel.'}`
    );
  } else if (compName === 'HowItWorks') {
    code = code.replace(
      /In 3 simpele stappen jouw kantoorborrel of vrijdagmiddagborrel geregeld\./,
      `{content?.how_it_works_subtitle || 'In 3 simpele stappen jouw kantoorborrel of vrijdagmiddagborrel geregeld.'}`
    );
  } else if (compName === 'Assortments') {
    code = code.replace(
      /Kies het pakket dat het beste bij uw kantoorborrel past\./,
      `{content?.assortments_subtitle || 'Kies het pakket dat het beste bij uw kantoorborrel past.'}`
    );
  } else if (compName === 'Menu') {
    code = code.replace(
      /Zelf samenstellen of iets extra's toevoegen aan uw pakket\? Bekijk ons uitgebreide menu\./,
      `{content?.menu_subtitle || "Zelf samenstellen of iets extra's toevoegen aan uw pakket? Bekijk ons uitgebreide menu."}`
    );
  } else if (compName === 'BusinessRegistration') {
    code = code.replace(
      /Regel wekelijks jullie kantoorborrel op rekening\./,
      `{content?.business_subtitle || 'Regel wekelijks jullie kantoorborrel op rekening.'}`
    );
  }
  
  fs.writeFileSync(file, code);
}

updateComponent('src/components/Hero.tsx', 'Hero');
updateComponent('src/components/HowItWorks.tsx', 'HowItWorks');
updateComponent('src/components/Assortments.tsx', 'Assortments');
updateComponent('src/components/Menu.tsx', 'Menu');

let busCode = fs.readFileSync('src/components/BusinessRegistration.tsx', 'utf8');
busCode = busCode.replace(
  /export function BusinessRegistration\(\) \{/,
  'export function BusinessRegistration({ content }: { content?: any }) {'
);
busCode = busCode.replace(
  /Regel wekelijks jullie kantoorborrel op rekening\./,
  `{content?.business_subtitle || 'Regel wekelijks jullie kantoorborrel op rekening.'}`
);
fs.writeFileSync('src/components/BusinessRegistration.tsx', busCode);

console.log('Components updated');
