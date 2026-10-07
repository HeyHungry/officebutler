import React, { useState, useEffect } from 'react';
import { supabase, CategoryVariantRulesMap, CategoryVariantRule } from '../lib/supabase';
import { Plus, Trash2, Edit2, Check, X, Image as ImageIcon, GripVertical, ChevronUp, ChevronDown, ChefHat, Sparkles, Printer, Search, Eye, EyeOff, RotateCcw } from 'lucide-react';
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
  extra_info_en?: string;
  additional_categories?: string[];
  sauces?: string[];
  variants?: string[];
  variant_surcharges?: Record<string, number>;
  brand?: string;
  hide_image?: boolean;
  allowed_company_ids?: string[];
  kitchen_name?: string;
  kitchen_ingredients?: string;
  kitchen_prep_instructions?: string;
};

export type EditFormState = Partial<ObProduct> & {
  sauces_str?: string;
  variants_str?: string;
  additional_categories_str?: string;
  hide_image?: boolean;
  allowed_company_ids?: string[];
  kitchen_name?: string;
  kitchen_ingredients?: string;
  kitchen_prep_instructions?: string;
};

export const DEFAULT_KITCHEN_SUGGESTIONS: Record<string, { kitchen_name: string; ingredients: string; prep_instructions: string }> = {
  'Bitterballen': {
    kitchen_name: 'Beef Bitterballen (Kalfs)',
    ingredients: 'Dutch beef ragout (beef broth, beef meat, roux, butter, onion, parsley), breadcrumb crust. Allergens: Gluten, Dairy, Mustard, Celery.',
    prep_instructions: 'Deep fry at 180°C for 4.5 to 5 minutes from frozen. Drain well. Serve with 2 mustard dip cups per 25pcs.'
  },
  'Kaasstengels': {
    kitchen_name: 'Crispy Cheese Sticks (Gouda)',
    ingredients: 'Aged Dutch Gouda cheese, crispy spring roll pastry wrap. Vegetarian. Allergens: Dairy, Gluten.',
    prep_instructions: 'Deep fry at 180°C for 3 to 3.5 minutes until golden brown. Remove promptly so cheese does not burst. Serve with sweet chili dip.'
  },
  'Frikandelletjes': {
    kitchen_name: 'Mini Dutch Frikandellen',
    ingredients: 'Pork, chicken, beef mince with traditional Dutch herbs & spices. Allergens: Gluten, Soy, Celery.',
    prep_instructions: 'Deep fry at 180°C for 3.5 to 4 minutes from frozen. Serve with curry ketchup or mayonnaise.'
  },
  'Vlammetjes': {
    kitchen_name: 'Spicy Beef Pastries (Vlammetjes)',
    ingredients: 'Spicy seasoned minced beef, red chili peppers, onions, spring roll pastry. Allergens: Gluten, Soy.',
    prep_instructions: 'Deep fry at 180°C for 3 to 3.5 minutes from frozen until crispy. Serve with sweet chili dip.'
  },
  'Mini Loempia': {
    kitchen_name: 'Mini Vegetable Spring Rolls',
    ingredients: 'Crispy pastry filled with cabbage, carrots, bean sprouts, bamboo shoots. 100% Vegan. Allergens: Gluten, Soy.',
    prep_instructions: 'Deep fry at 180°C for 4 minutes from frozen until golden and crispy. Serve with sweet chili dip.'
  },
  'Mini Kroket': {
    kitchen_name: 'Mini Croquettes (Beef / Veggie)',
    ingredients: 'Rich beef or vegetable ragout in crispy breading. Allergens: Gluten, Celery, Dairy.',
    prep_instructions: 'Deep fry at 180°C for 4.5 minutes from frozen. Serve with mustard.'
  },
  'Kipnuggets': {
    kitchen_name: 'Crispy Chicken Nuggets',
    ingredients: 'Tender chicken breast in crispy golden breading. Allergens: Gluten.',
    prep_instructions: 'Deep fry at 180°C for 3.5 to 4 minutes until golden and internal temp >75°C. Serve with mayo or ketchup.'
  },
  'Karaage Kip': {
    kitchen_name: 'Japanese Karaage Crispy Chicken',
    ingredients: 'Marinated chicken thigh bites (soy, ginger, garlic, mirin), potato starch crust. Allergens: Soy, Gluten.',
    prep_instructions: 'Deep fry at 175°C for 4.5 to 5 minutes until extra crispy and golden brown. Serve with spicy mayo.'
  },
  "Butterfly Gamba's": {
    kitchen_name: 'Crispy Butterfly King Prawns',
    ingredients: 'Butterfly cut king prawns, crispy panko breadcrumbs. Allergens: Crustaceans/Shellfish, Gluten.',
    prep_instructions: 'Deep fry at 180°C for 3 minutes from frozen until golden and crispy. Serve with sweet chili dip.'
  },
  'Chicken Wings': {
    kitchen_name: 'Marinated Chicken Wings',
    ingredients: 'Chicken wings, barbecue herb rub, paprika, garlic. Allergens: None (Gluten-free).',
    prep_instructions: 'Deep fry at 180°C for 5 minutes or oven bake at 200°C for 10-12 mins until piping hot. Serve with BBQ sauce.'
  },
  'Broodje Kroket': {
    kitchen_name: 'Dutch Beef Croquette Roll',
    ingredients: 'Soft white roll, Oma Bobs beef croquette, mustard. Allergens: Gluten, Dairy, Mustard, Celery.',
    prep_instructions: 'Deep fry croquette at 180°C for 5 minutes. Slice roll, place hot croquette inside, serve with mustard packet.'
  },
  'Broodje Kaasoufle': {
    kitchen_name: 'Dutch Cheese Soufflé Roll',
    ingredients: 'Soft white roll, Souflesse cheese soufflé. Vegetarian. Allergens: Gluten, Dairy.',
    prep_instructions: 'Deep fry cheese soufflé at 180°C for 4 minutes. Place inside soft roll, serve with mustard or sriracha.'
  },
  'Samosas Curry': {
    kitchen_name: 'Curry Vegetable Samosas (Vegan)',
    ingredients: 'Crispy triangular pastry filled with potatoes, green peas, curry spices, coriander. 100% Vegan. Allergens: Gluten.',
    prep_instructions: 'Deep fry at 180°C for 4 minutes from frozen until crispy golden. Serve with sweet chili or mango dip.'
  },
  'Patat': {
    kitchen_name: 'Crispy French Fries (McCain)',
    ingredients: 'Potato fries, sunflower oil, sea salt. Vegan & Gluten-free.',
    prep_instructions: 'Deep fry at 175°C for 3.5 to 4 minutes until golden and crispy. Season with fine sea salt.'
  },
  'Burgers': {
    kitchen_name: 'Smash Burgers',
    ingredients: '100% beef patty, brioche bun, cheddar cheese, burger sauce. Allergens: Gluten, Dairy, Egg, Mustard.',
    prep_instructions: 'Grill patty 2.5 mins per side on flat-top grill. Melt cheddar on top. Toast bun and assemble with sauce.'
  },
  'Classic Eco Mix 10st': {
    kitchen_name: 'Classic Eco Mix (10pcs Platter)',
    ingredients: 'Assorted warm snacks: 3x Bitterballen, 3x Kaasstengels, 2x Vlammetjes, 2x Mini Loempia. Allergens: Gluten, Dairy, Soy.',
    prep_instructions: 'Fry items according to specific times (3-5 mins at 180°C). Arrange in eco boat with 2 dip cups (mustard & sweet chili).'
  },
  'Vega Eco Mix 10st': {
    kitchen_name: 'Vegetarian Eco Mix (10pcs Platter)',
    ingredients: 'Assorted vegetarian warm snacks: Kaasstengels, Vega Bitterballen, Mini Loempia, Samosas. 100% Vegetarian. Allergens: Gluten, Dairy, Soy.',
    prep_instructions: 'Fry items in dedicated vegetarian fryer at 180°C for 3.5 to 4.5 minutes. Serve in eco boat with sweet chili and mustard.'
  },
  'Halal Eco Mix (10pcs)': {
    kitchen_name: 'Halal Certified Eco Mix (10pcs)',
    ingredients: 'Assorted 100% Halal certified bites (halal bitterballen, halal chicken, cheese sticks, mini loempia). Allergens: Gluten, Dairy, Soy.',
    prep_instructions: 'Fry in separate clean halal-safe oil at 180°C for 4 to 5 minutes. Serve with sweet chili dip.'
  },
  'Classic Platter': {
    kitchen_name: 'Classic Platter (Mixed Snacks)',
    ingredients: 'Assorted warm bites: Bitterballen, Kaasstengels, Frikandelletjes, Kipnuggets, Mini Loempia. Allergens: Gluten, Dairy, Soy, Celery.',
    prep_instructions: 'Fry according to item times. Arrange in serving platter with mustard, mayo and sweet chili dips.'
  },
  'Luxe Platter': {
    kitchen_name: 'Deluxe Platter (Premium Bites)',
    ingredients: 'Assorted premium bites: Butterfly Gamba\'s, Karaage Chicken, Vlammetjes, Kaasstengels, Truffle Mayo. Allergens: Shellfish, Gluten, Dairy, Soy.',
    prep_instructions: 'Fry items carefully (Gamba 3m, Karaage 5m, Cheese 3m). Arrange in deluxe platter with truffle mayo and sweet chili.'
  },
  'Vega(n) Platter': {
    kitchen_name: 'Vegetarian & Vegan Platter',
    ingredients: 'Assorted vegetarian snacks: Mini Loempia (vegan), Samosas (vegan), Kaasstengels (veggie), Vega Bitterballen. Allergens: Gluten, Dairy, Soy.',
    prep_instructions: 'Fry in dedicated vegetarian oil. Arrange with sweet chili and mustard dip cups.'
  },
  'Mayonaise': {
    kitchen_name: 'Zaanse Mayonnaise Dip',
    ingredients: 'Traditional Dutch creamy mayonnaise. Allergens: Egg, Mustard.',
    prep_instructions: 'Serve chilled in portion cups or bottles.'
  },
  'Mosterd': {
    kitchen_name: 'Zaanse Mustard Dip',
    ingredients: 'Dutch coarse whole-grain mustard. Allergens: Mustard.',
    prep_instructions: 'Serve chilled in portion cups.'
  },
  'Zoete Chili Saus': {
    kitchen_name: 'Sweet Chili Sauce Dip',
    ingredients: 'Sweet & spicy chili sauce. Vegan & Gluten-free.',
    prep_instructions: 'Serve in portion cups.'
  },
  'Cornichons': {
    kitchen_name: 'Kesbeke Mini Pickles (Cornichons)',
    ingredients: 'Baby gherkins pickled in vinegar, dill, mustard seeds. Vegan & Gluten-free. Allergens: Mustard.',
    prep_instructions: 'Drain and serve cold as table pickle garnish.'
  },
  'Amsterdamse Mix': {
    kitchen_name: 'Kesbeke Amsterdam Pickled Mix',
    ingredients: 'Traditional Amsterdam pickled yellow onions, gherkins with turmeric. Vegan & Gluten-free. Allergens: Mustard.',
    prep_instructions: 'Drain and serve chilled in bowls/containers.'
  }
};

