const fs = require('fs');

function revertFile(file) {
  let code = fs.readFileSync(file, 'utf8');

  // Find the new select class and replace it with the old one
  const currentSelect = `className="w-full text-sm border-2 border-gray-200 rounded-full shadow-sm focus:border-ob-blue focus:ring-0 py-2 px-4 bg-white text-[#05053D] font-bold cursor-pointer hover:border-gray-300 transition-colors"`;
  const oldSelect = `className="w-full text-[13px] border border-gray-300 rounded-lg shadow-sm focus:border-ob-blue focus:ring-1 focus:ring-ob-blue py-1.5 px-3 bg-white text-[#05053D] font-semibold cursor-pointer"`;
                                  
  code = code.replace(new RegExp(currentSelect.replace(/[.*+?^$\\{\\}()|[\\]\\\\]/g, '\\\\$&'), 'g'), oldSelect);
  
  fs.writeFileSync(file, code);
}

revertFile('src/pages/GuestOrdering.tsx');
revertFile('src/pages/EmployeeOrdering.tsx');

