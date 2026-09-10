import fs from 'fs';

// Fix ModeratorPanel
let modPanel = fs.readFileSync('src/components/ModeratorPanel.tsx', 'utf8');
modPanel = modPanel.replace(
  "import { LogIn, X, Lock, Store, Users, DollarSign, Building2, CheckCircle2, ChevronRight, ArrowLeft } from 'lucide-react';",
  "import { LogIn, X, Lock, Store, Users, DollarSign, Building2, CheckCircle2, ChevronRight, ArrowLeft, ShoppingBag } from 'lucide-react';"
);
fs.writeFileSync('src/components/ModeratorPanel.tsx', modPanel);

console.log("Fixed imports");
