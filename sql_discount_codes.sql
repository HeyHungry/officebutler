-- Optionele tabel voor discount codes indien gewenst naast opslag in store_settings:
CREATE TABLE IF NOT EXISTS ob_discount_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  type text NOT NULL CHECK (type IN ('percentage', 'free_product')),
  value numeric DEFAULT 0,
  free_product jsonb,
  is_active boolean DEFAULT true,
  min_order_amount numeric DEFAULT 0,
  description text,
  created_at timestamptz DEFAULT now()
);
