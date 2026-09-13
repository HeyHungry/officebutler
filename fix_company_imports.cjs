const fs = require('fs');
let code = fs.readFileSync('src/pages/CompanyDashboard.tsx', 'utf8');

// Ensure Truck and ListOrdered and Loader2 are imported
const oldImport = "import { Building, MapPin, Users, Package, Save, CheckCircle2, Plus, Trash2, Mail, Lock, UserPlus, Eye, EyeOff, ShoppingBag } from 'lucide-react';";
const newImport = "import { Building, MapPin, Users, Package, Save, CheckCircle2, Plus, Trash2, Mail, Lock, UserPlus, Eye, EyeOff, ShoppingBag, ListOrdered, Truck, Loader2 } from 'lucide-react';";

if (code.includes(oldImport)) {
  code = code.replace(oldImport, newImport);
} else {
  // Fallback if the line looks different
  code = code.replace(/import \{([^}]+)\} from 'lucide-react';/, (match, p1) => {
    let newImports = p1;
    if (!newImports.includes('ListOrdered')) newImports += ', ListOrdered';
    if (!newImports.includes('Truck')) newImports += ', Truck';
    if (!newImports.includes('Loader2')) newImports += ', Loader2';
    return `import {${newImports}} from 'lucide-react';`;
  });
}

fs.writeFileSync('src/pages/CompanyDashboard.tsx', code);
