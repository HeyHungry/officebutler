const fs = require('fs');

const file = 'src/components/HowItWorks.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace("import { ShoppingCart, Calendar, HandPlatter } from 'lucide-react';", "import { ShoppingCart, Calendar, ConciergeBell } from 'lucide-react';");

code = code.replace('<HandPlatter size={32} />', '<ConciergeBell size={32} />');

fs.writeFileSync(file, code);
