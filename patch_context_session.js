import fs from 'fs';
let code = fs.readFileSync('src/contexts/OrderModalContext.tsx', 'utf8');

const target = `  const openStep2 = (pref?: 'zsm' | 'scheduled') => {
    if (pref) setDeliveryPref(pref);
    setStep('step2');
  };`;

const replacement = `  const openStep2 = (pref?: 'zsm' | 'scheduled') => {
    if (pref) {
      setDeliveryPref(pref);
      sessionStorage.setItem('deliveryPref', pref);
    }
    setStep('step2');
  };`;

if (code.includes(target)) {
  fs.writeFileSync('src/contexts/OrderModalContext.tsx', code.replace(target, replacement));
  console.log("Patched Context with sessionStorage");
} else {
  console.log("Target not found in Context");
}
