import fs from 'fs';
let code = fs.readFileSync('src/pages/GuestOrdering.tsx', 'utf8');

const target = `  const initialDeliveryMode = location.state?.deliveryMode === 'scheduled' ? 'scheduled' : 'zsm';`;
const replacement = `  const sessionPref = sessionStorage.getItem('deliveryPref');
  const initialDeliveryMode = (location.state?.deliveryMode === 'scheduled' || sessionPref === 'scheduled') ? 'scheduled' : 'zsm';`;

if (code.includes(target)) {
  fs.writeFileSync('src/pages/GuestOrdering.tsx', code.replace(target, replacement));
  console.log("Patched GuestOrdering for sessionStorage");
} else {
  console.log("Target not found in GuestOrdering");
}
