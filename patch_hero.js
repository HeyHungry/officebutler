import fs from 'fs';
let code = fs.readFileSync('src/components/Hero.tsx', 'utf8');

code = code.replace(
  '<button onClick={openStep2} className="font-serif group bg-white text-ob-blue px-8 py-4 flex items-center gap-3 hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl w-full sm:w-auto justify-center"><span className="font-serif tracking-widest uppercase text-sm font-semibold">Bestel vooraf</span>',
  '<button onClick={() => openStep2(\'scheduled\')} className="font-serif group bg-white text-ob-blue px-8 py-4 flex items-center gap-3 hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl w-full sm:w-auto justify-center"><span className="font-serif tracking-widest uppercase text-sm font-semibold">Bestel vooraf</span>'
).replace(
  '<button onClick={openStep2} className="font-serif group bg-white text-ob-blue px-8 py-4 flex items-center gap-3 hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl w-full sm:w-auto justify-center"><span className="font-serif tracking-widest uppercase text-sm font-semibold">Bestel direct</span>',
  '<button onClick={() => openStep2(\'zsm\')} className="font-serif group bg-white text-ob-blue px-8 py-4 flex items-center gap-3 hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl w-full sm:w-auto justify-center"><span className="font-serif tracking-widest uppercase text-sm font-semibold">Bestel direct</span>'
);

fs.writeFileSync('src/components/Hero.tsx', code);
console.log("Patched Hero");
