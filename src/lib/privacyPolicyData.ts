/**
 * Standaard wettelijk AVG / GDPR conform Privacybeleid voor Office Butler (Mokum Local Kitchen - KvK 99852667).
 * Beheerders kunnen deze teksten via het Moderator Paneel aanpassen;
 * indien nog niet aangepast, wordt deze juridisch solide basis gebruikt.
 */

export interface PrivacyPolicyContent {
  title: string;
  lastUpdated: string;
  intro: string;
  sections: Array<{
    heading: string;
    body: string;
  }>;
  contactEmail: string;
}

export const DEFAULT_PRIVACY_POLICY_NL: PrivacyPolicyContent = {
  title: "Privacybeleid & Gegevensbescherming",
  lastUpdated: "7 oktober 2026",
  intro: "Office Butler (onderdeel van Mokum Local Kitchen, ingeschreven bij de Kamer van Koophandel onder KvK-nummer 99852667) respecteert uw privacy en hecht grote waarde aan een zorgvuldige en veilige verwerking van uw persoonsgegevens conform de Algemene Verordening Gegevensbescherming (AVG / GDPR) en de Nederlandse Telecommunicatiewet.",
  contactEmail: "info@office-butler.com",
  sections: [
    {
      heading: "1. Wie is verantwoordelijk voor uw gegevens?",
      body: "Mokum Local Kitchen (handelsnaam Office Butler), gevestigd te Amsterdam en ingeschreven bij de Kamer van Koophandel onder KvK 99852667, is de verwerkingsverantwoordelijke voor de verwerking van persoonsgegevens via de website, het bestelproces en de bijbehorende bedrijfsportalen."
    },
    {
      heading: "2. Welke persoonsgegevens verwerken wij?",
      body: `Wij verwerken uitsluitend gegevens die noodzakelijk zijn voor het functioneren van de dienst en het uitvoeren van uw bestellingen:\n
• Contactgegevens: Naam van contactpersoon, e-mailadres en telefoonnummer.
• Bedrijfs- en Bezorggegevens: Bedrijfsnaam, bezorgadres (straat, huisnummer, postcode, plaats, eventuele verdieping of afleverinstructie).
• Accountgegevens (bij inloggen): Zakelijk e-mailadres, gehasht (versleuteld) wachtwoord, gekoppelde rol (beheerder, medewerker) en bedrijfskoppeling.
• Bestel- en Transactiegegevens: Gekozen snacks, porties, allergenennotities, bezorgdatum/-tijdstip, gekozen bezorgoptie (bezorgen, uitpakken, butlerservice), orderbedragen en status van betaling/facturatie.
• Technische en Sessiegegevens: Functionele gegevens die nodig zijn om uw winkelmandje, taalkeuze en veilige inlogsessie te behouden.`
    },
    {
      heading: "3. Doeleinden en rechtsgronden van de verwerking",
      body: `Wij verwerken persoonsgegevens uitsluitend op basis van de wettelijke grondslagen van de AVG:\n
a) Uitvoering van de overeenkomst (art. 6 lid 1 sub b AVG): Om uw bestelling te bereiden, in te plannen, te bezorgen en factureren, alsmede om contact op te nemen bij eventuele wijzigingen in het bezorgschema.
b) Wettelijke verplichting (art. 6 lid 1 sub c AVG): Wij zijn wettelijk verplicht administratieve en fiscale gegevens (zoals facturen en transacties) 7 jaar te bewaren voor de Belastingdienst.
c) Gerechtvaardigd belang (art. 6 lid 1 sub f AVG): Ter beveiliging van onze systemen, fraudepreventie, beheer van bedrijfsaccounts en optimalisatie van onze dienstverlening.
d) Toestemming (art. 6 lid 1 sub a AVG): Voor optionele communicatie waar u vooraf expliciet toestemming voor heeft verleend.`
    },
    {
      heading: "4. Inloggen, Accounts en Beveiliging van Gegevens",
      body: `De authenticatie voor medewerkers en bedrijfsbeheerders verloopt via versleutelde verbindingen (HTTPS/SSL). Wachtwoorden worden nooit in platte tekst opgeslagen, maar cryptografisch gehasht en beveiligd met Row Level Security (RLS) in onze database.
\nToegang tot beheer- en bestelgegevens is strikt afgeschermd volgens het principe van minimale privileges (role-based access control). Medewerkers hebben uitsluitend toegang tot hun eigen bedrijfscatalogus en bestellingen.`
    },
    {
      heading: "5. Delen van gegevens met derden (Verwerkers)",
      body: `Wij verkopen uw persoonsgegevens NOOIT aan derden. Gegevens worden uitsluitend gedeeld met partijen die noodzakelijk zijn voor onze dienstverlening, onder strikte verwerkersovereenkomsten:\n
• Onze butlers en bezorgers (uitsluitend de voor de aflevering benodigde adres- en contactgegevens).
• Veilige cloud- en databasehosting providers binnen de Europese Economische Ruimte (EER) of onder passende waarborgen (zoals de AVG en EU Standard Contractual Clauses).
• Onze accountant en de Belastingdienst ter nakoming van fiscale verplichtingen.`
    },
    {
      heading: "6. Bewaartermijnen",
      body: `Wij bewaren persoonsgegevens niet langer dan strikt noodzakelijk:\n
• Fiscale en financiële orderadministratie: 7 jaar conform de wettelijke fiscale bewaarplicht.
• Bedrijfs- en gebruikersaccounts: Totdat het account door de beheerder of op uw verzoek wordt beëindigd, of uiterlijk 2 jaar na inactiviteit.
• Contactaanvragen en offertes: Maximaal 12 maanden na afhandeling van het verzoek.`
    },
    {
      heading: "7. Uitzondering op het Herroepingsrecht (Bederfelijke waar)",
      body: "Conform artikel 6:230p sub f van het Nederlands Burgerlijk Wetboek is het herroepingsrecht (de wettelijke bedenktijd van 14 dagen) uitgesloten voor de levering van zaken die snel bederven of die een beperkte houdbaarheid hebben, waaronder vers bereide warme snacks, borrelhapjes en catering."
    },
    {
      heading: "8. Uw rechten onder de AVG",
      body: `U heeft te allen tijde de volgende wettelijke rechten met betrekking tot uw persoonsgegevens:\n
• Recht op inzage (art. 15 AVG): U kunt opvragen welke gegevens wij van u hebben.
• Recht op rectificatie (art. 16 AVG): U kunt onjuiste of onvolledige gegevens laten corrigeren.
• Recht op gegevenswissing / vergetelheid (art. 17 AVG), voor zover dit niet botst met onze 7-jarige fiscale bewaarplicht.
• Recht op beperking van de verwerking (art. 18 AVG).
• Recht op dataportabiliteit (art. 20 AVG): Het recht om uw gegevens in een gestructureerd formaat te ontvangen.
• Recht op bezwaar (art. 21 AVG).
\nU kunt een verzoek indienen via info@office-butler.com. Wij reageren binnen vier weken op uw verzoek. Daarnaast heeft u het recht een klacht in te dienen bij de toezichthouder: de Autoriteit Persoonsgegevens (AP).`
    },
    {
      heading: "9. Cookies en Lokale Opslag",
      body: "Onze website maakt uitsluitend gebruik van noodzakelijke functionele cookies en lokale browseropslag (zoals het onthouden van uw geselecteerde taal, uw winkelmandje en uw inlogsessie). Wij plaatsen géén tracking- of advertentiecookies van derden zonder uw uitdrukkelijke toestemming."
    },
    {
      heading: "10. Wijzigingen in dit privacybeleid",
      body: "Wij behouden ons het recht voor om dit privacybeleid te actualiseren. Belangrijke wijzigingen worden via de website kenbaar gemaakt en direct bijgewerkt in dit overzicht."
    }
  ]
};

