const fs = require('fs');
let code = fs.readFileSync('src/pages/EmployeeOrdering.tsx', 'utf8');

const fixBlock = `      const compId = profile.company_id;
      if (!compId || compId === 'null') {
         setError('Geen bedrijf gekoppeld aan dit account.');
         setIsLoading(false);
         return;
      }
      setCompanyId(compId);`;

code = code.replace(/const compId = profile\.company_id;\n      setCompanyId\(compId\);/, fixBlock);
fs.writeFileSync('src/pages/EmployeeOrdering.tsx', code);
