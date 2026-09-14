const fs = require('fs');
let code = fs.readFileSync('src/components/ModeratorPanel.tsx', 'utf8');

// 1. Add state
code = code.replace("const [activeTab, setActiveTab] = useState<Tab>('store');", "const [activeTab, setActiveTab] = useState<Tab>('store');\n  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);");

// 2. Add ChevronLeft/Right icons to import
code = code.replace("import { X, Lock, CheckCircle2, Check, Clock, Edit2, Info, ChevronDown, Image as ImageIcon, MapPin, Search } from 'lucide-react';", "import { X, Lock, CheckCircle2, Check, Clock, Edit2, Info, ChevronDown, Image as ImageIcon, MapPin, Search, ChevronLeft, ChevronRight } from 'lucide-react';");

// 3. Update sidebar div class
const oldSidebar = `<div className="w-64 bg-gray-50 border-r border-gray-200 shrink-0 overflow-y-auto">`;
const newSidebar = `<div className={\`bg-gray-50 border-r border-gray-200 shrink-0 overflow-y-auto transition-all duration-300 relative \${isSidebarCollapsed ? 'w-16' : 'w-64'}\`}>
                  <button 
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    className="absolute top-4 -right-3 bg-white border border-gray-200 rounded-full p-1 text-gray-500 hover:text-ob-blue z-20 shadow-sm"
                  >
                    {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                  </button>`;
code = code.replace(oldSidebar, newSidebar);

// 4. Update tab buttons to hide text when collapsed
const tabsMapStart = `{tabs.map(tab => (`;
const tabsMapEndRegex = /<span className="truncate">\{tab\.label\}<\/span>\n\s*<\/button>\n\s*\)\)}/m;

code = code.replace(/<span className="truncate">\{tab\.label\}<\/span>/g, "{!isSidebarCollapsed && <span className=\"truncate\">{tab.label}</span>}");

fs.writeFileSync('src/components/ModeratorPanel.tsx', code);
