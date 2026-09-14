const fs = require('fs');
let code = fs.readFileSync('src/pages/GuestOrdering.tsx', 'utf8');

const newSorting = `
          const cats = Object.keys(grouped).map(key => ({
            title: key,
            items: grouped[key],
            minSortOrder: Math.min(...grouped[key].map((i: any) => i.sort_order || 0))
          }));
          cats.sort((a, b) => a.minSortOrder - b.minSortOrder);
          setCategories(cats);
`;

code = code.replace(
  /const cats = Object\.keys\(grouped\)[\s\S]*?setCategories\(cats\);/,
  newSorting
);

fs.writeFileSync('src/pages/GuestOrdering.tsx', code);
