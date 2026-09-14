const fs = require('fs');

// GuestOrdering.tsx
let guestCode = fs.readFileSync('src/pages/GuestOrdering.tsx', 'utf8');
guestCode = guestCode.replace(/if \(item\.status === 'Verborgen' \|\| item\.status === 'Inactief'\) return acc;/, "const st = (item.status || '').toLowerCase();\n            if (['inactive', 'inactief', 'verborgen'].includes(st)) return acc;");
fs.writeFileSync('src/pages/GuestOrdering.tsx', guestCode);

// EmployeeOrdering.tsx
let empCode = fs.readFileSync('src/pages/EmployeeOrdering.tsx', 'utf8');
empCode = empCode.replace(/p\.status !== 'Inactief' && p\.status !== 'Verborgen'/, "!['inactive', 'inactief', 'verborgen'].includes((p.status || '').toLowerCase())");
fs.writeFileSync('src/pages/EmployeeOrdering.tsx', empCode);

