const fs = require('fs');

const file = 'src/components/HowItWorks.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace("import { Building2, ChefHat, Truck } from 'lucide-react';", "import { ShoppingCart, Calendar, HandPlatter } from 'lucide-react';");

code = code.replace('<Building2 size={32} />', '<ShoppingCart size={32} />');
code = code.replace('<ChefHat size={32} />', '<Calendar size={32} />');
code = code.replace('<Truck size={32} />', '<HandPlatter size={32} />');

fs.writeFileSync(file, code);
