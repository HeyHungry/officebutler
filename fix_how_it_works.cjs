const fs = require('fs');
let code = fs.readFileSync('src/components/HowItWorks.tsx', 'utf8');

const newSteps = `    {
      icon: <Building2 size={32} />,
      title: content?.how_step1_title || "1. Bestel of Meld Aan",
      description: content?.how_step1_desc || "Bestel direct voor de vrijmibo, of meld uw bedrijf aan voor een vaste, gepersonaliseerde bestellink voor het personeel."
    },
    {
      icon: <ChefHat size={32} />,
      title: content?.how_step2_title || "2. Wij Bereiden Voor",
      description: content?.how_step2_desc || "Onze chefs in de Mokum Local Kitchen bereiden de warme snacks en verzamelen de gekoelde dranken op het afgesproken moment."
    },
    {
      icon: <Truck size={32} />,
      title: content?.how_step3_title || "3. Bezorging op Kantoor",
      description: content?.how_step3_desc || "Wij leveren alles vers, warm en gekoeld af bij u op kantoor in Amsterdam, precies op tijd voor de borrel of het evenement."
    }`;

code = code.replace(/\{\s*icon: <Building2 size=\{32\} \/>,[\s\S]*?\}\s*\];/, newSteps + '\n  ];');

fs.writeFileSync('src/components/HowItWorks.tsx', code);
