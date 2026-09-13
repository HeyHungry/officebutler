const fs = require('fs');
let code = fs.readFileSync('src/pages/EmployeeOrdering.tsx', 'utf8');

const lines = code.split('\n');
// Assuming line 57 is index 56
if (lines[56].includes(': productName -> portionSize')) {
  lines.splice(56, 1);
} else {
  console.log('Line 57 is not what we thought:', lines[56]);
}
fs.writeFileSync('src/pages/EmployeeOrdering.tsx', lines.join('\n'));
