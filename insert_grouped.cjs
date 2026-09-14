const fs = require('fs');
let code = fs.readFileSync('src/components/MenuManager.tsx', 'utf8');

const targetStr = `  const categories = Array.from(new Set([...products.map(p => p.category), editForm.category])).filter(Boolean) as string[];`;

const newStr = `  const grouped = products.reduce((acc, item) => {
    const cat = item.category || 'Overig';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, any[]>);

  const categoryList = Object.keys(grouped).map(key => ({
    title: key,
    minSortOrder: Math.min(...grouped[key].map(i => i.sort_order || 0)),
    items: grouped[key].sort((a,b) => (a.sort_order || 0) - (b.sort_order || 0))
  }));
  categoryList.sort((a,b) => a.minSortOrder - b.minSortOrder);

  const moveCategory = (index: number, direction: -1 | 1) => {
    if (index + direction < 0 || index + direction >= categoryList.length) return;
    const newCatList = [...categoryList];
    const temp = newCatList[index];
    newCatList[index] = newCatList[index + direction];
    newCatList[index + direction] = temp;

    let currentSortOrder = 0;
    const updatedProducts: any[] = [];
    for (const cat of newCatList) {
      for (const prod of cat.items) {
        updatedProducts.push({ ...prod, sort_order: currentSortOrder++ });
      }
    }
    setProducts(updatedProducts);
    if (supabase) {
      Promise.all(updatedProducts.map(item => 
        supabase.from('ob_products').update({ sort_order: item.sort_order }).eq('id', item.id)
      )).catch(err => console.error("Error updating sort order:", err));
    }
  };

  const categories = Array.from(new Set([...products.map(p => p.category), editForm.category])).filter(Boolean) as string[];`;

code = code.replace(targetStr, newStr);
fs.writeFileSync('src/components/MenuManager.tsx', code);
