const fs = require('fs');

// GuestOrdering.tsx
let guest = fs.readFileSync('src/pages/GuestOrdering.tsx', 'utf8');

const guestOldTitle = `<h3 className="text-2xl font-serif font-bold text-ob-blue pr-6 mb-2">{infoModalProduct.name}</h3>
                {infoModalProduct.extra_info && <div className="text-gray-600 whitespace-pre-wrap">{infoModalProduct.extra_info}</div>}`;

const guestNewTitle = `<h3 className="text-2xl font-serif font-bold text-ob-blue pr-6 mb-2">{infoModalProduct.name}</h3>
                {infoModalProduct.sauces && infoModalProduct.sauces.length > 0 && (
                  <div className="inline-flex items-start gap-1.5 bg-yellow-50/40 border border-yellow-100/50 px-2.5 py-1.5 rounded-lg w-fit mb-3">
                    <span className="text-[#d4af37] text-sm leading-none mt-0.5">✦</span> 
                    <span className="text-xs text-gray-600 font-medium leading-tight">Inclusief: <span className="font-bold text-gray-900">{infoModalProduct.sauces.join(', ')}</span></span>
                  </div>
                )}
                {infoModalProduct.extra_info && <div className="text-gray-600 whitespace-pre-wrap">{infoModalProduct.extra_info}</div>}`;

guest = guest.replace(guestOldTitle, guestNewTitle);
fs.writeFileSync('src/pages/GuestOrdering.tsx', guest);

// Menu.tsx
let menu = fs.readFileSync('src/components/Menu.tsx', 'utf8');

const menuOldTitle = `<h3 className="text-2xl font-serif font-bold text-ob-blue mb-4 pr-6">{infoModalProduct.name}</h3>
              <div className="text-gray-600 whitespace-pre-wrap">{infoModalProduct.extra_info}</div>`;

const menuNewTitle = `<h3 className="text-2xl font-serif font-bold text-ob-blue mb-2 pr-6">{infoModalProduct.name}</h3>
              {infoModalProduct.sauces && infoModalProduct.sauces.length > 0 && (
                <div className="inline-flex items-start gap-1.5 bg-yellow-50/40 border border-yellow-100/50 px-2.5 py-1.5 rounded-lg w-fit mb-4">
                  <span className="text-[#d4af37] text-sm leading-none mt-0.5">✦</span> 
                  <span className="text-xs text-gray-600 font-medium leading-tight">Inclusief: <span className="font-bold text-gray-900">{infoModalProduct.sauces.join(', ')}</span></span>
                </div>
              )}
              <div className="text-gray-600 whitespace-pre-wrap">{infoModalProduct.extra_info}</div>`;

menu = menu.replace(menuOldTitle, menuNewTitle);
fs.writeFileSync('src/components/Menu.tsx', menu);

