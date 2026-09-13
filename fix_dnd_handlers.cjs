const fs = require('fs');
let code = fs.readFileSync('src/components/MenuManager.tsx', 'utf8');

const handlers = `
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setProducts((items) => {
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
  };

  const fetchProducts = async () => {`;

code = code.replace(/const fetchProducts = async \(\) => \{/, handlers);

// Change order to 'sort_order' in fetchProducts
code = code.replace(
  /\.order\('created_at', \{ ascending: true \}\)/,
  ".order('sort_order', { ascending: true, nullsFirst: false }).order('created_at', { ascending: true })"
);

fs.writeFileSync('src/components/MenuManager.tsx', code);
