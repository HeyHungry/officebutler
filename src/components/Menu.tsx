import { StoreSettings } from '../lib/supabase';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';

type MenuItem = {
  name: string;
  image_url: string;
  category: string;
  status: string;
};

type MenuCategory = {
  title: string;
  items: MenuItem[];
};

export function Menu({ content }: { content?: any }) {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [infoModalProduct, setInfoModalProduct] = useState<any>(null);

  // Helper to chunk arrays
  const chunkArray = <T,>(arr: T[], size: number): T[][] => {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  };

  useEffect(() => {
    async function fetchMenu() {
      try {
        const { data, error } = await supabase
          .from('ob_products')
          .select('*')
          .neq('status', 'verborgen') // Ensure we don't show hidden items
          .order('sort_order', { ascending: true, nullsFirst: false }).order('category', { ascending: true }).order('name', { ascending: true });

        if (error) throw error;

        // Group by category
        const grouped = (data || []).reduce((acc: Record<string, MenuItem[]>, item) => {
          // You might only want 'actief' and 'meest gekozen' etc. Let's just group them.
          if (['verborgen', 'inactief', 'hidden', 'inactive'].includes((item.status || '').toLowerCase())) return acc;
          
          const itemCats = item.additional_categories && item.additional_categories.length > 0 ? Array.from(new Set([item.category, ...item.additional_categories])) : [item.category || 'Overig'];
          itemCats.forEach(cat => {
            if (!acc[cat]) {
              acc[cat] = [];
            }
            acc[cat].push(item);
          });
          return acc;
        }, {});

        
        const categoriesArray = Object.keys(grouped).map(key => {
          const primaryItems = (data || []).filter(
            (i: any) => (i.category || 'Overig').trim().toLowerCase() === key.trim().toLowerCase()
          );
          const minSortOrder = primaryItems.length > 0
            ? Math.min(...primaryItems.map((i: any) => i.sort_order ?? 9999))
            : Math.min(...grouped[key].map((i: any) => i.sort_order ?? 9999));

          return {
            title: key,
            items: grouped[key],
            minSortOrder
          };
        });
        
        categoriesArray.sort((a, b) => a.minSortOrder - b.minSortOrder);


        setCategories(categoriesArray);
      } catch (err) {
        console.error('Error fetching menu:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMenu();
  }, []);

  return (
    <section id="menu" className="font-serif py-24 bg-ob-cream">
      <div className="font-serif max-w-7xl mx-auto px-6 lg:px-8">
        <div className="font-serif text-center mb-20">
          <h2 className="font-serif text-3xl md:text-5xl text-ob-text mb-4">Onze Selectie</h2>
          <p className="font-serif text-ob-text-light max-w-2xl mx-auto font-serif">Hoogwaardige snacks, vers bereid in de Mokum Local Kitchen.</p>
          <div className="font-serif w-16 h-[1px] bg-ob-accent mx-auto mt-6"></div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ob-accent"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20 text-gray-500 font-serif">
            Op dit moment zijn er geen producten beschikbaar.
          </div>
        ) : (
          <div className="font-serif flex flex-wrap gap-12 lg:gap-16 justify-center">
            {categories.map((category, catIndex) => {
              const itemChunks = chunkArray(category.items, 5);
              
              return (
                <motion.div
                  key={category.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: catIndex * 0.15 }}
                  className={`font-serif flex flex-col w-full ${itemChunks.length > 1 ? 'md:w-[calc(100%-1.5rem)] lg:w-[calc(66.666%-2rem)]' : 'md:w-[calc(50%-1.5rem)] lg:w-[calc(33.333%-2rem)]'}`}
                >
                  <div className="font-serif border-b-2 border-ob-accent pb-4 mb-8">
                    <h3 className="font-serif text-2xl lg:text-3xl text-ob-blue uppercase tracking-widest text-center">{category.title}</h3>
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-8">
                    {itemChunks.map((chunk, chunkIndex) => (
                      <div key={chunkIndex} className="font-serif flex flex-col gap-6 flex-1 min-w-[250px]">
                        {chunk.map((item: any) => (
                          <div key={item.name} className="font-serif flex items-center gap-4 group cursor-pointer border-b border-black/5 pb-4 last:border-0 last:pb-0" onClick={() => item.extra_info && setInfoModalProduct(item)}>
                            <div className="font-serif w-16 h-16 shrink-0 overflow-hidden bg-white shadow-sm p-1 rounded-sm relative">
                              {item.image_url ? (
                                <img 
                                  src={item.image_url} 
                                  alt={item.name}
                                  className="font-serif w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                  loading="lazy"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
                                  <span className="text-xs">Geen foto</span>
                                </div>
                              )}
                            </div>
                            <div className="font-serif flex-1 flex flex-col justify-center">
                              <h4 className="font-serif text-lg text-ob-text group-hover:text-ob-accent transition-colors duration-300 font-medium font-serif flex flex-wrap items-center gap-2">
                                {item.name}
                                {item.status && !['actief', 'inactief', 'verborgen', 'active', 'inactive', 'hidden'].includes((item.status || '').toLowerCase()) && (
  <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 shrink-0 ${['uitverkocht', 'sold out', 'sold_out'].includes((item.status || '').toLowerCase()) ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{item.status === 'new' ? 'Nieuw' : item.status === 'popular' ? 'Meest Gekozen' : item.status === 'sold_out' ? 'Uitverkocht' : item.status === 'coming_soon' ? 'Binnenkort' : item.status}</span>
)}
                              </h4>
                              {item.extra_info && <span className="text-[10px] uppercase tracking-wider text-ob-blue/60 bg-ob-cream px-2 py-0.5 rounded-full w-fit mt-1 group-hover:bg-ob-blue/10 transition-colors">Meer info</span>}
                              {(item.variants && item.variants.length > 0) && (
                                <p className="text-xs text-gray-500 mt-1 flex flex-wrap gap-1">
                                  <span className="font-semibold text-gray-700">Opties:</span> {(() => {
                                    const sortedVariants = [...item.variants].sort((a, b) => {
                                      const isAMatch = a.trim().toLowerCase() === category.title.trim().toLowerCase();
                                      const isBMatch = b.trim().toLowerCase() === category.title.trim().toLowerCase();
                                      if (isAMatch && !isBMatch) return -1;
                                      if (!isAMatch && isBMatch) return 1;
                                      return 0;
                                    });
                                    return sortedVariants.join(', ');
                                  })()}
                                </p>
                              )}
                              {(item.sauces && item.sauces.length > 0) && (
                                <p className="text-xs text-gray-500 mt-0.5 flex flex-wrap gap-1">
                                  <span className="font-semibold text-gray-700">Inclusief:</span> {item.sauces.join(', ')}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {infoModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setInfoModalProduct(null)}>
          <div className="bg-white rounded-2xl p-0 max-w-sm w-full shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <button onClick={() => setInfoModalProduct(null)} className="absolute top-4 right-4 text-white bg-black/40 hover:bg-black/60 rounded-full p-1.5 backdrop-blur-sm z-10 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>
            </button>
            
            {infoModalProduct.image_url ? (
               <div className="w-full h-48 sm:h-56 shrink-0 bg-gray-100">
                 <img src={infoModalProduct.image_url} alt={infoModalProduct.name} className="w-full h-full object-cover" />
               </div>
            ) : (
               <div className="w-full h-24 shrink-0 bg-ob-cream flex items-center justify-center">
                 <svg className="w-8 h-8 text-ob-blue/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
               </div>
            )}
            
            <div className="p-6 overflow-y-auto">
              <h3 className="text-2xl font-serif font-bold text-ob-blue mb-2 pr-6">{infoModalProduct.name}</h3>
              {infoModalProduct.sauces && infoModalProduct.sauces.length > 0 && (
                <div className="inline-flex items-start gap-1.5 bg-yellow-50/40 border border-yellow-100/50 px-2.5 py-1.5 rounded-lg w-fit mb-4">
                  <span className="text-[#d4af37] text-sm leading-none mt-0.5">✦</span> 
                  <span className="text-xs text-gray-600 font-medium leading-tight">Inclusief: <span className="font-bold text-gray-900">{infoModalProduct.sauces.join(', ')}</span></span>
                </div>
              )}
              <div className="text-gray-600 whitespace-pre-wrap">{infoModalProduct.extra_info}</div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
