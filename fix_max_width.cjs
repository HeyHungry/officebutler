const fs = require('fs');

// 1. MenuManager.tsx
let menuCode = fs.readFileSync('src/components/MenuManager.tsx', 'utf8');
menuCode = menuCode.replace('className="space-y-6 max-w-5xl"', 'className="space-y-6 w-full max-w-7xl"');
fs.writeFileSync('src/components/MenuManager.tsx', menuCode);

// 2. ModeratorPanel.tsx
let modCode = fs.readFileSync('src/components/ModeratorPanel.tsx', 'utf8');
// 'Aanmeldingen' tab
modCode = modCode.replace('className="space-y-6 max-w-4xl"', 'className="space-y-6 w-full max-w-7xl"');
// 'Klanten' tab
modCode = modCode.replace('className="space-y-6 max-w-4xl"', 'className="space-y-6 w-full max-w-7xl"');
// 'Prijzen' tab
modCode = modCode.replace('className="space-y-6 max-w-2xl"', 'className="space-y-6 w-full max-w-6xl"');

fs.writeFileSync('src/components/ModeratorPanel.tsx', modCode);

