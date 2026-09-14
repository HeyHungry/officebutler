const fs = require('fs');
let code = fs.readFileSync('src/components/MenuManager.tsx', 'utf8');

const oldDragEnd = code.match(/const handleDragEnd = async \(event: any\) => \{[\s\S]*?    \}\n  \};/)[0];

const newDragEnd = `const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id !== over.id) {
      setProducts((items) => {
        const activeItem = items.find(i => i.id === active.id);
        const overItem = items.find(i => i.id === over.id);
        
        if (!activeItem || !overItem) return items;
        if (activeItem.category !== overItem.category) return items; // Prevent cross-category drag for now
        
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Optimistically update sort_order in UI
        const updatedItems = newItems.map((item, index) => ({ ...item, sort_order: index }));
        
        // Save to DB in background
        if (supabase) {
          Promise.all(updatedItems.map(item => 
            supabase.from('ob_products').update({ sort_order: item.sort_order }).eq('id', item.id)
          )).catch(err => console.error("Error updating sort order:", err));
        }
        
        return updatedItems;
      });
    }
  };`;

code = code.replace(oldDragEnd, newDragEnd);
fs.writeFileSync('src/components/MenuManager.tsx', code);
