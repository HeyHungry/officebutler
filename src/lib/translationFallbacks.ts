/**
 * Standaard automatische vertaalfallsbacks voor bezorgopties en extra snack-informatie.
 * Wordt gebruikt als er in Supabase (nog) geen handmatige vertaling is ingevuld.
 */

export const DEFAULT_DELIVERY_FALLBACKS: Record<string, { name: string; description: string }> = {
  'bezorgen': {
    name: 'Delivery',
    description: 'Our butlers deliver neatly right to your office door.'
  },
  'uitpakken': {
    name: 'Unpack & Setup',
    description: 'Our butlers unpack the snacks and arrange them ready to serve.'
  },
  'uitpakken ': {
    name: 'Unpack & Setup',
    description: 'Our butlers unpack the snacks and arrange them ready to serve.'
  },
  'uitserveren': {
    name: 'Butler Service',
    description: 'Our butlers walk around to serve the warm snacks directly to your team and guests.'
  },
  'uitserveren ': {
    name: 'Butler Service',
    description: 'Our butlers walk around to serve the warm snacks directly to your team and guests.'
  }
};

export const DEFAULT_SNACK_EXTRA_INFO_FALLBACKS: Record<string, { nl: string; en: string }> = {
  'bitterballen': {
    nl: 'Ooit bedacht als hartig hapje bij een bittertje, maar inmiddels dé onbetwiste koning van de borrelplank! De bitterbal is krokant, smeuïg van binnen en onweerstaanbaar lekker. Van bruine kroegen tot chique borrels, deze snack hoort overal thuis.',
    en: 'Originally created as a savoury bite with a traditional bitter liqueur, but now the undisputed king of the Dutch platter! Crispy on the outside, creamy on the inside, and irresistibly delicious. From historic brown cafes to chic corporate events, this snack belongs everywhere.'
  },
  'classic platter': {
    nl: 'De klassiekers die altijd in de smaak vallen.\nBitterballen, Kaasstengels, Frikandellen, Kip Loempiaatje en Vlammetjes. Geserveerd met mosterd, chili en mayonaise.',
    en: 'The crowd-pleasing classics that never disappoint.\nBitterballen, Crispy Cheese Sticks, Dutch Frikandellen, Mini Chicken Spring Rolls, and Spicy Vlammetjes. Served with mustard, sweet chili, and mayonnaise.'
  },
  'classic platter (old)': {
    nl: 'De klassiekers die altijd in de smaak vallen. Bitterballen, Kaasstengels Mini Frikandellen en Vlammetjes + Mosterd, Chili, Mayo.',
    en: 'The classics that always please: Bitterballen, Cheese Sticks, Mini Frikandellen and Spicy Vlammetjes + Mustard, Sweet Chili, and Mayonnaise.'
  },
  'luxe platter': {
    nl: 'Hoogwaardige en verfijnde smaken.\nKalfs bitterballen, Kaastengels, Truffel Kroketjes, Kreeft Kroketjes en Frikandellen van de slager. Geserveerd met mosterd, chili en mayonaise.',
    en: 'Refined and premium flavours.\nVeal bitterballen, Crispy Cheese Sticks, Truffle Croquettes, Lobster Croquettes, and artisan butcher frikandellen. Served with mustard, sweet chili, and mayonnaise.'
  },
  'luxe platter (old)': {
    nl: 'De classic snacks aangevuld met Truffel, Geitenkaas, Kreeft Kroketjes. Classic sausjes aangevuld met Truffle & Spicy Mayo.',
    en: 'Classic bites enhanced with Truffle, Goat Cheese, and Lobster Croquettes. Accompanied by Truffle Mayo and Spicy Mayo.'
  },
  'vega(n) platter': {
    nl: 'De classics maar dan vega(n): Vega Bitterbal, Vlammetje, Groente Kroketjes, Loempia’s en Samosas, afhankelijk van de voorkeur voor vega of vegan.',
    en: 'The classics reimagined as vegetarian & vegan: Vegetarian Bitterballen, Vegetarian Vlammetjes, Vegetable Croquettes, Spring Rolls, and Samosas, adapted to your vegetarian or vegan preference.'
  },
  'chicken wings': {
    nl: 'Let op: bevat bot en niet geschikt voor elke borrel.',
    en: 'Please note: contains bones and may not be suitable for every casual event.'
  },
  'classic eco mix 10st': {
    nl: '10 stuks:\n2x rund bitterballen, 2x normale frikandelletjes, 2x kaasstengel, 2x kip loempia, 2x kip nuggets. Inclusief sausjes: chili, mosterd en mayonaise.',
    en: '10 pieces:\n2x beef bitterballen, 2x classic frikandellen, 2x cheese sticks, 2x chicken spring rolls, 2x chicken nuggets. Includes sauces: sweet chili, mustard, and mayonnaise.'
  },
  'vega eco mix 10st': {
    nl: '10 stuks:\n2x vega bitterballen, 2x vega loempia, 2x kaasstengel (Oma Bobs), 2x vega kroketjes, 2x vega samosas. Inclusief sausjes: chili, mosterd en mayonaise.',
    en: '10 pieces:\n2x vegetarian bitterballen, 2x veggie spring rolls, 2x Oma Bobs cheese sticks, 2x veggie croquettes, 2x veggie samosas. Includes sauces: sweet chili, mustard, and mayonnaise.'
  },
  'halal eco mix (10pcs)': {
    nl: '10 stuks:\n2x vega bitterballen, 2x vega loempia, 2x halal karaage kip, 2x vega kroketjes, 2x vega samosas. Inclusief sausjes: mosterd, chili en mayonaise.',
    en: '10 pieces:\n2x vegetarian bitterballen, 2x veggie spring rolls, 2x halal chicken karaage, 2x veggie croquettes, 2x veggie samosas. Includes sauces: mustard, sweet chili, and mayonnaise.'
  },
  'mini kroket': {
    nl: 'Ambachtelijke mini kalfskroketjes met een krokante korst en romige ragoutvulling. Allergenen: Gluten, Selderij, Melk.',
    en: 'Artisan Dutch mini croquettes with rich ragout filling and crispy golden crust. Allergens: Gluten, Celery, Dairy.'
  },
  'kaasstengels': {
    nl: 'Krokant filodeeg gevuld met smaakvolle oude Goudse kaas. Vegetarisch. Allergenen: Gluten, Melk.',
    en: 'Crispy pastry rolls filled with aged Dutch Gouda cheese. Vegetarian. Allergens: Gluten, Dairy.'
  },
  'frikandelletjes': {
    nl: 'Traditionele mini frikandellen met authentieke kruiden. Allergenen: Gluten, Soja, Selderij.',
    en: 'Traditional mini Dutch frikandellen with savoury herbs & spices. Allergens: Gluten, Soy, Celery.'
  },
  'vlammetjes': {
    nl: 'Pikant gekruid rundergehakt met rode pepers in een knapperig jasje. Allergenen: Gluten, Soja.',
    en: 'Spicy seasoned minced beef with red chili peppers in crispy spring roll pastry. Allergens: Gluten, Soy.'
  },
  'mini loempia': {
    nl: 'Knapperige vegetarische mini loempia\'s gevuld met verse groenten. 100% Vegan. Allergenen: Gluten, Soja.',
    en: 'Crispy vegetable spring rolls filled with seasoned cabbage, carrots, and bean sprouts. 100% Vegan. Allergens: Gluten, Soy.'
  },
  'kipnuggets': {
    nl: 'Malse stukjes kipfilet in een goudbruin krokant beslag. Allergenen: Gluten.',
    en: 'Tender chicken breast bites in a golden crispy coating. Allergens: Gluten.'
  },
  'karaage kip': {
    nl: 'Japanse stijl krokante kippendijen gemarineerd met gember en sojasaus. Allergenen: Soja, Gluten.',
    en: 'Japanese-style crispy marinated chicken thigh bites with ginger and soy. Allergens: Soy, Gluten.'
  },
  "butterfly gamba's": {
    nl: 'Gepaneerde krokante reuzengarnalen in panko paneermeel. Allergenen: Schaaldieren, Gluten.',
    en: 'Crispy panko-breaded butterfly king prawns. Allergens: Crustaceans/Shellfish, Gluten.'
  },
  'broodje kroket': {
    nl: 'Zacht wit broodje met warme Oma Bobs rundvleeskroket en mosterd. Allergenen: Gluten, Melk, Mosterd, Selderij.',
    en: 'Soft white roll with hot Oma Bobs beef croquette and mustard. Allergens: Gluten, Dairy, Mustard, Celery.'
  },
  'broodje kaasoufle': {
    nl: 'Zacht wit broodje met een goudbruine kaassoufflé. Vegetarisch. Allergenen: Gluten, Melk.',
    en: 'Soft white roll with crispy Dutch cheese soufflé. Vegetarian. Allergens: Gluten, Dairy.'
  },
  'samosas curry': {
    nl: 'Knapperige driehoekige pasteitjes gevuld met groenten en currykruiden. 100% Vegan. Allergenen: Gluten.',
    en: 'Crispy triangular pastries filled with vegetables and aromatic curry spices. 100% Vegan. Allergens: Gluten.'
  },
  'burgers': {
    nl: '100% runderburger op een brioche broodje met cheddar en burgersaus. Allergenen: Gluten, Melk, Ei, Mosterd.',
    en: '100% beef patty on a brioche bun with cheddar cheese and burger sauce. Allergens: Gluten, Dairy, Egg, Mustard.'
  },
  'patat': {
    nl: 'Krokante frites bereid in plantaardige olie met fijn zeezout. Vegan & Glutenvrij.',
    en: 'Crispy golden potato fries seasoned with sea salt. Vegan & Gluten-free.'
  },
  'cornichons': {
    nl: 'Friszure mini augurkjes. Vegan & Glutenvrij. Allergenen: Mosterd.',
    en: 'Baby gherkins pickled in fine vinegar with mustard seeds. Vegan & Gluten-free. Allergens: Mustard.'
  },
  'amsterdamse mix': {
    nl: 'Traditioneel Amsterdams tafelzuur met uitjes en augurkjes. Vegan & Glutenvrij. Allergenen: Mosterd.',
    en: 'Traditional Amsterdam pickled yellow cocktail onions and gherkins. Vegan & Gluten-free. Allergens: Mustard.'
  }
};

