const fs = require('fs');
let code = fs.readFileSync('src/components/MenuManager.tsx', 'utf8');

const oldSave = `      } else {
        const { data, error } = await supabase.from('ob_products').update({
          name: editForm.name,
          category: categoryToSave,
          image_url: editForm.image_url,
          status: statusToSave,
          portions: portionsToSave
        }).eq('id', editingId).select();
        if (error) { alert('Error: ' + error.message); }
        if (data) {
          setProducts(products.map(p => p.id === editingId ? data[0] : p));
        }
      }`;

const newSave = `      } else {
        const oldProduct = products.find(p => p.id === editingId);
        const oldName = oldProduct?.name;

        const { data, error } = await supabase.from('ob_products').update({
          name: editForm.name,
          category: categoryToSave,
          image_url: editForm.image_url,
          status: statusToSave,
          portions: portionsToSave
        }).eq('id', editingId).select();
        if (error) { alert('Error: ' + error.message); }
        if (data) {
          if (oldName && oldName !== editForm.name) {
             await supabase.from('ob_product_prices').update({ product_name: editForm.name }).eq('product_name', oldName);
             await supabase.from('ob_company_assortment').update({ product_name: editForm.name }).eq('product_name', oldName);
          }
          setProducts(products.map(p => p.id === editingId ? data[0] : p));
        }
      }`;

code = code.replace(oldSave, newSave);

fs.writeFileSync('src/components/MenuManager.tsx', code);
