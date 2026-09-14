const fs = require('fs');
let code = fs.readFileSync('src/components/MenuManager.tsx', 'utf8');
const oldDecl = `export type ObProduct = {
  id: string;
  name: string;
  category: string;
  image_url: string;
  status: string;
  portions: number[];
  sort_order?: number;
};`;
const newDecl = `export type ObProduct = {
  id: string;
  name: string;
  category: string;
  image_url: string;
  status: string;
  portions: number[];
  sort_order?: number;
  sauces?: string[];
  variants?: string[];
};

export type EditFormState = Partial<ObProduct> & {
  sauces_str?: string;
  variants_str?: string;
};`;
code = code.replace(oldDecl, newDecl);
code = code.replace("useState<Partial<ObProduct>>({})", "useState<EditFormState>({})");

fs.writeFileSync('src/components/MenuManager.tsx', code);
