const fs = require('fs');

let code = fs.readFileSync('src/components/Hero.tsx', 'utf8');
code = code.replace(
  /<div className="absolute inset-0 bg-ob-blue\/80"><\/div>/g,
  '<div className="absolute inset-0 bg-gradient-to-b from-ob-blue via-ob-blue/80 to-ob-blue/40"></div>'
);
fs.writeFileSync('src/components/Hero.tsx', code);
