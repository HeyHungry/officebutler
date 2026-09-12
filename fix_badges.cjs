const fs = require('fs');

const blueBadge = "bg-ob-blue text-white shadow-md";

// 1. Menu.tsx
let menuCode = fs.readFileSync('src/components/Menu.tsx', 'utf8');
menuCode = menuCode.replace(
  /'bg-ob-blue\/10 text-ob-blue'/g,
  `'${blueBadge}'`
);
fs.writeFileSync('src/components/Menu.tsx', menuCode);

// 2. GuestOrdering.tsx
let guestCode = fs.readFileSync('src/pages/GuestOrdering.tsx', 'utf8');
guestCode = guestCode.replace(
  /'bg-ob-blue\/10 text-ob-blue'/g,
  `'${blueBadge}'`
);
// Make the buttons lift on hover
guestCode = guestCode.replace(
  /'bg-white text-gray-600 border-gray-200 hover:border-ob-blue'/g,
  "'bg-white text-gray-600 border-gray-200 hover:border-ob-blue hover:-translate-y-1 hover:shadow-md transition-all'"
);
// Also the order button
guestCode = guestCode.replace(
  /className="w-full bg-ob-blue text-white py-4 rounded-xl font-bold text-lg hover:bg-ob-blue-dark transition-colors flex items-center justify-center gap-3"/g,
  'className="w-full bg-ob-blue text-white py-4 rounded-xl font-bold text-lg hover:bg-ob-blue-dark hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"'
);
fs.writeFileSync('src/pages/GuestOrdering.tsx', guestCode);

// 3. EmployeeOrdering.tsx
let empCode = fs.readFileSync('src/pages/EmployeeOrdering.tsx', 'utf8');
empCode = empCode.replace(
  /'bg-ob-blue\/10 text-ob-blue'/g,
  `'${blueBadge}'`
);
// Improve button hovers
empCode = empCode.replace(
  /'border-gray-200 hover:border-ob-blue text-gray-700 bg-white'/g,
  "'border-gray-200 hover:border-ob-blue hover:-translate-y-1 hover:shadow-md text-gray-700 bg-white transition-all'"
);
empCode = empCode.replace(
  /className="w-full bg-ob-blue text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-ob-blue-dark transition-colors flex justify-center items-center gap-2"/g,
  'className="w-full bg-ob-blue text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-ob-blue-dark hover:-translate-y-1 hover:shadow-xl transition-all duration-300 flex justify-center items-center gap-2"'
);
fs.writeFileSync('src/pages/EmployeeOrdering.tsx', empCode);

console.log('Badges and some buttons updated');
