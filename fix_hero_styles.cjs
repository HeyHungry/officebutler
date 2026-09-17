const fs = require('fs');
let code = fs.readFileSync('src/components/Hero.tsx', 'utf8');

code = code.replace(
  '<span className="font-serif tracking-widest uppercase text-xs md:text-sm font-semibold">{content?.hero_pre_title || "EXCLUSIEF IN AMSTERDAM"}</span>',
  '<span className="font-serif tracking-widest uppercase text-xs md:text-sm font-semibold" style={{ fontSize: content?.hero_pre_title_size }}>{content?.hero_pre_title || "EXCLUSIEF IN AMSTERDAM"}</span>'
);

code = code.replace(
  'style={{ fontSize: content?.hero_btn_order_size }}',
  'style={{ fontSize: content?.hero_btn_order_size }}' // already there
);

code = code.replace(
  '<span className="font-serif tracking-widest uppercase text-sm font-semibold">{content?.hero_btn_offer || "Bekijk aanbod"}</span>',
  '<span className="font-serif tracking-widest uppercase text-sm font-semibold" style={{ fontSize: content?.hero_btn_offer_size }}>{content?.hero_btn_offer || "Bekijk aanbod"}</span>'
);

code = code.replace(
  'className="font-serif text-5xl md:text-7xl lg:text-8xl text-white mb-8 leading-tight"',
  'className="font-serif text-5xl md:text-7xl lg:text-8xl text-white mb-8 leading-tight" style={{ fontSize: content?.hero_title_size }}'
);

code = code.replace(
  'className="font-serif text-lg md:text-xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed"',
  'className="font-serif text-lg md:text-xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed" style={{ fontSize: content?.hero_subtitle_size }}'
);

fs.writeFileSync('src/components/Hero.tsx', code);
