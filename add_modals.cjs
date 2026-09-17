const fs = require('fs');

// GuestOrdering.tsx
let guest = fs.readFileSync('src/pages/GuestOrdering.tsx', 'utf8');
guest = guest.replace(
  'const [error, setError] = useState(\'\');',
  'const [error, setError] = useState(\'\');\n  const [infoModalProduct, setInfoModalProduct] = useState<any>(null);'
);

const imgDivSearch = `<div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-100">
                                <img src={item.image_url || item.image} alt={product} className="w-full h-full object-cover" />
                              </div>`;
                              
const imgDivReplace = `<div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-100 border border-gray-100 relative group" onClick={() => item.extra_info && setInfoModalProduct(item)}>
                                <img src={item.image_url || item.image} alt={product} className="w-full h-full object-cover" />
                                {item.extra_info && (
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <span className="text-white text-xs font-semibold">Meer info</span>
                                  </div>
                                )}
                              </div>`;
                              
guest = guest.replace(imgDivSearch, imgDivReplace);

const modalContent = `
      {infoModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setInfoModalProduct(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setInfoModalProduct(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900"><X size={20} /></button>
            <h3 className="text-2xl font-serif font-bold text-ob-blue mb-4 pr-6">{infoModalProduct.name}</h3>
            <div className="text-gray-600 whitespace-pre-wrap">{infoModalProduct.extra_info}</div>
          </div>
        </div>
      )}
    </div>
  );`;
  
guest = guest.replace('    </div>\n  );\n}\n', modalContent + '\n}\n');
fs.writeFileSync('src/pages/GuestOrdering.tsx', guest);


// Menu.tsx
let menu = fs.readFileSync('src/components/Menu.tsx', 'utf8');
menu = menu.replace(
  'const [isLoading, setIsLoading] = useState(true);',
  'const [isLoading, setIsLoading] = useState(true);\n  const [infoModalProduct, setInfoModalProduct] = useState<any>(null);'
);

const menuImgSearch = `<div className="font-serif w-16 h-16 shrink-0 overflow-hidden bg-white shadow-sm p-1 rounded-sm relative">
                              {item.image_url ? (
                                <img 
                                  src={item.image_url} 
                                  alt={item.name}
                                  className="font-serif w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                  loading="lazy"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="font-serif w-full h-full bg-ob-cream flex items-center justify-center text-ob-blue/20">
                                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                </div>
                              )}
                            </div>`;

const menuImgReplace = `<div className="font-serif w-16 h-16 shrink-0 overflow-hidden bg-white shadow-sm p-1 rounded-sm relative group" onClick={() => item.extra_info && setInfoModalProduct(item)}>
                              {item.image_url ? (
                                <img 
                                  src={item.image_url} 
                                  alt={item.name}
                                  className="font-serif w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                  loading="lazy"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="font-serif w-full h-full bg-ob-cream flex items-center justify-center text-ob-blue/20">
                                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                </div>
                              )}
                              {item.extra_info && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                  <span className="text-white text-[10px] font-semibold text-center leading-tight px-1">Meer<br/>info</span>
                                </div>
                              )}
                            </div>`;

menu = menu.replace(menuImgSearch, menuImgReplace);

const menuModalContent = `
      {infoModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setInfoModalProduct(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setInfoModalProduct(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>
            </button>
            <h3 className="text-2xl font-serif font-bold text-ob-blue mb-4 pr-6">{infoModalProduct.name}</h3>
            <div className="text-gray-600 whitespace-pre-wrap">{infoModalProduct.extra_info}</div>
          </div>
        </div>
      )}
    </section>
  );`;
  
menu = menu.replace('    </section>\n  );\n}\n', menuModalContent + '\n}\n');

fs.writeFileSync('src/components/Menu.tsx', menu);

