-- Voeg optioneel de kolom 'hide_image' toe aan de ob_products tabel
ALTER TABLE ob_products ADD COLUMN IF NOT EXISTS hide_image boolean DEFAULT false;
