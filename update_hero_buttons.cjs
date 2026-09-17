const fs = require('fs');

let code = fs.readFileSync('src/components/Hero.tsx', 'utf8');

// Bestel nu button - add border border-transparent
const searchOrder = `className="font-serif group bg-white text-ob-blue px-8 py-4 flex items-center gap-3 hover:shadow-[0_0_20px_rgba(5,5,61,0.5)] hover:-translate-y-1 transition-all duration-300 shadow-lg w-full sm:w-auto justify-center"`;
const replaceOrder = `className="font-serif group bg-white text-ob-blue border border-transparent px-8 py-4 flex items-center gap-3 hover:shadow-[0_0_20px_rgba(5,5,61,0.5)] hover:-translate-y-1 transition-all duration-300 shadow-lg w-full sm:w-auto justify-center h-[56px]"`;

code = code.replace(searchOrder, replaceOrder);

// Bekijk aanbod button - ensure identical height if needed
const searchOffer = `className="font-serif group border border-white/50 text-white px-8 py-4 flex items-center gap-3 hover:bg-white hover:text-ob-blue hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto justify-center"`;
const replaceOffer = `className="font-serif group border border-white/50 text-white px-8 py-4 flex items-center gap-3 hover:bg-white hover:text-ob-blue hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto justify-center h-[56px]"`;

code = code.replace(searchOffer, replaceOffer);

fs.writeFileSync('src/components/Hero.tsx', code);