export const DEFAULT_PRIVACY_POLICY_EN: PrivacyPolicyContent = {
  title: "Privacy Policy & Data Protection",
  lastUpdated: "October 7, 2026",
  intro: "Office Butler (part of Mokum Local Kitchen, registered with the Dutch Chamber of Commerce under registration number KvK 99852667) respects your privacy and is committed to protecting your personal data in accordance with the General Data Protection Regulation (GDPR / AVG) and the Dutch Telecommunications Act.",
  contactEmail: "info@office-butler.com",
  sections: [
    {
      heading: "1. Data Controller Identity",
      body: "Mokum Local Kitchen (trading as Office Butler), located in Amsterdam and registered with the Dutch Chamber of Commerce under KvK 99852667, is the data controller responsible for processing personal data through this website, ordering process, and corporate portals."
    },
    {
      heading: "2. Personal Data We Collect",
      body: `We only collect personal data necessary to provide our catering and corporate butler services:\n
• Contact details: Contact person's name, email address, and phone number.
• Company & Delivery details: Company name, delivery address (street, number, postal code, city, floor or specific delivery notes).
• Account details (upon authentication): Business email address, cryptographically hashed passwords, user role (admin, employee), and company affiliation.
• Order & Transaction data: Selected snacks, portion sizes, dietary/allergen notes, delivery date and time, delivery method (delivery, unpacking, butler service), order totals, and invoice/payment status.
• Technical & Session data: Necessary functional data to preserve your shopping basket, language preferences, and secure authenticated sessions.`
    },
    {
      heading: "3. Purposes and Legal Bases for Processing",
      body: `We process personal data solely in accordance with GDPR legal grounds:\n
a) Contract performance (Art. 6(1)(b) GDPR): To prepare, schedule, deliver, and invoice your order, and to communicate regarding order updates or logistics.
b) Legal obligation (Art. 6(1)(c) GDPR): We are legally required to retain transaction and accounting records for 7 years for the Dutch Tax Authorities (Belastingdienst).
c) Legitimate interests (Art. 6(1)(f) GDPR): To safeguard our systems, prevent fraud, administer business portals, and optimize our corporate services.
d) Consent (Art. 6(1)(a) GDPR): For optional communications where you have given explicit prior consent.`
    },
    {
      heading: "4. Authentication, Logins and Security",
      body: `All communications between your browser and our servers are encrypted via HTTPS/SSL. Passwords are never stored in plain text; they are cryptographically hashed and safeguarded by Row Level Security (RLS) policies within our database.\n
Access to administrative and order records is restricted according to the principle of least privilege. Employees can only access their designated company catalog and authorized orders.`
    },
    {
      heading: "5. Data Sharing with Third Parties",
      body: `We NEVER sell your personal data. Data is only shared with trusted service providers essential to fulfilling our services under formal data processing agreements:\n
• Our butlers and delivery couriers (strictly the delivery details required for prompt handover).
• Secure cloud hosting and database providers operating within the European Economic Area (EEA) or under recognized adequacy mechanisms (GDPR Standard Contractual Clauses).
• Certified accountants and tax authorities to comply with statutory fiscal obligations.`
    },
    {
      heading: "6. Data Retention Periods",
      body: `We retain personal data no longer than necessary:\n
• Fiscal and order transaction records: 7 years in compliance with statutory Dutch tax laws.
• Corporate and user accounts: Until terminated by the account administrator or upon request, or up to 2 years of inactivity.
• Lead and business inquiries: Up to 12 months following conclusion of the inquiry.`
    },
    {
      heading: "7. Right of Withdrawal Exemption (Perishable Goods)",
      body: "Pursuant to Article 6:230p(f) of the Dutch Civil Code, the statutory 14-day right of withdrawal does not apply to the supply of perishable foodstuffs, including freshly prepared hot snacks, catering platters, and butler food services."
    },
    {
      heading: "8. Your Rights Under GDPR",
      body: `Under the GDPR, you have the following enforceable rights:\n
• Right of access (Art. 15 GDPR): Request copies of the personal data we hold about you.
• Right to rectification (Art. 16 GDPR): Correct inaccurate or incomplete data.
• Right to erasure (Art. 17 GDPR), subject to statutory fiscal retention requirements.
• Right to restriction of processing (Art. 18 GDPR).
• Right to data portability (Art. 20 GDPR).
• Right to object (Art. 21 GDPR).
\nTo exercise any of these rights, contact us at info@office-butler.com. We respond within four weeks. You also have the right to lodge a complaint with the Dutch Data Protection Authority (Autoriteit Persoonsgegevens).`
    },
    {
      heading: "9. Cookies and Local Storage",
      body: "Our website strictly uses functional cookies and browser storage (such as remembering your language choice, shopping cart contents, and authentication session). We do NOT deploy third-party advertising or tracking cookies without your prior consent."
    },
    {
      heading: "10. Updates to this Policy",
      body: "We may update this privacy statement periodically. The latest version is always accessible on this page with the effective date indicated above."
    }
  ]
};

