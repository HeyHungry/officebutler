import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Plus, Trash2, Edit2, Check, X, Image as ImageIcon, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export type ObDeliveryMethod = {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_active: boolean;
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
          <div>
            <span className="font-semibold text-gray-800 block">{p.name}</span>
            <span className="text-xs text-gray-500">{p.description}</span>
          </div>
        </div>
      </td>
      <td className="px-2 py-2 font-medium">€{Number(p.price).toFixed(2)}</td>
      <td className="px-2 py-2">
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
          {p.is_active ? 'Actief' : 'Inactief'}
        </span>
      </td>
    </tr>
  );
}

export function DeliveryOptionsManager() {
  const [methods, setMethods] = useState<ObDeliveryMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ObDeliveryMethod>>({});

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    fetchMethods();
  }, []);

  const fetchMethods = async () => {
    setIsLoading(true);
    if (!supabase) return;
    try {
      const { data, error } = await supabase.from('ob_delivery_methods').select('*').order('sort_order', { ascending: true, nullsFirst: false }).order('created_at', { ascending: true });
      if (data) setMethods(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setMethods((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        const updatedItems = newItems.map((item: any, index: number) => ({ ...item, sort_order: index }));
        
        if (supabase) {
          Promise.all(updatedItems.map(item => 
            supabase.from('ob_delivery_methods').update({ sort_order: item.sort_order }).eq('id', item.id)
          )).catch(err => console.error("Error updating sort order:", err));
        }
        
        return updatedItems;
      });
    }
  };

  const handleEdit = (method: ObDeliveryMethod) => {
    setEditingId(method.id);
    setEditForm(method);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSave = async () => {
    if (!supabase || !editForm.name) return;
    setIsSaving(true);
    
    try {
      if (editingId === 'new') {
        const { data, error } = await supabase.from('ob_delivery_methods').insert({
          name: editForm.name,
          description: editForm.description || '',
          price: editForm.price || 0,
          image_url: editForm.image_url || '',
          is_active: editForm.is_active !== undefined ? editForm.is_active : true,
          sort_order: methods.length
        }).select();
        if (error) { alert('Error: ' + error.message); }
        if (data) setMethods([...methods, data[0]]);
      } else {
        const { data, error } = await supabase.from('ob_delivery_methods').update({
          name: editForm.name,
          description: editForm.description,
          price: editForm.price,
          image_url: editForm.image_url,
          is_active: editForm.is_active
        }).eq('id', editingId).select();
        if (error) { alert('Error: ' + error.message); }
        if (data) {
          setMethods(methods.map(p => p.id === editingId ? data[0] : p));
        }
      }
      setEditingId(null);
      setEditForm({});
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!supabase) return;
    if (!confirm('Weet je zeker dat je deze bezorgoptie wilt verwijderen?')) return;
    
    try {
      await supabase.from('ob_delivery_methods').delete().eq('id', id);
      setMethods(methods.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const renderEditRow = () => {
    return (
      <>
        <td className="px-2 py-2 space-x-2 align-top w-24">
          <button onClick={handleSave} disabled={isSaving} className="text-green-600 hover:text-green-800 p-1"><Check size={18} /></button>
          <button onClick={handleCancel} className="text-gray-400 hover:text-gray-600 p-1"><X size={18} /></button>
        </td>
        <td className="px-2 py-2 align-top">
          <input type="text" placeholder="Naam" className="w-full px-2 py-1.5 border rounded focus:border-[#151f33] focus:outline-none mb-2" value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} />
          <input type="text" placeholder="Beschrijving" className="w-full px-2 py-1.5 border rounded text-xs focus:border-[#151f33] focus:outline-none mb-2" value={editForm.description || ''} onChange={e => setEditForm({...editForm, description: e.target.value})} />
          <input type="text" placeholder="Afbeelding URL" className="w-full px-2 py-1.5 border rounded text-xs focus:border-[#151f33] focus:outline-none" value={editForm.image_url || ''} onChange={e => setEditForm({...editForm, image_url: e.target.value})} />
        </td>
        <td className="px-2 py-2 align-top">
          <input type="number" step="0.01" placeholder="Prijs" className="w-full px-2 py-1.5 border rounded focus:border-[#151f33] focus:outline-none" value={editForm.price !== undefined ? editForm.price : ''} onChange={e => setEditForm({...editForm, price: parseFloat(e.target.value) || 0})} />
        </td>
        <td className="px-2 py-2 align-top">
          <select 
            className="w-full px-2 py-1.5 border rounded text-sm focus:border-[#151f33] focus:outline-none" 
            value={editForm.is_active === false ? 'false' : 'true'} 
            onChange={e => setEditForm({...editForm, is_active: e.target.value === 'true'})}
          >
            <option value="true">Actief</option>
            <option value="false">Inactief</option>
          </select>
        </td>
      </>
    );
  };

  if (isLoading) return <div className="p-8 text-center text-gray-500">Laden...</div>;
  if (errorMsg) return <div className="p-8 text-center text-red-500">Error: {errorMsg}</div>;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-serif font-semibold text-[#05053D] mb-1">Bezorgopties Beheren</h3>
          <p className="text-sm text-gray-500">Beheer de beschikbare bezorg- en serviceopties voor bestellingen.</p>
        </div>
        <button 
          onClick={() => {
            setEditingId('new');
            setEditForm({ is_active: true, price: 0 });
          }}
          className="flex items-center gap-2 bg-[#05053D] text-white px-2 py-2 rounded-lg text-sm font-medium hover:bg-[#0a0a5c] transition-colors"
        >
          <Plus size={16} /> Nieuwe Optie
        </button>
      </div>

      <div className="w-full max-w-full overflow-auto custom-scrollbar bg-white border border-gray-200 rounded-xl max-h-[calc(100vh-320px)]">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={methods.map(p => p.id)} strategy={verticalListSortingStrategy}>
            <table className="w-full text-left text-sm min-w-[800px]">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-2 py-2 font-semibold text-gray-700 w-24">Acties</th>
                  <th className="px-2 py-2 font-semibold text-gray-700 w-1/2">Naam & Info</th>
                  <th className="px-2 py-2 font-semibold text-gray-700 w-1/6">Prijs</th>
                  <th className="px-2 py-2 font-semibold text-gray-700 w-1/6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {editingId === 'new' && (
                  <tr className="bg-blue-50/50">
                    {renderEditRow()}
                  </tr>
                )}
                
                {methods.map(p => (
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
