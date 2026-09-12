const fs = require('fs');
let code = fs.readFileSync('src/components/ModeratorPanel.tsx', 'utf8');

const tabButton = `
                      <button 
                        onClick={() => { setActiveTab('content'); setImpersonating(null); }}
                        className={\`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors shrink-0 md:shrink \${activeTab === 'content' && !impersonating ? 'bg-[#151f33] text-white' : 'text-gray-600 hover:bg-gray-100'}\`}
                      >
                        <Type size={18} /> Website Teksten
                      </button>`;

code = code.replace(
  /<Store size=\{18\} \/> Winkel Status\s*<\/button>/,
  `<Store size={18} /> Winkel Status\n                      </button>${tabButton}`
);

code = code.replace(
  /const \[activeTab, setActiveTab\] = useState<([^>]+)>\('menu'\);/,
  (match, p1) => {
    if (!p1.includes("'content'")) {
      return "const [activeTab, setActiveTab] = useState<" + p1 + " | 'content'>('menu');";
    }
    return match;
  }
);

code = code.replace(/import \{ ([^}]+) \} from 'lucide-react';/, (match, p1) => {
  if (!p1.includes('Type')) {
    return "import { " + p1 + ", Type } from 'lucide-react';";
  }
  return match;
});

fs.writeFileSync('src/components/ModeratorPanel.tsx', code);
