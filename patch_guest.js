import fs from 'fs';
let code = fs.readFileSync('src/pages/GuestOrdering.tsx', 'utf8');

code = code.replace(
  "import { Link } from 'react-router-dom';",
  "import { Link, useLocation } from 'react-router-dom';"
);

const stateTarget = `  const [guestAddress, setGuestAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  
  const [deliveryMode, setDeliveryMode] = useState<'zsm' | 'scheduled'>('zsm');`;

const stateReplacement = `  const location = useLocation();
  const initialDeliveryMode = location.state?.deliveryMode === 'scheduled' ? 'scheduled' : 'zsm';

  const [guestAddress, setGuestAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  
  const [deliveryMode, setDeliveryMode] = useState<'zsm' | 'scheduled'>(initialDeliveryMode);`;

if (code.includes(stateTarget)) {
  fs.writeFileSync('src/pages/GuestOrdering.tsx', code.replace(stateTarget, stateReplacement));
  console.log("Patched GuestOrdering");
} else {
  console.log("Failed to patch GuestOrdering");
}
