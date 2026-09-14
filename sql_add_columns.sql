ALTER TABLE ob_products ADD COLUMN IF NOT EXISTS sauces text[] DEFAULT '{}';
ALTER TABLE ob_products ADD COLUMN IF NOT EXISTS variants text[] DEFAULT '{}';
