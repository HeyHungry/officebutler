const fs = require('fs');
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

const oldNav = `<nav className="font-serif hidden lg:flex items-center gap-4 xl:gap-6 font-serif">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href}
              className="font-serif text-white/80 hover:text-white transition-colors duration-300 text-[15px] uppercase tracking-widest whitespace-nowrap"
            >
              {link.name}
            </a>
          ))}
          <a 
            href="/auth"
            className="font-serif text-white/80 hover:text-white transition-colors duration-300 text-[15px] uppercase tracking-widest font-semibold whitespace-nowrap"
          >
            Inloggen
          </a>
          <button 
            
            onClick={openStep1} className="font-serif bg-white text-ob-blue px-6 py-2.5 hover:shadow-[0_0_20px_rgba(5,5,61,0.4)] hover:-translate-y-0.5 transition-all duration-300 tracking-wider text-sm shadow-md font-semibold whitespace-nowrap shrink-0"
          >
            BESTEL NU
          </button>
        </nav>`;

const newNav = `        {/* Desktop Nav Links - Centered */}
        <nav className="font-serif hidden lg:flex flex-1 items-center justify-center gap-6 xl:gap-10">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href}
              className="font-serif text-white/80 hover:text-white transition-colors duration-300 text-[15px] uppercase tracking-widest whitespace-nowrap"
            >
              {link.name}
            </a>
          ))}
        </nav>
        
        {/* Desktop Actions - Right aligned */}
        <div className="font-serif hidden lg:flex items-center gap-6 shrink-0">
          <a 
            href="/auth"
            className="font-serif text-white/80 hover:text-white transition-colors duration-300 text-[15px] uppercase tracking-widest font-semibold whitespace-nowrap"
          >
            Inloggen
          </a>
          <button 
            onClick={openStep1} className="font-serif bg-white text-ob-blue px-6 py-2.5 hover:shadow-[0_0_20px_rgba(5,5,61,0.4)] hover:-translate-y-0.5 transition-all duration-300 tracking-wider text-sm shadow-md font-semibold whitespace-nowrap shrink-0"
          >
            BESTEL NU
          </button>
        </div>`;

code = code.replace(oldNav, newNav);
fs.writeFileSync('src/components/Navbar.tsx', code);