/**
 * Haalt het geconfigureerde privacybeleid op uit store_settings (of de standaardtekst als fallback)
 */
export function getPrivacyPolicy(pageContent?: any, language: 'nl' | 'en' = 'nl'): PrivacyPolicyContent {
  const isEn = language === 'en';
  const defaultPolicy = isEn ? DEFAULT_PRIVACY_POLICY_EN : DEFAULT_PRIVACY_POLICY_NL;

  if (!pageContent) return defaultPolicy;

  // Controleer of er een aangepaste tekst is opgeslagen in store_settings.page_content
  const customPolicyRaw = isEn ? pageContent.privacy_policy_en : (pageContent.privacy_policy_nl || pageContent.privacy_policy);

  if (!customPolicyRaw) {
    return defaultPolicy;
  }

  // Als de beheerder het als object of als platte tekst heeft opgeslagen
  if (typeof customPolicyRaw === 'object' && customPolicyRaw.sections) {
    return {
      title: customPolicyRaw.title || defaultPolicy.title,
      lastUpdated: customPolicyRaw.lastUpdated || defaultPolicy.lastUpdated,
      intro: customPolicyRaw.intro || defaultPolicy.intro,
      contactEmail: customPolicyRaw.contactEmail || defaultPolicy.contactEmail,
      sections: Array.isArray(customPolicyRaw.sections) && customPolicyRaw.sections.length > 0
        ? customPolicyRaw.sections
        : defaultPolicy.sections
    };
  }

  if (typeof customPolicyRaw === 'string' && customPolicyRaw.trim().length > 0) {
    // Platte tekst opgeslagen door beheerder
    return {
      title: (isEn ? pageContent.privacy_policy_title_en : pageContent.privacy_policy_title) || defaultPolicy.title,
      lastUpdated: pageContent.privacy_policy_date || defaultPolicy.lastUpdated,
      intro: (isEn ? pageContent.privacy_policy_intro_en : pageContent.privacy_policy_intro) || defaultPolicy.intro,
      contactEmail: pageContent.privacy_policy_email || defaultPolicy.contactEmail,
      sections: [
        {
          heading: isEn ? "Privacy Policy Content" : "Privacybeleid & Voorwaarden",
          body: customPolicyRaw
        }
      ]
    };
  }

  return defaultPolicy;
}
