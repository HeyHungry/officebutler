const fs = require('fs');

const files = [
  'src/components/HowItWorks.tsx',
  'src/components/Assortments.tsx',
  'src/components/Menu.tsx',
  'src/components/BusinessRegistration.tsx',
  'src/components/ContactFAQ.tsx'
];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');
  
  // Find all elements containing {content?.SOME_KEY || "fallback"}
  // We'll replace <div className="..."> {content?.some_key || "..."} </div>
  // with <div className="..." style={{ fontSize: content?.some_key_size }}> {content?.some_key || "..."} </div>
  
  // Regex to find className="..." and the content block inside it
  const regex = /(<[a-zA-Z0-9]+[^>]+)(>)\s*(\{content\?\.([a-zA-Z0-9_]+) \|\| ["'][^"']+["']\})/g;
  
  code = code.replace(regex, (match, beforeTags, closingBracket, contentBlock, keyName) => {
    // If it already has style=, we don't mess with it for simplicity, just skip
    if (beforeTags.includes('style={{')) {
       return match;
    }
    return `${beforeTags} style={{ fontSize: content?.${keyName}_size }}${closingBracket}${contentBlock}`;
  });

  fs.writeFileSync(file, code);
}
