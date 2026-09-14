const fs = require('fs');
let code = fs.readFileSync('src/components/MenuManager.tsx', 'utf8');

const targetSaveStart = code.indexOf('const portionsToSave');
const targetSaveEnd = code.indexOf('portions: portionsToSave,') + 25; // in insert block

const oldBlock = `    const portionsToSave = (editForm.portions || []).filter(n => n > 0);
    const categoryToSave = isCreatingCategory && newCategory ? newCategory : editForm.category;
    const statusToSave = isCreatingStatus && newStatus ? newStatus : (editForm.status || 'active');

    try {
      if (editingId === 'new') {
        const { data, error } = await supabase.from('ob_products').insert({
          name: editForm.name,
          category: categoryToSave,
          image_url: editForm.image_url || '',
          status: statusToSave,
          portions: portionsToSave,`;

const newBlock = `    const portionsToSave = (editForm.portions || []).filter(n => n > 0);
    const categoryToSave = isCreatingCategory && newCategory ? newCategory : editForm.category;
    const statusToSave = isCreatingStatus && newStatus ? newStatus : (editForm.status || 'active');

    const variantsToSave = editForm.variants_str !== undefined 
      ? editForm.variants_str.split(',').map(s => s.trim()).filter(Boolean) 
      : (editForm.variants || []);
    const saucesToSave = editForm.sauces_str !== undefined 
      ? editForm.sauces_str.split(',').map(s => s.trim()).filter(Boolean) 
      : (editForm.sauces || []);

    try {
      if (editingId === 'new') {
        const { data, error } = await supabase.from('ob_products').insert({
          name: editForm.name,
          category: categoryToSave,
          image_url: editForm.image_url || '',
          status: statusToSave,
          portions: portionsToSave,
          variants: variantsToSave,
          sauces: saucesToSave,`;

code = code.replace(oldBlock, newBlock);

// Do the same for update block
const oldUpdate = `          status: statusToSave,
          portions: portionsToSave
        }).eq('id', editingId).select();`;

const newUpdate = `          status: statusToSave,
          portions: portionsToSave,
          variants: variantsToSave,
          sauces: saucesToSave
        }).eq('id', editingId).select();`;
code = code.replace(oldUpdate, newUpdate);

fs.writeFileSync('src/components/MenuManager.tsx', code);
