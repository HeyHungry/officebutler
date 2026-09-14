const fs = require('fs');
let code = fs.readFileSync('src/components/MenuManager.tsx', 'utf8');

const oldSave = `    const variantsToSave = editForm.variants_str !== undefined 
      ? editForm.variants_str.split(',').map(s => s.trim()).filter(Boolean) 
      : (editForm.variants || []);
    const saucesToSave = editForm.sauces_str !== undefined 
      ? editForm.sauces_str.split(',').map(s => s.trim()).filter(Boolean) 
      : (editForm.sauces || []);`;

const newSave = `    const variantsToSave = editForm.variants || [];
    const saucesToSave = editForm.sauces || [];`;

code = code.replace(oldSave, newSave);
fs.writeFileSync('src/components/MenuManager.tsx', code);