function SortableRow({ p, editingId, renderEditRow, handleEdit, handleDelete, handleToggleHideImage, companyNamesMap }: any) {
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
          {!p.hide_image && p.image_url ? (
            <div className="w-10 h-10 rounded-md overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
              <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
            </div>
          ) : !p.hide_image ? (
            <div className="w-10 h-10 rounded-md bg-gray-100 shrink-0 border border-gray-200 flex items-center justify-center text-gray-400">
              <ImageIcon size={16} />
            </div>
          ) : null}
          <div className="flex flex-col">
            <span className="font-semibold text-gray-800">{p.name}</span>
            {p.brand && (
              <span className="text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded w-fit mt-0.5 border border-amber-200 font-medium">
                Merk: {p.brand}
              </span>
            )}
            {p.allowed_company_ids && p.allowed_company_ids.length > 0 && (
              <span className="text-[10px] text-indigo-800 bg-indigo-50 px-1.5 py-0.5 rounded w-fit mt-0.5 border border-indigo-200 font-medium flex items-center gap-1">
                🔒 Alleen voor: {p.allowed_company_ids.map((id: string) => companyNamesMap?.[id] || id).join(', ')}
              </span>
            )}
            {p.image_url ? (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleToggleHideImage?.(p); }}
                title={p.hide_image ? "Afbeelding is momenteel uitgeschakeld op pagina. Klik om in te schakelen." : "Afbeelding is momenteel zichtbaar. Klik om uit te schakelen."}
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors border w-fit mt-1 flex items-center gap-1 cursor-pointer select-none ${
                  p.hide_image
                    ? 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {p.hide_image ? '🚫 Afbeelding uit' : '🖼️ Afbeelding aan'}
              </button>
            ) : (
              <span className="text-[10px] text-gray-400 italic mt-0.5">Geen afbeelding</span>
            )}
            {p.variants && p.variants.length > 0 && <span className="text-[10px] text-gray-500">Varianten: {p.variants.join(', ')}</span>}
            {p.sauces && p.sauces.length > 0 && <span className="text-[10px] text-gray-500">Sauzen: {p.sauces.join(', ')}</span>}
            
            {(p.extra_info || p.extra_info_en) && (
              <div className="text-[10px] text-gray-500 mt-1 space-y-0.5 max-w-sm">
                {p.extra_info && <div className="truncate"><span className="font-semibold text-gray-700">Extra info (NL):</span> {p.extra_info}</div>}
                {p.extra_info_en && <div className="truncate text-amber-800"><span className="font-semibold text-amber-900">🇬🇧 Extra info (EN):</span> {p.extra_info_en}</div>}
              </div>
            )}
            
            {(p.kitchen_name || p.kitchen_ingredients || p.kitchen_prep_instructions) ? (
              <div className="text-[10px] bg-amber-50/90 text-amber-950 border border-amber-300/80 rounded px-2 py-1 mt-1.5 max-w-sm space-y-0.5 shadow-xs">
                <div className="font-semibold flex items-center gap-1 text-amber-950">
                  <ChefHat size={12} className="text-amber-700 shrink-0" />
                  <span className="text-[9px] uppercase tracking-wider font-bold text-amber-800">Keuken (EN):</span>
                  <span className="font-bold text-amber-950 truncate">{p.kitchen_name || p.name}</span>
                </div>
                {p.kitchen_ingredients && (
                  <div className="text-amber-900 line-clamp-1" title={p.kitchen_ingredients}>
                    <span className="font-semibold text-amber-950">Ingr:</span> {p.kitchen_ingredients}
                  </div>
                )}
                {p.kitchen_prep_instructions && (
                  <div className="text-amber-900 line-clamp-1" title={p.kitchen_prep_instructions}>
                    <span className="font-semibold text-amber-950">Prep:</span> {p.kitchen_prep_instructions}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </td>
      
      
      <td className="px-2 py-2"><span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-medium">{p.category}</span></td>
      <td className="px-2 py-2"><div className="flex flex-wrap gap-1">{p.portions && p.portions.map((port: number, portIdx: number) => (<span key={`p-port-${p.id || 'p'}-${port}-${portIdx}`} className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-xs font-medium">{port} st.</span>))}</div></td>
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

  const [companies, setCompanies] = useState<{ id: string; name: string }[]>([]);
  const [categoryDescriptions, setCategoryDescriptions] = useState<Record<string, string>>({});
  const [editingCatDesc, setEditingCatDesc] = useState<string | null>(null);
  const [catDescInput, setCatDescInput] = useState<string>('');
  const [categoryRestrictions, setCategoryRestrictions] = useState<Record<string, string[]>>({});
  const [editingCatRestrictions, setEditingCatRestrictions] = useState<string | null>(null);
  const [categoryVariantRules, setCategoryVariantRules] = useState<CategoryVariantRulesMap>({});
  const [editingCatVariants, setEditingCatVariants] = useState<string | null>(null);
  const [isSavingCatVariants, setIsSavingCatVariants] = useState(false);

  const [isKitchenSheetOpen, setIsKitchenSheetOpen] = useState(false);
  const [kitchenSearch, setKitchenSearch] = useState('');
  const [kitchenCategoryFilter, setKitchenCategoryFilter] = useState('ALL');
  const [kitchenDraftMap, setKitchenDraftMap] = useState<Record<string, { kitchen_name: string; ingredients: string; prep_instructions: string }>>({});
  const [isSavingKitchenSheet, setIsSavingKitchenSheet] = useState(false);
  const [kitchenSheetSavedNotice, setKitchenSheetSavedNotice] = useState(false);

  useEffect(() => {
    if (isKitchenSheetOpen) {
      const draft: Record<string, { kitchen_name: string; ingredients: string; prep_instructions: string }> = {};
      products.forEach(p => {
        draft[p.id] = {
          kitchen_name: p.kitchen_name || '',
          ingredients: p.kitchen_ingredients || '',
          prep_instructions: p.kitchen_prep_instructions || ''
        };
      });
      setKitchenDraftMap(draft);
    }
  }, [isKitchenSheetOpen, products]);

  const handleApplySmartSuggestions = () => {
    setKitchenDraftMap(prev => {
      const updated = { ...prev };
      products.forEach(p => {
        const cleanName = (p.name || '').trim();
        const suggestion = DEFAULT_KITCHEN_SUGGESTIONS[cleanName] ||
          Object.entries(DEFAULT_KITCHEN_SUGGESTIONS).find(([k]) => cleanName.toLowerCase().includes(k.toLowerCase()))?.[1];

        if (suggestion) {
          const current = updated[p.id] || { kitchen_name: '', ingredients: '', prep_instructions: '' };
          updated[p.id] = {
            kitchen_name: current.kitchen_name || suggestion.kitchen_name,
            ingredients: current.ingredients || suggestion.ingredients,
            prep_instructions: current.prep_instructions || suggestion.prep_instructions
          };
        }
      });
      return updated;
    });
  };

  const handleSaveKitchenSheet = async () => {
    setIsSavingKitchenSheet(true);
    try {
      const { data: storeData } = await supabase.from('store_settings').select('page_content').eq('id', 1).maybeSingle();
      const currentContent = storeData?.page_content || {};
      const currentKitchen = { ...(currentContent.product_kitchen_info || {}) };

      products.forEach(p => {
        const entry = kitchenDraftMap[p.id];
        if (entry && (entry.kitchen_name || entry.ingredients || entry.prep_instructions)) {
          currentKitchen[p.id] = entry;
          currentKitchen[p.name] = entry;
          currentKitchen[(p.name || '').trim()] = entry;
        } else {
          delete currentKitchen[p.id];
          delete currentKitchen[p.name];
          delete currentKitchen[(p.name || '').trim()];
        }
      });

      await supabase.from('store_settings').update({
        page_content: {
          ...currentContent,
          product_kitchen_info: currentKitchen
        }
      }).eq('id', 1);

      setProducts(prev => prev.map(p => {
        const entry = kitchenDraftMap[p.id];
        if (entry) {
          return {
            ...p,
            kitchen_name: entry.kitchen_name,
            kitchen_ingredients: entry.ingredients,
            kitchen_prep_instructions: entry.prep_instructions
          };
        }
        return p;
      }));

      setKitchenSheetSavedNotice(true);
      setTimeout(() => setKitchenSheetSavedNotice(false), 3000);
    } catch (err: any) {
      alert('Fout bij opslaan: ' + (err.message || String(err)));
    } finally {
      setIsSavingKitchenSheet(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const companyNamesMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    companies.forEach(c => { map[c.id] = c.name; });
    return map;
  }, [companies]);
  
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
        const updatedItems = (newItems as any[]).map((item, index) => ({ ...item, sort_order: index }));
        
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
      const [productsRes, storeRes, companiesRes] = await Promise.all([
        supabase.from('ob_products').select('*').order('sort_order', { ascending: true, nullsFirst: false }).order('created_at', { ascending: true }),
        supabase.from('store_settings').select('page_content').eq('id', 1).maybeSingle(),
        supabase.from('ob_companies').select('id, name').order('name', { ascending: true })
      ]);

      if (companiesRes?.data) {
        setCompanies(companiesRes.data);
      }

      const brandsMap: Record<string, string> = storeRes?.data?.page_content?.product_brands || {};
      const hideImagesMap: Record<string, boolean> = storeRes?.data?.page_content?.hide_image_products || {};
      const catDescMap: Record<string, string> = storeRes?.data?.page_content?.category_descriptions || {};
      const companyRestrictionsMap: Record<string, string[]> = storeRes?.data?.page_content?.company_restricted_products || {};
      const catRestrictionsMap: Record<string, string[]> = storeRes?.data?.page_content?.category_restricted_companies || {};
      const kitchenInfoMap: Record<string, { kitchen_name?: string; ingredients?: string; prep_instructions?: string }> = storeRes?.data?.page_content?.product_kitchen_info || {};
      const productTranslationsMap: Record<string, { extra_info_en?: string }> = storeRes?.data?.page_content?.product_translations || {};
      const catVariantRulesMap: CategoryVariantRulesMap = storeRes?.data?.page_content?.category_variant_rules || {};
      setCategoryDescriptions(catDescMap);
      setCategoryVariantRules(catVariantRulesMap);

      try {
        const { data: catTableData } = await supabase.from('ob_categories').select('name, allowed_company_ids');
        if (catTableData && catTableData.length > 0) {
          catTableData.forEach((row: any) => {
            if (row.name && Array.isArray(row.allowed_company_ids)) {
              catRestrictionsMap[row.name] = row.allowed_company_ids;
            }
          });
        }
      } catch (e) {
        // Table might not exist yet; handled gracefully
      }
      setCategoryRestrictions(catRestrictionsMap);

      if (productsRes.data) {
        const enriched = productsRes.data.map((p: any) => {
          const kInfo = kitchenInfoMap[p.id] || kitchenInfoMap[p.name] || kitchenInfoMap[(p.name || '').trim()];
          const pTrans = productTranslationsMap[p.id] || productTranslationsMap[p.name] || productTranslationsMap[(p.name || '').trim()];
          return {
            ...p,
            brand: p.brand || brandsMap[p.id] || brandsMap[p.name] || '',
            extra_info_en: p.extra_info_en || pTrans?.extra_info_en || '',
            hide_image: p.hide_image != null ? Boolean(p.hide_image) : Boolean(hideImagesMap[p.id] || hideImagesMap[p.name] || hideImagesMap[(p.name || '').trim()]),
            allowed_company_ids: p.allowed_company_ids || companyRestrictionsMap[p.id] || companyRestrictionsMap[p.name] || companyRestrictionsMap[(p.name || '').trim()] || [],
            kitchen_name: p.kitchen_name || kInfo?.kitchen_name || '',
            kitchen_ingredients: p.kitchen_ingredients || kInfo?.ingredients || '',
            kitchen_prep_instructions: p.kitchen_prep_instructions || kInfo?.prep_instructions || ''
          };
        });
        setProducts(enriched);
      }
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
    setEditForm({
      ...product,
      allowed_company_ids: product.allowed_company_ids ? [...product.allowed_company_ids] : [],
      kitchen_name: product.kitchen_name || '',
      kitchen_ingredients: product.kitchen_ingredients || '',
      kitchen_prep_instructions: product.kitchen_prep_instructions || ''
    });
    setIsCreatingCategory(false);
    setIsCreatingStatus(false);
  };

  const handleSaveCategoryDescription = async (catTitle: string, desc: string) => {
    const updated = { ...categoryDescriptions };
    const trimmed = desc.trim();
    if (trimmed) {
      updated[catTitle] = trimmed;
    } else {
      delete updated[catTitle];
    }
    setCategoryDescriptions(updated);
    setEditingCatDesc(null);

    try {
      const { data: storeData } = await supabase.from('store_settings').select('page_content').eq('id', 1).maybeSingle();
      const currentContent = storeData?.page_content || {};
      await supabase.from('store_settings').update({
        page_content: {
          ...currentContent,
          category_descriptions: updated
        }
      }).eq('id', 1);
    } catch (err) {
      console.error('Fout bij opslaan categorie beschrijving:', err);
    }
  };

  const handleSaveCategoryRestrictions = async (catTitle: string, allowedCompIds: string[]) => {
    const updated = { ...categoryRestrictions };
    if (allowedCompIds && allowedCompIds.length > 0) {
      updated[catTitle] = allowedCompIds;
    } else {
      delete updated[catTitle];
    }
    setCategoryRestrictions(updated);

    try {
      const { data: storeData } = await supabase.from('store_settings').select('page_content').eq('id', 1).maybeSingle();
      const currentContent = storeData?.page_content || {};
      await supabase.from('store_settings').update({
        page_content: {
          ...currentContent,
          category_restricted_companies: updated
        }
      }).eq('id', 1);
    } catch (err) {
      console.error('Fout bij opslaan categorie restricties in store_settings:', err);
    }

    try {
      if (allowedCompIds && allowedCompIds.length > 0) {
        await supabase.from('ob_categories').upsert({
          name: catTitle,
          allowed_company_ids: allowedCompIds
        });
      } else {
        await supabase.from('ob_categories').delete().eq('name', catTitle);
      }
    } catch (e) {
      // If table doesn't exist, ignore
    }
  };

  const handleSaveCategoryVariantRule = async (
    catTitle: string,
    productId: string,
    productName: string,
    order: string[],
    hidden: string[]
  ) => {
    setIsSavingCatVariants(true);
    try {
      const { data: storeData } = await supabase.from('store_settings').select('page_content').eq('id', 1).maybeSingle();
      const currentContent = storeData?.page_content || {};
      const updatedRules: CategoryVariantRulesMap = { ...(currentContent.category_variant_rules || categoryVariantRules || {}) };

      if (!updatedRules[catTitle]) {
        updatedRules[catTitle] = {};
      } else {
        updatedRules[catTitle] = { ...updatedRules[catTitle] };
      }

      const ruleObj: CategoryVariantRule = {};
      if (order && order.length > 0) ruleObj.order = order;
      if (hidden && hidden.length > 0) ruleObj.hidden = hidden;

      if (productId) updatedRules[catTitle][productId] = ruleObj;
      if (productName) {
        updatedRules[catTitle][productName] = ruleObj;
        updatedRules[catTitle][productName.trim()] = ruleObj;
      }

      await supabase.from('store_settings').update({
        page_content: {
          ...currentContent,
          category_variant_rules: updatedRules
        }
      }).eq('id', 1);

      setCategoryVariantRules(updatedRules);
    } catch (err: any) {
      alert('Fout bij opslaan van variant-instellingen: ' + (err.message || String(err)));
    } finally {
      setIsSavingCatVariants(false);
    }
  };

  const handleResetCategoryVariantRule = async (
    catTitle: string,
    productId: string,
    productName: string
  ) => {
    setIsSavingCatVariants(true);
    try {
      const { data: storeData } = await supabase.from('store_settings').select('page_content').eq('id', 1).maybeSingle();
      const currentContent = storeData?.page_content || {};
      const updatedRules: CategoryVariantRulesMap = { ...(currentContent.category_variant_rules || categoryVariantRules || {}) };

      if (updatedRules[catTitle]) {
        const catCopy = { ...updatedRules[catTitle] };
        if (productId) delete catCopy[productId];
        if (productName) {
          delete catCopy[productName];
          delete catCopy[productName.trim()];
        }
        if (Object.keys(catCopy).length === 0) {
          delete updatedRules[catTitle];
        } else {
          updatedRules[catTitle] = catCopy;
        }
      }

      await supabase.from('store_settings').update({
        page_content: {
          ...currentContent,
          category_variant_rules: updatedRules
        }
      }).eq('id', 1);

      setCategoryVariantRules(updatedRules);
    } catch (err: any) {
      alert('Fout bij herstellen: ' + (err.message || String(err)));
    } finally {
      setIsSavingCatVariants(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
    setIsCreatingCategory(false);
    setIsCreatingStatus(false);
  };

  const handleToggleHideImage = async (product: ObProduct) => {
    const newHide = !product.hide_image;
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, hide_image: newHide } : p));
    if (editingId === product.id) {
      setEditForm(prev => ({ ...prev, hide_image: newHide }));
    }

    try {
      await supabase.from('ob_products').update({ hide_image: newHide }).eq('id', product.id);
    } catch (e) {
      // ignore if column doesn't exist
    }

    try {
      const { data: storeData } = await supabase.from('store_settings').select('page_content').eq('id', 1).maybeSingle();
      const currentContent = storeData?.page_content || {};
      const currentHideImages = { ...(currentContent.hide_image_products || {}) };
      const cleanName = (product.name || '').trim();

      if (newHide) {
        if (product.id) currentHideImages[product.id] = true;
        currentHideImages[product.name] = true;
        currentHideImages[cleanName] = true;
      } else {
        if (product.id) delete currentHideImages[product.id];
        delete currentHideImages[product.name];
        delete currentHideImages[cleanName];
      }

      await supabase.from('store_settings').update({
        page_content: {
          ...currentContent,
          hide_image_products: currentHideImages
        }
      }).eq('id', 1);
    } catch (syncErr) {
      console.warn('Could not sync hide_image to store_settings:', syncErr);
    }
  };

  const handleSave = async () => {
    if (!supabase || !editForm.name || (!editForm.category && !newCategory)) return;
    setIsSaving(true);
    
    const trimmedName = editForm.name.trim();
    const portionsToSave = (editForm.portions || []).filter(n => n > 0);
    const categoryToSave = isCreatingCategory && newCategory ? newCategory.trim() : (editForm.category || '').trim();
    const statusToSave = isCreatingStatus && newStatus ? newStatus : (editForm.status || 'active');

    const variantsToSave = editForm.variants || [];
    const saucesToSave = editForm.sauces || [];
    const brandToSave = editForm.brand?.trim() || null;
    const hideImageToSave = Boolean(editForm.hide_image);
    const allowedCompanyIdsToSave = editForm.allowed_company_ids || [];
    const kitchenNameToSave = editForm.kitchen_name?.trim() || '';
    const kitchenIngredientsToSave = editForm.kitchen_ingredients?.trim() || '';
    const kitchenPrepToSave = editForm.kitchen_prep_instructions?.trim() || '';
    const extraInfoEnToSave = editForm.extra_info_en?.trim() || '';

    try {
      let savedProduct: any = null;
      if (editingId === 'new') {
        const insertPayload: any = {
          name: trimmedName,
          category: categoryToSave,
          image_url: editForm.image_url || '',
          status: statusToSave,
          portions: portionsToSave,
          variants: variantsToSave,
          extra_info: editForm.extra_info || null,
          extra_info_en: extraInfoEnToSave || null,
          additional_categories: editForm.additional_categories || [],
          sauces: saucesToSave,
          sort_order: products.length,
          hide_image: hideImageToSave,
          allowed_company_ids: allowedCompanyIdsToSave
        };
        if (brandToSave) insertPayload.brand = brandToSave;

        let { data, error } = await supabase.from('ob_products').insert(insertPayload).select();

        // If columns do not exist in ob_products table yet, retry without them
        if (error && (error.message?.toLowerCase().includes('brand') || error.message?.toLowerCase().includes('hide_image') || error.message?.toLowerCase().includes('allowed_company_ids') || error.message?.toLowerCase().includes('extra_info_en'))) {
          if (error.message?.toLowerCase().includes('brand')) delete insertPayload.brand;
          if (error.message?.toLowerCase().includes('hide_image')) delete insertPayload.hide_image;
          if (error.message?.toLowerCase().includes('allowed_company_ids')) delete insertPayload.allowed_company_ids;
          if (error.message?.toLowerCase().includes('extra_info_en')) delete insertPayload.extra_info_en;
          const retry = await supabase.from('ob_products').insert(insertPayload).select();
          data = retry.data;
          error = retry.error;
        }

        if (error) { alert('Error: ' + error.message); }
        if (data && data[0]) {
          savedProduct = {
            ...data[0],
            brand: brandToSave || '',
            extra_info_en: extraInfoEnToSave,
            hide_image: hideImageToSave,
            allowed_company_ids: allowedCompanyIdsToSave,
            kitchen_name: kitchenNameToSave,
            kitchen_ingredients: kitchenIngredientsToSave,
            kitchen_prep_instructions: kitchenPrepToSave
          };
          setProducts([...products, savedProduct]);
        }
      } else {
        const oldProduct = products.find(p => p.id === editingId);
        const oldName = oldProduct?.name;

        const updatePayload: any = {
          name: trimmedName,
          category: categoryToSave,
          image_url: editForm.image_url,
          status: statusToSave,
          portions: portionsToSave,
          variants: variantsToSave,
          extra_info: editForm.extra_info || null,
          extra_info_en: extraInfoEnToSave || null,
          additional_categories: editForm.additional_categories || [],
          sauces: saucesToSave,
          hide_image: hideImageToSave,
          allowed_company_ids: allowedCompanyIdsToSave
        };
        if (brandToSave !== undefined) updatePayload.brand = brandToSave;

        let { data, error } = await supabase.from('ob_products').update(updatePayload).eq('id', editingId).select();

        // If columns do not exist in ob_products table yet, retry without them
        if (error && (error.message?.toLowerCase().includes('brand') || error.message?.toLowerCase().includes('hide_image') || error.message?.toLowerCase().includes('allowed_company_ids') || error.message?.toLowerCase().includes('extra_info_en'))) {
          if (error.message?.toLowerCase().includes('brand')) delete updatePayload.brand;
          if (error.message?.toLowerCase().includes('hide_image')) delete updatePayload.hide_image;
          if (error.message?.toLowerCase().includes('allowed_company_ids')) delete updatePayload.allowed_company_ids;
          if (error.message?.toLowerCase().includes('extra_info_en')) delete updatePayload.extra_info_en;
          const retry = await supabase.from('ob_products').update(updatePayload).eq('id', editingId).select();
          data = retry.data;
          error = retry.error;
        }

        if (error) { alert('Error: ' + error.message); }
        if (data && data[0]) {
          savedProduct = {
            ...data[0],
            brand: brandToSave || '',
            extra_info_en: extraInfoEnToSave,
            hide_image: hideImageToSave,
            allowed_company_ids: allowedCompanyIdsToSave,
            kitchen_name: kitchenNameToSave,
            kitchen_ingredients: kitchenIngredientsToSave,
            kitchen_prep_instructions: kitchenPrepToSave
          };
          const cleanOldName = (oldName || '').trim();
          if (cleanOldName && cleanOldName !== trimmedName) {
             await supabase.from('ob_product_prices').update({ product_name: trimmedName }).ilike('product_name', cleanOldName);
             await supabase.from('ob_company_assortment').update({ product_name: trimmedName }).ilike('product_name', cleanOldName);
          }
          setProducts(products.map(p => p.id === editingId ? savedProduct : p));
        }
      }

      // Sync brand, hide_image, company_restricted_products, product_kitchen_info & product_translations in store_settings.page_content for reliable persistence
      try {
        const { data: storeData } = await supabase.from('store_settings').select('page_content').eq('id', 1).maybeSingle();
        const currentContent = storeData?.page_content || {};
        const currentBrands = { ...(currentContent.product_brands || {}) };
        const currentHideImages = { ...(currentContent.hide_image_products || {}) };
        const currentRestricted = { ...(currentContent.company_restricted_products || {}) };
        const currentKitchen = { ...(currentContent.product_kitchen_info || {}) };
        const currentProdTrans = { ...(currentContent.product_translations || {}) };
        const prodId = editingId === 'new' ? savedProduct?.id : editingId;

        if (brandToSave) {
          if (prodId) currentBrands[prodId] = brandToSave;
          currentBrands[editForm.name] = brandToSave;
        } else {
          if (prodId) delete currentBrands[prodId];
          delete currentBrands[editForm.name];
        }

        if (hideImageToSave) {
          if (prodId) currentHideImages[prodId] = true;
          currentHideImages[editForm.name] = true;
          currentHideImages[trimmedName] = true;
        } else {
          if (prodId) delete currentHideImages[prodId];
          delete currentHideImages[editForm.name];
          delete currentHideImages[trimmedName];
        }

        if (allowedCompanyIdsToSave && allowedCompanyIdsToSave.length > 0) {
          if (prodId) currentRestricted[prodId] = allowedCompanyIdsToSave;
          currentRestricted[editForm.name] = allowedCompanyIdsToSave;
          currentRestricted[trimmedName] = allowedCompanyIdsToSave;
        } else {
          if (prodId) delete currentRestricted[prodId];
          delete currentRestricted[editForm.name];
          delete currentRestricted[trimmedName];
        }

        const kitchenEntry = {
          kitchen_name: kitchenNameToSave,
          ingredients: kitchenIngredientsToSave,
          prep_instructions: kitchenPrepToSave
        };
        if (kitchenNameToSave || kitchenIngredientsToSave || kitchenPrepToSave) {
          if (prodId) currentKitchen[prodId] = kitchenEntry;
          if (editForm.name) currentKitchen[editForm.name] = kitchenEntry;
          currentKitchen[trimmedName] = kitchenEntry;
        } else {
          if (prodId) delete currentKitchen[prodId];
          if (editForm.name) delete currentKitchen[editForm.name];
          delete currentKitchen[trimmedName];
        }

        if (extraInfoEnToSave) {
          if (prodId) currentProdTrans[prodId] = { ...(currentProdTrans[prodId] || {}), extra_info_en: extraInfoEnToSave };
          if (editForm.name) currentProdTrans[editForm.name] = { ...(currentProdTrans[editForm.name] || {}), extra_info_en: extraInfoEnToSave };
          currentProdTrans[trimmedName] = { ...(currentProdTrans[trimmedName] || {}), extra_info_en: extraInfoEnToSave };
        } else {
          if (prodId && currentProdTrans[prodId]) {
            const copy = { ...currentProdTrans[prodId] };
            delete copy.extra_info_en;
            if (Object.keys(copy).length === 0) delete currentProdTrans[prodId];
            else currentProdTrans[prodId] = copy;
          }
          if (editForm.name && currentProdTrans[editForm.name]) {
            const copy = { ...currentProdTrans[editForm.name] };
            delete copy.extra_info_en;
            if (Object.keys(copy).length === 0) delete currentProdTrans[editForm.name];
            else currentProdTrans[editForm.name] = copy;
          }
          if (currentProdTrans[trimmedName]) {
            const copy = { ...currentProdTrans[trimmedName] };
            delete copy.extra_info_en;
            if (Object.keys(copy).length === 0) delete currentProdTrans[trimmedName];
            else currentProdTrans[trimmedName] = copy;
          }
        }

        await supabase.from('store_settings').update({
          page_content: {
            ...currentContent,
            product_brands: currentBrands,
            hide_image_products: currentHideImages,
            company_restricted_products: currentRestricted,
            product_kitchen_info: currentKitchen,
            product_translations: currentProdTrans
          }
        }).eq('id', 1);
      } catch (syncErr) {
        console.warn('Could not sync brand/hide_image/kitchen/translations to store_settings:', syncErr);
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
        const cleanName = (oldProduct.name || '').trim();
        await supabase.from('ob_product_prices').delete().ilike('product_name', cleanName);
        await supabase.from('ob_company_assortment').delete().ilike('product_name', cleanName);
        try {
          const { data: storeData } = await supabase.from('store_settings').select('page_content').eq('id', 1).maybeSingle();
          if (storeData?.page_content) {
            const brands = { ...(storeData.page_content.product_brands || {}) };
            delete brands[id];
            delete brands[oldProduct.name];
            delete brands[cleanName];

            const hideImages = { ...(storeData.page_content.hide_image_products || {}) };
            delete hideImages[id];
            delete hideImages[oldProduct.name];
            delete hideImages[cleanName];

            const restricted = { ...(storeData.page_content.company_restricted_products || {}) };
            delete restricted[id];
            delete restricted[oldProduct.name];
            delete restricted[cleanName];

            await supabase.from('store_settings').update({
              page_content: {
                ...storeData.page_content,
                product_brands: brands,
                hide_image_products: hideImages,
                company_restricted_products: restricted
              }
            }).eq('id', 1);
          }
        } catch (e) {}
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
            <input type="text" placeholder="Merk (optioneel, bijv. Mora of Van Dobben)" className="w-full px-2 py-1.5 border rounded text-xs focus:border-[#151f33] focus:outline-none" value={editForm.brand || ''} onChange={e => setEditForm({...editForm, brand: e.target.value})} />
            <input type="text" placeholder="Afbeelding URL" className="w-full px-2 py-1.5 border rounded text-xs focus:border-[#151f33] focus:outline-none" value={editForm.image_url || ''} onChange={e => setEditForm({...editForm, image_url: e.target.value})} />
            <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer select-none py-1">
              <input 
                type="checkbox" 
                checked={Boolean(editForm.hide_image)} 
                onChange={e => setEditForm({...editForm, hide_image: e.target.checked})} 
                className="rounded border-gray-300 text-[#151f33] focus:ring-[#151f33] cursor-pointer" 
              />
              <span className="font-semibold text-gray-800">Afbeelding uitzetten op bestel- en assortimentpagina</span>
              <span className="text-[11px] text-gray-500">(wordt alleen getoond bij 'Extra informatie' popup)</span>
            </label>
            
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider block">Extra informatie (Nederlands)</span>
              <textarea placeholder="Extra informatie (bijv. allergenen, ingrediënten)..." className="w-full px-2 py-1.5 border rounded text-xs focus:border-[#151f33] focus:outline-none min-h-[50px]" value={editForm.extra_info || ''} onChange={e => setEditForm({...editForm, extra_info: e.target.value})} />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider block flex items-center gap-1">
                🇬🇧 Extra informatie (Engels / English)
              </span>
              <textarea placeholder="Extra information in English (e.g. allergens, ingredients, serving notes)..." className="w-full px-2 py-1.5 border border-amber-300 bg-amber-50/20 rounded text-xs focus:border-[#151f33] focus:outline-none min-h-[50px]" value={editForm.extra_info_en || ''} onChange={e => setEditForm({...editForm, extra_info_en: e.target.value})} />
            </div>
            
            <div className="flex flex-col gap-1 mt-2">
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Extra Categorieën</span>
              <div className="flex flex-wrap gap-1 items-center">
               {(editForm.additional_categories || []).map((c, cIdx) => (
                 <span key={`add-cat-${c}-${cIdx}`} className="bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
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
                 {categories.filter(c => !(editForm.additional_categories || []).includes(c) && c !== editForm.category).map((c, cIdx) => (
                   <option key={`opt-cat-${c}-${cIdx}`} value={c}>{c}</option>
                 ))}
               </select>
              </div>
            </div>

          </div>

          {/* Bedrijfsspecifieke zichtbaarheid */}
          <div className="bg-indigo-50/60 p-2.5 rounded-lg border border-indigo-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-indigo-950 flex items-center gap-1.5">
                🏢 Zichtbaarheid voor bedrijven
              </span>
              {(editForm.allowed_company_ids || []).length > 0 && (
                <button
                  type="button"
                  onClick={() => setEditForm({ ...editForm, allowed_company_ids: [] })}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 underline font-medium"
                >
                  Zichtbaar voor iedereen maken
                </button>
              )}
            </div>
            <p className="text-[11px] text-indigo-800/80">
              {(editForm.allowed_company_ids || []).length === 0 ? (
                <span>🟢 <strong>Standaard:</strong> Zichtbaar voor alle bedrijven en gasten.</span>
              ) : (
                <span>🔒 <strong>Beperkt:</strong> Alleen geselecteerde bedrijven hieronder kunnen dit product zien en bestellen.</span>
              )}
            </p>
            <div className="flex flex-wrap gap-1.5 items-center">
              {(editForm.allowed_company_ids || []).map((cid, cidIdx) => (
                <span key={`cid-${cid}-${cidIdx}`} className="bg-white text-indigo-900 border border-indigo-300 px-2 py-0.5 rounded-md text-xs font-semibold flex items-center gap-1 shadow-xs">
                  🏢 {companyNamesMap[cid] || cid}
                  <button
                    type="button"
                    onClick={() => setEditForm({
                      ...editForm,
                      allowed_company_ids: (editForm.allowed_company_ids || []).filter(id => id !== cid)
                    })}
                    className="text-indigo-400 hover:text-red-600 ml-0.5"
                    title="Verwijderen"
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
              <select
                className="px-2 py-1 rounded-md text-xs border border-indigo-200 bg-white text-indigo-900 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-xs"
                value=""
                onChange={e => {
                  const val = e.target.value;
                  if (val && !(editForm.allowed_company_ids || []).includes(val)) {
                    setEditForm({
                      ...editForm,
                      allowed_company_ids: [...(editForm.allowed_company_ids || []), val]
                    });
                  }
                }}
              >
                <option value="" disabled>+ Kies bedrijf om exclusief toegang te geven...</option>
                {companies
                  .filter(c => !(editForm.allowed_company_ids || []).includes(c.id))
                  .map((c, idx) => (
                    <option key={`menu-comp-${c.id || idx}-${idx}`} value={c.id}>{c.name}</option>
                  ))
                }
              </select>
            </div>
          </div>

          {/* 🧑‍🍳 Keuken & Prep Info (Engels / Keukenteam) */}
          <div className="bg-amber-50/80 p-2.5 rounded-lg border border-amber-300 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-950 flex items-center gap-1.5">
                <ChefHat size={14} className="text-amber-700" />
                🧑‍🍳 Keuken & Prep Info (Kitchen / English)
              </span>
              {(() => {
                const cleanName = (editForm.name || '').trim();
                const suggestion = DEFAULT_KITCHEN_SUGGESTIONS[cleanName] ||
                  Object.entries(DEFAULT_KITCHEN_SUGGESTIONS).find(([k]) => cleanName.toLowerCase().includes(k.toLowerCase()))?.[1];
                if (suggestion && (!editForm.kitchen_name || !editForm.kitchen_ingredients || !editForm.kitchen_prep_instructions)) {
                  return (
                    <button
                      type="button"
                      onClick={() => {
                        setEditForm({
                          ...editForm,
                          kitchen_name: editForm.kitchen_name || suggestion.kitchen_name,
                          kitchen_ingredients: editForm.kitchen_ingredients || suggestion.ingredients,
                          kitchen_prep_instructions: editForm.kitchen_prep_instructions || suggestion.prep_instructions
                        });
                      }}
                      className="text-[10px] bg-amber-200/90 hover:bg-amber-300 text-amber-950 px-2 py-0.5 rounded font-medium flex items-center gap-1 transition-colors cursor-pointer"
                      title="Vul lege velden automatisch aan met de standaard suggestie"
                    >
                      <Sparkles size={11} /> Slimme suggestie invullen
                    </button>
                  );
                }
                return null;
              })()}
            </div>
            <p className="text-[11px] text-amber-900/80">
              Informatie specifiek voor de keuken (Engelse benaming, allergenen/ingrediënten en frituurtijd/bereiding). Wordt automatisch per item meegestuurd naar Biteberry (KDS / keukentickets).
            </p>
            <div className="space-y-2">
              <div>
                <label className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block mb-0.5">
                  Keukennaam / Engelse term (Kitchen Name)
                </label>
                <input
                  type="text"
                  placeholder="Bijv. Beef Bitterballen (Kalfs) [Mustard]"
                  className="w-full px-2 py-1.5 border border-amber-300 rounded text-xs bg-white text-gray-800 focus:outline-none focus:border-amber-600"
                  value={editForm.kitchen_name || ''}
                  onChange={e => setEditForm({ ...editForm, kitchen_name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block mb-0.5">
                  Ingrediënten & Allergenen (Ingredients list for kitchen)
                </label>
                <textarea
                  placeholder="Bijv. Dutch beef ragout, breadcrumb crust, parsley. Allergens: Gluten, Dairy, Mustard, Celery."
                  className="w-full px-2 py-1.5 border border-amber-300 rounded text-xs bg-white text-gray-800 focus:outline-none focus:border-amber-600 min-h-[50px]"
                  value={editForm.kitchen_ingredients || ''}
                  onChange={e => setEditForm({ ...editForm, kitchen_ingredients: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block mb-0.5">
                  Bereidingswijze & Frituuradvies (Cooking / Prep instructions)
                </label>
                <textarea
                  placeholder="Bijv. Deep fry 175-180°C for 4.5 to 5 mins from frozen. Drain well. Serve with 2 mustard cups per 25pcs."
                  className="w-full px-2 py-1.5 border border-amber-300 rounded text-xs bg-white text-gray-800 focus:outline-none focus:border-amber-600 min-h-[50px]"
                  value={editForm.kitchen_prep_instructions || ''}
                  onChange={e => setEditForm({ ...editForm, kitchen_prep_instructions: e.target.value })}
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-1">
             <div className="flex items-center justify-between">
               <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Varianten (Keuzes)</span>
               <span className="text-[10px] text-gray-400">Gebruik pijltjes om volgorde te wijzigen</span>
             </div>
             <div className="flex flex-wrap gap-1.5 items-center">
               {(editForm.variants || []).map((v, idx) => {
                 const canMoveLeft = idx > 0;
                 const canMoveRight = idx < (editForm.variants || []).length - 1;
                 const moveVariant = (dir: -1 | 1) => {
                   const arr = [...(editForm.variants || [])];
                   const target = idx + dir;
                   if (target < 0 || target >= arr.length) return;
                   const tmp = arr[idx];
                   arr[idx] = arr[target];
                   arr[target] = tmp;
                   setEditForm({ ...editForm, variants: arr });
                 };
                 return (
                   <span key={`menu-var-${v}-${idx}`} className="bg-blue-50 text-ob-blue border border-blue-200 px-2 py-0.5 rounded-md text-xs flex items-center gap-1.5 shadow-xs">
                     <span className="font-medium">{v}</span>
                     <div className="flex items-center gap-0.5 border-l border-blue-200 pl-1 ml-0.5">
                       <button
                         type="button"
                         disabled={!canMoveLeft}
                         onClick={() => moveVariant(-1)}
                         title="Naar voren verplaatsen"
                         className="text-ob-blue/60 hover:text-ob-blue disabled:opacity-25 cursor-pointer p-0.5"
                       >
                         <ChevronUp size={12} className="-rotate-90" />
                       </button>
                       <button
                         type="button"
                         disabled={!canMoveRight}
                         onClick={() => moveVariant(1)}
                         title="Naar achteren verplaatsen"
                         className="text-ob-blue/60 hover:text-ob-blue disabled:opacity-25 cursor-pointer p-0.5"
                       >
                         <ChevronDown size={12} className="-rotate-90" />
                       </button>
                       <button
                         type="button"
                         onClick={() => setEditForm({...editForm, variants: (editForm.variants || []).filter(x => x !== v)})}
                         className="hover:text-red-500 text-gray-400 cursor-pointer p-0.5 ml-0.5"
                         title="Verwijderen"
                       >
                         <X size={12} />
                       </button>
                     </div>
                   </span>
                 );
               })}
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
                 {allVariants.filter(v => !(editForm.variants || []).includes(v)).map((v, idx) => (
                   <option key={`menu-var-opt-${v}-${idx}`} value={v}>{v}</option>
                 ))}
               </select>
               <input type="text" placeholder="Of typ nieuw..." className="px-2 py-0.5 rounded-md text-xs border border-gray-200 w-24 focus:outline-none focus:border-ob-blue" onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); const val = e.currentTarget.value.trim(); if(val && !(editForm.variants || []).includes(val)) { setEditForm({...editForm, variants: [...(editForm.variants || []), val]}); } e.currentTarget.value = ''; } }} />
             </div>
          </div>
          
          <div className="space-y-1">
             <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Sauzen</div>
             <div className="flex flex-wrap gap-1.5 items-center">
               {(editForm.sauces || []).map((s, idx) => (
                 <span key={`menu-sauce-${s}-${idx}`} className="bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-md text-xs flex items-center gap-1">
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
                 {allSauces.filter(s => !(editForm.sauces || []).includes(s)).map((s, idx) => (
                   <option key={`menu-sauce-opt-${s}-${idx}`} value={s}>{s}</option>
                 ))}
               </select>
               <input type="text" placeholder="Of typ nieuw..." className="px-2 py-0.5 rounded-md text-xs border border-gray-200 w-24 focus:outline-none focus:border-orange-400" onKeyDown={(e) => { if(e.key === 'Enter') { e.preventDefault(); const val = e.currentTarget.value.trim(); if(val && !(editForm.sauces || []).includes(val)) { setEditForm({...editForm, sauces: [...(editForm.sauces || []), val]}); } e.currentTarget.value = ''; } }} />
             </div>
          </div>
        </td>
        <td className="px-2 py-2 align-top">
          {isCreatingCategory ? (
            <div className="flex gap-1 items-center">
              <input type="text" autoFocus className="w-full px-2 py-1.5 border rounded text-sm focus:border-[#151f33] focus:outline-none" value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="Nieuwe categorie..." />
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
              {categories.map((c, idx) => <option key={`menu-cat-opt-${c}-${idx}`} value={c}>{c}</option>)}
            </select>
          )}
        </td>
        <td className="px-2 py-2 align-top">
          <div className="flex gap-1">
            {[0, 1, 2, 3].map(index => (
              <input 
                key={`portion-idx-${index}`}
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
              {statuses.map((s, idx) => <option key={`menu-stat-opt-${s}-${idx}`} value={s}>{
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
        <div className="flex items-center gap-2.5">
          <button 
            type="button"
            onClick={() => setIsKitchenSheetOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-3.5 py-2 rounded-lg text-sm font-semibold shadow-xs transition-all cursor-pointer"
            title="Bekijk en bewerk alle keukennamen, ingrediënten en bereidingsinstructies voor de keuken"
          >
            <ChefHat size={16} /> Keuken & Prep Cheat Sheet
          </button>
          <button 
            onClick={() => {
              setEditingId('new');
              setEditForm({ status: 'active', portions: [], category: 'Nieuwe Categorie' });
              setIsCreatingCategory(true);
              setNewCategory('');
            }}
            className="flex items-center gap-2 bg-[#5170ff] text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            <Plus size={16} /> Nieuwe Categorie
          </button>
        </div>
      </div>

            <div className="w-full max-w-full overflow-auto custom-scrollbar max-h-[calc(100vh-320px)] space-y-6 p-1 pb-10">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          
          

          {categoryList.map((cat, catIndex) => (
            <div key={`cat-card-${cat.title || catIndex}-${catIndex}`} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
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
                  <button
                    type="button"
                    onClick={() => {
                      if (editingCatDesc === cat.title) {
                        setEditingCatDesc(null);
                      } else {
                        setEditingCatDesc(cat.title);
                        setEditingCatRestrictions(null);
                        setCatDescInput(categoryDescriptions[cat.title] || '');
                      }
                    }}
                    className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border transition-colors ${
                      categoryDescriptions[cat.title]
                        ? 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100 font-medium'
                        : 'bg-white text-gray-500 border-gray-200 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    title="Optionele algemene tekst/informatie boven deze categorie instellen"
                  >
                    <Edit2 size={12} />
                    {categoryDescriptions[cat.title] ? 'Categorie-tekst bewerken' : '+ Categorie-tekst'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (editingCatRestrictions === cat.title) {
                        setEditingCatRestrictions(null);
                      } else {
                        setEditingCatRestrictions(cat.title);
                        setEditingCatDesc(null);
                      }
                    }}
                    className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border transition-colors ${
                      categoryRestrictions[cat.title]?.length > 0
                        ? 'bg-indigo-50 text-indigo-900 border-indigo-300 hover:bg-indigo-100 font-semibold'
                        : 'bg-white text-gray-500 border-gray-200 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    title="Zichtbaarheid van hele categorie instellen voor specifieke bedrijven"
                  >
                    <span>🏢</span>
                    {categoryRestrictions[cat.title]?.length > 0 
                      ? `Alleen voor: ${categoryRestrictions[cat.title].length} ${categoryRestrictions[cat.title].length === 1 ? 'bedrijf' : 'bedrijven'}`
                      : '+ Zichtbaarheid'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (editingCatVariants === cat.title) {
                        setEditingCatVariants(null);
                      } else {
                        setEditingCatVariants(cat.title);
                        setEditingCatDesc(null);
                        setEditingCatRestrictions(null);
                      }
                    }}
                    className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
                      categoryVariantRules[cat.title] && Object.keys(categoryVariantRules[cat.title]).length > 0
                        ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 font-semibold shadow-xs'
                        : 'bg-white text-gray-500 border-gray-200 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    title="Volgorde en weergave van keuzes/varianten (bijv. Rund, Kalfs, Vega) aanpassen of verbergen voor deze categorie"
                  >
                    <span>🔀</span>
                    {categoryVariantRules[cat.title] && Object.keys(categoryVariantRules[cat.title]).length > 0
                      ? `Keuzes/Varianten (${Object.keys(categoryVariantRules[cat.title]).length} aangepast)`
                      : '+ Keuzes/Varianten'}
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

              {/* Categorie zichtbaarheid bewerken */}
              {editingCatRestrictions === cat.title && (
                <div className="bg-indigo-50/80 p-3.5 border-b border-indigo-200 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-indigo-950 flex items-center gap-1.5">
                      🏢 Zichtbaarheid van hele categorie '{cat.title}':
                    </span>
                    <div className="flex items-center gap-2">
                      {categoryRestrictions[cat.title]?.length > 0 && (
                        <button
                          type="button"
                          onClick={() => handleSaveCategoryRestrictions(cat.title, [])}
                          className="text-xs text-indigo-700 hover:text-indigo-950 underline font-medium"
                        >
                          Zichtbaar voor iedereen maken
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setEditingCatRestrictions(null)}
                        className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
                      >
                        Sluiten
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-indigo-900/80">
                    {(categoryRestrictions[cat.title] || []).length === 0 ? (
                      <span>🟢 <strong>Standaard:</strong> Deze categorie is zichtbaar voor alle bedrijven en gasten.</span>
                    ) : (
                      <span>🔒 <strong>Beperkt:</strong> Alleen de geselecteerde bedrijven hieronder kunnen deze categorie en bijbehorende producten zien en bestellen. Gasten en overige bedrijven zien deze categorie niet.</span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {(categoryRestrictions[cat.title] || []).map((cid, idx) => (
                      <span key={`res-cid-${cid}-${idx}`} className="bg-white text-indigo-900 border border-indigo-300 px-2 py-0.5 rounded-md text-xs font-semibold flex items-center gap-1 shadow-xs">
                        🏢 {companyNamesMap[cid] || cid}
                        <button
                          type="button"
                          onClick={() => {
                            const current = categoryRestrictions[cat.title] || [];
                            handleSaveCategoryRestrictions(cat.title, current.filter(id => id !== cid));
                          }}
                          className="text-indigo-400 hover:text-red-600 ml-0.5"
                          title="Verwijderen"
                        >
                          <X size={13} />
                        </button>
                      </span>
                    ))}
                    <select
                      className="px-2 py-1 rounded-md text-xs border border-indigo-200 bg-white text-indigo-900 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-xs"
                      value=""
                      onChange={e => {
                        const val = e.target.value;
                        if (val) {
                          const current = categoryRestrictions[cat.title] || [];
                          if (!current.includes(val)) {
                            handleSaveCategoryRestrictions(cat.title, [...current, val]);
                          }
                        }
                      }}
                    >
                      <option value="" disabled>+ Kies bedrijf om exclusief toegang te geven...</option>
                      {companies
                        .filter(c => !(categoryRestrictions[cat.title] || []).includes(c.id))
                        .map((c, idx) => (
                          <option key={`res-comp-${c.id || idx}-${idx}`} value={c.id}>{c.name}</option>
                        ))
                      }
                    </select>
                  </div>
                </div>
              )}

              {/* Actieve categorie restrictie weergave indien niet in edit mode */}
              {editingCatRestrictions !== cat.title && categoryRestrictions[cat.title]?.length > 0 && (
                <div className="bg-indigo-50/50 px-4 py-2 border-b border-indigo-100 flex items-center justify-between text-xs text-indigo-900">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="font-semibold text-indigo-950 shrink-0">🔒 Categorie alleen zichtbaar voor:</span>
                    <span className="font-medium text-indigo-800 truncate">
                      {categoryRestrictions[cat.title].map(id => companyNamesMap[id] || id).join(', ')}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCatRestrictions(cat.title);
                      setEditingCatDesc(null);
                    }}
                    className="text-indigo-600 hover:underline text-[11px] shrink-0 font-medium ml-3"
                  >
                    Aanpassen
                  </button>
                </div>
              )}

              {/* Optionele categorie beschrijving bewerken */}
              {editingCatDesc === cat.title && (
                <div className="bg-blue-50/70 p-3.5 border-b border-blue-100 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-blue-950 flex items-center gap-1.5">
                      ℹ️ Algemene informatie / tekst boven '{cat.title}' op assortiments- en bestelpagina's:
                    </span>
                    <div className="flex items-center gap-2">
                      {categoryDescriptions[cat.title] && (
                        <button
                          type="button"
                          onClick={() => handleSaveCategoryDescription(cat.title, '')}
                          className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
                        >
                          <Trash2 size={12} /> Tekst wissen
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setEditingCatDesc(null)}
                        className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
                      >
                        Annuleren
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveCategoryDescription(cat.title, catDescInput)}
                        className="bg-[#5170ff] text-white px-3 py-1 rounded text-xs font-medium hover:bg-blue-600"
                      >
                        Opslaan
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={catDescInput}
                    onChange={e => setCatDescInput(e.target.value)}
                    placeholder="Typ hier een optionele beschrijving of algemene toelichting die boven deze categorie wordt getoond..."
                    className="w-full text-xs p-2.5 border border-blue-200 rounded-md bg-white text-gray-800 focus:outline-none focus:border-blue-500"
                    rows={2}
                  />
                </div>
              )}

              {/* Actieve categorie beschrijving weergave als niet in edit mode */}
              {editingCatDesc !== cat.title && categoryDescriptions[cat.title] && (
                <div className="bg-amber-50/50 px-4 py-2 border-b border-amber-100 flex items-center justify-between text-xs text-gray-700">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="font-semibold text-amber-900 shrink-0">ℹ️ Categorie tekst:</span>
                    <span className="italic text-gray-700 truncate">{categoryDescriptions[cat.title]}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCatDesc(cat.title);
                      setCatDescInput(categoryDescriptions[cat.title] || '');
                    }}
                    className="text-blue-700 hover:underline text-[11px] shrink-0 font-medium ml-3"
                  >
                    Aanpassen
                  </button>
                </div>
              )}

              {/* Categorie varianten & keuzes bewerken */}
              {editingCatVariants === cat.title && (() => {
                const categoryProductsWithVariants = products.filter(p => 
                  (p.category === cat.title || (p.additional_categories && p.additional_categories.includes(cat.title))) &&
                  p.variants && p.variants.length > 0
                );

                const activeRulesForCat = categoryVariantRules[cat.title] || {};

                return (
                  <div className="bg-amber-50/90 p-4 border-b border-amber-200 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5 uppercase tracking-wide">
                          🔀 Keuzes & Varianten voor categorie '{cat.title}'
                        </span>
                        <p className="text-xs text-amber-900/80 mt-0.5">
                          Bepaal hieronder de volgorde van keuzes (bijv. Vega voorop) en verberg opties die niet in categorie <strong>'{cat.title}'</strong> mogen verschijnen (bijv. Rund & Kalfs verbergen in Vega).
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setEditingCatVariants(null)}
                          className="text-xs bg-white text-gray-700 border border-gray-200 hover:bg-gray-100 px-3 py-1 rounded-md font-medium cursor-pointer"
                        >
                          Sluiten
                        </button>
                      </div>
                    </div>

                    {categoryProductsWithVariants.length === 0 ? (
                      <div className="bg-white/80 border border-amber-200 rounded-lg p-3 text-xs text-amber-900 italic">
                        Geen producten met meerdere keuzes/varianten gevonden in categorie '{cat.title}'. Voeg eerst varianten (bijv. Rund, Kalfs, Vega) toe aan producten via de bewerk-knop bij het product.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {categoryProductsWithVariants.map((prod, prodIdx) => {
                          const prodRule = activeRulesForCat[prod.id] || activeRulesForCat[prod.name] || activeRulesForCat[(prod.name || '').trim()];
                          const hasCustomRule = Boolean(prodRule && ((prodRule.order && prodRule.order.length > 0) || (prodRule.hidden && prodRule.hidden.length > 0)));
                          const hiddenList = prodRule?.hidden || [];

                          // Calculate display order for this product in this category
                          let displayVariants = [...(prod.variants || [])];
                          if (prodRule?.order && prodRule.order.length > 0) {
                            const orderMap = new Map<string, number>(prodRule.order.map((name, i) => [name.trim().toLowerCase(), i]));
                            displayVariants.sort((a, b) => {
                              const posA = orderMap.has(a.trim().toLowerCase()) ? (orderMap.get(a.trim().toLowerCase()) as number) : 999;
                              const posB = orderMap.has(b.trim().toLowerCase()) ? (orderMap.get(b.trim().toLowerCase()) as number) : 999;
                              return posA - posB;
                            });
                          }

                          const hasVegaVariant = (prod.variants || []).some(v => /vega|vegan|vegetarisch|kaas|groente/i.test(v));
                          const hasMeatVariant = (prod.variants || []).some(v => /rund|kalf|kip|vlees|varken/i.test(v));

                          return (
                            <div key={`cat-var-prod-${prod.id || prod.name}-${prodIdx}`} className="bg-white rounded-lg border border-amber-200 p-3 shadow-xs">
                              <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-gray-100">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-sm text-gray-900">{prod.name}</span>
                                  {prod.category !== cat.title && (
                                    <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded font-medium">
                                      Hoofdcategorie: {prod.category}
                                    </span>
                                  )}
                                  {hasCustomRule && (
                                    <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full">
                                      Aangepast voor {cat.title}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  {hasVegaVariant && hasMeatVariant && (
                                    <button
                                      type="button"
                                      disabled={isSavingCatVariants}
                                      onClick={() => {
                                        const vegaItems = displayVariants.filter(v => /vega|vegan|vegetarisch|kaas|groente/i.test(v));
                                        const nonVegaItems = displayVariants.filter(v => !/vega|vegan|vegetarisch|kaas|groente/i.test(v));
                                        const newOrder = [...vegaItems, ...nonVegaItems];
                                        const newHidden = nonVegaItems;
                                        handleSaveCategoryVariantRule(cat.title, prod.id, prod.name, newOrder, newHidden);
                                      }}
                                      className="text-[11px] bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-1 rounded font-medium flex items-center gap-1 cursor-pointer"
                                      title="Zet Vega voorop en verberg Rund/Kalfs/Vlees opties voor deze categorie"
                                    >
                                      🌱 Alleen Vega tonen (verberg vlees)
                                    </button>
                                  )}
                                  {hasCustomRule && (
                                    <button
                                      type="button"
                                      disabled={isSavingCatVariants}
                                      onClick={() => handleResetCategoryVariantRule(cat.title, prod.id, prod.name)}
                                      className="text-[11px] text-gray-500 hover:text-red-600 flex items-center gap-1 cursor-pointer px-1 py-0.5"
                                      title="Herstel naar standaard productvolgorde en maak alle opties zichtbaar"
                                    >
                                      <RotateCcw size={11} /> Herstel standaard
                                    </button>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-col gap-1.5">
                                <span className="text-[11px] text-gray-500 font-medium">
                                  Volgorde & Zichtbaarheid van opties op bestelpagina onder '{cat.title}':
                                </span>
                                <div className="flex flex-wrap gap-2 items-center">
                                  {displayVariants.map((v, vIdx) => {
                                    const isHidden = hiddenList.some(h => h.trim().toLowerCase() === v.trim().toLowerCase());
                                    const canMoveLeft = vIdx > 0;
                                    const canMoveRight = vIdx < displayVariants.length - 1;

                                    const handleMove = (dir: -1 | 1) => {
                                      const arr = [...displayVariants];
                                      const target = vIdx + dir;
                                      if (target < 0 || target >= arr.length) return;
                                      const tmp = arr[vIdx];
                                      arr[vIdx] = arr[target];
                                      arr[target] = tmp;
                                      handleSaveCategoryVariantRule(cat.title, prod.id, prod.name, arr, hiddenList);
                                    };

                                    const handleToggleHidden = () => {
                                      let newHidden: string[];
                                      if (isHidden) {
                                        newHidden = hiddenList.filter(h => h.trim().toLowerCase() !== v.trim().toLowerCase());
                                      } else {
                                        newHidden = [...hiddenList, v];
                                      }
                                      handleSaveCategoryVariantRule(cat.title, prod.id, prod.name, displayVariants, newHidden);
                                    };

                                    return (
                                      <div
                                        key={`cat-rule-var-${v}-${vIdx}`}
                                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-all ${
                                          isHidden
                                            ? 'bg-gray-100 text-gray-400 border-gray-300 line-through'
                                            : 'bg-white text-gray-800 border-blue-200 shadow-xs'
                                        }`}
                                      >
                                        <span className="font-bold text-gray-900">{vIdx + 1}.</span>
                                        <span className={`font-semibold ${isHidden ? 'text-gray-400' : 'text-ob-blue'}`}>
                                          {v}
                                        </span>

                                        <div className="flex items-center gap-0.5 border-l border-gray-200 pl-1.5 ml-1">
                                          <button
                                            type="button"
                                            disabled={!canMoveLeft || isSavingCatVariants}
                                            onClick={() => handleMove(-1)}
                                            title="Naar voren (eerder)"
                                            className="p-0.5 text-gray-500 hover:text-ob-blue disabled:opacity-20 cursor-pointer"
                                          >
                                            <ChevronUp size={13} className="-rotate-90" />
                                          </button>
                                          <button
                                            type="button"
                                            disabled={!canMoveRight || isSavingCatVariants}
                                            onClick={() => handleMove(1)}
                                            title="Naar achteren (later)"
                                            className="p-0.5 text-gray-500 hover:text-ob-blue disabled:opacity-20 cursor-pointer"
                                          >
                                            <ChevronDown size={13} className="-rotate-90" />
                                          </button>
                                          <button
                                            type="button"
                                            disabled={isSavingCatVariants}
                                            onClick={handleToggleHidden}
                                            title={isHidden ? `Zichtbaar maken in categorie ${cat.title}` : `Verbergen in categorie ${cat.title}`}
                                            className={`p-1 rounded cursor-pointer transition-colors ml-1 ${
                                              isHidden
                                                ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                            }`}
                                          >
                                            {isHidden ? (
                                              <span className="flex items-center gap-1 text-[10px] no-underline font-semibold">
                                                <EyeOff size={11} /> Verborgen
                                              </span>
                                            ) : (
                                              <span className="flex items-center gap-1 text-[10px] font-semibold">
                                                <Eye size={11} /> Zichtbaar
                                              </span>
                                            )}
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Actieve categorie variant-regels weergave als niet in edit mode */}
              {editingCatVariants !== cat.title && categoryVariantRules[cat.title] && Object.keys(categoryVariantRules[cat.title]).length > 0 && (
                <div className="bg-amber-50/60 px-4 py-2 border-b border-amber-200/80 flex items-center justify-between text-xs text-amber-900">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="font-bold text-amber-950 shrink-0">🔀 Keuzes/Varianten:</span>
                    <span className="italic truncate text-amber-800">
                      Aangepaste volgorde & verbergregels actief voor {Object.keys(categoryVariantRules[cat.title]).length} {Object.keys(categoryVariantRules[cat.title]).length === 1 ? 'product' : 'producten'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCatVariants(cat.title);
                      setEditingCatDesc(null);
                      setEditingCatRestrictions(null);
                    }}
                    className="text-ob-blue hover:underline text-[11px] shrink-0 font-medium ml-3 cursor-pointer"
                  >
                    Aanpassen
                  </button>
                </div>
              )}

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
                    {cat.items.map((p: any, pIdx: number) => (
                      <SortableRow key={`sort-row-${p.id || pIdx}-${pIdx}`} p={p} editingId={editingId} renderEditRow={renderEditRow} handleEdit={handleEdit} handleDelete={handleDelete} handleToggleHideImage={handleToggleHideImage} companyNamesMap={companyNamesMap} />
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

      {/* 🧑‍🍳 Keuken & Prep Cheat Sheet Modal */}
      {isKitchenSheetOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 text-white px-6 py-4 flex items-center justify-between shrink-0 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs text-white">
                  <ChefHat size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    Keuken & Prep Cheat Sheet
                    <span className="text-xs bg-white/25 px-2 py-0.5 rounded-full font-normal">
                      English & Kitchen Reference
                    </span>
                  </h3>
                  <p className="text-xs text-amber-100">
                    Instructies, Engelse benamingen en ingrediënten voor de keuken. Wordt direct per item meegestuurd naar Biteberry (KDS & tickets)!
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white px-3 py-1.5 rounded-lg text-xs font-semibold backdrop-blur-xs transition-colors cursor-pointer"
                  title="Afdrukken voor in de keuken"
                >
                  <Printer size={15} /> Afdrukken
                </button>
                <button
                  type="button"
                  onClick={() => setIsKitchenSheetOpen(false)}
                  className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Sub-toolbar */}
            <div className="bg-amber-50/60 border-b border-amber-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5 flex-1 min-w-[260px]">
                <div className="relative flex-1">
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Zoek product, ingrediënt of keukennaam..."
                    value={kitchenSearch}
                    onChange={e => setKitchenSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-amber-500 shadow-2xs"
                  />
                </div>
                <select
                  value={kitchenCategoryFilter}
                  onChange={e => setKitchenCategoryFilter(e.target.value)}
                  className="bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-amber-500 shadow-2xs cursor-pointer"
                >
                  <option value="ALL">Alle categorieën ({products.length})</option>
                  {categories.map((c, cIdx) => (
                    <option key={`k-cat-${c}-${cIdx}`} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleApplySmartSuggestions}
                  className="flex items-center gap-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                  title="Vul lege velden automatisch aan met de standaard suggesties voor bekende snacks"
                >
                  <Sparkles size={13} className="text-amber-700" /> Slimme suggesties aanvullen
                </button>
                <button
                  type="button"
                  disabled={isSavingKitchenSheet}
                  onClick={handleSaveKitchenSheet}
                  className="flex items-center gap-1.5 bg-[#05053D] hover:bg-blue-950 text-white px-4 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSavingKitchenSheet ? 'Opslaan...' : '💾 Wijzigingen Opslaan'}
                </button>
              </div>
            </div>

            {kitchenSheetSavedNotice && (
              <div className="bg-emerald-50 text-emerald-800 border-b border-emerald-200 px-6 py-2 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                <Check size={14} className="text-emerald-600" /> Keukeninstructies en ingrediënten succesvol opgeslagen!
              </div>
            )}

            {/* Products Table/List */}
            <div className="overflow-y-auto p-6 space-y-4 flex-1 custom-scrollbar">
              {(() => {
                const filtered = products.filter(p => {
                  const matchCat = kitchenCategoryFilter === 'ALL' || p.category === kitchenCategoryFilter;
                  const draft = kitchenDraftMap[p.id] || { kitchen_name: '', ingredients: '', prep_instructions: '' };
                  const q = kitchenSearch.toLowerCase().trim();
                  const matchSearch = !q ||
                    p.name.toLowerCase().includes(q) ||
                    (p.category || '').toLowerCase().includes(q) ||
                    (p.brand || '').toLowerCase().includes(q) ||
                    draft.kitchen_name.toLowerCase().includes(q) ||
                    draft.ingredients.toLowerCase().includes(q) ||
                    draft.prep_instructions.toLowerCase().includes(q);
                  return matchCat && matchSearch;
                });

                if (filtered.length === 0) {
                  return (
                    <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                      Geen producten gevonden die voldoen aan de zoekcriteria.
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    {filtered.map((p, pIdx) => {
                      const draft = kitchenDraftMap[p.id] || {
                        kitchen_name: p.kitchen_name || '',
                        ingredients: p.kitchen_ingredients || '',
                        prep_instructions: p.kitchen_prep_instructions || ''
                      };
                      const cleanName = (p.name || '').trim();
                      const suggestion = DEFAULT_KITCHEN_SUGGESTIONS[cleanName] ||
                        Object.entries(DEFAULT_KITCHEN_SUGGESTIONS).find(([k]) => cleanName.toLowerCase().includes(k.toLowerCase()))?.[1];

                      return (
                        <div
                          key={`kitchen-card-${p.id || p.name || pIdx}-${pIdx}`}
                          className="bg-white rounded-xl border border-gray-200 p-4 hover:border-amber-400 hover:shadow-xs transition-all space-y-3"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2.5">
                            <div className="flex items-center gap-3">
                              {p.image_url && !p.hide_image ? (
                                <img src={p.image_url} alt={p.name} className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800">
                                  <ChefHat size={18} />
                                </div>
                              )}
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-gray-900 text-sm">{p.name}</h4>
                                  <span className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-medium">
                                    {p.category}
                                  </span>
                                  {p.brand && (
                                    <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded font-medium">
                                      Merk: {p.brand}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-gray-500 mt-0.5">
                                  Porties: {p.portions && p.portions.length > 0 ? p.portions.map(n => `${n}st`).join(', ') : 'Geen vaste porties'}
                                </div>
                              </div>
                            </div>

                            {suggestion && (!draft.kitchen_name || !draft.ingredients || !draft.prep_instructions) && (
                              <button
                                type="button"
                                onClick={() => {
                                  setKitchenDraftMap(prev => ({
                                    ...prev,
                                    [p.id]: {
                                      kitchen_name: draft.kitchen_name || suggestion.kitchen_name,
                                      ingredients: draft.ingredients || suggestion.ingredients,
                                      prep_instructions: draft.prep_instructions || suggestion.prep_instructions
                                    }
                                  }));
                                }}
                                className="text-[11px] text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-md font-medium flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Sparkles size={12} className="text-amber-600" /> Suggestie invullen
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider block mb-1">
                                Keukennaam / Engelse term
                              </label>
                              <input
                                type="text"
                                placeholder={suggestion?.kitchen_name || "Bijv. Beef Bitterballen (Kalfs)"}
                                value={draft.kitchen_name}
                                onChange={e => {
                                  const val = e.target.value;
                                  setKitchenDraftMap(prev => ({
                                    ...prev,
                                    [p.id]: { ...draft, kitchen_name: val }
                                  }));
                                }}
                                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-amber-500 bg-white"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider block mb-1">
                                Ingrediënten & Allergenen
                              </label>
                              <textarea
                                placeholder={suggestion?.ingredients || "Bijv. Beef ragout, breadcrumb crust. Allergens: Gluten, Dairy, Mustard."}
                                value={draft.ingredients}
                                onChange={e => {
                                  const val = e.target.value;
                                  setKitchenDraftMap(prev => ({
                                    ...prev,
                                    [p.id]: { ...draft, ingredients: val }
                                  }));
                                }}
                                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-amber-500 bg-white min-h-[58px]"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-gray-600 uppercase tracking-wider block mb-1">
                                Bereiding & Frituurtijd
                              </label>
                              <textarea
                                placeholder={suggestion?.prep_instructions || "Bijv. Deep fry at 180°C for 4.5 mins. Serve with 2 mustard cups."}
                                value={draft.prep_instructions}
                                onChange={e => {
                                  const val = e.target.value;
                                  setKitchenDraftMap(prev => ({
                                    ...prev,
                                    [p.id]: { ...draft, prep_instructions: val }
                                  }));
                                }}
                                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-amber-500 bg-white min-h-[58px]"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Footer */}
            <div className="bg-gray-50 border-t border-gray-200 px-6 py-3.5 flex items-center justify-between shrink-0">
              <span className="text-xs text-gray-500">
                Tip: De keukennaam en bereidingstijd worden op de Biteberry KDS keukenschermen en bonnen direct onder het item getoond.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsKitchenSheetOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Sluiten
                </button>
                <button
                  type="button"
                  disabled={isSavingKitchenSheet}
                  onClick={handleSaveKitchenSheet}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-1.5 rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSavingKitchenSheet ? 'Opslaan...' : 'Alles Opslaan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
