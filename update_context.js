import fs from 'fs';
let code = fs.readFileSync('src/contexts/OrderModalContext.tsx', 'utf8');

const target1 = `interface OrderModalContextType {
  step: OrderModalStep;
  openStep1: () => void;
  openStep2: () => void;
  closeModal: () => void;
}`;

const rep1 = `interface OrderModalContextType {
  step: OrderModalStep;
  deliveryPref: 'zsm' | 'scheduled';
  openStep1: () => void;
  openStep2: (pref?: 'zsm' | 'scheduled') => void;
  closeModal: () => void;
}`;

const target2 = `  const [step, setStep] = useState<OrderModalStep>('none');

  const openStep1 = () => setStep('step1');
  const openStep2 = () => setStep('step2');
  const closeModal = () => setStep('none');`;

const rep2 = `  const [step, setStep] = useState<OrderModalStep>('none');
  const [deliveryPref, setDeliveryPref] = useState<'zsm' | 'scheduled'>('zsm');

  const openStep1 = () => {
    setStep('step1');
  };
  const openStep2 = (pref?: 'zsm' | 'scheduled') => {
    if (pref) setDeliveryPref(pref);
    setStep('step2');
  };
  const closeModal = () => setStep('none');`;

if (code.includes(target1) && code.includes(target2)) {
  code = code.replace(target1, rep1).replace(target2, rep2);
  fs.writeFileSync('src/contexts/OrderModalContext.tsx', code);
  console.log("Patched Context");
} else {
  console.log("Failed to patch Context");
}
