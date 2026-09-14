const fs = require('fs');
let code = fs.readFileSync('src/components/Hero.tsx', 'utf8');

code = code.replace(
  /className="absolute inset-0 z-0 bg-cover bg-\[center_top_10%\] md:bg-\[center_top_20%\] bg-no-repeat"/,
  'className="absolute inset-0 z-0 bg-cover bg-[center_20%] bg-no-repeat"'
);

fs.writeFileSync('src/components/Hero.tsx', code);
