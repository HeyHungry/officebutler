import fs from 'fs';
let code = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

if (!code.includes('useOrderModal')) {
  code = code.replace(
    "import { StoreSettings } from '../lib/supabase';",
    "import { StoreSettings } from '../lib/supabase';\nimport { useOrderModal } from '../contexts/OrderModalContext';"
  );
}

// Add the hook call inside the component
if (!code.includes('const { openStep1 } = useOrderModal();')) {
  code = code.replace(
    'export function Navbar({ storeSettings }: { storeSettings?: StoreSettings }) {',
    'export function Navbar({ storeSettings }: { storeSettings?: StoreSettings }) {\n  const { openStep1 } = useOrderModal();'
  );
  
  // also try the other possible signature just in case it's slightly different
  code = code.replace(
    'export function Navbar({ storeSettings }: { storeSettings: StoreSettings | null }) {',
    'export function Navbar({ storeSettings }: { storeSettings: StoreSettings | null }) {\n  const { openStep1 } = useOrderModal();'
  );
}

fs.writeFileSync('src/components/Navbar.tsx', code);
