import fs from 'fs';
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

const oldMobileBtn = `<a \n                href="/#menu"\n                onClick={() => setIsMobileMenuOpen(false)}\n                className="font-serif bg-ob-blue text-white px-8 py-4 text-lg mt-4 inline-block mx-auto hover:bg-ob-blue-dark transition-colors"\n              >\n                BESTEL NU\n              </a>`;

const newMobileBtn = `<button \n                onClick={() => { openStep1(); setIsMobileMenuOpen(false); }}\n                className="font-serif bg-ob-blue text-white px-8 py-4 text-lg mt-4 inline-block mx-auto hover:bg-ob-blue-dark transition-colors"\n              >\n                BESTEL NU\n              </button>`;

if (code.includes(oldMobileBtn)) {
  code = code.replace(oldMobileBtn, newMobileBtn);
  fs.writeFileSync('src/components/Navbar.tsx', code);
} else {
  // Let's just do a broad replace
  code = code.replace(
    /<a\s*href="\/#menu"\s*onClick=\{\(\) => setIsMobileMenuOpen\(false\)\}\s*className="[^"]+"\s*>\s*BESTEL NU\s*<\/a>/,
    `<button onClick={() => { openStep1(); setIsMobileMenuOpen(false); }} className="font-serif bg-ob-blue text-white px-8 py-4 text-lg mt-4 inline-block mx-auto hover:bg-ob-blue-dark transition-colors">BESTEL NU</button>`
  );
  fs.writeFileSync('src/components/Navbar.tsx', code);
}
