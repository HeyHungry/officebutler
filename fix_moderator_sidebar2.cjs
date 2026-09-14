const fs = require('fs');
let code = fs.readFileSync('src/components/ModeratorPanel.tsx', 'utf8');

code = code.replace(/<div className=\{`bg-gray-50 border-r border-gray-200 shrink-0 overflow-y-auto transition-all duration-300 relative \${isSidebarCollapsed \? 'w-16' \: 'w-64'}`\}>/, "<div className={`bg-gray-50 border-r border-gray-200 shrink-0 overflow-y-auto transition-all duration-300 relative ${isSidebarCollapsed ? 'w-16' : 'w-64'}`} style={{ overflowX: 'visible', overflowY: 'visible' }}>");

fs.writeFileSync('src/components/ModeratorPanel.tsx', code);
