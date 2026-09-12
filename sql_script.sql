CREATE TABLE IF NOT EXISTS ob_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  image_url text NOT NULL,
  status text DEFAULT 'active', -- 'active', 'inactive', 'coming_soon', 'sold_out', 'new', 'popular'
  portions jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ob_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access on ob_products" ON ob_products FOR SELECT USING (true);
CREATE POLICY "Allow authenticated full access on ob_products" ON ob_products FOR ALL USING (auth.role() = 'authenticated');

INSERT INTO ob_products (name, category, image_url, status, portions) VALUES
('Snack Mix', 'Snacks', 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/img_0743d367c64afbf145e9c0fea03ba65553996e64ffef54a95252060ee7ac758c/responsive320', 'active', '[25, 50, 100, 150]'),
('Bitterballen', 'Snacks', 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/233e7d3e-19d8-4504-adf9-2100d5c71800/responsive640', 'popular', '[25, 50, 100, 150]'),
('Vlammetjes', 'Snacks', 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/c3a12a9a-1fd9-4041-11a7-c2ba71d3c100/responsive960', 'active', '[25, 50, 100, 150]'),
('Frikandelletjes', 'Snacks', 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/089a0deb-f72e-46b4-cd48-de98d1f82a00/responsive640', 'active', '[25, 50, 100, 150]'),
('Mini Kroketjes', 'Snacks', 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/53ee579e-f63d-4c57-8f54-dae1e90a1c00/responsive640', 'active', '[25, 50, 100, 150]'),
('Chicken Wings', 'Snacks', 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/ee601f8d-efac-4ef4-2cee-c4c59c117200/responsive640', 'active', '[25, 50, 100, 150]'),
('Kipnuggets', 'Snacks', 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/b58dad40-1353-4159-e305-2669d75f6b00/responsive640', 'active', '[25, 50, 100, 150]'),
('Karaage Kip', 'Snacks', 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/img_5991de8e937102a4dd1ef314fb255423bf85586b62f82c8285e054e14615ce52/responsive640', 'active', '[25, 50, 100, 150]'),
('Butterfly Gamba''s', 'Snacks', 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/8688dded-96d4-414f-e816-8553f5ec8000/responsive640', 'active', '[25, 50, 100, 150]'),
('Kaasstengels', 'Vega', 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/img_8d2216804329784b49540823b54b47525bfcf318725033896b6fb9646d6cc0d1/responsive640', 'active', '[25, 50, 100, 150]'),
('Curry Samosas', 'Vega', 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/ae28ddae-8a3f-4049-3527-09fa31308f00/responsive640', 'active', '[25, 50, 100, 150]'),
('Mini Loempia', 'Vega', 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/9eab1d3b-96cc-449a-e6af-7a4ee6e66d00/responsive640', 'active', '[25, 50, 100, 150]'),
('Vegan Bitterballen', 'Vega', 'https://imagedelivery.net/xS_5nksgKmcoB2_mcBGUmA/img_382e6f9d8eabd5d872ed938ed4c12f25c6696f38b8ab2d2791d968c2783fd954/responsive640', 'new', '[25, 50, 100, 150]');
