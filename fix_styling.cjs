const fs = require('fs');

const oldBadge = "'bg-ob-blue text-white shadow-md'";
const newBadge = "'bg-blue-50 text-ob-blue border border-ob-blue shadow-sm'";

// 1. Menu.tsx
let menuCode = fs.readFileSync('src/components/Menu.tsx', 'utf8');
menuCode = menuCode.replace(oldBadge, newBadge);
fs.writeFileSync('src/components/Menu.tsx', menuCode);

// 2. GuestOrdering.tsx
let guestCode = fs.readFileSync('src/pages/GuestOrdering.tsx', 'utf8');
guestCode = guestCode.replace(oldBadge, newBadge);
// Portion buttons hover effect
guestCode = guestCode.replace(
  /'bg-white text-gray-600 border-gray-200 hover:border-ob-blue hover:-translate-y-1 hover:shadow-md transition-all'/g,
  "'bg-white text-gray-600 border-gray-200 hover:border-ob-blue hover:bg-blue-50 hover:text-ob-blue hover:-translate-y-1 hover:shadow-md transition-all'"
);
fs.writeFileSync('src/pages/GuestOrdering.tsx', guestCode);

// 3. EmployeeOrdering.tsx
let empCode = fs.readFileSync('src/pages/EmployeeOrdering.tsx', 'utf8');
empCode = empCode.replace(oldBadge, newBadge);
// Portion buttons hover effect
empCode = empCode.replace(
  /'border-gray-200 hover:border-ob-blue hover:-translate-y-1 hover:shadow-md text-gray-700 bg-white transition-all'/g,
  "'border-gray-200 hover:border-ob-blue hover:bg-blue-50 hover:text-ob-blue hover:-translate-y-1 hover:shadow-md text-gray-700 bg-white transition-all'"
);
fs.writeFileSync('src/pages/EmployeeOrdering.tsx', empCode);

// 4. Hero.tsx hover effects
let heroCode = fs.readFileSync('src/components/Hero.tsx', 'utf8');
heroCode = heroCode.replace(
  /hover:bg-gray-100 hover:-translate-y-1/g,
  "hover:bg-ob-accent hover:text-white hover:-translate-y-1"
);
heroCode = heroCode.replace(
  /hover:bg-white\/10 hover:-translate-y-1/g,
  "hover:bg-white hover:text-ob-blue hover:-translate-y-1"
);
fs.writeFileSync('src/components/Hero.tsx', heroCode);

// 5. Navbar.tsx hover effects
let navCode = fs.readFileSync('src/components/Navbar.tsx', 'utf8');
navCode = navCode.replace(
  /hover:bg-gray-100 hover:-translate-y-0\.5/g,
  "hover:bg-ob-accent hover:text-white hover:-translate-y-0.5"
);
fs.writeFileSync('src/components/Navbar.tsx', navCode);

console.log('Styling updated');
