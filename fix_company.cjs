const fs = require('fs');
let code = fs.readFileSync('src/pages/CompanyDashboard.tsx', 'utf8');

// Add state for dbProducts
code = code.replace(
  /const \[employees, setEmployees\] = useState<any\[\]>\(\[\]\);/,
  "const [employees, setEmployees] = useState<any[]>([]);\n  const [dbProducts, setDbProducts] = useState<any[]>([]);"
);

// Fetch dbProducts in checkSession / checkUser
const fetchProds = `
        // Fetch products
        try {
          const { data: prods } = await supabase.from('ob_products').select('*');
          if (prods) setDbProducts(prods);
        } catch (e) {
          console.warn('No products table');
        }
`;

code = code.replace(
  /\/\/ Fetch assortment/,
  `${fetchProds}\n        // Fetch assortment`
);

// Replace mapping
const oldMap = `{AVAILABLE_PRODUCTS.map(product => (`;
const newMap = `{(dbProducts.length > 0 ? dbProducts : AVAILABLE_PRODUCTS).map(product => (`;

code = code.replace(oldMap, newMap);

fs.writeFileSync('src/pages/CompanyDashboard.tsx', code);
