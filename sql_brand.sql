-- Voeg optioneel de kolom 'brand' toe aan de ob_products tabel
ALTER TABLE ob_products ADD COLUMN IF NOT EXISTS brand text;
