import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Trash2, Edit2, Check, X, Image as ImageIcon, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';


export type ObProduct = {
  id: string;
  name: string;
  category: string;
  image_url: string;
  status: string;
  portions: number[];
  sort_order?: number;
  extra_info?: string;
  additional_categories?: string[];
  sauces?: string[];
  variants?: string[];
  variant_surcharges?: Record<string, number>;
};

export type EditFormState = Partial<ObProduct> & {
  sauces_str?: string;
  variants_str?: string;
  additional_categories_str?: string;
};

function SortableRow({ p, editingId, renderEditRow, handleEdit, handleDelete }: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: p.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    position: 'relative' as 'relative',
  };

  if (editingId === p.id) {
    return (
      <tr ref={setNodeRef} style={style} className="bg-blue-50/50">
        {renderEditRow()}
      </tr>
    );
  }

  return (
    <tr ref={setNodeRef} style={style} className={`hover:bg-gray-50 transition-colors ${isDragging ? 'bg-gray-100 shadow-md' : ''}`}>
      <td className="px-2 py-2 space-x-2 w-24">
        <button {...attributes} {...listeners} className="text-gray-400 hover:text-gray-600 p-1 cursor-grab active:cursor-grabbing"><GripVertical size={16} /></button>
        <button onClick={() => handleEdit(p)} className="text-gray-400 hover:text-blue-600 p-1"><Edit2 size={16} /></button>
        <button onClick={() => handleDelete(p.id)} className="text-gray-400 hover:text-red-600 p-1"><Trash2 size={16} /></button>
      </td>
      <td className="px-2 py-2">
        <div className="flex items-center gap-3">
          {p.image_url ? (
            <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
              <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-md bg-gray-100 shrink-0 border border-gray-200 flex items-center justify-center text-gray-400">
              <ImageIcon size={16} />
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-semibold text-gray-800">{p.name}</span>
            {p.variants && p.variants.length > 0 && <span className="text-[10px] text-gray-500">Varianten: {p.variants.join(', ')}</span>}
            {p.sauces && p.sauces.length > 0 && <span className="text-[10px] text-gray-500">Sauzen: {p.sauces.join(', ')}</span>}
          </div>
        </div>
      </td>
      
      
      <td className="px-2 py-2"><span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-medium">{p.category}</span></td>
      <td className="px-2 py-2"><div className="flex flex-wrap gap-1">{p.portions && p.portions.map((port: number) => (<span key={port} className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-xs font-medium">{port} st.</span>))}</div></td>
      <td className="px-2 py-2">
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${['uitverkocht', 'verborgen', 'sold_out', 'inactive', 'inactief'].includes((p.status || '').toLowerCase()) ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {p.status === 'inactive' ? 'Verborgen' : 
           p.status === 'sold_out' ? 'Uitverkocht' : 
           p.status === 'coming_soon' ? 'Binnenkort' : 
           p.status === 'new' ? 'Nieuw' : 
           p.status === 'popular' ? 'Populair' : 
           p.status === 'active' ? 'Actief' : (p.status || 'Actief')}
        </span>
      </td>
    </tr>

  );
}


export function MenuManager() {
  const [products, setProducts] = useState<ObProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditFormState>({});

  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  
  const [isCreatingStatus, setIsCreatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: any) => {
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
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    if (!supabase) return;
    try {
      const { data, error } = await supabase.from('ob_products').select('*').order('sort_order', { ascending: true, nullsFirst: false }).order('created_at', { ascending: true });
      if (data) setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const grouped = products.reduce((acc, item) => {
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
  
  // Ensure the currently edited new category is rendered so the edit row doesn't vanish
  if (editingId === 'new' && editForm.category && !categoryList.find(c => c.title === editForm.category)) {
    categoryList.push({
      title: editForm.category,
      minSortOrder: 9999,
      items: []
    });
  }

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

  const categories = Array.from(new Set([...products.map(p => p.category), editForm.category])).filter(Boolean) as string[];
  if (categories.length === 0) categories.push('Snacks', 'Vega');
  
  const allVariants = Array.from(new Set(products.flatMap(p => p.variants || []))).sort();
  const allSauces = Array.from(new Set(products.flatMap(p => p.sauces || []))).sort();
  
  const defaultStatuses = ['active', 'inactive', 'sold_out', 'coming_soon', 'new', 'popular'];
  const statuses = Array.from(new Set([...defaultStatuses, ...products.map(p => p.status), editForm.status])).filter(Boolean) as string[];

  const handleEdit = (product: ObProduct) => {
    setEditingId(product.id);
    setEditForm(product);
    setIsCreatingCategory(false);
    setIsCreatingStatus(false);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
    setIsCreatingCategory(false);
    setIsCreatingStatus(false);
  };

  const handleSave = async () => {
    if (!supabase || !editForm.name || (!editForm.category && !newCategory)) return;
    setIsSaving(true);
    
    // Cleanup portions
    const portionsToSave = (editForm.portions || []).filter(n => n > 0);
    const categoryToSave = isCreatingCategory && newCategory ? newCategory : editForm.category;
    const statusToSave = isCreatingStatus && newStatus ? newStatus : (editForm.status || 'active');

    const variantsToSave = editForm.variants || [];
    const saucesToSave = editForm.sauces || [];

    try {
      if (editingId === 'new') {
        const { data, error } = await supabase.from('ob_products').insert({
          name: editForm.name,
          category: categoryToSave,
          image_url: editForm.image_url || '',
          status: statusToSave,
          portions: portionsToSave,
          variants: variantsToSave,
          extra_info: editForm.extra_info || null,
          additional_categories: editForm.additional_categories || [],
          sauces: saucesToSave,
          sort_order: products.length
        }).select();
        if (error) { alert('Error: ' + error.message); }
        if (data) setProducts([...products, data[0]]);
      } else {
        const oldProduct = products.find(p => p.id === editingId);
        const oldName = oldProduct?.name;

        const { data, error } = await supabase.from('ob_products').update({
          name: editForm.name,
          category: categoryToSave,
          image_url: editForm.image_url,
          status: statusToSave,
          portions: portionsToSave,
          variants: variantsToSave,
          extra_info: editForm.extra_info || null,
          additional_categories: editForm.additional_categories || [],
          sauces: saucesToSave
        }).eq('id', editingId).select();
        if (error) { alert('Error: ' + error.message); }
        if (data) {
          if (oldName && oldName !== editForm.name) {
             await supabase.from('ob_product_prices').update({ product_name: editForm.name }).eq('product_name', oldName);
             await supabase.from('ob_company_assortment').update({ product_name: editForm.name }).eq('product_name', oldName);
          }
          setProducts(products.map(p => p.id === editingId ? data[0] : p));
        }
      }
      setEditingId(null);
      setEditForm({});
      setIsCreatingCategory(false);
      setIsCreatingStatus(false);
    } catch (err: any) {
      alert('Error: ' + err.message);
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

    const handleDelete = async (id: string) => {
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
  };

  const handlePortionChangeIndex = (index: number, val: string) => {
    const current = [...(editForm.portions || [])];
    while (current.length <= index) current.push(0);
    current[index] = parseInt(val, 10) || 0;
    setEditForm({ ...editForm, portions: current });
  };

  const renderEditRow = () => {
    return (
      <>
        <td className="px-2 py-2 space-x-2 align-top w-24">
          <button onClick={handleSave} disabled={isSaving} className="text-green-600 hover:text-green-800 p-1"><Check size={18} /></button>
          <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600 p-1"><X size={18} /></button>
        </td>
        <td className="px-2 py-2 align-top space-y-3">
          <div className="space-y-1.5">
            <input type="text" placeholder="Naam" className="w-full px-2 py-1.5 border rounded focus:border-[#151f33] focus:outline-none" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} />
            <input type="text" placeholder="Afbeelding URL" className="w-full px-2 py-1.5 border rounded text-xs focus:border-[#151f33] focus:outline-none" value={editForm.image_url || ''} onChange={e => setEditForm({...editForm, image_url: e.target.value})} />
            <textarea placeholder="Extra informatie (bijv. allergenen)..." className="w-full px-2 py-1.5 border rounded text-xs focus:border-[#151f33] focus:outline-none min-h-[60px]" value={editForm.extra_info || ''} onChange={e => setEditForm({...editForm, extra_info: e.target.value})} />
            
            <div className="flex flex-col gap-1 mt-2">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Extra Categorieën</span>
              <div className="flex flex-wrap gap-1 items-center">
               {(editForm.additional_categories || []).map(c => (
                 <span key={c} className="bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                   {c}
                   <button onClick={() => setEditForm({...editForm, additional_categories: (editForm.additional_categories || []).filter(x => x !== c)})} className="hover:text-red-500"><X size={12} /></button>
                 </span>
               ))}
               <select className="px-2 py-0.5 rounded-md text-xs border border-gray-200 bg-gray-50 cursor-pointer focus:outline-none" onChange={(e) => {
                   const val = e.target.value;
                   if (val && !(editForm.additional_categories || []).includes(val)) {
                     setEditForm({...editForm, additional_categories: [...(editForm.additional_categories || []), val]});
                   }
                   e.target.value = '';
                 }}>
                 <option value="">+ Toevoegen</option>
                 {categories.filter(c => !(editForm.additional_categories || []).includes(c) && c !== editForm.category).map(c => (
                   <option key={c} value={c}>{c}</option>
                 ))}
               </select>
              </div>
            </div>

          </div>
          
          <div className="space-y-1">
             <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Varianten</div>
             <div className="flex flex-wrap gap-1.5 items-center">
               {(editForm.variants || []).map(v => (
                 <span key={v} className="bg-blue-50 text-ob-blue border border-blue-200 px-2 py-0.5 rounded-md text-xs flex items-center gap-1">
                   {v}
                   <button onClick={() => setEditForm({...editForm, variants: (editForm.variants || []).filter(x => x !== v)})} className="hover:text-red-500"><X size={12} /></button>
                 </span>
               ))}
               <select 
                 className="px-2 py-0.5 rounded-md text-xs border border-gray-200 w-auto focus:outline-none focus:border-ob-blue bg-white"
                 onChange={(e) => {
                   const val = e.target.value;
                   if (val && !(editForm.variants || []).includes(val)) {
                     setEditForm({...editForm, variants: [...(editForm.variants || []), val]});
                   }
                   e.target.value = "";
                 }}
                 defaultValue=""
               >
                 <option value="" disabled>+ Kies Variant...</option>
                 {allVariants.filter(v => !(editForm.variants || []).includes(v)).map(v => (
                   <option key={v} value={v}>{v}</option>
                 ))}
               </select>
               <input type="text" placeholder="Of typ nieuw..." className="px-2 py-0.5 rounded-md text-xs border border-gray-200 w-24 focus:outline-none focus:border-ob-blue" onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); const val = e.currentTarget.value.trim(); if(val && !(editForm.variants || []).includes(val)) { setEditForm({...editForm, variants: [...(editForm.variants || []), val]}); } e.currentTarget.value = ''; } }} />
             </div>
          </div>
          
          <div className="space-y-1">
             <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Sauzen</div>
             <div className="flex flex-wrap gap-1.5 items-center">
               {(editForm.sauces || []).map(s => (
                 <span key={s} className="bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-md text-xs flex items-center gap-1">
                   {s}
                   <button onClick={() => setEditForm({...editForm, sauces: (editForm.sauces || []).filter(x => x !== s)})} className="hover:text-red-500"><X size={12} /></button>
                 </span>
               ))}
               <select 
                 className="px-2 py-0.5 rounded-md text-xs border border-gray-200 w-auto focus:outline-none focus:border-orange-400 bg-white"
                 onChange={(e) => {
                   const val = e.target.value;
                   if (val && !(editForm.sauces || []).includes(val)) {
                     setEditForm({...editForm, sauces: [...(editForm.sauces || []), val]});
                   }
                   e.target.value = "";
                 }}
                 defaultValue=""
               >
                 <option value="" disabled>+ Kies Saus...</option>
                 {allSauces.filter(s => !(editForm.sauces || []).includes(s)).map(s => (
                   <option key={s} value={s}>{s}</option>
                 ))}
               </select>
               <input type="text" placeholder="Of typ nieuw..." className="px-2 py-0.5 rounded-md text-xs border border-gray-200 w-24 focus:outline-none focus:border-orange-400" onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); const val = e.currentTarget.value.trim(); if(val && !(editForm.sauces || []).includes(val)) { setEditForm({...editForm, sauces: [...(editForm.sauces || []), val]}); } e.currentTarget.value = ''; } }} />
             </div>
          </div>
        </td>
        <td className="px-2 py-2 align-top">
          {isCreatingCategory ? (
            <div className="flex gap-1 items-center">
              <input type="text" autoFocus className="w-full px-2 py-1.5 border rounded text-sm focus:border-[#151f33] focus:outline-none" value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="Nieuwe cat..." />
              <button onClick={() => { setEditForm({...editForm, category: newCategory}); setIsCreatingCategory(false); }} className="text-green-600 hover:bg-green-50 p-1 rounded"><Check size={16}/></button>
              <button onClick={() => setIsCreatingCategory(false)} className="text-red-600 hover:bg-red-50 p-1 rounded"><X size={16}/></button>
            </div>
          ) : (
            <select 
              className="w-full px-2 py-1.5 border rounded text-sm focus:border-[#151f33] focus:outline-none" 
              value={editForm.category || ''} 
              onChange={e => {
                if (e.target.value === '__NEW__') {
                  setIsCreatingCategory(true);
                  setNewCategory('');
                } else {
                  setEditForm({...editForm, category: e.target.value});
                }
              }}
            >
              <option value="__NEW__" className="font-bold text-ob-blue">+ Nieuwe categorie...</option>
              <option disabled>──────────</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
        </td>
        <td className="px-2 py-2 align-top">
          <div className="flex gap-1">
            {[0, 1, 2, 3].map(index => (
              <input 
                key={index}
                type="number" 
                min="0"
                placeholder="-"
                className="w-12 px-1 py-1.5 text-center border rounded text-sm focus:border-[#151f33] focus:outline-none" 
                value={editForm.portions?.[index] || ''} 
                onChange={e => handlePortionChangeIndex(index, e.target.value)}
              />
            ))}
          </div>
        </td>
        <td className="px-2 py-2 align-top">
          {isCreatingStatus ? (
            <div className="flex gap-1 items-center">
              <input type="text" autoFocus className="w-full px-2 py-1.5 border rounded text-sm focus:border-[#151f33] focus:outline-none" value={newStatus} onChange={e => setNewStatus(e.target.value)} placeholder="Nieuwe status..." />
              <button onClick={() => { setEditForm({...editForm, status: newStatus}); setIsCreatingStatus(false); }} className="text-green-600 hover:bg-green-50 p-1 rounded"><Check size={16}/></button>
              <button onClick={() => setIsCreatingStatus(false)} className="text-red-600 hover:bg-red-50 p-1 rounded"><X size={16}/></button>
            </div>
          ) : (
            <select 
              className="w-full px-2 py-1.5 border rounded text-sm focus:border-[#151f33] focus:outline-none" 
              value={editForm.status || 'active'} 
              onChange={e => {
                if (e.target.value === '__NEW__') {
                  setIsCreatingStatus(true);
                  setNewStatus('');
                } else {
                  setEditForm({...editForm, status: e.target.value});
                }
              }}
            >
              <option value="__NEW__" className="font-bold text-ob-blue">+ Nieuwe status...</option>
              <option disabled>──────────</option>
              {statuses.map(s => <option key={s} value={s}>{
                s === 'active' ? 'Actief' : 
                s === 'inactive' ? 'Inactief / Verborgen' : 
                s === 'sold_out' ? 'Uitverkocht' : 
                s === 'coming_soon' ? 'Binnenkort' : 
                s === 'new' ? 'Nieuw' : 
                s === 'popular' ? 'Meest Gekozen' : s
              }</option>)}
            </select>
          )}
        </td>
      </>
    );
  };

  return (
    <div className="space-y-6 w-full max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-serif font-semibold text-[#05053D] mb-1">Menu & Producten Beheren</h3>
          <p className="text-sm text-gray-500">Voeg producten toe, bewerk porties en statussen, en verwijder items.</p>
        </div>
        <button 
          onClick={() => {
            setEditingId('new');
            setEditForm({ status: 'active', portions: [], category: 'Nieuwe Categorie' });
            setIsCreatingCategory(true);
            setNewCategory('');
          }}
          className="flex items-center gap-2 bg-[#05053D] text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-[#0a0a5c] transition-colors"
        >
          <Plus size={16} /> Nieuwe Categorie
        </button>
      </div>

            <div className="w-full max-w-full overflow-auto custom-scrollbar max-h-[calc(100vh-320px)] space-y-6 p-1 pb-10">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          
          

          {categoryList.map((cat, catIndex) => (
            <div key={cat.title} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-[#f8f9fa] px-4 py-3 flex items-center justify-between border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <h4 className="font-bold text-[#05053D] text-lg">{cat.title}</h4>
                  <button 
                    onClick={() => {
                      setEditingId('new');
                      setEditForm({ status: 'active', portions: [], category: cat.title });
                    }}
                    className="flex items-center gap-1 text-sm bg-white border border-gray-200 px-2 py-1 rounded-md text-gray-600 hover:text-ob-blue hover:border-ob-blue transition-colors"
                  >
                    <Plus size={14} /> Nieuw Product
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => moveCategory(catIndex, -1)}
                    disabled={catIndex === 0}
                    className="p-1 rounded text-gray-500 hover:bg-gray-200 hover:text-gray-800 disabled:opacity-30 transition-colors"
                  ><ChevronUp size={20} /></button>
                  <button 
                    onClick={() => moveCategory(catIndex, 1)}
                    disabled={catIndex === categoryList.length - 1}
                    className="p-1 rounded text-gray-500 hover:bg-gray-200 hover:text-gray-800 disabled:opacity-30 transition-colors"
                  ><ChevronDown size={20} /></button>
                </div>
              </div>
              <SortableContext items={cat.items.map((p: any) => p.id)} strategy={verticalListSortingStrategy}>
                <table className="w-full text-left text-sm min-w-[1000px]">
                  {catIndex === 0 && (
                    <thead className="bg-gray-50 border-b border-gray-200 text-xs">
                      <tr>
                        <th className="px-2 py-2 font-semibold text-gray-700 w-24">Acties</th>
                        <th className="px-2 py-2 font-semibold text-gray-700 w-1/3">Product</th>
                        <th className="px-2 py-2 font-semibold text-gray-700 w-1/6">Categorie</th>
                        <th className="px-2 py-2 font-semibold text-gray-700 ">Porties (stuks)</th>
                        <th className="px-2 py-2 font-semibold text-gray-700 w-1/6">Status</th>
                      </tr>
                    </thead>
                  )}
                  <tbody className="divide-y divide-gray-100">
                    {editingId === 'new' && editForm.category === cat.title && (
                      <tr className="bg-blue-50/50">
                        {renderEditRow()}
                      </tr>
                    )}
                    {cat.items.map((p: any) => (
                      <SortableRow key={p.id} p={p} editingId={editingId} renderEditRow={renderEditRow} handleEdit={handleEdit} handleDelete={handleDelete} />
                    ))}
                    {cat.items.length === 0 && (
                      <tr><td colSpan={5} className="p-4 text-center text-gray-500 italic">Geen producten in deze categorie.</td></tr>
                    )}
                  </tbody>
                </table>
              </SortableContext>
            </div>
          ))}

        </DndContext>
      </div>
    </div>
  );
}
