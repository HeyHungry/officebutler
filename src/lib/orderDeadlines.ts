export type DeadlineAction = 
  | 'cancel' 
  | 'change_location' 
  | 'change_time' 
  | 'add_products' 
  | 'remove_products';

export interface DeadlineTier {
  id: string;
  name: string;
  min_amount: number;
  max_amount: number | null; // null = onbeperkt (bijv. > €1.000)
  deadlines: {
    cancel: number;           // Uren van tevoren voor annuleren
    change_location: number;  // Uren van tevoren voor locatie wijzigen
    change_time: number;      // Uren van tevoren voor datum/tijd wijzigen
    add_products: number;     // Uren van tevoren voor producten toevoegen
    remove_products: number;  // Uren van tevoren voor producten verwijderen
  };
}

export interface ModificationRulesConfig {
  enabled: boolean;
  tiers: DeadlineTier[];
}

export interface CompanyCustomDeadlines {
  use_custom: boolean;
  tiers: DeadlineTier[];
}

export const DEADLINE_ACTION_LABELS: Record<DeadlineAction, { label: string; description: string; short: string }> = {
  cancel: {
    label: 'Bestelling Annuleren',
    description: 'Volledige bestelling annuleren',
    short: 'Annuleren'
  },
  change_location: {
    label: 'Locatie Wijzigen',
    description: 'Afleveradres of verdieping/locatie aanpassen',
    short: 'Locatie'
  },
  change_time: {
    label: 'Tijdstip Wijzigen',
    description: 'Bezorgdatum of bezorgtijdstip wijzigen',
    short: 'Datum & Tijd'
  },
  add_products: {
    label: 'Producten Toevoegen',
    description: 'Extra snacks, arrangementen of dranken toevoegen',
    short: 'Toevoegen'
  },
  remove_products: {
    label: 'Producten Verwijderen',
    description: 'Bestaande producten uit de order schrappen of minderen',
    short: 'Verwijderen'
  }
};

export const DEFAULT_DEADLINE_TIERS: DeadlineTier[] = [
  {
    id: 'tier_1',
    name: 'Tot € 100,-',
    min_amount: 0,
    max_amount: 100,
    deadlines: {
      cancel: 2,
      change_location: 2,
      change_time: 2,
      add_products: 2,
      remove_products: 2
    }
  },
  {
    id: 'tier_2',
    name: '€ 100,- tot € 250,-',
    min_amount: 100,
    max_amount: 250,
    deadlines: {
      cancel: 4,
      change_location: 2,
      change_time: 4,
      add_products: 2,
      remove_products: 4
    }
  },
  {
    id: 'tier_3',
    name: '€ 250,- tot € 500,-',
    min_amount: 250,
    max_amount: 500,
    deadlines: {
      cancel: 12,
      change_location: 4,
      change_time: 12,
      add_products: 4,
      remove_products: 12
    }
  },
  {
    id: 'tier_4',
    name: '€ 500,- tot € 1.000,-',
    min_amount: 500,
    max_amount: 1000,
    deadlines: {
      cancel: 24,
      change_location: 6,
      change_time: 24,
      add_products: 6,
      remove_products: 24
    }
  },
  {
    id: 'tier_5',
    name: 'Boven € 1.000,-',
    min_amount: 1000,
    max_amount: null,
    deadlines: {
      cancel: 48,
      change_location: 12,
      change_time: 48,
      add_products: 12,
      remove_products: 48
    }
  }
];

export const DEFAULT_MODIFICATION_RULES: ModificationRulesConfig = {
  enabled: true,
  tiers: DEFAULT_DEADLINE_TIERS
};

/**
 * Vindt de van toepassing zijnde tier op basis van het orderbedrag
 */
export function getApplicableTier(
  totalAmount: number,
  customRules?: ModificationRulesConfig | DeadlineTier[] | null
): DeadlineTier {
  const tiers: DeadlineTier[] = Array.isArray(customRules) 
    ? customRules 
    : (customRules?.tiers && customRules.tiers.length > 0 ? customRules.tiers : DEFAULT_DEADLINE_TIERS);

  const amount = Math.max(0, Number(totalAmount) || 0);

  // Zoek van hoog naar laag of vind matching range
  const matched = tiers.find(t => {
    if (t.max_amount !== null && t.max_amount !== undefined) {
      return amount >= t.min_amount && amount < t.max_amount;
    }
    return amount >= t.min_amount;
  });

  return matched || tiers[0] || DEFAULT_DEADLINE_TIERS[0];
}

