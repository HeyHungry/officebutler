const fs = require('fs');
let code = fs.readFileSync('src/components/ModeratorPanel.tsx', 'utf8');

const targetStr = `                  <button 
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    className="absolute top-4 -right-3 bg-white border border-gray-200 rounded-full p-1 text-gray-500 hover:text-ob-blue z-20 shadow-sm"
                  >
                    {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                  </button>`;

code = code.replace(targetStr, "");
fs.writeFileSync('src/components/ModeratorPanel.tsx', code);
