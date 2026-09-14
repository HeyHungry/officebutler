ALTER TABLE ob_products ADD COLUMN IF NOT EXISTS variant_surcharges jsonb DEFAULT '{}'::jsonb;
