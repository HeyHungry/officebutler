const fs = require('fs');
['src/pages/EmployeeOrdering.tsx', 'src/pages/GuestOrdering.tsx', 'src/pages/CompanyDashboard.tsx'].forEach(file => {
  let code = fs.readFileSync(file, 'utf8');
  code = code.replace(
    /\.order\('sort_order', \{ ascending: true, nullsFirst: false \}\)(?!\.order\('name')(?!\.order\('created_at')/g,
    ".order('sort_order', { ascending: true, nullsFirst: false }).order('created_at', { ascending: true })"
  );
  fs.writeFileSync(file, code);
});
