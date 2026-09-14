const fs = require('fs');
let code = fs.readFileSync('src/pages/EmployeeOrdering.tsx', 'utf8');

code = code.replace(/export function EmployeeOrdering\(\) {/, `export function EmployeeOrdering() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);`);
fs.writeFileSync('src/pages/EmployeeOrdering.tsx', code);
