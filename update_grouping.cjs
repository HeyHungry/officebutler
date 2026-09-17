const fs = require('fs');

// GuestOrdering.tsx
let guestCode = fs.readFileSync('src/pages/GuestOrdering.tsx', 'utf8');

guestCode = guestCode.replace(
  'if (!acc[item.category]) acc[item.category] = [];\n            acc[item.category].push(item);\n            return acc;',
  `const itemCats = item.additional_categories && item.additional_categories.length > 0 ? Array.from(new Set([item.category, ...item.additional_categories])) : [item.category || 'Overig'];
            itemCats.forEach(cat => {
              if (!acc[cat]) acc[cat] = [];
              acc[cat].push(item);
            });
            return acc;`
);
fs.writeFileSync('src/pages/GuestOrdering.tsx', guestCode);


// Menu.tsx
let menuCode = fs.readFileSync('src/components/Menu.tsx', 'utf8');

menuCode = menuCode.replace(
  `          if (!acc[item.category]) {
            acc[item.category] = [];
          }
          acc[item.category].push(item);
          return acc;`,
  `          const itemCats = item.additional_categories && item.additional_categories.length > 0 ? Array.from(new Set([item.category, ...item.additional_categories])) : [item.category || 'Overig'];
          itemCats.forEach(cat => {
            if (!acc[cat]) {
              acc[cat] = [];
            }
            acc[cat].push(item);
          });
          return acc;`
);
fs.writeFileSync('src/components/Menu.tsx', menuCode);

