const fs = require('fs');
let code = fs.readFileSync('src/components/Hero.tsx', 'utf8');

// Bestel nu
code = code.replace(
  'shadow-lg w-full sm:w-auto justify-center h-[56px]"',
  'shadow-lg w-full sm:w-[260px] justify-center h-[56px]"'
);

// Bekijk aanbod
code = code.replace(
  'duration-300 w-full sm:w-auto justify-center h-[56px]"',
  'duration-300 w-full sm:w-[260px] justify-center h-[56px]"'
);

fs.writeFileSync('src/components/Hero.tsx', code);
