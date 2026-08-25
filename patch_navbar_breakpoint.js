import fs from 'fs';
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

code = code.replace(
  'className="font-serif md:hidden text-white"',
  'className="font-serif lg:hidden text-white"'
);

// also let's make sure the text styles have whitespace-nowrap in desktop nav
code = code.replace(
  'text-[15px] uppercase tracking-widest"',
  'text-[15px] uppercase tracking-widest whitespace-nowrap"'
);
code = code.replace(
  'text-[15px] uppercase tracking-widest font-semibold"',
  'text-[15px] uppercase tracking-widest font-semibold whitespace-nowrap"'
);

// and on the button
code = code.replace(
  'tracking-wider text-sm shadow-md font-semibold"',
  'tracking-wider text-sm shadow-md font-semibold whitespace-nowrap shrink-0"'
);

fs.writeFileSync('src/components/Navbar.tsx', code);
