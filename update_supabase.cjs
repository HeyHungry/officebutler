const fs = require('fs');
let code = fs.readFileSync('src/lib/supabase.ts', 'utf8');

// Update StoreSettings type
const oldType = `export type StoreSettings = {
  id: number;
  override_status: 'AUTO' | 'OPEN' | 'CLOSED';
  schedule: StoreSchedule;
  pickup_url: string;
  delivery_url: string;
};`;

const newType = `export type StoreSettings = {
  id: number;
  override_status: 'AUTO' | 'OPEN' | 'CLOSED';
  schedule: StoreSchedule;
  pickup_url: string;
  delivery_url: string;
  page_content?: {
    hero_title: string;
    hero_subtitle: string;
    how_it_works_subtitle: string;
    assortments_subtitle: string;
    menu_subtitle: string;
    business_subtitle: string;
  };
};`;

code = code.replace(oldType, newType);

// Update fallbackStoreSettings
const oldFallback = `export const fallbackStoreSettings: StoreSettings = {
  id: 1,
  override_status: 'AUTO',
  schedule: {
    "1": { open: "15:00", close: "23:00", closed: false }, // Ma
    "2": { open: "15:00", close: "23:00", closed: false }, // Di
    "3": { open: "15:00", close: "23:00", closed: false }, // Wo
    "4": { open: "15:00", close: "00:00", closed: false }, // Do
    "5": { open: "14:00", close: "01:00", closed: false }, // Vr
    "6": { open: "13:00", close: "01:00", closed: false }, // Za
    "0": { open: "13:00", close: "00:00", closed: false }, // Zo
  },
  pickup_url: "https://web.orderli.com/YKjd-bootjes_i",
  delivery_url: "https://www.heyhungry.online/Canalbu",
};`;

const newFallback = `export const fallbackStoreSettings: StoreSettings = {
  id: 1,
  override_status: 'AUTO',
  schedule: {
    "1": { open: "15:00", close: "23:00", closed: false }, // Ma
    "2": { open: "15:00", close: "23:00", closed: false }, // Di
    "3": { open: "15:00", close: "23:00", closed: false }, // Wo
    "4": { open: "15:00", close: "00:00", closed: false }, // Do
    "5": { open: "14:00", close: "01:00", closed: false }, // Vr
    "6": { open: "13:00", close: "01:00", closed: false }, // Za
    "0": { open: "13:00", close: "00:00", closed: false }, // Zo
  },
  pickup_url: "https://web.orderli.com/YKjd-bootjes_i",
  delivery_url: "https://www.heyhungry.online/Canalbu",
  page_content: {
    hero_title: "De perfecte kantoorborrel.",
    hero_subtitle: "Onze butlers leveren de lekkerste snacks voor jouw kantoorborrel.",
    how_it_works_subtitle: "In 3 simpele stappen jouw kantoorborrel of vrijdagmiddagborrel geregeld.",
    assortments_subtitle: "Kies het pakket dat het beste bij uw kantoorborrel past.",
    menu_subtitle: "Zelf samenstellen of iets extra's toevoegen aan uw pakket? Bekijk ons uitgebreide menu.",
    business_subtitle: "Regel wekelijks jullie kantoorborrel op rekening."
  }
};`;

code = code.replace(oldFallback, newFallback);
fs.writeFileSync('src/lib/supabase.ts', code);
