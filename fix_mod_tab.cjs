const fs = require('fs');
let code = fs.readFileSync('src/components/ModeratorPanel.tsx', 'utf8');

const newMenuItem = `                      <button
                        onClick={() => { setActiveTab('delivery'); setImpersonating(null); }}
                        className={\`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors shrink-0 md:shrink \${activeTab === 'delivery' && !impersonating ? 'bg-[#151f33] text-white' : 'text-gray-600 hover:bg-gray-100'}\`}
                      >
                        <Truck size={18} />
                        <span>Bezorgopties</span>
                      </button>
                    </nav>`;

code = code.replace(/<\/button>\n\s*<\/nav>/, "</button>\n" + newMenuItem);

fs.writeFileSync('src/components/ModeratorPanel.tsx', code);
