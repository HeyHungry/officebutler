const fs = require('fs');

const files = [
  'src/components/MenuManager.tsx'
];

for (const file of files) {
  let code = fs.readFileSync(file, 'utf8');

  // Add extra_info and additional_categories to ObProduct
  code = code.replace(
    'sort_order?: number;',
    'sort_order?: number;\n  extra_info?: string;\n  additional_categories?: string[];'
  );

  code = code.replace(
    'variants_str?: string;',
    'variants_str?: string;\n  additional_categories_str?: string;'
  );

  fs.writeFileSync(file, code);
}
