import { createClient } from '@supabase/supabase-js';
import type { ModificationRulesConfig, CompanyCustomDeadlines } from './orderDeadlines';
export type { ModificationRulesConfig, CompanyCustomDeadlines };

let rawSupabaseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL ? String(import.meta.env.VITE_SUPABASE_URL).trim() : '');
let rawSupabaseAnonKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY ? String(import.meta.env.VITE_SUPABASE_ANON_KEY).trim() : '');

// Detecteer en herstel automatisch wanneer de URL en de Anon Key omgewisseld zijn
if (
  (rawSupabaseUrl.startsWith('sb_publishable') || (!rawSupabaseUrl.includes('.') && rawSupabaseUrl.length > 15)) &&
  (rawSupabaseAnonKey.startsWith('http://') || rawSupabaseAnonKey.startsWith('https://') || rawSupabaseAnonKey.includes('.supabase.co'))
) {
  const temp = rawSupabaseUrl;
  rawSupabaseUrl = rawSupabaseAnonKey;
  rawSupabaseAnonKey = temp;
}

// Centrale gedeelde Supabase backend van Office Butler / Canal Butler
const SHARED_SUPABASE_URL = 'https://rqqotumbdsghvkkmquqo.supabase.co';
const SHARED_SUPABASE_ANON_KEY = 'sb_publishable__q89JYItyV3VZvVe6codfg_WOZ__u28';

if (!rawSupabaseUrl || rawSupabaseUrl.includes('your-project.supabase.co')) {
  rawSupabaseUrl = SHARED_SUPABASE_URL;
}
if (!rawSupabaseAnonKey || rawSupabaseAnonKey === 'your-anon-key' || rawSupabaseAnonKey.length < 10) {
  rawSupabaseAnonKey = SHARED_SUPABASE_ANON_KEY;
}

