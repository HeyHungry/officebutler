import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { StoreSettings, SharedSettings } from '../lib/supabase';

export type Language = 'nl' | 'en';

// Comprehensive dictionary for instant, zero-latency translations
const STATIC_DICTIONARY: Record<string, string> = {
  // Navigation & Header
  'Hoe het werkt': 'How it works',
  'Assortiment': 'Assortment',
  'Voor Bedrijven': 'For Businesses',
  'Contact': 'Contact',
  'Inloggen': 'Sign In',
  'BESTEL NU': 'ORDER NOW',
  'Bestel Nu': 'Order Now',
  'Bestel nu': 'Order now',
  'Bestellen': 'Order',
  'Bekijk aanbod': 'View assortment',
  'Nu open': 'Open now',
  'Momenteel gesloten': 'Currently closed',
  'Sluiten': 'Close',

  // Hero Section
  'Exclusief in Amsterdam': 'Exclusively in Amsterdam',
  'EXCLUSIEF IN AMSTERDAM': 'EXCLUSIVELY IN AMSTERDAM',
  'De Zakelijke Borrelservice van Mokum': "Amsterdam's Premier Corporate Catering Service",
  'Luxe Borrelen': 'Luxury Catering',
  'op Kantoor': 'at the Office',
  'Kantoorborrel?': 'Office Gathering?',
  'De perfecte kantoorborrel.': 'The perfect office gathering.',
  'De perfecte <span class="font-serif italic text-white/90">kantoorborrel</span>.': 'The perfect <span class="font-serif italic text-white/90">office gathering</span>.',
  'De borrelservice van Mokum': "Amsterdam's Catering Service",
  'Onze butlers leveren de lekkerste snacks voor jouw kantoorborrel.': 'Our butlers deliver the finest hot snacks for your office event.',
  'Wij serveren snacks in butler stijl direct bij jullie op kantoor.': 'We serve warm snacks in classic butler style directly at your office.',
  'Warm en koud geserveerd op het gewenste tijdstip': 'Served hot and cold at your preferred time',
  'Direct Bestellen': 'Order Directly',
  'Bestel direct': 'Order directly',
  'Bestel Vooruit': 'Pre-order',
  'Offerte Aanvragen': 'Request a Quote',

  // How it works
  'Hoe het Werkt': 'How It Works',
  'Hoe Het Werkt': 'How It Works',
  'Hoe Werkt Office Butler?': 'How Does Office Butler Work?',
  'Hoe werkt de Office Butler?': 'How Does Office Butler Work?',
  'In drie eenvoudige stappen de perfecte borrel': 'The perfect office drinks in three simple steps',
  'In 3 simpele stappen jouw kantoorborrel of vrijdagmiddagborrel geregeld.': 'Arrange your office drinks or Friday social in 3 simple steps.',
  'Kies uw Moment': 'Choose Your Time',
  'Selecteer de gewenste datum en het tijdstip voor uw kantoorborrel.': 'Select your desired date and time for your office gathering.',
  'Stel Samen': 'Choose Your Assortment',
  'Kies uit onze samengestelde pakketten of bestel à la carte van het menu.': 'Choose from our curated packages or order à la carte from our menu.',
  'Zorgeloos Genieten': 'Enjoy Worry-Free',
  'Wij bezorgen stipt op tijd, eventueel inclusief professioneel uitserveren.': 'We deliver on time, with optional professional on-site serving.',
  '1. Bestel of Meld Aan': '1. Order or Register',
  'Bestel direct voor de vrijmibo, of meld uw bedrijf aan voor een vaste, gepersonaliseerde bestellink voor het personeel.': 'Order directly for Friday drinks, or register your company for a dedicated ordering portal for your staff.',
  '2. Wij Bereiden Voor': '2. We Prepare',
  'Onze chefs in de Mokum Local Kitchen bereiden de warme snacks en verzamelen de gekoelde dranken op het afgesproken moment.': 'Our chefs at Mokum Local Kitchen prepare the hot snacks and chill the beverages for the agreed time.',
  '3. Bezorging op Kantoor': '3. Office Delivery',
  'Wij leveren alles vers, warm en gekoeld af bij u op kantoor in Amsterdam, precies op tijd voor de borrel of het evenement.': 'We deliver everything fresh, hot, and chilled to your Amsterdam office, right on time for your gathering.',
  'Selecteer gewenste snacks': 'Select your favourite snacks',
  'Stel de ideale bittergarnituur samen uit ons ruime assortiment aan kwaliteit snacks.': 'Compose the ideal snack selection from our wide range of premium snacks.',
  'Perfecte bezorgmoment': 'Choose the perfect delivery time',
  'Bestel voor directe levering binnen 45 minuten of plan de bestelling eenvoudig vooruit.': 'Order for direct delivery within 45 minutes or plan easily in advance.',
  'Uitpakken en uitserveren': 'Unpack and serve',
  'De snacks worden standaard gratis bezorgd, of maak gebruik van de butler service voor het uitpakken en uitserveren.': 'Snacks are delivered free as standard, or opt for our butler service to unpack and serve them.',

  // Categories & Headers
  'Onze Selectie': 'Our Selection',
  'Ons Menu': 'Our Menu',
  'Hoogwaardige snacks, vers bereid in de Mokum Local Kitchen.': 'High-quality snacks, freshly prepared in the Mokum Local Kitchen.',
  'Zelf samenstellen of iets extra\'s toevoegen aan uw pakket? Bekijk ons uitgebreide menu.': 'Customise your selection or add extras to your package? Explore our complete menu.',
  'Bekijk volledig menu': 'View full menu',
  'Bekijk menu': 'View menu',
  'Extra informatie': 'Extra information',
  'Ingrediënten / Allergenen': 'Ingredients / Allergens',
  'Bekijk en bestel': 'View and order',
  'Alle': 'All',
  'Warm': 'Hot',
  'Koud': 'Cold',
  'Vega': 'Vegetarian',
  'vega': 'Vegetarian',
  'Vegetarisch': 'Vegetarian',
  'vegetarisch': 'Vegetarian',
  'Vegetarisch & Vegan': 'Vegetarian & Vegan',
  'Vegan': 'Vegan',
  'vegan': 'Vegan',
  'Dranken': 'Drinks & Beverages',
  'dranken': 'Drinks & Beverages',
  'Snacks': 'Hot Snacks & Bites',
  'snacks': 'Hot Snacks & Bites',
  'Borrelhapjes': 'Snacks & Bites',
  'Klassiekers': 'Classics',
  'klassiekers': 'Classics',
  'Gamba & Kip': 'Prawns & Chicken',
  'gamba & kip': 'Prawns & Chicken',
  'Gevogelte': 'Poultry',
  'Rundvlees': 'Beef',
  'Kalfsvlees': 'Veal',
  'Vis & Gamba': 'Fish & Prawns',
  'broodjes': 'Warm Rolls & Sandwiches',
  'Broodjes': 'Warm Rolls & Sandwiches',
  'Sausjes': 'Sauces & Dips',
  'sausjes': 'Sauces & Dips',
  'Sauzen & Dips': 'Sauces & Dips',
  'sauzen & dips': 'Sauces & Dips',
  'Tafel Zuur': 'Table Pickles',
  'tafel zuur': 'Table Pickles',
  'Overig': 'Other',
  'overig': 'Other',

  // Product and Variant translations
  'Mini Kroket': 'Mini Dutch Croquettes (Crispy)',
  'Mini kroket': 'Mini Dutch Croquettes (Crispy)',
  'Mini Kroketjes': 'Mini Dutch Croquettes',
  'Mini Kroketten': 'Mini Dutch Croquettes',
  'Bitterballen': 'Crispy Dutch Meatballs (Bitterballen)',
  'Broodje Kaasoufle': 'Dutch Cheese Soufflé Roll',
  'Broodje Kaassoufflé': 'Dutch Cheese Soufflé Roll',
  'Broodje Kroket': 'Dutch Beef Croquette Roll',
  'Cornichons': 'Mini Pickles (Cornichons)',
  'Amsterdamse Mix': 'Amsterdam Pickled Mix (Onions & Gherkins)',
  'Samosas Curry': 'Crispy Curry Samosas',
  'Curry Samosas': 'Crispy Curry Samosas',
  'Zoete Chili saus': 'Sweet Chili Sauce',
  'Mayonaise | Zaanse': 'Traditional Dutch Mayonnaise (Zaanse)',
  'Ketchup | Zaanse': 'Tomato Ketchup (Zaanse)',
  'Spicy-Mayo | Zaanse': 'Spicy Mayonnaise (Zaanse)',
  'Frikandelletjes': 'Mini Dutch Frikandellen',
  'Kaasstengels': 'Crispy Cheese Sticks',
  'Kipnuggets': 'Crispy Chicken Nuggets',
  'Vlammetjes': 'Spicy Beef Pastries (Vlammetjes)',
  'Karaage Kip': 'Japanese Karaage Crispy Chicken',
  'Chicken Wings': 'Crispy Chicken Wings',
  'Mini Loempia': 'Mini Crispy Spring Rolls',
  "Butterfly Gamba's": 'Crispy Butterfly King Prawns',
  'Vegan Bitterballen': 'Vegan Dutch Bitterballen',
  'Kalfskroketjes': 'Veal Croquettes',
  'Runderbitterballen': 'Beef Bitterballen',
  'Kaashapjes': 'Cheese Bites',
  'Snack Mix': 'Signature Snack Mix',

  // Ingredients / Options / Sauces
  'Rund': 'Beef',
  'Kalf': 'Veal',
  'Garnalen': 'Shrimp',
  'Kip': 'Chicken',
  'Pikant': 'Spicy',
  'Mild': 'Mild',
  'Knoflooksaus': 'Garlic sauce',
  'Mosterd': 'Mustard',
  'Chilisaus': 'Sweet chili sauce',
  'Mayonaise': 'Mayonnaise',
  'Ketchup': 'Ketchup',
  'Curry': 'Curry ketchup',
  'Truffelmayonaise': 'Truffle mayonnaise',
  'Geen foto': 'No photo',
  'Nieuw': 'New',
  'Meest Gekozen': 'Most Popular',
  'Uitverkocht': 'Sold Out',
  'Binnenkort': 'Coming Soon',
  'Meer info': 'More info',
  'Opties': 'Options',
  'Inclusief': 'Includes',

  // Business Section ("Vaste Klant Worden")
  'Vaste Klant Worden': 'Become a Regular Partner',
  'Een vaste partner voor uw kantoor.': 'A trusted catering partner for your office.',
  'De garantie voor een vlekkeloze kantoorborrel.': 'The guarantee for a seamless office event.',
  'Organiseert u regelmatig kantoorborrels of evenementen? Meld uw bedrijf aan bij Office Butler. Wij creëren een gepersonaliseerde bestelomgeving exclusief voor uw medewerkers.': 'Do you regularly host office drinks or corporate events? Register your company with Office Butler. We will create a personalized ordering portal exclusively for your team.',
  'Bedrijf Aanmelden': 'Register Your Company',
  'Bedrijfsnaam': 'Company Name',
  'Contactpersoon': 'Contact Person',
  'E-mailadres': 'Email Address',
  'Telefoonnummer': 'Phone Number',
  'Wensen / Notities': 'Special Requests / Notes',
  'Eventuele wensen (bijv. frequentie, grootte team)': 'Special requests (e.g. frequency, team size)',
  'Kantoor Inschrijven': 'Register Office',
  'Aanvraag versturen': 'Submit Registration',
  'Versturen...': 'Submitting...',
  'Vaste bezorgmomenten inplannen': 'Schedule recurring delivery times',
  'Achteraf betalen op factuur': 'Monthly invoicing afterwards',
  'Volumekorting bij vaste afname': 'Volume discounts for regular orders',
  'Een eigen, unieke URL (bijv. officebutler.nl/uw-bedrijf)': 'A dedicated, branded URL (e.g. officebutler.nl/your-company)',
  'Gepersonaliseerd assortiment naar wens': 'Customized menu tailored to your preferences',
  'Optie tot betalen op factuur': 'Option for monthly business invoicing',
  'Aanvraag Verzonden': 'Registration Received',
  'Bedankt voor uw aanvraag!': 'Thank you for your registration!',
  'Bedankt voor uw aanvraag. Wij nemen zo spoedig mogelijk contact met u op.': 'Thank you for registering. We will contact you as soon as possible.',
  'Wij hebben uw gegevens in goede orde ontvangen en nemen zo spoedig mogelijk contact met u op.': 'We have received your details in good order and will contact you as soon as possible.',
  'Nog een aanvraag doen': 'Submit another request',

  // Assortments
  'Onze Assortimenten': 'Our Assortments',
  'Onze Butler Service': 'Our Butler Service',
  'Kies het pakket dat het beste bij uw kantoorborrel past.': 'Choose the package that best fits your office event.',
  'Kies de service die het beste bij de kantoorborrel past.': 'Choose the service that best suits your office gathering.',
  'Samengestelde Pakketten': 'Curated Packages',
  'Pakketten': 'Packages',
  'Kies voor gemak met onze complete borrelarrangementen': 'Choose convenience with our complete catering arrangements',
  'Pakket 1: Bezorgen': 'Package 1: Delivery',
  'Pakket 2: Uitserveren': 'Package 2: On-site Serving',
  'Bezorgen': 'Delivery',
  'Bezorgen op kantoor': 'Office Delivery',
  'Inclusief professioneel uitserveren': 'Including professional on-site service',
  'vanaf': 'from',
  'per persoon': 'per person',
  'Warm en koud bezorgd': 'Delivered hot and cold',
  'Inclusief disposables en servetten': 'Includes napkins and eco disposables',
  'Keuze uit ons complete snackassortiment': 'Choice from our entire snack assortment',
  'Optioneel met drankenarrangement': 'Optional beverage package',
  'Professionele bediening op locatie': 'Professional service staff on-site',
  'Warmhouden en serveren van snacks': 'Warming and table service of snacks',
  'Opruimen en meenemen van afval': 'Clean-up and waste removal included',
  'Minimaal 20 personen': 'Minimum 20 people',
  'Bestel Bezorging': 'Order Delivery',
  'Bestel Uitserveren': 'Order Full Service',
  'Bestel Compleet': 'Order Complete',
  'Kies Bezorgen': 'Choose Delivery',
  'KIES BEZORGEN': 'CHOOSE DELIVERY',
  'Kies Uitserveren': 'Choose Full Service',
  'KIES BUTLER SERVICE': 'CHOOSE BUTLER SERVICE',
  'Netjes en warm tot aan de deur geleverd': 'Delivered hot and neatly right to your office door',
  'Gegarandeerd warme levering': 'Guaranteed hot delivery',
  'Stipt op de afgesproken tijd (of binnen 45 min)': 'Punctually at the agreed time (or within 45 min)',
  'Gratis bezorgservice': 'Free delivery service',
  'Vanaf 10 personen': 'From 10 people',
  'Uitpakken & uitserveren': 'Unpack & Serve',
  'De ultieme butler ervaring': 'The ultimate butler experience',
  'Butlers pakken de snacks uit en maken ze eetklaar': 'Butlers unpack the snacks and prepare them ready-to-eat',
  'Butlers serveren de warme hapjes direct uit': 'Butlers serve the hot snacks directly to your guests',
  'Ideaal voor grotere groepen of evenementen': 'Ideal for larger teams, company events, or receptions',

  // Contact & FAQ
  'Contact & Informatie': 'Contact & Information',
  'Veelgestelde Vragen': 'Frequently Asked Questions',
  'FAQ | Veelgestelde Vragen': 'FAQ | Frequently Asked Questions',
  'Openingstijden': 'Opening Hours',
  'Locatie': 'Location',
  'WhatsApp & Telefoon': 'WhatsApp & Phone',
  'Snelste reactie via WhatsApp': 'Fastest response via WhatsApp',
  'E-mail': 'Email',
  'Openingstijden Bezorging': 'Delivery Hours',
  'Ma - Vr: 15:00 - 21:00': 'Mon - Fri: 15:00 - 21:00',
  'Bezorgen jullie ook buiten Amsterdam?': 'Do you also deliver outside Amsterdam?',
  'Momenteel bezorgen wij met Office Butler uitsluitend op kantoren binnen de ring van Amsterdam om de kwaliteit en temperatuur van onze snacks te garanderen.': 'Currently, Office Butler delivers exclusively to offices within the Amsterdam ring road to guarantee the top quality and optimal temperature of our snacks.',
  'Wat is het verschil met Canal Butler?': 'What is the difference with Canal Butler?',
  'Office Butler is het B2B zusterbedrijf van Canal Butler. We maken gebruik van dezelfde keuken (Mokum Local Kitchen) en bieden dezelfde premium kwaliteit, maar dan specifiek afgestemd op levering op kantoor in plaats van op de grachten.': 'Office Butler is the corporate B2B sister company of Canal Butler. We use the same kitchen (Mokum Local Kitchen) and offer the same premium quality, specifically tailored for delivery to offices rather than canal boats.',
  'Hoe ver van tevoren moet ik bestellen?': 'How far in advance do I need to order?',
  'Voor reguliere bestellingen vragen wij u minimaal 2 uur van tevoren te bestellen. Voor grote groepen (>30 personen) of een compleet assortiment horen wij dit graag minimaal 24 uur van tevoren.': 'For standard orders, we recommend ordering at least 2 hours in advance. For large groups (>30 people) or full catering packages, please let us know at least 24 hours in advance.',

  // Order Modal & Delivery
  'Hoe wilt u bestellen?': 'How would you like to order?',
  'Maak uw keuze': 'Make your choice',
  'Word vaste klant': 'Become a regular client',
  'Meld uw bedrijf aan voor een vaste bestelomgeving': 'Register your company for a dedicated ordering portal',
  'Eenmalig bestellen': 'One-off order',
  'Bestel direct zonder vast account': 'Order directly without a corporate account',
  'Selecteer bezorgwijze': 'Select delivery method',
  'Uitserveren': 'On-site Serving',
  'Uitserveren (uurloon)': 'On-site Serving (hourly rate)',
  'Uitserveren (uurtarief)': 'On-site Serving (hourly rate)',
  '/ uur (uurtarief)': '/ hour (hourly rate)',
  'per uur': 'per hour',
  'Gratis': 'Free',
  'Bestel vooraf': 'Pre-order',
  'Plan uw bestelling voor een later moment': 'Schedule your order for a later time',
  'Ontvang uw bestelling zo snel mogelijk': 'Receive your order as quickly as possible',
  'Voor bestaande zakelijke klanten en medewerkers': 'For existing corporate clients and staff',
  'Eenmalig / Particulier bestellen': 'One-time / Guest order',
  'Snel bestellen zonder account': 'Quick ordering without an account',
  'Kies je bezorgmethode': 'Choose your delivery method',
  'Selecteer hoe je je bestelling wilt ontvangen of laten verzorgen.': 'Select how you would like to receive or have your order served.',

  // Days of week
  'Maandag': 'Monday',
  'Dinsdag': 'Tuesday',
  'Woensdag': 'Wednesday',
  'Donderdag': 'Thursday',
  'Vrijdag': 'Friday',
  'Zaterdag': 'Saturday',
  'Zondag': 'Sunday',
  'Gesloten': 'Closed',

  // Footer
  'Luxe borrelservice voor kantoren in Amsterdam.': 'Luxury office catering service in Amsterdam.',
  'Alle rechten voorbehouden.': 'All rights reserved.',
  'Onderdeel van het Butler netwerk.': 'Part of the Butler network.'
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (dutchText?: string, fallbackEn?: string) => string;
  isTranslating: boolean;
  translateCustomTexts: (texts: Record<string, string>) => Promise<Record<string, string>>;
  getTranslatedStoreSettings: (storeSettings?: StoreSettings) => StoreSettings | undefined;
  getTranslatedSharedSettings: (settings?: SharedSettings) => SharedSettings | undefined;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'ob_preferred_language';
const CACHE_STORAGE_KEY = 'ob_dynamic_translations_cache';

export const LanguageProvider: React.FC<{
  children: React.ReactNode;
  customTranslations?: Record<string, string>;
}> = ({ children, customTranslations = {} }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved === 'en' || saved === 'nl') return saved;
    }
    return 'nl';
  });

  const [dynamicCache, setDynamicCache] = useState<Record<string, string>>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem(CACHE_STORAGE_KEY);
        return cached ? JSON.parse(cached) : {};
      } catch {
        return {};
      }
    }
    return {};
  });

  const [isTranslating, setIsTranslating] = useState(false);

  // Sync language selection to localStorage and <html> lang attribute
  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, newLang);
      document.documentElement.lang = newLang;
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  // Utility to translate a batch of texts on-demand (e.g. via explicit button or background action)
  const translateCustomTexts = async (texts: Record<string, string>): Promise<Record<string, string>> => {
    if (language === 'nl') return texts;

    const toFetch: Record<string, string> = {};
    const resolved: Record<string, string> = {};

    for (const [key, text] of Object.entries(texts)) {
      if (!text || typeof text !== 'string') {
        resolved[key] = text;
        continue;
      }
      const trimmed = text.trim();
      const lower = trimmed.toLowerCase();

      // Check custom overrides first
      if (customTranslations[trimmed]) {
        resolved[key] = customTranslations[trimmed];
        continue;
      }

      // Check static dictionary
      if (STATIC_DICTIONARY[trimmed]) {
        resolved[key] = STATIC_DICTIONARY[trimmed];
        continue;
      }
      let foundStatic = false;
      for (const [k, v] of Object.entries(STATIC_DICTIONARY)) {
        if (k.trim().toLowerCase() === lower && v) {
          resolved[key] = v;
          foundStatic = true;
          break;
        }
      }
      if (foundStatic) continue;

      if (dynamicCache[trimmed]) {
        resolved[key] = dynamicCache[trimmed];
      } else {
        toFetch[key] = text;
      }
    }

    if (Object.keys(toFetch).length === 0) {
      return resolved;
    }

    setIsTranslating(true);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texts: toFetch, targetLang: 'en' }),
      });

      if (res.ok) {
        const data = await res.json();
        const newTranslations = data.translations || {};
        const updatedCache = { ...dynamicCache };

        for (const [k, translated] of Object.entries(newTranslations)) {
          resolved[k] = String(translated);
          const origText = toFetch[k];
          if (origText) {
            updatedCache[origText.trim()] = String(translated);
          }
        }

        setDynamicCache(updatedCache);
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(updatedCache));
          } catch (e) {
            console.warn('Failed to persist translation cache to localStorage', e);
          }
        }
      } else {
        for (const [k, orig] of Object.entries(toFetch)) {
          resolved[k] = orig;
        }
      }
    } catch {
      for (const [k, orig] of Object.entries(toFetch)) {
        resolved[k] = orig;
      }
    } finally {
      setIsTranslating(false);
    }

    return resolved;
  };

  // Pure translation lookup function: NEVER triggers setState or network requests during render
  const t = (dutchText?: string, fallbackEn?: string): string => {
    if (!dutchText) return '';
    if (language === 'nl') return dutchText;

    const trimmed = dutchText.trim();
    const lower = trimmed.toLowerCase();

    // 1. Moderator custom translation overrides
    if (customTranslations[trimmed]) {
      return String(customTranslations[trimmed]);
    }
    for (const [k, v] of Object.entries(customTranslations)) {
      if (k.trim().toLowerCase() === lower && v) {
        return String(v);
      }
    }

    // 2. Static dictionary exact trimmed match
    if (STATIC_DICTIONARY[trimmed]) {
      return STATIC_DICTIONARY[trimmed];
    }

    // 3. Static dictionary case-insensitive match (e.g. "broodjes" vs "Broodjes")
    for (const [k, v] of Object.entries(STATIC_DICTIONARY)) {
      if (k.trim().toLowerCase() === lower && v) {
        return v;
      }
    }

    // 4. Dynamic cache
    if (dynamicCache[trimmed]) {
      return dynamicCache[trimmed];
    }

    // 5. Provided fallback
    if (fallbackEn) {
      return fallbackEn;
    }

    return dutchText;
  };

  // Translates storeSettings page_content purely: NEVER triggers setState or network requests during render
  const getTranslatedStoreSettings = (storeSettings?: StoreSettings): StoreSettings | undefined => {
    if (!storeSettings) return storeSettings;
    if (language === 'nl') return storeSettings;

    const pageContent = storeSettings.page_content || {};
    const translatedContent: Record<string, any> = { ...pageContent };

    for (const [key, val] of Object.entries(pageContent)) {
      if (key.endsWith('_en') || key === 'custom_translations' || key === 'section_order') {
        continue;
      }

      // Check explicit English override configured in the moderator dashboard (e.g. hero_title_en)
      const explicitOverride = pageContent[`${key}_en`];
      if (typeof explicitOverride === 'string' && explicitOverride.trim()) {
        translatedContent[key] = explicitOverride.trim();
      } else if (typeof val === 'string' && val.trim()) {
        translatedContent[key] = t(val);
      }
    }

    return {
      ...storeSettings,
      page_content: translatedContent
    };
  };

  // Translates sharedSettings purely: NEVER triggers setState or network requests during render
  const getTranslatedSharedSettings = (settings?: SharedSettings): SharedSettings | undefined => {
    if (!settings) return settings;
    if (language === 'nl') return settings;

    let translatedPromo = settings.promo_message;
    if (settings.promo_message) {
      translatedPromo = t(settings.promo_message);
    }

    return {
      ...settings,
      promo_message: translatedPromo
    };
  };

  const contextValue = useMemo(() => ({
    language,
    setLanguage,
    t,
    isTranslating,
    translateCustomTexts,
    getTranslatedStoreSettings,
    getTranslatedSharedSettings,
  }), [language, customTranslations, dynamicCache, isTranslating]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
