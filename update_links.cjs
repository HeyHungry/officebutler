const fs = require('fs');

// 1. Hero.tsx
let heroCode = fs.readFileSync('src/components/Hero.tsx', 'utf8');
heroCode = heroCode.replace('href="#assortments"', 'href="#menu"');
fs.writeFileSync('src/components/Hero.tsx', heroCode);

// 2. Navbar.tsx
let navCode = fs.readFileSync('src/components/Navbar.tsx', 'utf8');
navCode = navCode.replace("{ name: 'Assortiment', href: '/#assortments' },", "{ name: 'Assortiment', href: '/#menu' },");
fs.writeFileSync('src/components/Navbar.tsx', navCode);

