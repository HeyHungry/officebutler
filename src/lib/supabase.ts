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

export type StoreSettings = {
  id: number;
  override_status: 'AUTO' | 'OPEN' | 'CLOSED';
  schedule: StoreSchedule;
  pickup_url: string;
  delivery_url: string;
};

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
};

