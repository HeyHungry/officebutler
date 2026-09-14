const fs = require('fs');
let code = fs.readFileSync('src/components/MenuManager.tsx', 'utf8');

code = code.replace(/setEditForm\(\{ status: 'active', portions: \[\], category: '__NEW__' \}\);/, "setEditForm({ status: 'active', portions: [], category: 'Nieuwe Categorie' });");

fs.writeFileSync('src/components/MenuManager.tsx', code);
