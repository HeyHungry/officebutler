const fs = require('fs');
let code = fs.readFileSync('src/components/Menu.tsx', 'utf8');

const newSorting = `
        const categoriesArray = Object.keys(grouped).map(key => ({
          title: key,
          items: grouped[key],
          minSortOrder: Math.min(...grouped[key].map((i: any) => i.sort_order || 0))
        }));
        
        categoriesArray.sort((a, b) => a.minSortOrder - b.minSortOrder);
`;

code = code.replace(
  /const categoriesArray = Object\.keys\(grouped\)[\s\S]*?categoriesArray\.sort\([\s\S]*?\}\);/,
  newSorting
);

fs.writeFileSync('src/components/Menu.tsx', code);
