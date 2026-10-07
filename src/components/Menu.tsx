import { StoreSettings, sortVariantsByCategory, supabase, CategoryVariantRulesMap } from '../lib/supabase';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShoppingBag, Info } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getTypographyStyle } from '../lib/typography';
import { getSnackExtraInfo, hasSnackExtraInfo } from '../lib/translationFallbacks';

type MenuItem = {
  id?: string;
  name: string;
  image_url: string;
  category: string;
  status: string;
  brand?: string;
  extra_info?: string;
  variants?: string[];
  sauces?: string[];
  [key: string]: any;
};

type MenuCategory = {
  title: string;
  items: MenuItem[];
};

export function Menu({ content }: { content?: any }) {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [categoryDescriptions, setCategoryDescriptions] = useState<Record<string, string>>({});
  const [categoryVariantRules, setCategoryVariantRules] = useState<CategoryVariantRulesMap>({});
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
        const [prodsRes, storeRes] = await Promise.all([
          supabase
            .from('ob_products')
            .select('*')
            .neq('status', 'verborgen') // Ensure we don't show hidden items
            .order('sort_order', { ascending: true, nullsFirst: false })
            .order('category', { ascending: true })
            .order('name', { ascending: true }),
          supabase
            .from('store_settings')
            .select('page_content')
            .eq('id', 1)
            .maybeSingle()
        ]);

        if (prodsRes.error) throw prodsRes.error;
        const data = prodsRes.data;

        const brandsMap: Record<string, string> = storeRes?.data?.page_content?.product_brands || content?.product_brands || {};
        const hideImagesMap: Record<string, boolean> = storeRes?.data?.page_content?.hide_image_products || content?.hide_image_products || {};
        const catDescMap: Record<string, string> = storeRes?.data?.page_content?.category_descriptions || content?.category_descriptions || {};
        const companyRestrictionsMap: Record<string, string[]> = storeRes?.data?.page_content?.company_restricted_products || content?.company_restricted_products || {};
        const categoryRestrictionsMap: Record<string, string[]> = storeRes?.data?.page_content?.category_restricted_companies || content?.category_restricted_companies || {};
        const prodTranslationsMap: Record<string, { extra_info_en?: string }> = storeRes?.data?.page_content?.product_translations || content?.product_translations || {};
        const catVariantRules = storeRes?.data?.page_content?.category_variant_rules || content?.category_variant_rules || {};
        setCategoryDescriptions(catDescMap);
        setCategoryVariantRules(catVariantRules);

        const itemsWithBrands = (data || []).map((item: any) => ({
          ...item,
          brand: item.brand || brandsMap[item.id] || brandsMap[item.name] || '',
          extra_info: item.extra_info || '',
          extra_info_en: item.extra_info_en || prodTranslationsMap[item.id]?.extra_info_en || prodTranslationsMap[item.name]?.extra_info_en || prodTranslationsMap[(item.name || '').trim()]?.extra_info_en || '',
          hide_image: item.hide_image != null ? Boolean(item.hide_image) : Boolean(hideImagesMap[item.id] || hideImagesMap[item.name] || hideImagesMap[(item.name || '').trim()]),
          allowed_company_ids: item.allowed_company_ids || companyRestrictionsMap[item.id] || companyRestrictionsMap[item.name] || companyRestrictionsMap[(item.name || '').trim()] || []
        }));

        // Group by category
        const grouped = itemsWithBrands.reduce((acc: Record<string, MenuItem[]>, item: any) => {
          // You might only want 'actief' and 'meest gekozen' etc. Let's just group them.
          if (['verborgen', 'inactief', 'hidden', 'inactive'].includes((item.status || '').toLowerCase())) return acc;
          
          // Exclude products restricted to specific companies from the public menu
          if (item.allowed_company_ids && Array.isArray(item.allowed_company_ids) && item.allowed_company_ids.length > 0) {
            return acc;
          }

          const itemCats = item.additional_categories && item.additional_categories.length > 0 ? Array.from(new Set([item.category, ...item.additional_categories])) : [item.category || 'Overig'];
          itemCats.forEach(cat => {
            // Exclude categories restricted to specific companies
            if (categoryRestrictionsMap[cat] && Array.isArray(categoryRestrictionsMap[cat]) && categoryRestrictionsMap[cat].length > 0) {
              return;
            }
            if (!acc[cat]) {
              acc[cat] = [];
            }
            acc[cat].push(item);
          });
          return acc;
        }, {});

        
        const categoriesArray = Object.keys(grouped)
          .filter(key => !(categoryRestrictionsMap[key] && Array.isArray(categoryRestrictionsMap[key]) && categoryRestrictionsMap[key].length > 0))
          .map(key => {
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
    <section id="menu" className="py-24 bg-ob-cream">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 
            className="text-3xl md:text-5xl text-ob-text mb-4 font-title-default"
            style={getTypographyStyle('title', content?.menu_title_font, content?.menu_title_size)}
          >
            {content?.menu_title || "Onze Selectie"}
          </h2>
          <p 
            className="text-ob-text-light max-w-2xl mx-auto font-subtitle-default"
            style={getTypographyStyle('subtitle', content?.menu_subtitle_font, content?.menu_subtitle_size)}
          >
            {content?.menu_subtitle || "Hoogwaardige snacks, vers bereid in de Mokum Local Kitchen."}
          </p>
          <div className="w-16 h-[1px] bg-ob-accent mx-auto mt-6"></div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ob-accent"></div>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20 text-gray-500 font-paragraph-default">
            {t('Op dit moment zijn er geen producten beschikbaar.', 'Currently there are no products available.')}
          </div>
        ) : (
          <div className="flex flex-wrap gap-12 lg:gap-16 justify-center">
            {categories.map((category, catIndex) => {
              const itemChunks = chunkArray(category.items, 5);
              
              return (
                <motion.div
                  key={`menu-cat-${category.title || catIndex}-${catIndex}`}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: catIndex * 0.15 }}
                  className={`flex flex-col w-full ${itemChunks.length > 1 ? 'md:w-[calc(100%-1.5rem)] lg:w-[calc(66.666%-2rem)]' : 'md:w-[calc(50%-1.5rem)] lg:w-[calc(33.333%-2rem)]'}`}
                >
                  <div className="border-b-2 border-ob-accent pb-4 mb-8 text-center">
                    <h3 
                      className="text-2xl lg:text-3xl text-ob-blue uppercase tracking-widest font-title-default"
                      style={getTypographyStyle('title', content?.menu_category_title_font, content?.menu_category_title_size)}
                    >
                      {t(category.title)}
                    </h3>
                    {categoryDescriptions[category.title] && (
                      <p 
                        className="text-sm text-ob-text-light max-w-2xl mx-auto mt-2 italic font-paragraph-default"
                        style={getTypographyStyle('paragraph', content?.menu_category_desc_font, content?.menu_category_desc_size)}
                      >
                        {t(categoryDescriptions[category.title])}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-8">
                    {itemChunks.map((chunk, chunkIndex) => (
                      <div key={`menu-chunk-${chunkIndex}`} className="flex flex-col gap-6 flex-1 min-w-[250px]">
                        {chunk.map((item: any, itemIdx: number) => {
                          const hasVisibleImage = !item.hide_image && Boolean(item.image_url);
                          return (
                            <div key={`menu-item-${item.id || item.name}-${chunkIndex}-${itemIdx}`} className={`flex items-center ${hasVisibleImage ? 'gap-4 pb-4' : 'gap-3 pb-2.5'} group cursor-pointer border-b border-black/5 last:border-0 last:pb-0`} onClick={() => setInfoModalProduct(item)}>
                              {hasVisibleImage && (
                                <div className="w-16 h-16 shrink-0 overflow-hidden bg-white shadow-sm p-1 rounded-sm relative">
                                  <img 
                                    src={item.image_url} 
                                    alt={t(item.name)}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    loading="lazy"
                                    referrerPolicy="no-referrer"
                                  />
                                </div>
                              )}
                              <div className="flex-1 flex flex-col justify-center">
                                <h4 
                                  className="text-lg text-ob-text group-hover:text-ob-accent transition-colors duration-300 font-normal flex flex-wrap items-center gap-2"
                                  style={{ fontWeight: 400, ...getTypographyStyle('paragraph', content?.menu_item_title_font || 'agrandir_regular', content?.menu_item_title_size) }}
                                >
                                  {t(item.name)}
                                  {item.status && !['actief', 'inactief', 'verborgen', 'active', 'inactive', 'hidden'].includes((item.status || '').toLowerCase()) && (
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ml-2 shrink-0 ${['uitverkocht', 'sold out', 'sold_out'].includes((item.status || '').toLowerCase()) ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{item.status === 'new' ? t('Nieuw', 'New') : item.status === 'popular' ? t('Meest Gekozen', 'Most Popular') : item.status === 'sold_out' ? t('Uitverkocht', 'Sold Out') : item.status === 'coming_soon' ? t('Binnenkort', 'Coming Soon') : item.status}</span>
                                  )}
                                </h4>
                                {(item.extra_info || item.extra_info_en || item.brand || hasSnackExtraInfo(item)) && (
                                  <span className="text-[10px] uppercase tracking-wider text-[#5170ff] bg-ob-cream px-2 py-0.5 rounded-full w-fit mt-1 group-hover:bg-[#5170ff]/10 transition-colors flex items-center gap-1 font-medium">
                                    <Info size={11} className="text-[#5170ff]" />
                                    {t('Extra informatie', 'Extra info')}
                                  </span>
                                )}
                                {(() => {
                                  const visibleVariants = sortVariantsByCategory(item.variants, category.title, item, categoryVariantRules);
                                  if (visibleVariants.length > 1) {
                                    return (
                                      <p className="text-xs text-gray-500 mt-1 flex flex-wrap gap-1">
                                        <span className="font-semibold text-gray-700">{t('Opties', 'Options')}:</span> {visibleVariants.map((v: string) => t(v)).join(', ')}
                                      </p>
                                    );
                                  }
                                  if (visibleVariants.length === 1) {
                                    return (
                                      <p className="text-xs text-gray-500 mt-0.5 flex flex-wrap items-center gap-1">
                                        <span className="font-semibold text-gray-700">{t('Variant', 'Variant')}:</span> <span className="text-[11px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded border border-gray-200">{visibleVariants[0]}</span>
                                      </p>
                                    );
                                  }
                                  return null;
                                })()}
                                {(item.sauces && item.sauces.length > 0) && (
                                  <p className="text-xs text-gray-500 mt-0.5 flex flex-wrap gap-1">
                                    <span className="font-semibold text-gray-700">{t('Inclusief', 'Includes')}:</span> {item.sauces.map((s: string) => t(s)).join(', ')}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
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
                 <img src={infoModalProduct.image_url} alt={t(infoModalProduct.name)} className="w-full h-full object-cover" />
               </div>
            ) : (
               <div className="w-full h-24 shrink-0 bg-ob-cream flex items-center justify-center">
                 <svg className="w-8 h-8 text-ob-blue/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
               </div>
            )}
            
            <div className="p-6 overflow-y-auto">
              <h3 className="text-2xl font-title-default font-normal text-ob-blue mb-2 pr-6">{t(infoModalProduct.name)}</h3>
              {infoModalProduct.brand && (
                <div className="inline-flex items-center gap-2 bg-blue-50/80 border border-blue-200/60 px-3 py-1.5 rounded-lg text-xs font-medium mb-3 font-paragraph-default">
                  <span className="text-ob-blue/70 font-semibold">{t('Merk', 'Brand')}:</span>
                  <span className="text-ob-blue font-bold text-sm font-heading-default">{infoModalProduct.brand}</span>
                </div>
              )}
              {infoModalProduct.variants && infoModalProduct.variants.length > 0 && (
                <p className="text-xs text-gray-500 mb-2 flex flex-wrap gap-1 font-paragraph-default">
                  <span className="font-semibold text-gray-700">{t('Opties', 'Options')}:</span> {sortVariantsByCategory(infoModalProduct.variants, infoModalProduct.category || '', infoModalProduct, categoryVariantRules).map((v: string) => t(v)).join(', ')}
                </p>
              )}
              {infoModalProduct.sauces && infoModalProduct.sauces.length > 0 && (
                <div className="inline-flex items-start gap-1.5 bg-yellow-50/40 border border-yellow-100/50 px-2.5 py-1.5 rounded-lg w-fit mb-3 font-paragraph-default">
                  <span className="text-[#d4af37] text-sm leading-none mt-0.5">✦</span> 
                  <span className="text-xs text-gray-600 font-medium leading-tight">{t('Inclusief', 'Includes')}: <span className="font-bold text-gray-900">{infoModalProduct.sauces.map((s: string) => t(s)).join(', ')}</span></span>
                </div>
              )}
              {getSnackExtraInfo(infoModalProduct, language, t) && (
                <div className="text-gray-600 whitespace-pre-wrap mb-4 font-paragraph-default text-sm leading-relaxed">
                  {getSnackExtraInfo(infoModalProduct, language, t)}
                </div>
              )}

              <div className="pt-4 border-t border-gray-100 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setInfoModalProduct(null);
                    navigate('/guest-order');
                  }}
                  className="w-full bg-[#5170ff] hover:bg-[#4060ee] text-white py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer font-button-default"
                >
                  <ShoppingBag size={18} />
                  {t('Bestellen', 'Order')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