/**
 * Haalt de juiste vertaalde bezorgoptie naam op met veilige automatische fallback
 */
export function getDeliveryMethodName(method?: any, language: 'nl' | 'en' = 'nl', t?: (s?: string) => string): string {
  if (!method) return '';
  const rawName = String(method.name || '');
  if (language === 'nl') return rawName;

  // 1. Directe Engelse vertaling uit database / store_settings
  if (method.name_en && String(method.name_en).trim()) {
    return String(method.name_en).trim();
  }

  // 2. Fallback tabel via genormaliseerde naam
  const key = rawName.trim().toLowerCase();
  if (DEFAULT_DELIVERY_FALLBACKS[key]?.name) {
    return DEFAULT_DELIVERY_FALLBACKS[key].name;
  }

  // 3. Taalcontext vertaalhelper
  if (t) {
    const translated = t(rawName);
    if (translated && translated !== rawName) return translated;
  }

  return rawName;
}

/**
 * Haalt de juiste vertaalde bezorgoptie omschrijving op met veilige automatische fallback
 */
export function getDeliveryMethodDescription(method?: any, language: 'nl' | 'en' = 'nl', t?: (s?: string) => string): string {
  if (!method) return '';
  const rawDesc = String(method.description || '');
  if (language === 'nl') return rawDesc;

  // 1. Directe Engelse vertaling uit database / store_settings
  if (method.description_en && String(method.description_en).trim()) {
    return String(method.description_en).trim();
  }

  // 2. Fallback tabel via methodenaam
  const key = String(method.name || '').trim().toLowerCase();
  if (DEFAULT_DELIVERY_FALLBACKS[key]?.description) {
    return DEFAULT_DELIVERY_FALLBACKS[key].description;
  }

  // 3. Taalcontext vertaalhelper
  if (t && rawDesc) {
    const translated = t(rawDesc);
    if (translated && translated !== rawDesc) return translated;
  }

  return rawDesc;
}

