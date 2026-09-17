const fs = require('fs');
const file = 'src/components/Assortments.tsx';
let code = fs.readFileSync(file, 'utf8');

const s1 = '<p className="font-serif text-ob-text-light mb-8 italic">Puur genieten van warme en koude snacks.</p>';
const r1 = '<p className="font-serif text-ob-text-light mb-8 italic" style={{ fontSize: content?.assort_snacks_subtitle_size }}>{content?.assort_snacks_subtitle || "Puur genieten van warme en koude snacks."}</p>';
code = code.replace(s1, r1);

const s2 = '<p className="font-serif text-white/70 mb-8 italic">De volledige vrijmibo ervaring.</p>';
const r2 = '<p className="font-serif text-white/70 mb-8 italic" style={{ fontSize: content?.assort_complete_subtitle_size }}>{content?.assort_complete_subtitle || "De volledige vrijmibo ervaring."}</p>';
code = code.replace(s2, r2);

// Let's also add style={{ fontSize: ... }} to the titles in Assortments.tsx
// wait, I can do this in a broader way, but let's stick to what's requested specifically or just provide a generic font size feature.
fs.writeFileSync(file, code);
