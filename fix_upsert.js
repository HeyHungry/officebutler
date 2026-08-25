import fs from 'fs';
let code = fs.readFileSync('src/components/ModeratorPanel.tsx', 'utf8');

const newUpsert = `
          if (p.price > 0) {
            // First check if it exists
            const { data: existing } = await supabase.from('ob_product_prices')
              .select('id')
              .eq('product_name', selectedPriceProduct)
              .eq('portion_size', p.portion_size)
              .is('company_id', selectedPriceCompany || null)
              .maybeSingle();
              
            if (existing) {
              await supabase.from('ob_product_prices').update({ price: p.price }).eq('id', existing.id);
            } else {
              await supabase.from('ob_product_prices').insert({
                company_id: selectedPriceCompany,
                product_name: selectedPriceProduct,
                portion_size: p.portion_size,
                price: p.price
              });
            }
          }
`;

code = code.replace(/if \(p\.price > 0\) \{[\s\S]*?\}, \{ onConflict: 'company_id, product_name, portion_size' \}\);\n          \}/, newUpsert.trim());

fs.writeFileSync('src/components/ModeratorPanel.tsx', code);
