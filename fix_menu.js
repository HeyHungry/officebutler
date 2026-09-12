const fs = require('fs');

let code = fs.readFileSync('src/components/Menu.tsx', 'utf8');

// The problematic lines:
/*
                          <div key={item.name}
                                {item.status && !["Actief", "Inactief", "Verborgen", "Uitverkocht"].includes(item.status) && (
                                  <span className="text-[10px] uppercase tracking-wider bg-ob-blue/10 text-ob-blue px-2 py-0.5 rounded-full font-bold ml-2 shrink-0">{item.status}</span>
                                )} className="font-serif flex items-center gap-4 group cursor-pointer border-b border-black/5 pb-4 last:border-0 last:pb-0">
*/

code = code.replace(
  /<div key=\{item.name\}[^>]+className="font-serif flex items-center gap-4 group cursor-pointer border-b border-black\/5 pb-4 last:border-0 last:pb-0">/g,
  '<div key={item.name} className="font-serif flex items-center gap-4 group cursor-pointer border-b border-black/5 pb-4 last:border-0 last:pb-0">'
);

code = code.replace(
  /<img\s+src=\{item\.image_url\}\s+alt=\{item\.name\}[^>]+className="font-serif w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"/g,
  '<img src={item.image_url} alt={item.name} className="font-serif w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"'
);

fs.writeFileSync('src/components/Menu.tsx', code);
console.log('Fixed');
