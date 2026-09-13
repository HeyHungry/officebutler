const fs = require('fs');
let code = fs.readFileSync('src/pages/EmployeeOrdering.tsx', 'utf8');

code = code.replace(/: productName -> portionSize/, "");

fs.writeFileSync('src/pages/EmployeeOrdering.tsx', code);
