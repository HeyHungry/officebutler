const fs = require('fs');
let code = fs.readFileSync('src/components/ModeratorPanel.tsx', 'utf8');

// Replace the imports to include Truck
code = code.replace(/import \{ LogIn, X, Lock, Store, Users, DollarSign, Building2, CheckCircle2, ChevronRight, ArrowLeft, ShoppingBag, Type \} from 'lucide-react';/, "import { LogIn, X, Lock, Store, Users, DollarSign, Building2, CheckCircle2, ChevronRight, ArrowLeft, ShoppingBag, Type, Truck } from 'lucide-react';");

fs.writeFileSync('src/components/ModeratorPanel.tsx', code);
