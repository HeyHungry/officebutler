const fs = require('fs');

// 1. BADGES
const oldBadge = "'border border-ob-blue text-ob-blue bg-transparent shadow-sm'";
const newBadge = "'bg-blue-100 text-blue-700'";

let menuCode = fs.readFileSync('src/components/Menu.tsx', 'utf8');
menuCode = menuCode.replace(oldBadge, newBadge);
fs.writeFileSync('src/components/Menu.tsx', menuCode);

let guestCode = fs.readFileSync('src/pages/GuestOrdering.tsx', 'utf8');
guestCode = guestCode.replace(oldBadge, newBadge);
fs.writeFileSync('src/pages/GuestOrdering.tsx', guestCode);

let empCode = fs.readFileSync('src/pages/EmployeeOrdering.tsx', 'utf8');
empCode = empCode.replace(oldBadge, newBadge);
fs.writeFileSync('src/pages/EmployeeOrdering.tsx', empCode);


// 2. HERO.TSX 
let heroCode = fs.readFileSync('src/components/Hero.tsx', 'utf8');
// overlay
heroCode = heroCode.replace(/bg-ob-blue\/70/g, 'bg-ob-blue/80');

// hover effects
heroCode = heroCode.replace(/hover:shadow-\[0_0_15px_rgba\(255,255,255,0\.3\)\] /g, 'hover:bg-gray-100 ');
fs.writeFileSync('src/components/Hero.tsx', heroCode);


// 3. NAVBAR.TSX
let navCode = fs.readFileSync('src/components/Navbar.tsx', 'utf8');
navCode = navCode.replace(/hover:shadow-\[0_0_15px_rgba\(255,255,255,0\.3\)\] /g, 'hover:bg-gray-100 ');
fs.writeFileSync('src/components/Navbar.tsx', navCode);

// 4. ASSORTMENTS.TSX
// Revert Bestel Snacks and Bestel Compleet hover glow if they have it
let assortCode = fs.readFileSync('src/components/Assortments.tsx', 'utf8');
assortCode = assortCode.replace(/hover:shadow-\[0_0_15px_rgba\(21,31,51,0\.2\)\] /g, 'hover:bg-ob-blue hover:text-white ');
assortCode = assortCode.replace(/hover:brightness-110 hover:shadow-\[0_0_15px_rgba\(212,175,55,0\.4\)\] /g, 'hover:bg-ob-accent-hover ');
fs.writeFileSync('src/components/Assortments.tsx', assortCode);

console.log('Fixed styling again');
