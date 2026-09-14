const fs = require('fs');
let code = fs.readFileSync('src/components/ModeratorPanel.tsx', 'utf8');

const oldHeader = `<h2 className="text-2xl font-serif font-semibold text-[#05053D]">Moderator Paneel</h2>`;
const newHeader = `<div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors"
                >
                  {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
                <h2 className="text-2xl font-serif font-semibold text-[#05053D]">Moderator Paneel</h2>
              </div>`;

code = code.replace(oldHeader, newHeader);
fs.writeFileSync('src/components/ModeratorPanel.tsx', code);
