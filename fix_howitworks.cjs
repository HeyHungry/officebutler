const fs = require('fs');
let code = fs.readFileSync('src/components/HowItWorks.tsx', 'utf8');

code = code.replace(
  'title: content?.how_step1_title || "1. Bestel of Meld Aan",',
  'title: content?.how_step1_title || "1. Bestel of Meld Aan",\n      titleSize: content?.how_step1_title_size,\n      descSize: content?.how_step1_desc_size,'
);
code = code.replace(
  'title: content?.how_step2_title || "2. Wij Bereiden Voor",',
  'title: content?.how_step2_title || "2. Wij Bereiden Voor",\n      titleSize: content?.how_step2_title_size,\n      descSize: content?.how_step2_desc_size,'
);
code = code.replace(
  'title: content?.how_step3_title || "3. Bezorging op Kantoor",',
  'title: content?.how_step3_title || "3. Bezorging op Kantoor",\n      titleSize: content?.how_step3_title_size,\n      descSize: content?.how_step3_desc_size,'
);

code = code.replace('<h3 className="font-serif text-xl mb-3">{step.title}</h3>', '<h3 className="font-serif text-xl mb-3" style={{ fontSize: step.titleSize }}>{step.title}</h3>');
code = code.replace('<p className="font-serif text-ob-text-light leading-relaxed max-w-xs">\n                {step.description}\n              </p>', '<p className="font-serif text-ob-text-light leading-relaxed max-w-xs" style={{ fontSize: step.descSize }}>\n                {step.description}\n              </p>');

fs.writeFileSync('src/components/HowItWorks.tsx', code);
