const fs = require('fs');
let code = fs.readFileSync('src/components/MenuManager.tsx', 'utf8');

code = code.replace(
  'variants: variantsToSave,',
  'variants: variantsToSave,\n          extra_info: editForm.extra_info || null,\n          additional_categories: editForm.additional_categories || [],'
);

// Do it again because there's an insert and an update block
code = code.replace(
  'variants: variantsToSave,',
  'variants: variantsToSave,\n          extra_info: editForm.extra_info || null,\n          additional_categories: editForm.additional_categories || [],'
);

fs.writeFileSync('src/components/MenuManager.tsx', code);
