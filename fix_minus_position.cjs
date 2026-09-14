const fs = require('fs');

const guestFile = 'src/pages/GuestOrdering.tsx';
let guestCode = fs.readFileSync(guestFile, 'utf8');

const oldGuestClass = 'className="absolute -top-2 -left-2 bg-red-500 text-white text-[12px] font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md border-2 border-white hover:bg-red-600 transition-colors z-10 cursor-pointer"';
const newGuestClass = 'className="absolute top-5 -right-2 bg-gray-400 text-white text-[12px] font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md border-2 border-white hover:bg-red-500 transition-colors z-10 cursor-pointer"';

guestCode = guestCode.replace(oldGuestClass, newGuestClass);
fs.writeFileSync(guestFile, guestCode);


const empFile = 'src/pages/EmployeeOrdering.tsx';
let empCode = fs.readFileSync(empFile, 'utf8');

const oldEmpClass = 'className="absolute -top-2 -left-2 bg-red-500 text-white text-[12px] font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md border-2 border-white hover:bg-red-600 transition-colors z-10 cursor-pointer" role="button"';
const newEmpClass = 'className="absolute top-5 -right-2 bg-gray-400 text-white text-[12px] font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md border-2 border-white hover:bg-red-500 transition-colors z-10 cursor-pointer" role="button"';

empCode = empCode.replace(oldEmpClass, newEmpClass);
fs.writeFileSync(empFile, empCode);

