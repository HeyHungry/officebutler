const fs = require('fs');

let code = fs.readFileSync('src/lib/supabase.ts', 'utf8');

const newType = `export type StoreSettings = {
  id: number;
  override_status: 'AUTO' | 'OPEN' | 'CLOSED';
  schedule: StoreSchedule;
  pickup_url: string;
  delivery_url: string;
  page_content?: {
    // HERO
    hero_pre_title?: string;
    hero_title?: string;
    hero_subtitle?: string;
    hero_btn_scheduled?: string;
    hero_btn_direct?: string;
    hero_btn_offer?: string;
    
    // HOW IT WORKS
    how_title?: string;
    how_subtitle?: string;
    how_step1_title?: string;
    how_step1_desc?: string;
    how_step2_title?: string;
    how_step2_desc?: string;
    how_step3_title?: string;
    how_step3_desc?: string;
    
    // MENU
    menu_title?: string;
    menu_subtitle?: string;
    menu_btn?: string;
    
    // BUSINESS
    business_title?: string;
    business_subtitle?: string;
    business_point1?: string;
    business_point2?: string;
    business_point3?: string;
    business_btn?: string;
    
    // ASSORTMENTS
    assortments_title?: string;
    assortments_subtitle?: string;
    assort_snacks_title?: string;
    assort_snacks_item1?: string;
    assort_snacks_item2?: string;
    assort_snacks_item3?: string;
    assort_snacks_btn?: string;
    assort_complete_title?: string;
    assort_complete_item1?: string;
    assort_complete_item2?: string;
    assort_complete_item3?: string;
    assort_complete_btn?: string;
    
    // CONTACT/FAQ
    contact_title?: string;
    faq_title?: string;
  };
};`;

code = code.replace(/export type StoreSettings = \{[\s\S]*?\}\s*};/, newType);

const newFallback = `export const fallbackStoreSettings: StoreSettings = {
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
    menu_title: "Ons Menu",
    menu_subtitle: "Zelf samenstellen of iets extra's toevoegen aan uw pakket? Bekijk ons uitgebreide menu.",
    menu_btn: "Bekijk volledig menu",
    business_title: "Voor Bedrijven",
    business_subtitle: "Regel wekelijks jullie kantoorborrel op rekening.",
    business_point1: "Achteraf betalen op factuur",
    business_point2: "Overzichtelijk dashboard",
    business_point3: "Vaste bezorgmomenten inplannen",
    business_btn: "Kantoor Inschrijven",
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
    faq_title: "Veelgestelde Vragen"
  }
};`;

code = code.replace(/export const fallbackStoreSettings: StoreSettings = \{[\s\S]*?\};\s*$/m, newFallback);

fs.writeFileSync('src/lib/supabase.ts', code);
