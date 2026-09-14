const fs = require('fs');
let code = fs.readFileSync('src/components/ModeratorPanel.tsx', 'utf8');

code = code.replace("import { LogIn, X, Lock, Store, Users, DollarSign, Building2, CheckCircle2, ChevronRight, ArrowLeft, ShoppingBag, Type, Truck } from 'lucide-react';", "import { LogIn, X, Lock, Store, Users, DollarSign, Building2, CheckCircle2, ChevronRight, ChevronLeft, ArrowLeft, ShoppingBag, Type, Truck } from 'lucide-react';");

fs.writeFileSync('src/components/ModeratorPanel.tsx', code);
