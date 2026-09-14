const fs = require('fs');
let code = fs.readFileSync('src/pages/EmployeeOrdering.tsx', 'utf8');
code = code.replace("\\\\n\\\\n", "\\n\\n");
fs.writeFileSync('src/pages/EmployeeOrdering.tsx', code);

let code2 = fs.readFileSync('src/pages/GuestOrdering.tsx', 'utf8');
code2 = code2.replace("\\\\n\\\\n", "\\n\\n");
fs.writeFileSync('src/pages/GuestOrdering.tsx', code2);