/**
 * Berekent het aantal uren tot het bezorgmoment
 */
export function getHoursUntilDelivery(deliveryDate?: string, deliveryTime?: string): number {
  if (!deliveryDate) return 0;
  if (!deliveryTime || deliveryTime.toLowerCase().includes('snel') || deliveryTime.toLowerCase().includes('zsm')) {
    return 0; // Directe levering = 0 uur speling
  }

  const timeClean = deliveryTime.trim().padStart(5, '0');
  const target = new Date(`${deliveryDate}T${timeClean}:00`);
  if (isNaN(target.getTime())) return 999;

  return (target.getTime() - Date.now()) / (1000 * 60 * 60);
}

/**
 * Haalt de specifieke deadline (in uren) op voor een actie en bedrag
 */
export function getDeadlineHours(
  action: DeadlineAction,
  totalAmount: number,
  rulesConfig?: ModificationRulesConfig | DeadlineTier[] | null,
  fallbackHours?: number
): number {
  const tier = getApplicableTier(totalAmount, rulesConfig);
  if (tier && tier.deadlines && tier.deadlines[action] !== undefined) {
    return Number(tier.deadlines[action]);
  }
  return fallbackHours !== undefined ? Number(fallbackHours) : 2;
}

/**
 * Controleert of een specifieke actie nog is toegestaan
 */
export function checkActionAllowed(
  action: DeadlineAction,
  deliveryDate?: string,
  deliveryTime?: string,
  totalAmount: number = 0,
  rulesConfig?: ModificationRulesConfig | DeadlineTier[] | null,
  fallbackHours?: number
): {
  allowed: boolean;
  requiredHours: number;
  remainingHours: number;
  message?: string;
} {
  const remainingHours = getHoursUntilDelivery(deliveryDate, deliveryTime);
  const requiredHours = getDeadlineHours(action, totalAmount, rulesConfig, fallbackHours);
  const actionMeta = DEADLINE_ACTION_LABELS[action];

  if (!deliveryTime || deliveryTime.toLowerCase().includes('snel') || deliveryTime.toLowerCase().includes('zsm')) {
    const allowed = requiredHours === 0;
    return {
      allowed,
      requiredHours,
      remainingHours: 0,
      message: allowed 
        ? undefined 
        : `${actionMeta.label} is niet meer mogelijk voor directe leveringen (minimaal ${requiredHours} uur voorbereidingstijd vereist).`
    };
  }

  const allowed = remainingHours >= requiredHours;

  let message: string | undefined;
  if (!allowed) {
    message = `${actionMeta.label} is niet meer mogelijk binnen ${requiredHours} uur voor bezorging wegens voorbereidingstijd in de keuken.`;
  }

  return {
    allowed,
    requiredHours,
    remainingHours,
    message
  };
}

/**
 * Geeft een statusoverzicht van alle 5 acties voor een specifieke order
 */
export function getAllOrderActionsStatus(
  deliveryDate?: string,
  deliveryTime?: string,
  totalAmount: number = 0,
  rulesConfig?: ModificationRulesConfig | DeadlineTier[] | null,
  fallbackHours?: number
): Record<DeadlineAction, { allowed: boolean; requiredHours: number; remainingHours: number; message?: string }> {
  return {
    cancel: checkActionAllowed('cancel', deliveryDate, deliveryTime, totalAmount, rulesConfig, fallbackHours),
    change_location: checkActionAllowed('change_location', deliveryDate, deliveryTime, totalAmount, rulesConfig, fallbackHours),
    change_time: checkActionAllowed('change_time', deliveryDate, deliveryTime, totalAmount, rulesConfig, fallbackHours),
    add_products: checkActionAllowed('add_products', deliveryDate, deliveryTime, totalAmount, rulesConfig, fallbackHours),
    remove_products: checkActionAllowed('remove_products', deliveryDate, deliveryTime, totalAmount, rulesConfig, fallbackHours),
  };
}
