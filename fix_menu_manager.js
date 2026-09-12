import fs from 'fs';

let code = fs.readFileSync('src/components/MenuManager.tsx', 'utf8');

// Fix dropdowns by including editForm values in the arrays
code = code.replace(
  "const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));",
  "const categories = Array.from(new Set([...products.map(p => p.category), editForm.category])).filter(Boolean) as string[];"
);

code = code.replace(
  "const statuses = Array.from(new Set([...defaultStatuses, ...products.map(p => p.status).filter(Boolean)]));",
  "const statuses = Array.from(new Set([...defaultStatuses, ...products.map(p => p.status), editForm.status])).filter(Boolean) as string[];"
);

// Fix scrolling issue by limiting the height of the container so the horizontal scrollbar is always visible
code = code.replace(
  "className=\"bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto\"",
  "className=\"bg-white border border-gray-200 rounded-xl shadow-sm overflow-x-auto max-h-[calc(100vh-200px)] overflow-y-auto\""
);

// Make the table header sticky
code = code.replace(
  "<thead className=\"bg-gray-50 border-b border-gray-200\">",
  "<thead className=\"bg-gray-50 border-b border-gray-200 sticky top-0 z-10 shadow-sm\">"
);

fs.writeFileSync('src/components/MenuManager.tsx', code);
console.log("Fixed MenuManager");
