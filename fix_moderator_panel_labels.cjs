const fs = require('fs');

let code = fs.readFileSync('src/components/ModeratorPanel.tsx', 'utf8');

code = code.replace(/Grootte \(bijv\. [a-zA-Z0-9]+\)/g, 'Schaal (bijv. 120%)');
code = code.replace(/placeholder="px\/rem"/g, 'placeholder="%"');

fs.writeFileSync('src/components/ModeratorPanel.tsx', code);
