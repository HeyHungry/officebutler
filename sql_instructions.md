```sql
CREATE TABLE IF NOT EXISTS ob_delivery_methods (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  price numeric(10,2) DEFAULT 0.00,
  image_url text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

INSERT INTO ob_delivery_methods (name, price, image_url, sort_order) VALUES
('Gratis bezorging', 0.00, 'https://imgur.com/Y55F1xq.png', 0),
('Wij stallen het uit', 15.00, 'https://imgur.com/CXfgvvF.png', 1),
('Premium butler service', 30.00, 'https://imgur.com/ilBPhXf.png', 2);

CREATE TABLE IF NOT EXISTS ob_company_delivery_methods (
  company_id uuid,
  delivery_method_id uuid,
  PRIMARY KEY (company_id, delivery_method_id)
);
```