function getValidSupabaseClient() {
  if (!rawSupabaseUrl || !rawSupabaseAnonKey) {
    return null;
  }

  let finalUrl = rawSupabaseUrl;
  if (!finalUrl.match(/^https?:\/\//i)) {
    finalUrl = `https://${finalUrl}`;
  }

  try {
    const parsed = new URL(finalUrl);
    if (!parsed.protocol.startsWith('http')) {
      return null;
    }
    return createClient(finalUrl, rawSupabaseAnonKey);
  } catch (err) {
    console.warn('[Supabase] Kon client niet initialiseren met opgegeven URL:', err);
    return null;
  }
}

// Create client with verified credentials
export const supabase = getValidSupabaseClient();

export type SharedSettings = {
  id: number;
  opening_hours: string;
  promo_active: boolean;
  promo_message: string;
};

export type DaySchedule = {
  open: string;
  close: string;
  closed: boolean;
};

export type StoreSchedule = {
  [key: string]: DaySchedule; // "0" to "6", standard JS days where 0=Zondag, 1=Maandag
};

export type HomepageSectionKey = 'hero' | 'how_it_works' | 'menu' | 'business' | 'assortments' | 'contact';

export const DEFAULT_SECTION_ORDER: HomepageSectionKey[] = [
  'hero',
  'how_it_works',
  'menu',
  'business',
  'assortments',
  'contact'
];

export const SECTION_METADATA: Record<HomepageSectionKey, { name: string; description: string }> = {
  hero: { name: 'Hoofdscherm (Hero)', description: 'Welkomstbanner en snelle actieknoppen' },
  how_it_works: { name: 'Hoe Het Werkt', description: 'Stappenplan voor bestellen en aanmelden' },
  menu: { name: 'Onze Selectie (Menu)', description: 'Overzicht van snacks en hapjes' },
  business: { name: 'Vaste Klant Worden (Voor Bedrijven)', description: 'Informatie en aanmeldformulier voor bedrijven' },
  assortments: { name: 'Pakketten (Bezorgen & Uitserveren)', description: 'Geselecteerde arrangementen en serviceopties' },
  contact: { name: 'Contact & FAQ', description: 'Contactgegevens en veelgestelde vragen' },
};

export type DiscountCode = {
  id: string;
  code: string;
  type: 'percentage' | 'free_product';
  value: number;
  free_product?: {
    product_name: string;
    portion_size: number;
    variant?: string;
  };
  is_active: boolean;
  min_order_amount?: number;
  description?: string;
  created_at?: string;
  max_uses_total?: number;
  max_uses_per_person?: number;
  used_count?: number;
  used_by?: Record<string, number>;
};

export type PackagingOption = {
  id: string;
  name: string;
  name_en?: string;
  description?: string;
  description_en?: string;
  image_url?: string;
  price?: number;
  is_active: boolean;
  available_for_guests: boolean;
  available_for_all_companies: boolean;
  allowed_company_ids?: string[];
  allowed_brands?: string[] | string | null;
  sort_order?: number;
  created_at?: string;
};

export type StoreSettings = {
  id: number;
  override_status: 'AUTO' | 'OPEN' | 'CLOSED';
  schedule: StoreSchedule;
  pickup_url: string;
  delivery_url: string;
  page_content?: {
    section_order?: string[];
    min_order_modify_hours?: number;
    modification_rules?: ModificationRulesConfig;
    company_deadlines?: Record<string, CompanyCustomDeadlines>;
    product_brands?: Record<string, string>;
    hide_image_products?: Record<string, boolean>;
    product_kitchen_info?: Record<string, {
      kitchen_name?: string;
      ingredients?: string;
      prep_instructions?: string;
      variant_kitchen_names?: Record<string, string>;
    }>;
    discount_codes?: DiscountCode[];
    packaging_options?: PackagingOption[];

    // HERO
    hero_background_image?: string;
    hero_pre_title?: string;
    hero_pre_title_size?: string;
    hero_title?: string;
    hero_title_size?: string;
    hero_subtitle?: string;
    hero_subtitle_size?: string;
    hero_btn_order?: string;
    hero_btn_order_size?: string;
    hero_btn_scheduled?: string;
    hero_btn_scheduled_size?: string;
    hero_btn_direct?: string;
    hero_btn_direct_size?: string;
    hero_btn_offer?: string;
    hero_btn_offer_size?: string;
    
    // HOW IT WORKS
    how_title?: string;
    how_title_size?: string;
    how_subtitle?: string;
    how_subtitle_size?: string;
    how_step1_title?: string;
    how_step1_title_size?: string;
    how_step1_desc?: string;
    how_step1_desc_size?: string;
    how_step2_title?: string;
    how_step2_title_size?: string;
    how_step2_desc?: string;
    how_step2_desc_size?: string;
    how_step3_title?: string;
    how_step3_title_size?: string;
    how_step3_desc?: string;
    how_step3_desc_size?: string;
    
    // MENU
    menu_title?: string;
    menu_title_size?: string;
    menu_subtitle?: string;
    menu_subtitle_size?: string;
    menu_btn?: string;
    menu_btn_size?: string;
    
    // BUSINESS
    business_title?: string;
    business_title_size?: string;
    business_subtitle?: string;
    business_subtitle_size?: string;
    business_desc?: string;
    business_desc_size?: string;
    business_point1?: string;
    business_point1_size?: string;
    business_point2?: string;
    business_point2_size?: string;
    business_point3?: string;
    business_point3_size?: string;
    business_btn?: string;
    business_btn_size?: string;
    business_form_title?: string;
    
    // ASSORTMENTS
    assortments_title?: string;
    assortments_title_size?: string;
    assortments_subtitle?: string;
    assortments_subtitle_size?: string;
    assort_snacks_title?: string;
    assort_snacks_title_size?: string;
    assort_snacks_subtitle?: string;
    assort_snacks_subtitle_size?: string;
    assort_snacks_item1?: string;
    assort_snacks_item1_size?: string;
    assort_snacks_item2?: string;
    assort_snacks_item2_size?: string;
    assort_snacks_item3?: string;
    assort_snacks_item3_size?: string;
    assort_snacks_item4?: string;
    assort_snacks_item4_size?: string;
    assort_snacks_btn?: string;
    assort_snacks_btn_size?: string;
    assort_complete_badge?: string;
    assort_complete_badge_size?: string;
    assort_complete_title?: string;
    assort_complete_title_size?: string;
    assort_complete_subtitle?: string;
    assort_complete_subtitle_size?: string;
    assort_complete_item1?: string;
    assort_complete_item1_size?: string;
    assort_complete_item2?: string;
    assort_complete_item2_size?: string;
    assort_complete_item3?: string;
    assort_complete_item3_size?: string;
    assort_complete_item4?: string;
    assort_complete_item4_size?: string;
    assort_complete_btn?: string;
    assort_complete_btn_size?: string;
    
    // CONTACT/FAQ
    contact_title?: string;
    contact_title_size?: string;
    faq_title?: string;
    faq_title_size?: string;
    opening_hours_custom?: string;
    faq_q1?: string;
    faq_q1_size?: string;
    faq_a1?: string;
    faq_a1_size?: string;
    faq_q2?: string;
    faq_q2_size?: string;
    faq_a2?: string;
    faq_a2_size?: string;
    faq_q3?: string;
    faq_q3_size?: string;
    faq_a3?: string;
    faq_a3_size?: string;
    faq_q4?: string;
    faq_q4_size?: string;
    faq_a4?: string;
    faq_a4_size?: string;
    [key: string]: any;
  };
};

export function formatStoreSchedule(schedule?: StoreSchedule): string[] {
  if (!schedule) return [];

  const days = [
    { id: '1', short: 'Ma' },
    { id: '2', short: 'Di' },
    { id: '3', short: 'Wo' },
    { id: '4', short: 'Do' },
    { id: '5', short: 'Vr' },
    { id: '6', short: 'Za' },
    { id: '0', short: 'Zo' },
  ];

  const hasConfiguredDay = days.some(d => schedule[d.id] !== undefined);
  if (!hasConfiguredDay) return [];

  const formattedDays = days.map(d => {
    const s = schedule[d.id];
    if (!s || s.closed) {
      return { short: d.short, text: 'Gesloten' };
    }
    return { short: d.short, text: `${s.open} - ${s.close}` };
  });

  // Group consecutive days with the same hours
  const groups: { start: string; end: string; text: string }[] = [];
  for (const item of formattedDays) {
    const last = groups[groups.length - 1];
    if (last && last.text === item.text) {
      last.end = item.short;
    } else {
      groups.push({ start: item.short, end: item.short, text: item.text });
    }
  }

  return groups.map(g => {
    const dayLabel = g.start === g.end ? g.start : `${g.start} - ${g.end}`;
    return `${dayLabel}: ${g.text}`;
  });
}

export function getVariantScore(variant: string, categoryTitle: string): number {
  if (!variant || !categoryTitle) return 0;
  const v = variant.trim().toLowerCase();
  const c = categoryTitle.trim().toLowerCase();

  // Exact match to category title always gets maximum score
  if (v === c) return 100;

  // Check if category is a vegetarian / vegan category (e.g. "Vega", "Vegetarisch", "Vegan")
  const isVegaCategory = /vega|vegan|vegetarisch/i.test(c);
  if (isVegaCategory) {
    if (v === 'vega' || v === 'vegetarisch') return 95;
    if (v === 'vegan' || v === 'veganistisch') return 90;
    if (v.includes('groente') || v.includes('groenten')) return 85;
    if (v.includes('kaas') || v.includes('geit')) return 75;
    if (v.includes('falafel') || v.includes('plant')) return 70;
    if (/vega|vegan|vegetarisch/i.test(v)) return 65;
    return 0;
  }

  // If category is not vega: partial match with category title gets boosted
  if (c.includes(v) || v.includes(c)) return 50;

  return 0;
}

export type CategoryVariantRule = {
  order?: string[];
  hidden?: string[];
};

export type CategoryVariantRulesMap = Record<string, Record<string, CategoryVariantRule>>;

export function sortVariantsByCategory(
  variants: string[] | undefined,
  categoryTitle: string,
  product?: { id?: string; name?: string } | string,
  categoryVariantRules?: CategoryVariantRulesMap
): string[] {
  if (!variants || variants.length === 0) return [];
  // Deduplicate and trim variants
  const uniqueVariants = Array.from(new Set(variants.map(v => (v || '').trim()).filter(Boolean)));
  if (uniqueVariants.length === 0) return [];

  // Check if a category variant rule exists
  if (categoryVariantRules && categoryTitle) {
    const catClean = categoryTitle.trim().toLowerCase();
    const catEntry = Object.entries(categoryVariantRules).find(([catKey]) => (catKey || '').trim().toLowerCase() === catClean);
    const catRules = catEntry ? catEntry[1] : undefined;

    if (catRules) {
      let rule: CategoryVariantRule | undefined;
      const prodId = typeof product === 'object' && product !== null ? product.id : undefined;
      const prodName = typeof product === 'string' ? product : (typeof product === 'object' && product !== null ? product.name : undefined);
      const cleanProdName = (prodName || '').trim().toLowerCase();

      if (prodId && catRules[prodId]) {
        rule = catRules[prodId];
      } else if (prodName && catRules[prodName]) {
        rule = catRules[prodName];
      } else if (cleanProdName) {
        const found = Object.entries(catRules).find(([k]) => (k || '').trim().toLowerCase() === cleanProdName);
        if (found) rule = found[1];
      }
      if (!rule && catRules['*']) {
        rule = catRules['*'];
      }

      if (rule) {
        // Filter out hidden variants
        const hiddenSet = new Set((rule.hidden || []).map(h => (h || '').trim().toLowerCase()));
        let visibleVariants = uniqueVariants.filter(v => !hiddenSet.has(v.toLowerCase()));

        // If an explicit order is defined for this category
        if (rule.order && rule.order.length > 0) {
          const orderMap = new Map<string, number>();
          rule.order.forEach((item, idx) => {
            orderMap.set(item.trim().toLowerCase(), idx);
          });
          visibleVariants.sort((a, b) => {
            const posA = orderMap.has(a.toLowerCase()) ? orderMap.get(a.toLowerCase())! : 999;
            const posB = orderMap.has(b.toLowerCase()) ? orderMap.get(b.toLowerCase())! : 999;
            if (posA !== posB) return posA - posB;
            return uniqueVariants.indexOf(a) - uniqueVariants.indexOf(b);
          });
        }
        return visibleVariants;
      }
    }
  }

  // Fallback to heuristic scoring
  return [...uniqueVariants].sort((a, b) => {
    const scoreA = getVariantScore(a, categoryTitle);
    const scoreB = getVariantScore(b, categoryTitle);
    if (scoreA !== scoreB) {
      return scoreB - scoreA; // higher score first
    }
    const idxA = uniqueVariants.indexOf(a);
    const idxB = uniqueVariants.indexOf(b);
    if (idxA !== -1 && idxB !== -1) {
      return idxA - idxB;
    }
    return a.localeCompare(b);
  });
}

export function validateDiscountCode(
  code: DiscountCode,
  totalOrderPrice: number,
  userIdentifier?: string
): { valid: boolean; error?: string } {
  if (code.is_active === false) {
    return { valid: false, error: 'Deze kortingscode is momenteel inactief.' };
  }

  // 1. Minimaal orderbedrag
  if (code.min_order_amount && code.min_order_amount > 0 && totalOrderPrice < code.min_order_amount) {
    return {
      valid: false,
      error: `Deze kortingscode is pas geldig vanaf een bestelbedrag van €${Number(code.min_order_amount).toFixed(2)}.`
    };
  }

  // 2. Maximaal aantal keren totaal
  const totalUsed = code.used_count || 0;
  if (code.max_uses_total && code.max_uses_total > 0 && totalUsed >= code.max_uses_total) {
    return {
      valid: false,
      error: `Deze kortingscode is niet meer geldig: het maximaal aantal keren gebruik (${code.max_uses_total}x) is bereikt.`
    };
  }

  // 3. Maximaal aantal keren per persoon
  if (code.max_uses_per_person && code.max_uses_per_person > 0 && userIdentifier) {
    const cleanId = userIdentifier.trim().toLowerCase();
    const userUses = (code.used_by && code.used_by[cleanId]) || 0;
    if (userUses >= code.max_uses_per_person) {
      return {
        valid: false,
        error: `U heeft deze kortingscode al het maximaal aantal toegestane keren (${code.max_uses_per_person}x) gebruikt.`
      };
    }
  }

  return { valid: true };
}

export async function recordDiscountCodeUsage(
  codeIdOrCode: string,
  userIdentifier?: string
) {
  if (!supabase) return;
  try {
    const { data: storeData } = await supabase
      .from('store_settings')
      .select('id, page_content')
      .eq('id', 1)
      .maybeSingle();

    const currentCodes: DiscountCode[] = storeData?.page_content?.discount_codes || [];
    const cleanTarget = codeIdOrCode.trim().toUpperCase();
    const cleanUser = (userIdentifier || '').trim().toLowerCase();

    let updated = false;
    const updatedCodes = currentCodes.map(c => {
      if (c.id === codeIdOrCode || (c.code && c.code.toUpperCase() === cleanTarget)) {
        updated = true;
        const newUsedCount = (c.used_count || 0) + 1;
        const currentUsedBy = { ...(c.used_by || {}) };
        if (cleanUser) {
          currentUsedBy[cleanUser] = (currentUsedBy[cleanUser] || 0) + 1;
        }
        return {
          ...c,
          used_count: newUsedCount,
          used_by: currentUsedBy
        };
      }
      return c;
    });

    if (updated) {
      await supabase
        .from('store_settings')
        .update({
          page_content: {
            ...(storeData?.page_content || {}),
            discount_codes: updatedCodes
          }
        })
        .eq('id', storeData?.id || 1);
    }
  } catch (err) {
    console.error("Fout bij registreren kortingscode gebruik:", err);
  }
}


export type ObCompany = {
  id: string;
  name: string;
  address: string;
  phone: string;
  billing_email: string;
  billing_info?: string;
  allowed_email_domain?: string;
  custom_deadlines?: CompanyCustomDeadlines;
  is_approved: boolean;
  created_at: string;
};

export type ObPortionPrice = {
  id: number;
  portion_size: number;
  price: number;
};

// Fallback data for preview if Supabase is not connected
export const fallbackSettings: SharedSettings = {
  id: 1,
  opening_hours: "Ma - Zo: 12:00 - 23:00",
  promo_active: true,
  promo_message: "Welkom bij Canal Butler! Verse warme borrelhappen bezorgd aan boord van uw rondvaart in Amsterdam.",
};

export const fallbackStoreSettings: StoreSettings = {
  id: 1,
  override_status: 'AUTO',
  schedule: {
    "1": { open: "12:00", close: "23:00", closed: false },
    "2": { open: "12:00", close: "23:00", closed: false },
    "3": { open: "12:00", close: "23:00", closed: false },
    "4": { open: "12:00", close: "00:00", closed: false },
    "5": { open: "12:00", close: "01:00", closed: false },
    "6": { open: "11:00", close: "01:00", closed: false },
    "0": { open: "11:00", close: "23:00", closed: false },
  },
  pickup_url: "https://web.orderli.com/YKjd-bootjes_i",
  delivery_url: "https://www.heyhungry.online/Canalbu",
  page_content: {
    section_order: DEFAULT_SECTION_ORDER,
    header_logo_url: "https://i.imgur.com/psrYTWD.png",
    hero_background_image: "https://i.imgur.com/owrXF8B.png",
    hero_pre_title: "AAN DE AMSTERDAMSE GRACHTEN",
    hero_title: "De perfecte borrel aan boord.",
    hero_subtitle: "Verse, warme snacks en gekoelde dranken bezorgd op vaste aanleglocaties voor rederijen en sloepen in Amsterdam.",
    hero_btn_order: "Bestel nu",
    hero_btn_scheduled: "Plan vaartocht",
    hero_btn_direct: "Direct bestellen",
    hero_btn_offer: "Bekijk assortiment",
    how_title: "Hoe Werkt Canal Butler?",
    how_subtitle: "In 3 simpele stappen verse warme borrelhappen aan boord van uw rondvaartboot of sloep.",
    how_step1_title: "Stel uw vaarpakket samen",
    how_step1_desc: "Kies uit onze samengestelde borrelboxen of stel zelf uw ideale assortiment samen met onze losse warme snacks.",
    how_step2_title: "Kies tijd & aanleglocatie",
    how_step2_desc: "Geef uw vaartijd en vaste aanlegsteiger of kade in Amsterdam door voor een stipte overhandiging aan boord.",
    how_step3_title: "Geniet op het water",
    how_step3_desc: "Onze butlers leveren de snacks warm, krokant en vaarklaar verpakt direct aan de kapitein of bemanning.",
    menu_title: "Onze Selectie voor Rederijen",
    menu_subtitle: "Hoogwaardige snacks en dranken, vers bereid in de Mokum Local Kitchen en warm aan boord bezorgd.",
    menu_btn: "Bekijk volledig assortiment",
    business_title: "Partner Worden voor Rederijen",
    business_subtitle: "Vaste horecapartner voor uw rondvaarten en sloepen.",
    business_desc: "Vaart u regelmatig met gasten over de grachten? Sluit uw rederij aan bij Canal Butler. Wij creëren een gepersonaliseerde bestelomgeving exclusief voor uw schippers en planners met vaste overdrachtspunten langs uw vaarroutes.",
    business_point1: "Vaste afleversteigers en overdrachtspunten langs uw vaarroutes",
    business_point2: "Gepersonaliseerd assortiment en speciale rederij-tarieven",
    business_point3: "Eenvoudig bestellen en overzichtelijke verzamelfacturatie",
    business_btn: "Rederij Aanmelden",
    business_form_title: "Rederij Aanmelden",
    assortments_title: "Onze Vaararrangementen",
    assortments_subtitle: "Kies het pakket dat het beste bij uw vaartocht of gezelschap past.",
    assort_snacks_title: "Grachten Borrelmix",
    assort_snacks_item1: "Gemengde warme snacks (Bourgondiër & vega)",
    assort_snacks_item2: "Inclusief ambachtelijke sauzen",
    assort_snacks_item3: "Vaarklaar verpakt in thermobox",
    assort_snacks_btn: "Bestel Borrelmix",
    assort_complete_title: "Vaartocht Compleet",
    assort_complete_item1: "Uitgebreid assortiment warme en koude happen",
    assort_complete_item2: "Inclusief gekoelde dranken",
    assort_complete_item3: "Volledig verzorgd voor uw gasten",
    assort_complete_btn: "Bestel Compleet",
    contact_title: "Contact & Locaties",
    faq_title: "Veelgestelde Vragen",
    faq_q1: "Op welke locaties in Amsterdam bezorgen jullie?",
    faq_a1: "Wij bezorgen op vaste afgesproken aanlegsteigers, kades en overdrachtspunten langs de gehele Amsterdamse grachtengordel, Amstel en het Oosterdok.",
    faq_q2: "Hoe blijven de snacks warm op het water?",
    faq_a2: "Al onze hapjes worden vlak voor overdracht vers bereid in de Mokum Local Kitchen en direct in professionele thermoboxen overgedragen aan boord, zodat ze gegarandeerd heet en krokant geserveerd kunnen worden.",
    faq_q3: "Hoe ver van tevoren moeten wij als rederij bestellen?",
    faq_a3: "Bestellingen kunnen vooraf worden ingepland voor specifieke afvaarten. Voor reguliere vaarten adviseren wij minimaal 2 uur vooraf te bestellen, grotere arrangementen graag 24 uur vooraf."
  }
};

// ==========================================
// MULTI-BRAND (ZUSTERBEDRIJVEN) ONDERSTEUNING
// ==========================================
export type BrandId = 'office_butler' | 'canal_butler' | 'snack_butler';

export const CURRENT_BRAND = 'canal_butler';
export const CENTRAL_MODERATOR_URL = 'https://www.office-butler.com/moderator';

export interface BrandConfig {
  id: BrandId;
  name: string;
  badge: string;
  description: string;
}

export const AVAILABLE_BRANDS: BrandConfig[] = [
  { 
    id: 'office_butler', 
    name: 'Office Butler', 
    badge: '🏢 Office Butler', 
    description: 'Kantoorborrels en zakelijke levering' 
  },
  { 
    id: 'canal_butler', 
    name: 'Canal Butler', 
    badge: '🚤 Canal Butler', 
    description: 'Rederijen, sloepen en grachten' 
  },
  { 
    id: 'snack_butler', 
    name: 'Snack Butler', 
    badge: '🍻 Snack Butler', 
    description: 'Cafés, bars en horeca' 
  },
];

export interface BrandPageContentRow {
  brand_id: BrandId;
  page_content: Record<string, any>;
  updated_at?: string;
}

/**
 * Haalt de pagina-inhoud / teksten op voor een specifiek merk uit de tabel brand_page_content.
 * Standaard ingesteld op 'canal_butler'.
 */
export async function fetchBrandPageContent(brandId: string = 'canal_butler'): Promise<Record<string, any> | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('brand_page_content')
      .select('page_content')
      .eq('brand_id', brandId)
      .maybeSingle();

    if (error) {
      console.warn(`[Supabase] Kon brand_page_content niet ophalen voor ${brandId}:`, error.message);
      return null;
    }
    return (data?.page_content as Record<string, any>) || null;
  } catch (err) {
    console.warn(`[Supabase] Fout bij fetchBrandPageContent voor ${brandId}:`, err);
    return null;
  }
}

/**
 * Slaat de pagina-inhoud / teksten op voor een specifiek merk in de tabel brand_page_content.
 * Standaard ingesteld op 'canal_butler'.
 */
export async function saveBrandPageContent(brandId: string = 'canal_butler', content: Record<string, any>): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('brand_page_content')
      .upsert({
        brand_id: brandId,
        page_content: content,
        updated_at: new Date().toISOString()
      }, { onConflict: 'brand_id' });

    if (error) {
      console.error(`[Supabase] Fout bij opslaan brand_page_content voor ${brandId}:`, error);
      throw error;
    }
    return true;
  } catch (err) {
    console.error(`[Supabase] Fout bij saveBrandPageContent voor ${brandId}:`, err);
    throw err;
  }
}

export { isBrandAllowed, getPricePriorityRank, resolveProductPrices } from './brandUtils';
