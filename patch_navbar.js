import fs from 'fs';
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

// Use whitespace-nowrap for the 'Momenteel gesloten' text
code = code.replace(
  'text-white/90 font-serif text-sm font-medium tracking-wide',
  'text-white/90 font-serif text-sm font-medium tracking-wide whitespace-nowrap'
);

// Reduce gap-8 to gap-4 lg:gap-6 xl:gap-8, and add whitespace-nowrap to links
code = code.replace(
  '<nav className="font-serif hidden md:flex items-center gap-8 font-serif">',
  '<nav className="font-serif hidden lg:flex items-center gap-4 xl:gap-6 font-serif">'
);

// We need to change md:flex to lg:flex probably, or xl:flex. But wait, if we hide it on md, we need to show the mobile menu on md.
code = code.replace(
  'hidden md:block',
  'hidden lg:block' // For the mobile menu button (wait, let's see how the mobile menu button is defined)
);

fs.writeFileSync('src/components/Navbar.tsx', code);
