const fs = require('fs');
let code = fs.readFileSync('src/pages/EmployeeOrdering.tsx', 'utf8');

code = code.replace(/\}\);\s*\}\);\s*\}\);\s*const results = await Promise\.all\(orderPromises\);/, `});
        });
        
        const results = await Promise.all(orderPromises);`);

fs.writeFileSync('src/pages/EmployeeOrdering.tsx', code);
