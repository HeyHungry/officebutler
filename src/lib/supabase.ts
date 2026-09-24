import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a dummy client if env vars are missing so the app doesn't crash during preview
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

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
};

export type StoreSettings = {
  id: number;
  override_status: 'AUTO' | 'OPEN' | 'CLOSED';
  schedule: StoreSchedule;
  pickup_url: string;
  delivery_url: string;
  page_content?: {
    section_order?: string[];
    product_brands?: Record<string, string>;
    discount_codes?: DiscountCode[];

    // HERO
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

export function sortVariantsByCategory(variants: string[] | undefined, categoryTitle: string): string[] {
  if (!variants || variants.length === 0) return [];
  return [...variants].sort((a, b) => {
    const scoreA = getVariantScore(a, categoryTitle);
    const scoreB = getVariantScore(b, categoryTitle);
    if (scoreA !== scoreB) {
      return scoreB - scoreA; // higher score first
    }
    return 0;
  });
}


export type ObCompany = {
  id: string;
  name: string;
  address: string;
  phone: string;
  billing_email: string;
  billing_info?: string;
  allowed_email_domain?: string;
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
  opening_hours: "Ma - Vr: 15:00 - 21:00",
  promo_active: true,
  promo_message: "Welkom bij Office Butler! Bestel nu voor de vrijmibo van aanstaande vrijdag.",
};

export const fallbackStoreSettings: StoreSettings = {
  id: 1,
  override_status: 'AUTO',
  schedule: {
    "1": { open: "15:00", close: "23:00", closed: false },
    "2": { open: "15:00", close: "23:00", closed: false },
    "3": { open: "15:00", close: "23:00", closed: false },
    "4": { open: "15:00", close: "00:00", closed: false },
    "5": { open: "14:00", close: "01:00", closed: false },
    "6": { open: "13:00", close: "01:00", closed: false },
    "0": { open: "13:00", close: "00:00", closed: false },
  },
  pickup_url: "https://web.orderli.com/YKjd-bootjes_i",
  delivery_url: "https://www.heyhungry.online/Canalbu",
  page_content: {
    section_order: DEFAULT_SECTION_ORDER,
    hero_pre_title: "EXCLUSIEF IN AMSTERDAM",
    hero_title: "De perfecte kantoorborrel.",
    hero_subtitle: "Onze butlers leveren de lekkerste snacks voor jouw kantoorborrel.",
    hero_btn_scheduled: "Bestel vooraf",
    hero_btn_direct: "Bestel direct",
    hero_btn_offer: "Bekijk aanbod",
    how_title: "Hoe Werkt Office Butler?",
    how_subtitle: "In 3 simpele stappen jouw kantoorborrel of vrijdagmiddagborrel geregeld.",
    how_step1_title: "Stel uw pakket samen",
    how_step1_desc: "Kies uit onze vaste pakketten of stel zelf uw ideale borrel samen met onze losse snacks.",
    how_step2_title: "Kies uw bezorgmoment",
    how_step2_desc: "Bestel direct voor levering binnen 45 minuten, of plan uw borrel vooruit voor een specifiek moment.",
    how_step3_title: "Geniet van de borrel",
    how_step3_desc: "Onze butlers bezorgen de snacks warm en perfect gepresenteerd bij u op kantoor.",
    menu_title: "Onze Selectie",
    menu_subtitle: "Hoogwaardige snacks, vers bereid in de Mokum Local Kitchen.",
    menu_btn: "Bekijk volledig menu",
    business_title: "Vaste Klant Worden",
    business_subtitle: "Een vaste partner voor uw kantoor.",
    business_desc: "Organiseert u regelmatig kantoorborrels of evenementen? Meld uw bedrijf aan bij Office Butler. Wij creëren een gepersonaliseerde bestelomgeving exclusief voor uw medewerkers.",
    business_point1: "Een eigen, unieke URL (bijv. officebutler.nl/uw-bedrijf)",
    business_point2: "Gepersonaliseerd assortiment naar wens",
    business_point3: "Optie tot betalen op factuur",
    business_btn: "Kantoor Inschrijven",
    business_form_title: "Bedrijf Aanmelden",
    assortments_title: "Onze Assortimenten",
    assortments_subtitle: "Kies het pakket dat het beste bij uw kantoorborrel past.",
    assort_snacks_title: "Office Snacks",
    assort_snacks_item1: "Gemengde warme snacks (Bourgondiër)",
    assort_snacks_item2: "Inclusief sauzen",
    assort_snacks_item3: "Perfect als aanvulling",
    assort_snacks_btn: "Bestel Snacks",
    assort_complete_title: "Office Compleet",
    assort_complete_item1: "Uitgebreid assortiment",
    assort_complete_item2: "Inclusief dranken",
    assort_complete_item3: "Compleet verzorgd",
    assort_complete_btn: "Bestel Compleet",
    contact_title: "Contact & Informatie",
    faq_title: "Veelgestelde Vragen",
    faq_q1: "Bezorgen jullie ook buiten Amsterdam?",
    faq_a1: "Momenteel bezorgen wij met Office Butler uitsluitend op kantoren binnen de ring van Amsterdam om de kwaliteit en temperatuur van onze snacks te garanderen.",
    faq_q2: "Wat is het verschil met Canal Butler?",
    faq_a2: "Office Butler is het B2B zusterbedrijf van Canal Butler. We maken gebruik van dezelfde keuken (Mokum Local Kitchen) en bieden dezelfde premium kwaliteit, maar dan specifiek afgestemd op levering op kantoor in plaats van op de grachten.",
    faq_q3: "Hoe ver van tevoren moet ik bestellen?",
    faq_a3: "Voor reguliere bestellingen vragen wij u minimaal 2 uur van tevoren te bestellen. Voor grote groepen (>30 personen) of een compleet assortiment horen wij dit graag minimaal 24 uur van tevoren."
  }
};
