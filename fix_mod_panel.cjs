const fs = require('fs');
let code = fs.readFileSync('src/components/ModeratorPanel.tsx', 'utf8');

// Add import
code = code.replace(/import \{ MenuManager \} from '\.\/MenuManager';/, "import { MenuManager } from './MenuManager';\nimport { DeliveryOptionsManager } from './DeliveryOptionsManager';");
code = code.replace(/import \{ Link \} from 'lucide-react';/, "import { Link, Truck } from 'lucide-react';"); // Add Truck icon

// Add menu item
const newMenuItem = `                      <button
                        onClick={() => setActiveTab('delivery')}
                        className={\`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors shrink-0 md:shrink \${activeTab === 'delivery' && !impersonating ? 'bg-[#151f33] text-white' : 'text-gray-600 hover:bg-gray-100'}\`}
                      >
                        <Truck size={18} />
                        <span>Bezorgopties</span>
                      </button>
                      <button`;

code = code.replace(/<button\s+onClick=\{\(\) => setActiveTab\('menu'\)\}/, newMenuItem);

// Add component render
const newRender = `                    ) : activeTab === 'menu' ? (
                      <MenuManager />
                    ) : activeTab === 'delivery' ? (
                      <DeliveryOptionsManager />
                    ) : null}`;

code = code.replace(/\) : activeTab === 'menu' \? \([\s\S]*?<MenuManager \/>[\s\S]*?\) : null\}/, newRender);

fs.writeFileSync('src/components/ModeratorPanel.tsx', code);
