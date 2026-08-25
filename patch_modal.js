import fs from 'fs';
let code = fs.readFileSync('src/components/OrderModal.tsx', 'utf8');

code = code.replace(
  'const { step, closeModal, openStep2 } = useOrderModal();',
  'const { step, deliveryPref, closeModal, openStep2 } = useOrderModal();'
);

code = code.replace(
  /onClick=\{\(\) => openStep2\(\)\}\s*className="[^"]*"\s*>\s*<div className="[^"]*">\s*<Clock/g,
  'onClick={() => openStep2(\'scheduled\')} className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-ob-blue hover:bg-blue-50 transition-colors text-left group">\n                  <div className="bg-ob-blue/10 p-3 rounded-lg text-ob-blue group-hover:scale-110 transition-transform">\n                    <Clock'
);

code = code.replace(
  'onClick={() => openStep2()}\n                  className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-ob-blue hover:bg-blue-50 transition-colors text-left group"\n                >\n                  <div className="bg-ob-blue/10 p-3 rounded-lg text-ob-blue group-hover:scale-110 transition-transform">\n                    <Zap',
  'onClick={() => openStep2(\'zsm\')}\n                  className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-ob-blue hover:bg-blue-50 transition-colors text-left group"\n                >\n                  <div className="bg-ob-blue/10 p-3 rounded-lg text-ob-blue group-hover:scale-110 transition-transform">\n                    <Zap'
);

code = code.replace(
  'navigate(\'/guest-order\');',
  'navigate(\'/guest-order\', { state: { deliveryMode: deliveryPref } });'
);
code = code.replace(
  'navigate(\'/auth\');',
  'navigate(\'/auth\', { state: { deliveryMode: deliveryPref } });'
);

fs.writeFileSync('src/components/OrderModal.tsx', code);
console.log("Patched Modal");
