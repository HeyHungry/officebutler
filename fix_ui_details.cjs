const fs = require('fs');

function fixFile(file) {
  let code = fs.readFileSync(file, 'utf8');

  // Fix sauces
  const oldSauces = `{item.sauces && item.sauces.length > 0 && (
                                  <p className="text-[11px] text-gray-500 font-medium flex items-center gap-1 mt-auto">
                                    <span className="text-[#d4af37]">✦</span> 
                                    <span>Inclusief: <span className="font-semibold text-gray-700">{item.sauces.join(', ')}</span></span>
                                  </p>
                                )}`;
  const newSauces = `{item.sauces && item.sauces.length > 0 && (
                                  <div className="mt-auto inline-flex items-start gap-1.5 bg-yellow-50/40 border border-yellow-100/50 px-2.5 py-1.5 rounded-lg w-fit">
                                    <span className="text-[#d4af37] text-sm leading-none mt-0.5">✦</span> 
                                    <span className="text-xs text-gray-600 font-medium leading-tight">Inclusief: <span className="font-bold text-gray-900">{item.sauces.join(', ')}</span></span>
                                  </div>
                                )}`;
                                
  code = code.replace(oldSauces, newSauces);

  // Fix dropdown
  const oldSelect = `<select 
                                  className="w-full text-[13px] border border-gray-300 rounded-lg shadow-sm focus:border-ob-blue focus:ring-1 focus:ring-ob-blue py-1.5 px-3 bg-white text-[#05053D] font-semibold cursor-pointer"`;
  const newSelect = `<select 
                                  className="w-full text-sm border-2 border-gray-200 rounded-full shadow-sm focus:border-ob-blue focus:ring-0 py-2 px-4 bg-white text-[#05053D] font-bold cursor-pointer hover:border-gray-300 transition-colors"`;
                                  
  code = code.replace(oldSelect, newSelect);
  
  fs.writeFileSync(file, code);
}

fixFile('src/pages/GuestOrdering.tsx');
fixFile('src/pages/EmployeeOrdering.tsx');

