const fs = require('fs');
let code = fs.readFileSync('src/components/MenuManager.tsx', 'utf8');

const oldDelete = `  const handleDelete = async (id: string) => {
    if (!supabase || !window.confirm('Weet je zeker dat je dit product wilt verwijderen?')) return;
    
    try {
      await supabase.from('ob_products').delete().eq('id', id);
      setProducts(products.filter(p => p.id !== id));
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
  };`;

const newDelete = `  const handleDelete = async (id: string) => {
    if (!supabase || !window.confirm('Weet je zeker dat je dit product wilt verwijderen?')) return;
    
    const oldProduct = products.find(p => p.id === id);
    try {
      if (oldProduct) {
        await supabase.from('ob_product_prices').delete().eq('product_name', oldProduct.name);
        await supabase.from('ob_company_assortment').delete().eq('product_name', oldProduct.name);
      }
      await supabase.from('ob_products').delete().eq('id', id);
      setProducts(products.filter(p => p.id !== id));
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
  };`;

if (code.includes("const handleDelete = async (id: string) => {\n    if (!supabase || !window.confirm('Weet je zeker dat je dit product wilt verwijderen?')) return;\n    \n    try {\n      await supabase.from('ob_products').delete().eq('id', id);\n      setProducts(products.filter(p => p.id !== id));\n    } catch (e: any) {\n      alert('Error: ' + e.message);\n    }\n  };")) {
  code = code.replace(oldDelete, newDelete);
} else {
  console.log("Could not find exact match for handleDelete. Appending regex logic.");
  code = code.replace(/const handleDelete = async \(id: string\) => \{[\s\S]*?setProducts\(products\.filter\(p => p\.id !== id\)\);[\s\S]*?\};/, newDelete);
}

fs.writeFileSync('src/components/MenuManager.tsx', code);
