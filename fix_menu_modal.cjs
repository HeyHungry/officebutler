const fs = require('fs');

let code = fs.readFileSync('src/components/Menu.tsx', 'utf8');

// Update item container to be clickable and trigger the modal if there is extra info.
code = code.replace(
  '<div key={item.name} className="font-serif flex items-center gap-4 group cursor-pointer border-b border-black/5 pb-4 last:border-0 last:pb-0">',
  '<div key={item.name} className="font-serif flex items-center gap-4 group cursor-pointer border-b border-black/5 pb-4 last:border-0 last:pb-0" onClick={() => item.extra_info && setInfoModalProduct(item)}>'
);

// We should also display an indicator that there is more info.
code = code.replace(
  '</h4>',
  '</h4>\n                              {item.extra_info && <span className="text-[10px] uppercase tracking-wider text-ob-blue/60 bg-ob-cream px-2 py-0.5 rounded-full w-fit mt-1 group-hover:bg-ob-blue/10 transition-colors">Meer info</span>}'
);

// Also add the image to the modal
const oldModal = `<div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setInfoModalProduct(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>
            </button>
            <h3 className="text-2xl font-serif font-bold text-ob-blue mb-4 pr-6">{infoModalProduct.name}</h3>
            <div className="text-gray-600 whitespace-pre-wrap">{infoModalProduct.extra_info}</div>
          </div>`;

const newModal = `<div className="bg-white rounded-2xl p-0 max-w-sm w-full shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <button onClick={() => setInfoModalProduct(null)} className="absolute top-4 right-4 text-white bg-black/40 hover:bg-black/60 rounded-full p-1.5 backdrop-blur-sm z-10 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>
            </button>
            
            {infoModalProduct.image_url ? (
               <div className="w-full h-48 sm:h-56 shrink-0 bg-gray-100">
                 <img src={infoModalProduct.image_url} alt={infoModalProduct.name} className="w-full h-full object-cover" />
               </div>
            ) : (
               <div className="w-full h-24 shrink-0 bg-ob-cream flex items-center justify-center">
                 <svg className="w-8 h-8 text-ob-blue/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
               </div>
            )}
            
            <div className="p-6 overflow-y-auto">
              <h3 className="text-2xl font-serif font-bold text-ob-blue mb-4 pr-6">{infoModalProduct.name}</h3>
              <div className="text-gray-600 whitespace-pre-wrap">{infoModalProduct.extra_info}</div>
            </div>
          </div>`;

code = code.replace(oldModal, newModal);
fs.writeFileSync('src/components/Menu.tsx', code);

