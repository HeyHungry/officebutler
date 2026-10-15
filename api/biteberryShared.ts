import { createClient } from "@supabase/supabase-js";

export const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://rqqotumbdsghvkkmquqo.supabase.co";
export const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

export const adminClient = (supabaseUrl && serviceKey)
  ? createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
  : null;

// Helper to parse Dutch address strings into BiteBerry address components
export function parseDutchAddress(rawAddress: string, label?: string, notes?: string) {
  const text = (rawAddress || "").trim();
  const postalCodeMatch = text.match(/\b([1-9][0-9]{3}\s?[A-Za-z]{2})\b/);
  const zipcode = postalCodeMatch ? postalCodeMatch[1].toUpperCase() : "1011 RB";
  
  let city = "Amsterdam";
  if (postalCodeMatch) {
    const afterZip = text.slice(text.indexOf(postalCodeMatch[0]) + postalCodeMatch[0].length).trim();
    const cityWord = afterZip.split(/[,;\n]/)[0].trim();
    if (cityWord) city = cityWord;
  }

  const line1 = text || "Keizersgracht 123";
  const noteParts: string[] = [];
  if (label) noteParts.push(`Locatie: ${label}`);
  if (notes) noteParts.push(notes);

  return {
    line1,
    city: city || "Amsterdam",
    zipcode: zipcode || "1011 RB",
    country: "Netherlands",
    country_code: "nl",
    note: noteParts.length > 0 ? noteParts.join(" | ") : undefined
  };
}

// Helper to translate delivery methods to English for courier and staff
export function translateDeliveryMethodToEnglish(method?: string): string {
  if (!method) return "Standard delivery";
  const m = method.toLowerCase().trim();
  if (m.includes("dockside") || m.includes("kade") || m.includes("steiger") || m.includes("aanlegplek") || m.includes("opstap")) {
    return "Dockside delivery";
  }
  if (m.includes("butler service") || m.includes("butlerservice") || m.includes("service aan boord")) {
    return "Butler service";
  }
  if (m.includes("afhaal") || m.includes("pickup") || m.includes("ophalen")) {
    return "Pickup";
  }
  if (m.includes("uitpakken") || m.includes("unpack") || m.includes("setup")) {
    return "Unpack service";
  }
  if (m.includes("drempel") || m.includes("doorstep") || m.includes("threshold")) {
    return "Doorstep delivery";
  }
  if (m.includes("standaard") || m.includes("standard")) {
    return "Standard delivery";
  }
  return "Standard delivery";
}

// Helper to parse deliveryDate and deliveryTime into BiteBerry ISO scheduled date-times
export function parseDeliverySchedule(deliveryDate?: string, deliveryTime?: string) {
  if (!deliveryDate) {
    return { scheduled_order: false };
  }

  const dateMatch = deliveryDate.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!dateMatch) {
    return { scheduled_order: false };
  }

  const [_, y, m, d] = dateMatch;
  let hh = "12";
  let mm = "00";

  if (deliveryTime && !deliveryTime.toLowerCase().includes("snel") && !deliveryTime.toLowerCase().includes("zsm") && !deliveryTime.toLowerCase().includes("asap")) {
    const timeMatch = deliveryTime.match(/(\d{1,2}):(\d{2})/);
    if (timeMatch) {
      hh = timeMatch[1];
      mm = timeMatch[2];
    }
  }

  const pad = (n: number | string) => String(n).padStart(2, "0");
  const isoLocal = `${y}-${pad(m)}-${pad(d)}T${pad(hh)}:${pad(mm)}:00`;
  let offsetHours = 2; // Default summer (CEST) in NL
  try {
    const testUtc = new Date(`${isoLocal}Z`);
    const amsterdamStr = testUtc.toLocaleString("en-US", { timeZone: "Europe/Amsterdam", timeZoneName: "shortOffset" });
    const offsetMatch = amsterdamStr.match(/GMT([+-]\d+)/);
    if (offsetMatch) {
      offsetHours = parseInt(offsetMatch[1], 10);
    }
  } catch {
    offsetHours = 2;
  }

  const offsetSign = offsetHours >= 0 ? "+" : "-";
  const formattedOffset = `${offsetSign}${pad(Math.abs(offsetHours))}:00`;

  const finishedAt = new Date(`${isoLocal}${formattedOffset}`);
  if (isNaN(finishedAt.getTime())) {
    return { scheduled_order: false };
  }

  const readyAt = new Date(finishedAt.getTime() - 30 * 60 * 1000); // 30 minutes before delivery for kitchen prep
  const isFuture = finishedAt.getTime() > (Date.now() + 15 * 60 * 1000);

  return {
    scheduled_order: true,
    is_future: isFuture,
    estimated_finished_at: finishedAt.toISOString(),
    estimated_ready_at: readyAt.toISOString()
  };
}

