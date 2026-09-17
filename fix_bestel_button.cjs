const fs = require('fs');

let code = fs.readFileSync('src/components/Hero.tsx', 'utf8');

const oldButton = `<button onClick={() => window.location.href = '/guest-order'} className="font-serif group bg-white text-ob-blue px-10 py-5 flex items-center gap-3 hover:shadow-[0_0_20px_rgba(5,5,61,0.5)] hover:-translate-y-1 transition-all duration-300 shadow-lg w-full sm:w-auto justify-center rounded-xl">
                <span className="font-serif tracking-widest uppercase text-base font-bold" style={{ fontSize: content?.hero_btn_order_size ? \`calc(\${String(content.hero_btn_order_size).replace(/[^0-9]/g,'')} / 100 * 1em)\` : undefined }}>{content?.hero_btn_order || "Bestel nu"}</span>
                <ArrowRight size={20} className="font-serif group-hover:translate-x-1 transition-transform" />
              </button>`;

const newButton = `<button onClick={() => window.location.href = '/guest-order'} className="font-serif group bg-white text-ob-blue px-8 py-4 flex items-center gap-3 hover:shadow-[0_0_20px_rgba(5,5,61,0.5)] hover:-translate-y-1 transition-all duration-300 shadow-lg w-full sm:w-auto justify-center">
                <span className="font-serif tracking-widest uppercase text-sm font-semibold" style={{ fontSize: content?.hero_btn_order_size ? \`calc(\${String(content.hero_btn_order_size).replace(/[^0-9]/g,'')} / 100 * 1em)\` : undefined }}>{content?.hero_btn_order || "Bestel nu"}</span>
                <ArrowRight size={18} className="font-serif group-hover:translate-x-1 transition-transform" />
              </button>`;

code = code.replace(oldButton, newButton);
fs.writeFileSync('src/components/Hero.tsx', code);