/**
 * Haalt de juiste vertaalde extra informatie voor een snack op met veilige automatische fallback
 */
export function getSnackExtraInfo(product?: any, language: 'nl' | 'en' = 'nl', t?: (s?: string) => string): string {
  if (!product) return '';
  const prodNameKey = String(product.name || '').trim().toLowerCase();
  const rawNl = (product.extra_info || '').trim();
  const rawEn = (product.extra_info_en || '').trim();

  if (language === 'en') {
    // 1. Directe Engelse vertaling
    if (rawEn) return rawEn;

    // 2. Als er Nederlandse tekst is, probeer via t() te vertalen
    if (rawNl && t) {
      const translated = t(rawNl);
      if (translated && translated !== rawNl) {
        return translated;
      }
    }

    // 3. Bekende snack fallback
    if (DEFAULT_SNACK_EXTRA_INFO_FALLBACKS[prodNameKey]?.en) {
      return DEFAULT_SNACK_EXTRA_INFO_FALLBACKS[prodNameKey].en;
    }

    // 4. Val terug op Nederlandse tekst als die er is
    return rawNl;
  } else {
    // Nederlands
    if (rawNl) return rawNl;
    if (DEFAULT_SNACK_EXTRA_INFO_FALLBACKS[prodNameKey]?.nl) {
      return DEFAULT_SNACK_EXTRA_INFO_FALLBACKS[prodNameKey].nl;
    }
    return rawEn;
  }
}

/**
 * Bepaalt of er extra info getoond moet worden voor een snack (inclusief automatische fallback)
 */
export function hasSnackExtraInfo(product?: any): boolean {
  if (!product) return false;
  if (product.extra_info || product.extra_info_en || product.brand) return true;
  const prodNameKey = String(product.name || '').trim().toLowerCase();
  return Boolean(DEFAULT_SNACK_EXTRA_INFO_FALLBACKS[prodNameKey]);
}
