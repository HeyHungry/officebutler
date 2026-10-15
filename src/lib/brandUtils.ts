import { CURRENT_BRAND } from './supabase';

/**
 * Controleert of een item (product, bezorgoptie, verpakking) getoond mag worden voor het actieve merk.
 * Regels volgens specificatie:
 * - Toon een item alleen als:
 *   * allowed_brands IS NULL of leeg is (standaard = alle merken), OF
 *   * allowed_brands bevat targetBrand (standaard 'canal_butler').
 */
export function isBrandAllowed(
  allowedBrands: any,
  targetBrand: string = CURRENT_BRAND || 'canal_butler'
): boolean {
  if (allowedBrands === null || allowedBrands === undefined) {
    return true;
  }

  const normalizedTarget = (targetBrand || '').trim().toLowerCase();

  // 1. Text array uit PostgreSQL of JS array (bijv. ['canal_butler', 'office_butler'])
  if (Array.isArray(allowedBrands)) {
    if (allowedBrands.length === 0) return true;
    return allowedBrands.some((b) => String(b).trim().toLowerCase() === normalizedTarget);
  }

  // 2. String weergave (bijv. 'canal_butler', '["canal_butler"]', of 'canal_butler, office_butler')
  if (typeof allowedBrands === 'string') {
    const trimmed = allowedBrands.trim();
    if (trimmed === '' || trimmed === '[]' || trimmed === '{}') return true;

    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          if (parsed.length === 0) return true;
          return parsed.some((b) => String(b).trim().toLowerCase() === normalizedTarget);
        }
      } catch {
        // Indien geen geldige JSON, val terug op string checks
      }
    }

    // Door komma's of spaties gescheiden
    const parts = trimmed
      .split(/[,\s]+/)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    if (parts.length === 0) return true;
    return parts.includes(normalizedTarget);
  }

  // 3. Object weergave (bijv. { canal_butler: true })
  if (typeof allowedBrands === 'object') {
    const keys = Object.keys(allowedBrands);
    if (keys.length === 0) return true;
    if (allowedBrands[normalizedTarget]) return true;
    return Object.values(allowedBrands).some((v) => String(v).trim().toLowerCase() === normalizedTarget);
  }

  return true;
}

/**
 * Bepaalt de prioriteit van een prijsrij uit ob_product_prices:
 * 1. Bedrijf-specifieke prijs (company_id match) -> rang 3
 * 2. Merk-specifieke prijs (brand = 'canal_butler' en company_id is null) -> rang 2
 * 3. Standaardprijs (brand is null en company_id is null) -> rang 1
 * 0. Geen match (behoort tot ander bedrijf of ander merk) -> rang 0 (negeren)
 */
export function getPricePriorityRank(
  priceRow: any,
  targetCompanyId?: string | null,
  targetBrand: string = CURRENT_BRAND || 'canal_butler'
): number {
  if (!priceRow) return 0;

  const rowCompanyId = priceRow.company_id ? String(priceRow.company_id).trim() : null;
  const rowBrand = priceRow.brand
    ? String(priceRow.brand).trim().toLowerCase()
    : priceRow.brand_id
    ? String(priceRow.brand_id).trim().toLowerCase()
    : null;

  const targetComp = targetCompanyId ? String(targetCompanyId).trim() : null;
  const normalizedTargetBrand = (targetBrand || '').trim().toLowerCase();

  // Prioriteit 1: Bedrijf-specifieke prijs (company_id match)
  if (targetComp && rowCompanyId && rowCompanyId === targetComp) {
    return 3;
  }

  // Als de prijsrij specifiek voor een ANDER bedrijf is bedoeld, niet gebruiken
  if (rowCompanyId) {
    return 0;
  }

  // Prioriteit 2: Merk-specifieke prijs (brand = 'canal_butler' en company_id is null)
  if (rowBrand && rowBrand === normalizedTargetBrand) {
    return 2;
  }

  // Als de prijsrij specifiek voor een ANDER merk is (bijv. 'office_butler'), niet gebruiken
  if (rowBrand && rowBrand !== '') {
    return 0;
  }

  // Prioriteit 3: Standaardprijs (brand is null/leeg en company_id is null)
  return 1;
}

/**
 * Verwerkt een lijst van ob_product_prices rijen naar een handige PriceMap:
 * Record<string, number> (bijv. 'Bitterballen_50' => 45.00).
 * Past automatisch de 3 prioriteitsniveaus toe en koppelt optioneel met dbProducts.
 */
export function resolveProductPrices(
  priceRows: any[],
  targetCompanyId?: string | null,
  targetBrand: string = CURRENT_BRAND || 'canal_butler',
  products?: any[]
): Record<string, number> {
  if (!priceRows || !Array.isArray(priceRows)) return {};

  // Houd per productnaam + portie de hoogst gerangschikte prijs bij
  const bestPrices = new Map<
    string,
    { price: number; rank: number; rawName: string; portionSize: any }
  >();

  for (const row of priceRows) {
    const rank = getPricePriorityRank(row, targetCompanyId, targetBrand);
    if (rank <= 0) continue; // Behoort tot ander merk of ander bedrijf

    const rawName = row.product_name || '';
    const cleanLowerName = rawName.trim().toLowerCase();
    const portion = row.portion_size;
    const priceNum = parseFloat(row.price);

    if (isNaN(priceNum)) continue;

    const key = `${cleanLowerName}_${portion}`;
    const existing = bestPrices.get(key);

    if (!existing || rank > existing.rank) {
      bestPrices.set(key, {
        price: priceNum,
        rank,
        rawName,
        portionSize: portion,
      });
    }
  }

  const pMap: Record<string, number> = {};

  // Vul de pMap met alle gevonden beste prijzen
  for (const item of bestPrices.values()) {
    const trimmed = item.rawName.trim();
    pMap[`${trimmed}_${item.portionSize}`] = item.price;
    pMap[`${item.rawName}_${item.portionSize}`] = item.price;
  }

  // Cross-reference met de actieve productenlijst zodat witruimtes/hoofdletters altijd matchen
  if (products && Array.isArray(products)) {
    products.forEach((prodItem: any) => {
      const prodName = prodItem.name || '';
      const cleanLower = prodName.trim().toLowerCase();

      for (const item of bestPrices.values()) {
        if (item.rawName.trim().toLowerCase() === cleanLower) {
          pMap[`${prodName}_${item.portionSize}`] = item.price;
          pMap[`${prodItem.name.trim()}_${item.portionSize}`] = item.price;
        }
      }
    });
  }

  return pMap;
}
