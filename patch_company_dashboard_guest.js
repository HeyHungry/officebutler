import fs from 'fs';

let code = fs.readFileSync('src/pages/CompanyDashboard.tsx', 'utf8');

// 1. Add custom-scrollbar to the table wrapper
code = code.replace(
  'className="w-full max-w-full overflow-x-auto bg-white border border-gray-200 rounded-xl"',
  'className="w-full max-w-full overflow-x-auto custom-scrollbar bg-white border border-gray-200 rounded-xl"'
);

fs.writeFileSync('src/pages/CompanyDashboard.tsx', code);
console.log("Patched CompanyDashboard scrollbar");