export async function sendOrderToBiteberry(params: {
  brand?: string;
  brandPlatform?: string;
  customerName: string;
  email?: string;
  phone: string;
  rawAddress: string;
  addressLabel?: string;
  companyName?: string;
  orderLines?: any[];
  selections?: any;
  prices?: any;
  deliveryDate?: string;
  deliveryTime?: string;
  deliveryMethod?: string;
  deliveryMethodPrice?: number;
  notes?: string;
  billingInfo?: string;
  discountCode?: string;
  discountAmount?: number;
  freeProductInfo?: string;
  isTest?: boolean;
  supabaseAdmin?: any;
}) {
  try {
    const brand = params.brand || "canal_butler";
    const brandPlatform = params.brandPlatform || "canal";

    let apiKey = process.env.BITEBERRY_API_KEY?.trim() || "ob_live_8f3a9e2b7c4d1f5e0a6b";
    let storefrontId = process.env.BITEBERRY_STOREFRONT_ID?.trim() || "322e275f-c3d3-44bd-876c-f30ecf713227";
    if (storefrontId === "4f6adec7-55d6-4bdb-b719-a37f44a3fc19") {
      storefrontId = "322e275f-c3d3-44bd-876c-f30ecf713227";
    }

    let kitchenInfoMap: Record<string, { kitchen_name?: string; ingredients?: string; prep_instructions?: string; variant_kitchen_names?: Record<string, string> }> = {};
    let dbProducts: { id: string; name: string; variants?: string[]; variant_kitchen_names?: Record<string, string> }[] = [];

    const sbClient = params.supabaseAdmin || adminClient;
    if (sbClient) {
      try {
        const [storeRes, prodRes] = await Promise.all([
          sbClient.from('store_settings').select('page_content').eq('id', 1).maybeSingle(),
          sbClient.from('ob_products').select('id, name, variants')
        ]);
        const storeRow = storeRes.data;
        if (prodRes?.data) {
          dbProducts = prodRes.data;
        }
        if (storeRow?.page_content?.biteberry_storefront_id?.trim() && storeRow.page_content.biteberry_storefront_id.trim() !== "4f6adec7-55d6-4bdb-b719-a37f44a3fc19") {
          storefrontId = storeRow.page_content.biteberry_storefront_id.trim();
        }
        if (storeRow?.page_content?.biteberry_api_key?.trim()) {
          apiKey = storeRow.page_content.biteberry_api_key.trim();
        }
        if (storeRow?.page_content?.product_kitchen_info) {
          kitchenInfoMap = storeRow.page_content.product_kitchen_info;
        }
      } catch (e) {
        // Fallback to env / default
      }
    }

    if (!apiKey) {
      console.warn("[BiteBerry] Geen API key gevonden, bestelling wordt overgeslagen.");
      return { success: false, reason: "No API key configured" };
    }

    // 1. Process items / order lines
    const parsedLines: { name: string; qty: number; price: number; taxRate?: number }[] = [];
    if (params.orderLines && Array.isArray(params.orderLines) && params.orderLines.length > 0) {
      for (const line of params.orderLines) {
        const isDelivery = Boolean(
          line.product_name && (
            line.product_name.startsWith("Canal Butler levering:") ||
            line.product_name.startsWith("Bezorging:") ||
            line.product_name.toLowerCase().includes("levering:")
          )
        );
        const portionSuffix = (!isDelivery && line.portion_size) ? ` (${line.portion_size} stuks)` : "";
        parsedLines.push({
          name: `${line.product_name}${portionSuffix}`,
          qty: Math.max(1, Number(line.qty) || 1),
          price: Math.max(0, Number(line.price) || 0),
          taxRate: isDelivery ? 21 : 9
        });
      }
    } else if (params.selections && typeof params.selections === "object") {
      const prices = params.prices || {};
      for (const [prod, sizes] of Object.entries(params.selections)) {
        for (const [sizeStr, qty] of Object.entries(sizes as any)) {
          const parts = String(sizeStr).split('_');
          const size = Number(parts[0]);
          const variant = parts[1] || '';
          const finalProd = variant ? `${prod} (${variant})` : prod;
          const cleanProd = (prod || '').trim();
          const price = prices[`${cleanProd}_${sizeStr}`] || prices[`${cleanProd}_${size}`] || prices[`${prod}_${sizeStr}`] || prices[`${prod}_${size}`] || 0;
          parsedLines.push({
            name: `${finalProd} (${size} stuks)`,
            qty: Math.max(1, Number(qty) || 1),
            price: Math.max(0, Number(price) || 0),
            taxRate: 9
          });
        }
      }
    }

    // 2. Type bestelling: order_type 'delivery' en orderregel met 'Canal Butler levering: [methode]'
    const deliveryPriceNum = params.deliveryMethodPrice && Number(params.deliveryMethodPrice) > 0
      ? Number(params.deliveryMethodPrice)
      : 0;
    const rawDeliveryMethod = (params.deliveryMethod || "Standaard bezorging").trim();
    const deliveryItemName = `Canal Butler levering: ${rawDeliveryMethod}`;

    const existingDeliveryIdx = parsedLines.findIndex(l => 
      l.name.startsWith("Canal Butler levering:") || 
      l.name.startsWith("Bezorging:") ||
      l.name.toLowerCase().includes("levering:")
    );

    if (existingDeliveryIdx >= 0) {
      parsedLines[existingDeliveryIdx].name = deliveryItemName;
      if (deliveryPriceNum > 0) {
        parsedLines[existingDeliveryIdx].price = deliveryPriceNum;
      }
      parsedLines[existingDeliveryIdx].taxRate = 21;
    } else {
      parsedLines.push({
        name: deliveryItemName,
        qty: 1,
        price: deliveryPriceNum,
        taxRate: 21
      });
    }

    if (params.freeProductInfo && !parsedLines.some(l => l.name.includes(params.freeProductInfo!))) {
      parsedLines.push({
        name: `GRATIS: ${params.freeProductInfo}`,
        qty: 1,
        price: 0,
        taxRate: 9
      });
    }

    // Items mapping met voorvoegsel CB-
    const items = parsedLines.map((line, idx) => {
      return {
        name: line.name,
        quantity: line.qty,
        price: Math.round(line.price * 100), // In cents
        tax_rate: line.taxRate || 9,
        order_item_type: "standalone" as const,
        external_id: `CB-ITEM-${idx + 1}`
      };
    });

    const charges: any[] = [];

    // 3. Discounts
    const discounts: any[] = [];
    const discountCents = params.discountAmount && Number(params.discountAmount) > 0
      ? Math.round(Number(params.discountAmount) * 100)
      : 0;

    if (discountCents > 0) {
      discounts.push({
        discount_type: "all",
        amount: discountCents,
        name: params.discountCode ? `Korting (${params.discountCode})` : "Korting",
        external_id: `CB-DISCOUNT-${params.discountCode || "CODE"}`
      });
    }

    const activeItems = items.length > 0 ? items : [
      {
        name: "Canal Butler Catering",
        quantity: 1,
        price: 100,
        tax_rate: 9,
        order_item_type: "standalone" as const,
        external_id: "CB-ITEM-1"
      }
    ];

    const subTotalCents = activeItems.reduce((sum, it) => sum + (it.price * it.quantity), 0);
    const grandTotalCents = Math.max(0, subTotalCents - discountCents);

    // 4. Contact details & Address
    const isTestOrder = Boolean(params.isTest === true);

    let effectiveCustomerName = (params.customerName || "Klant").trim();
    let firstName = "";
    let lastName = "";

    if (isTestOrder) {
      firstName = "[TEST]";
      const cleanName = effectiveCustomerName.replace(/\[TEST.*?\]/gi, '').trim();
      lastName = cleanName ? `${cleanName}` : "Klant";
    } else {
      const nameParts = effectiveCustomerName.split(" ");
      firstName = nameParts[0] || "Klant";
      lastName = nameParts.slice(1).join(" ") || (params.companyName ? `(${params.companyName})` : "Klant");
    }

    // Sanitize phone number so Biteberry contact_details.phone.number is ALWAYS filled
    let rawPhone = String(params.phone || '').trim();
    let digitsOnly = rawPhone.replace(/[^0-9]/g, '');
    if (digitsOnly.startsWith('31') && digitsOnly.length >= 10) {
      digitsOnly = '0' + digitsOnly.slice(2);
    }
    const cleanPhone = (digitsOnly && digitsOnly.length >= 6) ? digitsOnly : "0612345678";
    const address = parseDutchAddress(params.rawAddress, params.addressLabel, params.notes);
    const scheduleInfo = parseDeliverySchedule(params.deliveryDate, params.deliveryTime);

    // Helper to resolve product kitchen title and info
    const kitchenProductLines: string[] = [];
    const courierProductLines: string[] = [];

    for (const line of parsedLines) {
      if (
        line.name.startsWith("Canal Butler levering:") ||
        line.name.startsWith("Bezorging:") ||
        line.name.startsWith("GRATIS:")
      ) {
        continue;
      }

      const rawName = line.name || "";
      const cleanName = rawName.replace(/\s*\(\d+\s*stuks\)/i, "").replace(/\s*\[\+.*?\]/g, "").trim();

      // Check for variant in parenthesis at the end (e.g. "Bitterballen (Vega)" -> variant: "Vega", base: "Bitterballen")
      const variantParenMatch = cleanName.match(/\(([^()]+)\)$/);
      const extractedVariant = variantParenMatch ? variantParenMatch[1].trim() : null;
      const baseCleanName = variantParenMatch
        ? cleanName.replace(/\s*\([^()]+\)$/, "").trim()
        : cleanName;

      const prod = dbProducts.find((p: any) => {
        const pName = (p.name || '').trim().toLowerCase();
        const cName = cleanName.toLowerCase();
        const bName = baseCleanName.toLowerCase();
        return pName === cName || pName === bName || cName.startsWith(pName) || bName.startsWith(pName);
      });

      const match = (prod && kitchenInfoMap[prod.id]) ||
                    kitchenInfoMap[cleanName] ||
                    kitchenInfoMap[baseCleanName] ||
                    kitchenInfoMap[rawName] ||
                    (prod && kitchenInfoMap[prod.name]) ||
                    Object.entries(kitchenInfoMap).find(([key]) => {
                      const kClean = key.trim().toLowerCase();
                      return cleanName.toLowerCase() === kClean ||
                             baseCleanName.toLowerCase() === kClean ||
                             cleanName.toLowerCase().startsWith(kClean) ||
                             rawName.toLowerCase().includes(kClean);
                    })?.[1];

      // Gather all potential variant names for this product
      const allKnownVariants: string[] = [
        ...(prod?.variants || []),
        ...(match?.variant_kitchen_names ? Object.keys(match.variant_kitchen_names) : []),
        ...((prod as any)?.variant_kitchen_names ? Object.keys((prod as any).variant_kitchen_names) : [])
      ];

      let chosenVariant: string | null = extractedVariant;
      if (!chosenVariant && allKnownVariants.length > 0) {
        for (const v of allKnownVariants) {
          const vLower = v.toLowerCase();
          if (rawName.toLowerCase().includes(`(${vLower})`) || cleanName.toLowerCase().includes(`(${vLower})`)) {
            chosenVariant = v;
            break;
          }
        }
      } else if (chosenVariant && allKnownVariants.length > 0) {
        const exactKnown = allKnownVariants.find(v => v.toLowerCase() === chosenVariant!.toLowerCase());
        if (exactKnown) {
          chosenVariant = exactKnown;
        }
      }

      // Combine variant kitchen names maps
      const variantKitchenMap: Record<string, string> = {
        ...((prod as any)?.variant_kitchen_names || {}),
        ...(match?.variant_kitchen_names || {})
      };

      let resolvedKitchenName: string = '';

      // 1. If a specific kitchen name is set for this variant via variant_kitchen_names, use it
      if (chosenVariant) {
        const variantKey = Object.keys(variantKitchenMap).find(
          k => k.trim().toLowerCase() === chosenVariant!.trim().toLowerCase()
        );
        if (variantKey && variantKitchenMap[variantKey]?.trim()) {
          resolvedKitchenName = variantKitchenMap[variantKey].trim();
        }
      }

      // 2. If no specific kitchen name for this variant is configured, but a general kitchen name is available:
      // Automatically append the variant name (e.g. "Keukennaam (Variant)") so the kitchen never misses the variant
      if (!resolvedKitchenName && match?.kitchen_name?.trim()) {
        const baseKitchen = match.kitchen_name.trim();
        if (chosenVariant) {
          const alreadyHasVariant = baseKitchen.toLowerCase().includes(chosenVariant.toLowerCase());
          if (!alreadyHasVariant) {
            resolvedKitchenName = `${baseKitchen} (${chosenVariant})`;
          } else {
            resolvedKitchenName = baseKitchen;
          }
        } else {
          resolvedKitchenName = baseKitchen;
        }
      }

      const portionMatch = rawName.match(/\((\d+\s*stuks)\)/i);
      const portionStr = portionMatch ? ` (${portionMatch[1]})` : "";
      const kitchenTitle = resolvedKitchenName ? `${resolvedKitchenName}${portionStr}` : cleanName;

      // Courier summary line: Keukennaam + aantal
      courierProductLines.push(`${line.qty}x ${kitchenTitle}`);

      // Kitchen instructions: Keukennaam + aantallen, eventuele ingrediënten (VOLLEDIG ZONDER bereidingswijzen)
      const parts: string[] = [`${line.qty}x ${kitchenTitle}`];
      if (match?.ingredients && String(match.ingredients).trim()) {
        parts.push(`Ingrediënten: ${String(match.ingredients).trim()}`);
      }
      kitchenProductLines.push(parts.join("\n"));
    }

    // 5. Opmerking voor de koerier (contact_details.courier_note):
    // - Bovenin kort de merknaam: "canal butler" (klein, zonder emoji's of poespas)
    // - Bezorgadres
    // - Engelse vertaling van de gekozen bezorgmethode
    // - De eventuele extra opmerking / notities van de klant
    // - Telefoonnummer en naam van de klant
    // - Keukennamen en hoeveelheden van de bestelde producten
    // (Duidelijke witregels \n\n tussen alle losse onderdelen)
    const courierAddress = params.rawAddress || params.addressLabel || address.line1 || "Adres op aanvraag";
    const courierMethodEn = translateDeliveryMethodToEnglish(params.deliveryMethod);

    const courierParts: string[] = [
      "canal butler",
      courierAddress,
      courierMethodEn
    ];
    if (params.notes && params.notes.trim()) {
      courierParts.push(params.notes.trim());
    }
    courierParts.push(`${cleanPhone} - ${effectiveCustomerName}`);
    if (courierProductLines.length > 0) {
      courierParts.push(courierProductLines.join("\n"));
    }
    const courierNote = courierParts.join("\n\n");

    // 6. Opmerking voor de operator (operator_note):
    // - Klantnaam
    // - Bedrijfsnaam (indien ingevuld)
    // - E-mailadres
    // - Bestelplatform: "canal" / "canal butler"
    // (Gescheiden door witregels \n\n)
    const effectiveEmailStr = (params.email && params.email.includes("@")) ? params.email.trim() : "info@canalbutler.nl";
    const operatorParts: string[] = [
      effectiveCustomerName
    ];
    if (params.companyName && params.companyName.trim() && params.companyName.trim() !== effectiveCustomerName) {
      operatorParts.push(params.companyName.trim());
    }
    operatorParts.push(effectiveEmailStr);
    operatorParts.push("canal butler");
    const operatorNote = operatorParts.join("\n\n");

    // 7. Opmerking voor de keuken (kitchen_note):
    // - Bestelplatform: "canal" / "canal butler"
    // - Keukennamen + aantallen van de producten (+ ingrediënten indien aanwezig, GEEN bereidingswijzen)
    // - Klantnaam en bedrijf + eventuele extra opmerking van de klant
    // (Zorg voor witregels \n\n tussen het platform, de producten, en de klantinformatie)
    const kitchenCustomerParts: string[] = [
      params.companyName && params.companyName.trim() !== effectiveCustomerName
        ? `${effectiveCustomerName} & ${params.companyName.trim()}`
        : effectiveCustomerName
    ];
    if (params.notes && params.notes.trim()) {
      kitchenCustomerParts.push(`Opmerking: ${params.notes.trim()}`);
    }

    const kitchenSections: string[] = ["canal butler"];
    if (kitchenProductLines.length > 0) {
      kitchenSections.push(kitchenProductLines.join("\n\n"));
    }
    if (kitchenCustomerParts.length > 0) {
      kitchenSections.push(kitchenCustomerParts.join("\n"));
    }
    const finalKitchenNote = kitchenSections.join("\n\n");

    // 8. Klantgegevens:
    // - Vul contact_details met first_name, last_name, email, phone (+31) en gestructureerd address.
    // Betaling: 'Op factuur'
    // Bestel-Id: external_id met voorvoegsel 'CB-'
    const orderPayload = {
      brand,
      brandPlatform,
      order: {
        brand,
        brandPlatform,
        brand_platform: brandPlatform,
        storefront_id: storefrontId,
        order_type: "delivery",
        delivery_type: "own_fleet",
        is_test: isTestOrder,
        scheduled_order: scheduleInfo.scheduled_order ?? (Boolean(scheduleInfo.estimated_finished_at)),
        estimated_finished_at: scheduleInfo.estimated_finished_at,
        estimated_ready_at: scheduleInfo.estimated_ready_at,
        external_id: `CB-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        kitchen_note: finalKitchenNote,
        operator_note: operatorNote,
        sub_total: subTotalCents,
        grand_total: grandTotalCents,
        contact_details: {
          first_name: firstName,
          last_name: lastName,
          email: effectiveEmailStr,
          phone: {
            number: cleanPhone,
            country_code: "+31"
          },
          courier_note: courierNote,
          address: {
            line1: address.line1 || "Keizersgracht 123",
            city: address.city || "Amsterdam",
            zipcode: address.zipcode || "1011 RB",
            country: "Netherlands",
            country_code: "nl",
            note: address.note
          }
        },
        items: activeItems,
        charges: charges.length > 0 ? charges : undefined,
        discounts: discounts.length > 0 ? discounts : undefined,
        payments: [
          {
            amount: grandTotalCents,
            status: "paid",
            payment_type: "other",
            name: "Op factuur",
            description: "Op factuur",
            payment_method: "Op factuur",
            external_id: `CB-PAY-${Date.now()}`
          }
        ]
      }
    };

    const response = await fetch("https://api-core.biteberry.com/api/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey
      },
      body: JSON.stringify(orderPayload)
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("[BiteBerry] API antwoordde met foutstatus:", response.status, JSON.stringify(data));
      return { success: false, status: response.status, error: data };
    }

    console.log("[BiteBerry] Order succesvol aangemaakt! Order ID:", data.order?.id || data.id, "Short Code:", data.order?.short_code || data.short_code);
    return { success: true, order: data.order || data };
  } catch (err: any) {
    console.error("[BiteBerry] Fout bij doorsturen naar BiteBerry:", err?.message || err);
    return { success: false, error: err?.message || String(err) };
  }
}
