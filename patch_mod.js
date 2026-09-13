import fs from 'fs';

let code = fs.readFileSync('src/components/ModeratorPanel.tsx', 'utf8');

// Import MenuManager if not imported
if (!code.includes("import { MenuManager }")) {
  code = code.replace(
    "import { motion, AnimatePresence } from 'framer-motion';",
    "import { motion, AnimatePresence } from 'framer-motion';\nimport { MenuManager } from './MenuManager';"
  );
}

// Add state to active tab
code = code.replace(
  "const [activeTab, setActiveTab] = useState<'store' | 'registrations' | 'customers' | 'orders' | 'prices'>('store');",
  "const [activeTab, setActiveTab] = useState<'store' | 'registrations' | 'customers' | 'orders' | 'prices' | 'menu'>('store');"
);

// Add Tab Button
const findPricesTab = `                        className={\`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors shrink-0 md:shrink \${activeTab === 'prices' && !impersonating ? 'bg-[#151f33] text-white' : 'text-gray-600 hover:bg-gray-100'}\`}
                      >
                        <DollarSign size={18} /> Portie Prijzen
                      </button>`;
const replaceMenuTab = `                        className={\`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors shrink-0 md:shrink \${activeTab === 'prices' && !impersonating ? 'bg-[#151f33] text-white' : 'text-gray-600 hover:bg-gray-100'}\`}
                      >
                        <DollarSign size={18} /> Portie Prijzen
                      </button>
                      <button 
                        onClick={() => { setActiveTab('menu'); setImpersonating(null); }}
                        className={\`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors shrink-0 md:shrink \${activeTab === 'menu' && !impersonating ? 'bg-[#151f33] text-white' : 'text-gray-600 hover:bg-gray-100'}\`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m8 17 4 4 4-4"/></svg>
                        <span>Menu & Producten</span>
                      </button>`;
code = code.replace(findPricesTab, replaceMenuTab);

// Add content area
const findPricesContentEnd = `                        <p className="text-xs text-gray-400 mt-2">Laat het veld leeg als de portie niet beschikbaar is.</p>
                      </div>
                    ) : null}`;

const replaceMenuContent = `                        <p className="text-xs text-gray-400 mt-2">Laat het veld leeg als de portie niet beschikbaar is.</p>
                      </div>
                    ) : activeTab === 'menu' ? (
                      <MenuManager />
                    ) : null}`;

code = code.replace(findPricesContentEnd, replaceMenuContent);

fs.writeFileSync('src/components/ModeratorPanel.tsx', code);
console.log("Patched ModeratorPanel to include MenuManager.");
