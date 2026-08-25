import fs from 'fs';

let code = fs.readFileSync('src/pages/GuestOrdering.tsx', 'utf8');

const defaultPrices = `
  const [prices, setPrices] = useState<Record<string, number>>({ 
    'Bitterballen Deal_25': 25.50, 'Bitterballen Deal_50': 48.00,
    'Dutch Classic Deal_25': 24.50, 'Dutch Classic Deal_50': 46.00,
    'Deluxe Deal_25': 29.50, 'Deluxe Deal_50': 55.00,
    'Chicken Deal_25': 27.50, 'Chicken Deal_50': 52.00,
    'Vega Deal_25': 26.50, 'Vega Deal_50': 49.00,
    
    'Snack Mix_25': 24.00, 'Snack Mix_50': 45.00,
    'Bitterballen_25': 22.00, 'Bitterballen_50': 40.00,
    'Vlammetjes_25': 25.00, 'Vlammetjes_50': 47.00,
    'Frikandelletjes_25': 20.00, 'Frikandelletjes_50': 38.00,
    'Mini Kroketjes_25': 23.00, 'Mini Kroketjes_50': 42.00,
    'Chicken Wings_25': 26.00, 'Chicken Wings_50': 50.00,
    'Kipnuggets_25': 21.00, 'Kipnuggets_50': 39.00,
    'Karaage Kip_25': 28.00, 'Karaage Kip_50': 52.00,
    "Butterfly Gamba's_25": 30.00, "Butterfly Gamba's_50": 55.00,

    'Kaasstengels_25': 24.00, 'Kaasstengels_50': 45.00,
    'Curry Samosas_25': 25.00, 'Curry Samosas_50': 47.00,
    'Mini Loempia_25': 22.00, 'Mini Loempia_50': 40.00,
    'Vegan Bitterballen_25': 26.00, 'Vegan Bitterballen_50': 48.00,
  });
`;

code = code.replace(
  /const \[prices, setPrices\] = useState<Record<string, number>>\(\{[^}]+\}\);/,
  defaultPrices.trim()
);

fs.writeFileSync('src/pages/GuestOrdering.tsx', code);
