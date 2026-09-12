const fs = require('fs');

// BADGE STYLING
const oldBadgeRegex = /'bg-blue-50 text-ob-blue border border-ob-blue shadow-sm'/g;
const newBadge = "'border border-ob-blue text-ob-blue bg-transparent shadow-sm'";

// Menu.tsx
let menuCode = fs.readFileSync('src/components/Menu.tsx', 'utf8');
menuCode = menuCode.replace(oldBadgeRegex, newBadge);
fs.writeFileSync('src/components/Menu.tsx', menuCode);

// GuestOrdering.tsx
let guestCode = fs.readFileSync('src/pages/GuestOrdering.tsx', 'utf8');
guestCode = guestCode.replace(oldBadgeRegex, newBadge);
// Hover fixes (remove bg-blue-50, hover:text-ob-blue)
guestCode = guestCode.replace(/hover:bg-blue-50 hover:text-ob-blue /g, '');
fs.writeFileSync('src/pages/GuestOrdering.tsx', guestCode);

// EmployeeOrdering.tsx
let empCode = fs.readFileSync('src/pages/EmployeeOrdering.tsx', 'utf8');
empCode = empCode.replace(oldBadgeRegex, newBadge);
empCode = empCode.replace(/hover:bg-blue-50 hover:text-ob-blue /g, '');
fs.writeFileSync('src/pages/EmployeeOrdering.tsx', empCode);

// Hero.tsx
let heroCode = fs.readFileSync('src/components/Hero.tsx', 'utf8');
// Fix overlay
heroCode = heroCode.replace(/bg-ob-blue\/90/g, 'bg-ob-blue/70');
// Shorten title
heroCode = heroCode.replace(
  /<h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white mb-8 leading-tight">\s*De perfecte <span className="font-serif italic text-white\/90">kantoorborrel<\/span>,<br \/> tot in de puntjes verzorgd\.\s*<\/h1>/,
  '<h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-white mb-8 leading-tight">\n            De perfecte <span className="font-serif italic text-white/90">kantoorborrel</span>.\n          </h1>'
);
// Fix hover (remove color swap, keep translate and shadow/glow)
heroCode = heroCode.replace(/hover:bg-ob-accent hover:text-white /g, 'hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] ');
heroCode = heroCode.replace(/hover:bg-white hover:text-ob-blue /g, 'hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] ');
fs.writeFileSync('src/components/Hero.tsx', heroCode);

// Navbar.tsx
let navCode = fs.readFileSync('src/components/Navbar.tsx', 'utf8');
navCode = navCode.replace(/hover:bg-ob-accent hover:text-white /g, 'hover:shadow-[0_0_15px_rgba(255,255,255,0.3)] ');
fs.writeFileSync('src/components/Navbar.tsx', navCode);

// Assortments.tsx
let assortCode = fs.readFileSync('src/components/Assortments.tsx', 'utf8');
// "hover:bg-ob-blue hover:text-white" for Bestel Snacks
assortCode = assortCode.replace(/hover:bg-ob-blue hover:text-white /g, 'hover:shadow-[0_0_15px_rgba(21,31,51,0.2)] ');
// "hover:bg-ob-accent-hover hover:-translate-y-1 hover:shadow-lg" for Bestel Compleet
assortCode = assortCode.replace(/hover:bg-ob-accent-hover /g, 'hover:brightness-110 hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] ');
fs.writeFileSync('src/components/Assortments.tsx', assortCode);

console.log('Fixed styling');
