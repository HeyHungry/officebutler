const fs = require('fs');
let code = fs.readFileSync('src/components/MenuManager.tsx', 'utf8');

// The first block got doubled extra_info:
const badBlock = `variants: variantsToSave,
          extra_info: editForm.extra_info || null,
          additional_categories: editForm.additional_categories || [],
          extra_info: editForm.extra_info || null,
          additional_categories: editForm.additional_categories || [],
          sauces: saucesToSave,`;

const goodBlock = `variants: variantsToSave,
          extra_info: editForm.extra_info || null,
          additional_categories: editForm.additional_categories || [],
          sauces: saucesToSave,`;

code = code.replace(badBlock, goodBlock);

// The second block has:
const updateBlock = `portions: portionsToSave,
          variants: variantsToSave,
          sauces: saucesToSave
        }).eq('id', editingId).select();`;

const newUpdateBlock = `portions: portionsToSave,
          variants: variantsToSave,
          extra_info: editForm.extra_info || null,
          additional_categories: editForm.additional_categories || [],
          sauces: saucesToSave
        }).eq('id', editingId).select();`;

code = code.replace(updateBlock, newUpdateBlock);

fs.writeFileSync('src/components/MenuManager.tsx', code);
