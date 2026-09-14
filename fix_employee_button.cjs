const fs = require('fs');
let code = fs.readFileSync('src/pages/EmployeeOrdering.tsx', 'utf8');

code = code.replace(/className="absolute -top-2 -left-2 bg-red-500 text-white text-\[12px\] font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md border-2 border-white hover:bg-red-600 transition-colors z-10"/g,
 'className="absolute -top-2 -left-2 bg-red-500 text-white text-[12px] font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md border-2 border-white hover:bg-red-600 transition-colors z-10 cursor-pointer" role="button"');

fs.writeFileSync('src/pages/EmployeeOrdering.tsx', code);
