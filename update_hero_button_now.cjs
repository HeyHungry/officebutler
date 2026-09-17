const fs = require('fs');
let code = fs.readFileSync('src/components/Hero.tsx', 'utf8');

// Use regex to match the buttons container and its contents more flexibly
const regex = /<div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto justify-center">[\s\S]*?<button onClick=\{\(\) => openStep2\('scheduled'\)[\s\S]*?<\/button>[\s\S]*?<button onClick=\{\(\) => openStep2\('zsm'\)[\s\S]*?<\/button>[\s\S]*?<\/div>/;

const replace = `<div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto justify-center">
              <button onClick={() => window.location.href = '/guest-order'} className="font-serif group bg-white text-ob-blue px-10 py-5 flex items-center gap-3 hover:shadow-[0_0_20px_rgba(5,5,61,0.5)] hover:-translate-y-1 transition-all duration-300 shadow-lg w-full sm:w-auto justify-center rounded-xl">
                <span className="font-serif tracking-widest uppercase text-base font-bold" style={{ fontSize: content?.hero_btn_order_size }}>{content?.hero_btn_order || "Bestel nu"}</span>
                <ArrowRight size={20} className="font-serif group-hover:translate-x-1 transition-transform" />
              </button>
            </div>`;

code = code.replace(regex, replace);
fs.writeFileSync('src/components/Hero.tsx', code);
