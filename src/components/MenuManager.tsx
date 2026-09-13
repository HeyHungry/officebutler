import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Trash2, Edit2, Check, X, Image as ImageIcon, GripVertical } from 'lucide-react';
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
          <span className="font-semibold text-gray-800">{p.name}</span>
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
  const [editForm, setEditForm] = useState<Partial<ObProduct>>({});

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

  const categories = Array.from(new Set([...products.map(p => p.category), editForm.category])).filter(Boolean) as string[];
  if (categories.length === 0) categories.push('Snacks', 'Vega');
  
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

    try {
      if (editingId === 'new') {
        const { data, error } = await supabase.from('ob_products').insert({
          name: editForm.name,
          category: categoryToSave,
          image_url: editForm.image_url || '',
          status: statusToSave,
          portions: portionsToSave,
          sort_order: products.length
        }).select();
        if (error) { alert('Error: ' + error.message); }
        if (data) setProducts([...products, data[0]]);
      } else {
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
    try {
      await supabase.from('ob_products').delete().eq('id', id);
      setProducts(products.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
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
        <td className="px-2 py-2 align-top">
          <input type="text" placeholder="Naam" className="w-full px-2 py-1.5 border rounded focus:border-[#151f33] focus:outline-none" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} />
          <input type="text" placeholder="Afbeelding URL" className="w-full px-2 py-1.5 border rounded mt-2 text-xs focus:border-[#151f33] focus:outline-none" value={editForm.image_url || ''} onChange={e => setEditForm({...editForm, image_url: e.target.value})} />
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
      </>
    );
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-serif font-semibold text-[#05053D] mb-1">Menu & Producten Beheren</h3>
          <p className="text-sm text-gray-500">Voeg producten toe, bewerk porties en statussen, en verwijder items.</p>
        </div>
        <button 
          onClick={() => {
            setEditingId('new');
            setEditForm({ status: 'active', portions: [], category: categories[0] || 'Snacks' });
          }}
          className="flex items-center gap-2 bg-[#05053D] text-white px-2 py-2 rounded-lg text-sm font-medium hover:bg-[#0a0a5c] transition-colors"
        >
          <Plus size={16} /> Nieuw Product
        </button>
      </div>

            <div className="w-full max-w-full overflow-auto custom-scrollbar bg-white border border-gray-200 rounded-xl max-h-[calc(100vh-320px)]">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={products.map(p => p.id)} strategy={verticalListSortingStrategy}>
            <table className="w-full text-left text-sm min-w-[1000px]">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                
                <tr>
                  <th className="px-2 py-2 font-semibold text-gray-700 w-24">Acties</th>
                  <th className="px-2 py-2 font-semibold text-gray-700 w-1/3">Product</th>
                  <th className="px-2 py-2 font-semibold text-gray-700 w-1/6">Categorie</th>
                  <th className="px-2 py-2 font-semibold text-gray-700 ">Porties (stuks)</th>
                  <th className="px-2 py-2 font-semibold text-gray-700 w-1/6">Status</th>
                </tr>

              </thead>
              <tbody className="divide-y divide-gray-100">
                {editingId === 'new' && (
                  <tr className="bg-blue-50/50">
                    {renderEditRow()}
                  </tr>
                )}
                
                {products.map(p => (
                  <SortableRow key={p.id} p={p} editingId={editingId} renderEditRow={renderEditRow} handleEdit={handleEdit} handleDelete={handleDelete} />
                ))}
              </tbody>
            </table>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
