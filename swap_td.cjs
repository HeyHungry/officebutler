const fs = require('fs');
let code = fs.readFileSync('src/components/MenuManager.tsx', 'utf8');

const statusBlock = code.match(/<td className="px-2 py-2 align-top">\s*\{isCreatingStatus \? \([\s\S]*?<\/select>\s*\)\}\s*<\/td>/)[0];
const portionsBlock = code.match(/<td className="px-2 py-2 align-top">\s*<div className="flex gap-1">[\s\S]*?<\/div>\s*<\/td>/)[0];

const fullMatch = code.match(/<td className="px-2 py-2 align-top">\s*\{isCreatingStatus \? \([\s\S]*?<\/div>\s*<\/td>/)[0];

code = code.replace(fullMatch, portionsBlock + '\n        ' + statusBlock);

fs.writeFileSync('src/components/MenuManager.tsx', code);
