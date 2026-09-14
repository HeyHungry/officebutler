const fs = require('fs');
let code = fs.readFileSync('src/components/MenuManager.tsx', 'utf8');

const targetStr = `  const categoryList = Object.keys(grouped).map(key => ({
    title: key,
    minSortOrder: Math.min(...grouped[key].map(i => i.sort_order || 0)),
    items: grouped[key].sort((a,b) => (a.sort_order || 0) - (b.sort_order || 0))
  }));
  categoryList.sort((a,b) => a.minSortOrder - b.minSortOrder);`;

const newStr = `  const categoryList = Object.keys(grouped).map(key => ({
    title: key,
    minSortOrder: Math.min(...grouped[key].map(i => i.sort_order || 0)),
    items: grouped[key].sort((a,b) => (a.sort_order || 0) - (b.sort_order || 0))
  }));
  categoryList.sort((a,b) => a.minSortOrder - b.minSortOrder);
  
  // Ensure the currently edited new category is rendered so the edit row doesn't vanish
  if (editingId === 'new' && editForm.category && !categoryList.find(c => c.title === editForm.category)) {
    categoryList.push({
      title: editForm.category,
      minSortOrder: 9999,
      items: []
    });
  }`;

code = code.replace(targetStr, newStr);
fs.writeFileSync('src/components/MenuManager.tsx', code);
