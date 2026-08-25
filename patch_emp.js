import fs from 'fs';
let code = fs.readFileSync('src/pages/EmployeeOrdering.tsx', 'utf8');

const target = `  const [deliveryMode, setDeliveryMode] = useState<'zsm' | 'scheduled'>('zsm');`;
const replacement = `  const sessionPref = sessionStorage.getItem('deliveryPref');
  const initialDeliveryMode = sessionPref === 'scheduled' ? 'scheduled' : 'zsm';
  const [deliveryMode, setDeliveryMode] = useState<'zsm' | 'scheduled'>(initialDeliveryMode);`;

if (code.includes(target)) {
  fs.writeFileSync('src/pages/EmployeeOrdering.tsx', code.replace(target, replacement));
  console.log("Patched EmployeeOrdering");
} else {
  console.log("Target not found in EmployeeOrdering");
}
